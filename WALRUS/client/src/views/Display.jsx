import { socket } from '../socket'
import { useState, useEffect } from 'react'


export default function Display() {
const [question, setQuestion] = useState(null)
const [board, setBoard] = useState([])
const [timeLeft, setTimeLeft] = useState(0)


useEffect(() => {
socket.onmessage = e => {
const msg = JSON.parse(e.data)
if (msg.type === 'QUESTION') {
console.log('Display got QUESTION:', msg.prompt)
setQuestion(msg)
setTimeLeft(msg.duration / 1000)
}
if (msg.type === 'ROSTER') {
console.log('Display got ROSTER update')
setBoard(msg.players)
}
if (msg.type === 'LEADERBOARD') {
console.log('Display got LEADERBOARD')
setBoard(msg.players)
setQuestion(null)
}
}
}, [])

useEffect(() => {
if (!question || timeLeft <= 0) return

const interval = setInterval(() => {
setTimeLeft(t => Math.max(0, t - 1))
}, 1000)

return () => clearInterval(interval)
}, [question, timeLeft])


return (
<div style={{ padding: '20px', fontSize: '24px' }}>
{question && (
<div>
<h1>{question.prompt}</h1>
<div style={{ marginTop: '20px', fontSize: '48px', fontWeight: 'bold' }}>
⏱️ {timeLeft}s
</div>
</div>
)}

{board.length > 0 && (
<div style={{ marginTop: '30px' }}>
<h2>Live Scores</h2>
<ol style={{ fontSize: '32px' }}>
{board.map((p, i) => (
<li key={p.id}>{p.name} – {p.score} pts</li>
))}
</ol>
</div>
)}
</div>
)
}