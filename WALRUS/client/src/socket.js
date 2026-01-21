export const socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event)
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket closed')
})

export function send(type, data = {}) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...data }))
  } else {
    console.warn('WebSocket not ready, message not sent:', type)
  }
}