import { send, socket } from '../socket'
import { useState, useEffect } from 'react'


export default function Host() {
const [roomId, setRoomId] = useState(null)
const [players, setPlayers] = useState([])
const [leaderboard, setLeaderboard] = useState(null)
const [socketReady, setSocketReady] = useState(socket.readyState === WebSocket.OPEN)


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
if (msg.type === 'ROSTER') setPlayers(msg.players)
if (msg.type === 'LEADERBOARD') {
console.log('Host got LEADERBOARD:', msg.players)
setLeaderboard(msg.players)
}
}

return () => {
// Cleanup if needed
}
}, [])

return (
    <div>
    <button onClick={() => send('CREATE_ROOM')} disabled={!socketReady}>
      {socketReady ? 'Create Room' : 'Connecting...'}
    </button>
    {roomId && <h2>Room: {roomId}</h2>}
    
    
    {leaderboard && (
    <div>
    <h3>Current Scores</h3>
    <ol>
    {leaderboard.map(p => <li key={p.id}>{p.name} – {p.score}</li>)}
    </ol>
    </div>
    )}
    
    {!leaderboard && players.length > 0 && (
    <div>
    <h3>Players</h3>
    <ul>
    {players.map(p => <li key={p.id}>{p.name} – {p.score}</li>)}
    </ul>
    </div>
    )}
    
    {roomId && (
    <>
    <button onClick={() => send('START_GAME', { roomId })}>
      {leaderboard ? 'Start Next Question' : 'Start Question'}
    </button>
    </>
    )}
    </div>
    )
    }