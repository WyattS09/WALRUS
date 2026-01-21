import http from 'http'
import { WebSocketServer } from 'ws'
import { registerClient, handleMessage } from './ws.js'


const server = http.createServer()
const wss = new WebSocketServer({ server })


wss.on('connection', ws => {
registerClient(ws)
ws.on('message', msg => handleMessage(ws, JSON.parse(msg)))
})


server.listen(3001, () => console.log('WebSocket server running on :3001'))