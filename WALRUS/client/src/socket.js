class SocketWrapper {
  constructor() {
    this.socket = this.createSocket()
    this.handlers = { open: [], message: [], close: [], error: [] }
    this.reconnectAttempts = 0
    this.setupSocket()
  }

  createSocket() {
    return new WebSocket('ws://localhost:3001')
  }

  setupSocket() {
    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.handlers.open.forEach(cb => cb())
    })

    this.socket.addEventListener('message', (e) => {
      this.handlers.message.forEach(cb => cb(e))
    })

    this.socket.addEventListener('close', () => {
      console.log('WebSocket closed, attempting to reconnect...')
      this.reconnectAttempts++
      if (this.reconnectAttempts < 10) {
        setTimeout(() => {
          this.socket = this.createSocket()
          this.setupSocket()
        }, 1000 * this.reconnectAttempts)
      }
    })

    this.socket.addEventListener('error', (e) => {
      console.error('WebSocket error:', e)
      this.handlers.error.forEach(cb => cb(e))
    })
  }

  addEventListener(type, callback) {
    if (this.handlers[type]) {
      this.handlers[type].push(callback)
    }
  }

  set onmessage(callback) {
    this.handlers.message = [callback]
  }

  get readyState() {
    return this.socket.readyState
  }

  send(data) {
    console.log('socket.js: sending payload:', data)
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data)
    } else {
      console.warn('WebSocket not ready, message queued')
    }
  }
}

export const socket = new SocketWrapper()

export function send(type, data = {}) {
  socket.send(JSON.stringify({ type, ...data }))
}