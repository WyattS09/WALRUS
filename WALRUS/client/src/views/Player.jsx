import { socket, send } from '../socket'
import { useState, useEffect } from 'react'


export default function Player({ username }) {
const [roomId, setRoomId] = useState('')
const [question, setQuestion] = useState(null)
const [leaderboard, setLeaderboard] = useState(null)
const [socketReady, setSocketReady] = useState(socket.readyState === WebSocket.OPEN)
const [joined, setJoined] = useState(false)
const [answered, setAnswered] = useState(false)
const [currentScore, setCurrentScore] = useState(0)
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
console.log('Got ROSTER:', msg.players)
const player = msg.players.find(p => p.id === playerId || p.name === 'Player')
if (player) {
setCurrentScore(player.score)
}
setJoined(true)
}
}

return () => {
// Cleanup if needed
}
}, [playerId])

const handleAnswer = (answerIndex) => {
send('ANSWER', { roomId, answerIndex, playerId })
setAnswered(true)
console.log('Answer submitted:', answerIndex)
}

const handleJoin = () => {
console.log('Joining room:', roomId, 'with playerId:', playerId, 'username:', username)
send('JOIN_ROOM', { roomId, playerId, name: username })
}

return (
<div style={{ padding: '20px', fontSize: '20px' }}>
{!joined && (
<>
<h1>Join a Room</h1>
<input 
placeholder="Room Code" 
value={roomId}
onChange={e => setRoomId(e.target.value.toUpperCase())} 
/>
<button 
onClick={handleJoin}
disabled={!socketReady || !roomId}
style={{ padding: '10px 20px', fontSize: '16px' }}
>
{socketReady ? 'Join' : 'Connecting...'}
</button>
</>
)}

{joined && !question && !leaderboard && (
<div>
<h2>Waiting for next question...</h2>
<p>Your Score: {currentScore}</p>
</div>
)}

{leaderboard && (
<>
<h2>Leaderboard</h2>
<ol style={{ fontSize: '24px' }}>
{leaderboard.map(p => (
<li key={p.id}>{p.name} – {p.score} points</li>
))}
</ol>
<p>Waiting for next question...</p>
</>
)}

{question && (
<>
<div style={{ marginBottom: '20px' }}>
<p style={{ fontSize: '18px' }}>Your Score: {currentScore}</p>
</div>
<div>
{question.choices.map((c, idx) => (
<button 
key={idx} 
onClick={() => handleAnswer(idx)}
disabled={answered}
style={{ 
display: 'block',
margin: '10px auto',
padding: '15px 30px',
fontSize: '18px',
width: '90%',
maxWidth: '300px',
opacity: answered ? 0.5 : 1,
cursor: answered ? 'not-allowed' : 'pointer'
}}
>
{c}
</button>
))}
</div>
{answered && <p>✓ Answer submitted!</p>}
</>
)}
</div>
)
}