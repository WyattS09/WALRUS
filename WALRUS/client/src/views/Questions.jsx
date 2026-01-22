import { useState } from 'react'

export default function Questions({ questions, setQuestions, onDone }) {
  const [prompt, setPrompt] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [duration, setDuration] = useState(20)
  const [editingId, setEditingId] = useState(null)

  const handleChoiceChange = (idx, value) => {
    const newChoices = [...choices]
    newChoices[idx] = value
    setChoices(newChoices)
  }

  const handleAddQuestion = () => {
    if (!prompt.trim() || choices.some(c => !c.trim())) {
      alert('Please fill in prompt and all choices')
      return
    }

    const newQuestion = {
      questionId: editingId || `q${Date.now()}`,
      prompt,
      choices,
      correctIndex: parseInt(correctIndex),
      durationSec: parseInt(duration)
    }

    if (editingId) {
      setQuestions(questions.map(q => q.questionId === editingId ? newQuestion : q))
      setEditingId(null)
    } else {
      setQuestions([...questions, newQuestion])
    }

    setPrompt('')
    setChoices(['', '', '', ''])
    setCorrectIndex(0)
    setDuration(20)
  }

  const handleEdit = (q) => {
    setPrompt(q.prompt)
    setChoices([...q.choices])
    setCorrectIndex(q.correctIndex)
    setDuration(q.durationSec)
    setEditingId(q.questionId)
  }

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.questionId !== id))
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Question Manager</h2>
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Question prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        {choices.map((c, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <input
              type="text"
              placeholder={`Choice ${i + 1}`}
              value={c}
              onChange={e => handleChoiceChange(i, e.target.value)}
              style={{ width: '70%', marginRight: 8, padding: 6 }}
            />
            <label>
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              /> Correct
            </label>
          </div>
        ))}
        <div style={{ margin: '8px 0' }}>
          <label>Duration (seconds): </label>
          <input
            type="number"
            min={5}
            max={120}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{ width: 60, marginLeft: 8 }}
          />
        </div>
        <button onClick={handleAddQuestion} style={{ padding: '8px 20px', marginTop: 8 }}>
          {editingId ? 'Save Question' : 'Add Question'}
        </button>
        {editingId && (
          <button onClick={() => { setPrompt(''); setChoices(['', '', '', '']); setCorrectIndex(0); setDuration(20); setEditingId(null); }} style={{ marginLeft: 12 }}>
            Cancel
          </button>
        )}
      </div>
      <h3>Questions</h3>
      <ol>
        {questions.map(q => (
          <li key={q.questionId} style={{ marginBottom: 8 }}>
            <b>{q.prompt}</b> <span style={{ color: '#888' }}>[{q.durationSec}s]</span>
            <ul>
              {q.choices.map((c, i) => (
                <li key={i} style={{ color: i === q.correctIndex ? 'green' : undefined }}>
                  {c} {i === q.correctIndex && <b>(correct)</b>}
                </li>
              ))}
            </ul>
            <button onClick={() => handleEdit(q)} style={{ marginRight: 8 }}>Edit</button>
            <button onClick={() => handleDelete(q.questionId)}>Delete</button>
          </li>
        ))}
      </ol>
      <button onClick={onDone} style={{ marginTop: 24, padding: '10px 24px', fontSize: 16 }}>Done</button>
    </div>
  )
}
  