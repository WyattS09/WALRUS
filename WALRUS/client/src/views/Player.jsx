import { socket, send } from '../socket'
import { useState, useEffect } from 'react'


export default function Player() {
const [roomId, setRoomId] = useState('')
const [question, setQuestion] = useState(null)


useEffect(() => {
socket.onmessage = e => {
const msg = JSON.parse(e.data)
if (msg.type === 'QUESTION') setQuestion(msg)
}
}, [])


return (
<div>
{!question && (
<>
<input placeholder="Room Code" onChange={e => setRoomId(e.target.value)} />
<button onClick={() => send('JOIN_ROOM', { roomId, name: 'Player' })}>Join</button>
</>
)}


{question && question.choices.map(c => (
<button key={c.index} onClick={() => send('ANSWER', { roomId, answerIndex: c.index })}>
{c.text}
</button>
))}
</div>
)
}