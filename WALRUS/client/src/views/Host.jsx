import { send, socket } from '../socket'
import { useState, useEffect } from 'react'


export default function Host() {
const [roomId, setRoomId] = useState(null)
const [players, setPlayers] = useState([])
const [socketReady, setSocketReady] = useState(false)


useEffect(() => {
socket.addEventListener('open', () => setSocketReady(true))

socket.onmessage = e => {
const msg = JSON.parse(e.data)
if (msg.type === 'ROOM_CREATED') setRoomId(msg.roomId)
if (msg.type === 'ROSTER') setPlayers(msg.players)
}
}, [])

return (
    <div>
    <button onClick={() => send('CREATE_ROOM')} disabled={!socketReady}>
      {socketReady ? 'Create Room' : 'Connecting...'}
    </button>
    {roomId && <h2>Room: {roomId}</h2>}
    
    
    <ul>
    {players.map(p => <li key={p.id}>{p.name} – {p.score}</li>)}
    </ul>
    
    
    {roomId && (
    <>
    <button onClick={() => send('START_GAME', { roomId })}>Start Question</button>
    <button onClick={() => send('END_QUESTION', { roomId })}>End Question</button>
    </>
    )}
    </div>
    )
    }