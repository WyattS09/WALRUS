import crypto from 'crypto'
import { rooms, clients } from './state.js'
import { questions } from './questions.js'
import { scoreAnswer } from './scoring.js'
import { saveRoom, loadRoom } from './redis.js'
import { estimateLatency } from './latency.js'


export function registerClient(ws) {
const id = crypto.randomUUID()
clients.set(ws, { id, roomId: null })
}


export async function handleMessage(ws, msg) {
const client = clients.get(ws)


switch (msg.type) {
case 'PING': {
ws.send(JSON.stringify({ type: 'PONG', ts: msg.ts }))
break
}
case 'CREATE_ROOM': {
    const roomId = Math.random().toString(36).slice(2, 7).toUpperCase()
    const room = {
    roomId,
    hostId: client.id,
    qIndex: 0,
    players: [],
    submissions: {},
    startTs: null
    }
    rooms.set(roomId, room)
    await saveRoom(room)
    ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }))
    break
    }
case 'JOIN_ROOM': {
let room = rooms.get(msg.roomId) || await loadRoom(msg.roomId)
if (!room) return


client.roomId = msg.roomId


let player = room.players.find(p => p.id === msg.playerId)
if (!player) {
player = { id: client.id, name: msg.name, score: 0, latency: 50 }
room.players.push(player)
}


rooms.set(msg.roomId, room)
await saveRoom(room)


broadcast(msg.roomId, { type: 'ROSTER', players: room.players })
break
}
case 'PONG': {
    const latency = estimateLatency(msg.sentTs, Date.now())
    const room = rooms.get(client.roomId)
    const player = room.players.find(p => p.id === client.id)
    if (player) player.latency = latency
    break
    }
    
    
case 'START_GAME': {
const room = rooms.get(msg.roomId)
const q = questions[room.qIndex]
room.startTs = Date.now()
room.submissions = {}
    
    
broadcast(msg.roomId, {
type: 'QUESTION',
questionId: q.questionId,
prompt: q.prompt,
choices: shuffle(q.choices),
startTs: room.startTs,
duration: q.durationSec * 1000
})
break
}

case 'ANSWER': {
    const room = rooms.get(msg.roomId)
    if (room.submissions[client.id]) return
    room.submissions[client.id] = true
    
    
    const q = questions[room.qIndex]
    const player = room.players.find(p => p.id === client.id)
    
    
    if (msg.answerIndex === q.correctIndex) {
    player.score += scoreAnswer({
    startTs: room.startTs,
    receivedTs: Date.now(),
    latency: player.latency,
    duration: q.durationSec * 1000
    })
    }
    
    
    await saveRoom(room)
    break
}
case 'END_QUESTION': {
    const room = rooms.get(msg.roomId)
    broadcast(msg.roomId, {
    type: 'LEADERBOARD',
    players: [...room.players].sort((a, b) => b.score - a.score)
    })
    room.qIndex++
    await saveRoom(room)
    break
    }
    }
    }
    
    
    function broadcast(roomId, payload) {
    for (const [ws, c] of clients) {
    if (c.roomId === roomId) ws.send(JSON.stringify(payload))
    }
    }
    
    
    function shuffle(arr) {
    return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1])
}