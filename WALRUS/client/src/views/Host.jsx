import { send, socket } from '../socket'
import { useState, useEffect } from 'react'


export default function Host({ username, customQuestions = [] }) {
  console.log('Host.jsx: customQuestions prop:', customQuestions)
const [roomId, setRoomId] = useState(null)
const [players, setPlayers] = useState([])
const [leaderboard, setLeaderboard] = useState(null)
const [question, setQuestion] = useState(null)
const [timeLeft, setTimeLeft] = useState(0)
const [socketReady, setSocketReady] = useState(socket.readyState === WebSocket.OPEN)
const handleCreateRoom = () => {
  if (customQuestions.length === 0) {
    alert('Please add at least one question before creating a room')
    return
  }
  console.log('Sending CREATE_ROOM with questions:', customQuestions)
  send('CREATE_ROOM', { questions: customQuestions })
}


useEffect(() => {
const handleOpen = () => {
console.log('Socket open in Host component')
setSocketReady(true)
}

socket.addEventListener('open', handleOpen)

socket.onmessage = e => {
const msg = JSON.parse(e.data)
console.log('Host received message:', msg.type)
if (msg.type === 'ROOM_CREATED') setRoomId(msg.roomId)
if (msg.type === 'ROSTER') {
console.log('Host got ROSTER:', msg.players)
setPlayers(msg.players)
}
if (msg.type === 'QUESTION') {
console.log('Host got QUESTION:', msg.prompt)
setQuestion(msg)
setTimeLeft(msg.duration / 1000)
setLeaderboard(null)
}
if (msg.type === 'LEADERBOARD') {
console.log('Host got LEADERBOARD:', msg.players)
setLeaderboard(msg.players)
setQuestion(null)
}
}

return () => {
// Cleanup if needed
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
    <div>
    <h1>WALRUS Host</h1>
    <button onClick={handleCreateRoom} disabled={!socketReady || customQuestions.length === 0}>
      {!socketReady ? 'Connecting...' : customQuestions.length === 0 ? 'Add Questions First' : 'Create Room'}
    </button>
    {roomId && <h2>Room: {roomId}</h2>}
    
    
    {question && (
    <div>
    <h2>{question.prompt}</h2>
    <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
    ⏱️ {timeLeft}s
    </div>
    </div>
    )}
    
    {leaderboard && (
    <div>
    <h3>Current Scores</h3>
    <ol>
    {leaderboard.map(p => <li key={p.id}>{p.name} – {p.score}</li>)}
    </ol>
    </div>
    )}
    
    {!leaderboard && players.length > 0 && !question && (
    <div>
    <h3>Players</h3>
    <ul>
    {players.map(p => <li key={p.id}>{p.name} – {p.score}</li>)}
    </ul>
    </div>
    )}
    
    {roomId && !question && !leaderboard && players.length === 0 && (
    <p>Waiting for players to join...</p>
    )}
    
    {roomId && !question && !leaderboard && players.length > 0 && (
    <button onClick={() => send('START_GAME', { roomId })}>Start Question</button>
    )}
    
    {roomId && question && (
    <button onClick={() => send('END_QUESTION', { roomId })}>End Question</button>
    )}
    
    {roomId && leaderboard && (
    <button onClick={() => send('START_GAME', { roomId })}>Start Next Question</button>
    )}
    </div>
    )
    }