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
    client.roomId = roomId
    await saveRoom(room)
    ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }))
    break
    }
case 'JOIN_ROOM': {
let room = rooms.get(msg.roomId) || await loadRoom(msg.roomId)
if (!room) {
console.log('Room not found:', msg.roomId)
return
}

client.roomId = msg.roomId
const playerId = msg.playerId
if (!playerId) {
  console.error('JOIN_ROOM missing playerId')
  return
}

let player = room.players.find(p => p.id === playerId)
if (!player) {
player = { id: playerId, name: msg.name, score: 0, latency: 50 }
room.players.push(player)
console.log('Player joined:', playerId, 'room:', msg.roomId)
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
if (!room) return

if (room.qIndex >= questions.length) {
console.log('Quiz finished! All questions answered')
broadcast(msg.roomId, { type: 'QUIZ_FINISHED', message: 'Quiz is complete!' })
return
}

const q = questions[room.qIndex]
room.startTs = Date.now()
room.submissions = {}

// Shuffle choices and track where the correct answer ended up
console.log('DEBUG START_GAME: Question index:', room.qIndex)
console.log('DEBUG START_GAME: Original choices:', q.choices)
console.log('DEBUG START_GAME: Correct index from question:', q.correctIndex)
const correctChoice = q.choices[q.correctIndex]
console.log('DEBUG START_GAME: Correct choice:', correctChoice)
const shuffledChoices = shuffle(q.choices)
console.log('DEBUG START_GAME: Shuffled choices:', shuffledChoices)
const correctIndex = shuffledChoices.indexOf(correctChoice)
console.log('DEBUG START_GAME: Correct index AFTER shuffle:', correctIndex)
room.currentCorrectIndex = correctIndex

broadcast(msg.roomId, {
type: 'QUESTION',
questionId: q.questionId,
prompt: q.prompt,
choices: shuffledChoices,
startTs: room.startTs,
duration: q.durationSec * 1000
})
break
}

case 'ANSWER': {
    console.log('DEBUG: ANSWER message received')
    const room = rooms.get(msg.roomId)
    console.log('DEBUG: room found?', !!room)
    if (!room) return
    const playerId = msg.playerId
    console.log('DEBUG: playerId =', playerId)
    if (!playerId) {
      console.error('ANSWER missing playerId')
      return
    }
    
    // Ensure submissions object exists
    if (!room.submissions) room.submissions = {}
    
    console.log('DEBUG: checking if already submitted:', room.submissions[playerId])
    if (room.submissions[playerId]) return
    room.submissions[playerId] = true
    
    
    const player = room.players.find(p => p.id === playerId)
    console.log('DEBUG: player found?', !!player)
    
    if (!player) return
    
    console.log('DEBUG: room.currentCorrectIndex =', room.currentCorrectIndex, 'msg.answerIndex =', msg.answerIndex)
    const isCorrect = msg.answerIndex === room.currentCorrectIndex
    console.log('DEBUG: Answer comparison - Correct Index:', room.currentCorrectIndex, 'Player Selected:', msg.answerIndex, 'Match?:', isCorrect)
    const pointsAwarded = isCorrect ? scoreAnswer({
    startTs: room.startTs,
    receivedTs: Date.now(),
    latency: player.latency,
    duration: 20000
    }) : 0
    
    player.score += pointsAwarded
    console.log('Player', player.name, 'answered. Correct:', isCorrect, 'Points:', pointsAwarded, 'Total:', player.score)
    
    
    await saveRoom(room)
    broadcast(msg.roomId, { type: 'ROSTER', players: room.players })
    
    // Check if all players have answered
    const allAnswered = room.players.every(p => room.submissions[p.id])
    if (allAnswered && room.players.length > 0) {
      console.log('All players answered, auto-ending question')
      // Auto-end the question after a short delay
      setTimeout(() => {
        const currentRoom = rooms.get(msg.roomId)
        if (currentRoom && currentRoom.qIndex === room.qIndex) {
          broadcast(msg.roomId, {
            type: 'LEADERBOARD',
            players: [...currentRoom.players].sort((a, b) => b.score - a.score)
          })
          currentRoom.qIndex++
          currentRoom.submissions = {}
          saveRoom(currentRoom)
        }
      }, 500)
    }
    break
}
case 'END_QUESTION': {
    const room = rooms.get(msg.roomId)
    broadcast(msg.roomId, {
    type: 'LEADERBOARD',
    players: [...room.players].sort((a, b) => b.score - a.score)
    })
    room.qIndex++
    room.submissions = {}
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