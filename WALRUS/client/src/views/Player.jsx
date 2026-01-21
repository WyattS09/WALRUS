import { socket, send } from '../socket'
import { useState, useEffect } from 'react'


export default function Player() {
const [roomId, setRoomId] = useState('')
const [question, setQuestion] = useState(null)
const [leaderboard, setLeaderboard] = useState(null)
const [socketReady, setSocketReady] = useState(socket.readyState === WebSocket.OPEN)
const [joined, setJoined] = useState(false)
const [answered, setAnswered] = useState(false)
const [playerId] = useState(() => {
  return 'player_' + Math.random().toString(36).substr(2, 9)
})


useEffect(() => {
const handleOpen = () => {
console.log('Socket open in Player component')
setSocketReady(true)
}

socket.addEventListener('open', handleOpen)

socket.onmessage = e => {
const msg = JSON.parse(e.data)
console.log('Player received message:', msg.type)
if (msg.type === 'QUESTION') {
setQuestion(msg)
setLeaderboard(null)
setAnswered(false)
}
if (msg.type === 'LEADERBOARD') {
console.log('Got LEADERBOARD:', msg.players)
setLeaderboard(msg.players)
setQuestion(null)
}
if (msg.type === 'ROSTER') {
console.log('Got ROSTER, players:', msg.players)
setJoined(true)
}
}

return () => {
// Cleanup if needed
}
}, [])

const handleAnswer = (answerIndex) => {
send('ANSWER', { roomId, answerIndex })
setAnswered(true)
console.log('Answer submitted:', answerIndex)
}

const handleJoin = () => {
console.log('Joining room:', roomId, 'with playerId:', playerId)
send('JOIN_ROOM', { roomId, playerId, name: 'Player' })
}

return (
<div>
{!joined && (
<>
<h2>Join a Room</h2>
<input 
placeholder="Room Code" 
value={roomId}
onChange={e => setRoomId(e.target.value.toUpperCase())} 
/>
<button 
onClick={handleJoin}
disabled={!socketReady || !roomId}
>
{socketReady ? 'Join' : 'Connecting...'}
</button>
</>
)}


{leaderboard && (
<>
<h2>Leaderboard</h2>
<ol>
{leaderboard.map(p => (
<li key={p.id}>{p.name} – {p.score} points</li>
))}
</ol>
<p>Waiting for next question...</p>
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
{answered && <p>Answer submitted! Waiting for results...</p>}
</>
)}
</div>
)
}