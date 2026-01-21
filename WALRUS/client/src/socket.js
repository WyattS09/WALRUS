export const socket = new WebSocket('ws://localhost:3001')


export function send(type, data = {}) {
socket.send(JSON.stringify({ type, ...data }))
}