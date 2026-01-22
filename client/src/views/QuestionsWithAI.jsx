import QuestionGenerator from "./QuestionGenerator";
import React, { useState } from "react";

export default function QuestionsWithAI({ onAddQuestions }) {
  const [aiQuestions, setAiQuestions] = useState([]);
  return (
    <div>
      <QuestionGenerator onQuestions={setAiQuestions} />
      {aiQuestions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2>AI-Generated Questions (Ready to Add)</h2>
          <button
            style={{ marginBottom: 16, padding: '8px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 4 }}
            onClick={() => onAddQuestions && onAddQuestions(aiQuestions)}
          >
            Add to My Questions
          </button>
          <pre style={{ background: '#f8f8f8', padding: 10 }}>{JSON.stringify(aiQuestions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
