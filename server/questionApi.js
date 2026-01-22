// Express server for file upload and Ollama-powered question generation
import express from 'express';
import multer from 'multer';
import csv from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware for API key authentication
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  if (!apiKey || apiKey !== process.env.QUIZ_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

// Helper: Extract text from uploaded file
async function extractText(file) {
  const buffer = await fs.readFile(file.path);
  if (file.mimetype === 'text/csv') {
    return buffer.toString('utf8');
  } else if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type');
  }
}

// Helper: Generate questions using Ollama (local LLM)
async function generateQuestionsFromText(text) {
  const prompt = `Generate 5 multiple-choice quiz questions (with 4 choices each, one correct answer, and a short prompt) from the following content. Respond as a JSON array with fields: questionId, prompt, choices (array), correctIndex, durationSec (20):\n${text}`;
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false
    })
  });
  if (!response.ok) throw new Error('Ollama API error: ' + response.statusText);
  const data = await response.json();
  const content = data.response || data.message || '';
  const match = content.match(/\[.*\]/s);
  if (!match) throw new Error('No JSON array found in Ollama response');
  return JSON.parse(match[0]);
}

// Main endpoint
app.post('/api/generate-questions', upload.single('file'), async (req, res) => {
  try {
    const text = await extractText(req.file);
    let questions;
    if (req.file.mimetype === 'text/csv') {
      // Optionally, parse CSV and join as text
      const records = csv.parse(text, { columns: false });
      questions = await generateQuestionsFromText(records.flat().join(' '));
    } else {
      questions = await generateQuestionsFromText(text);
    }
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
  }
});

app.listen(4000, () => {
  console.log('Quiz question generator API running on port 4000');
});
