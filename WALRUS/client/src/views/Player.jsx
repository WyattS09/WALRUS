import { socket, send } from '../socket'
import { useState, useEffect } from 'react'


export default function Player() {
const [roomId, setRoomId] = useState('')
const [question, setQuestion] = useState(null)
const [socketReady, setSocketReady] = useState(false)
const [joined, setJoined] = useState(false)
const [answered, setAnswered] = useState(false)


useEffect(() => {
socket.addEventListener('open', () => setSocketReady(true))

socket.onmessage = e => {
const msg = JSON.parse(e.data)
if (msg.type === 'QUESTION') {
setQuestion(msg)
setAnswered(false)
}
if (msg.type === 'ROSTER') setJoined(true)
}
}, [])

const handleAnswer = (answerIndex) => {
send('ANSWER', { roomId, answerIndex })
setAnswered(true)
console.log('Answer submitted:', answerIndex)
}

return (
<div>
{!joined && (
<>
<input 
placeholder="Room Code" 
value={roomId}
onChange={e => setRoomId(e.target.value.toUpperCase())} 
/>
<button 
onClick={() => {
send('JOIN_ROOM', { roomId, playerId: crypto.randomUUID(), name: 'Player' })
console.log('Joining room:', roomId)
}}
disabled={!socketReady || !roomId}
>
{socketReady ? 'Join' : 'Connecting...'}
</button>
</>
)}


{question && (
<>
<h2>{question.prompt}</h2>
<div>
{question.choices.map((c, idx) => (
<button 
key={idx} 
onClick={() => handleAnswer(idx)}
disabled={answered}
style={{ opacity: answered ? 0.5 : 1 }}
>
{c}
</button>
))}
</div>
{answered && <p>Answer submitted! Waiting for next question...</p>}
</>
)}
</div>
)
}