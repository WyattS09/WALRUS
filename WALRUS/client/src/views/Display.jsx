import { socket } from '../socket'
import { useState, useEffect } from 'react'


export default function Display() {
const [question, setQuestion] = useState(null)
const [board, setBoard] = useState([])


useEffect(() => {
socket.onmessage = e => {
const msg = JSON.parse(e.data)
if (msg.type === 'QUESTION') setQuestion(msg)
if (msg.type === 'LEADERBOARD') setBoard(msg.players)
}
}, [])


return (
<div>
{question && <h1>{question.prompt}</h1>}
{board.map(p => <div key={p.id}>{p.name}: {p.score}</div>)}
</div>
)
}