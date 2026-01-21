import Redis from 'ioredis'
export const redis = new Redis({ lazyConnect: true, maxRetriesPerRequest: null })

redis.connect().catch(err => {
  console.warn('Redis not available, running without persistence:', err.message)
})

export async function saveRoom(room) {
  if (redis.status === 'ready') {
    try {
      await redis.set(`room:${room.roomId}`, JSON.stringify(room))
    } catch (err) {
      console.warn('Failed to save room to Redis:', err.message)
    }
  }
}

export async function loadRoom(roomId) {
  if (redis.status === 'ready') {
    try {
      const data = await redis.get(`room:${roomId}`)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.warn('Failed to load room from Redis:', err.message)
    }
  }
  return null
}