import React, { useState } from "react";

export default function QuestionGenerator({ onQuestions }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setQuestions([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setQuestions(data.questions);
      if (onQuestions) onQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Generate Questions from File (AI)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input type="file" accept=".csv,.pdf,.docx,.doc" onChange={handleFileChange} required />
        </div>
        <button type="submit" disabled={loading || !file}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {questions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Preview & Edit Questions</h3>
          {questions.map((q, i) => (
            <div key={q.questionId || i} style={{ border: "1px solid #eee", padding: 10, marginBottom: 10 }}>
              <input
                type="text"
                value={q.prompt}
                onChange={e => {
                  const newQs = [...questions];
                  newQs[i].prompt = e.target.value;
                  setQuestions(newQs);
                  if (onQuestions) onQuestions(newQs);
                }}
                style={{ width: "100%", marginBottom: 6 }}
              />
              {q.choices && q.choices.map((c, j) => (
                <div key={j}>
                  <input
                    type="text"
                    value={c}
                    onChange={e => {
                      const newQs = [...questions];
                      newQs[i].choices[j] = e.target.value;
                      setQuestions(newQs);
                      if (onQuestions) onQuestions(newQs);
                    }}
                    style={{ width: "90%" }}
                  />
                  <input
                    type="radio"
                    checked={q.correctIndex === j}
                    onChange={() => {
                      const newQs = [...questions];
                      newQs[i].correctIndex = j;
                      setQuestions(newQs);
                      if (onQuestions) onQuestions(newQs);
                    }}
                  /> Correct
                </div>
              ))}
              <div>
                <label>Duration (sec): </label>
                <input
                  type="number"
                  value={q.durationSec || 20}
                  min={5}
                  max={120}
                  onChange={e => {
                    const newQs = [...questions];
                    newQs[i].durationSec = parseInt(e.target.value, 10);
                    setQuestions(newQs);
                    if (onQuestions) onQuestions(newQs);
                  }}
                  style={{ width: 60 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
