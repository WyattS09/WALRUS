import Redis from 'ioredis'
export const redis = new Redis()


export async function saveRoom(room) {
await redis.set(`room:${room.roomId}`, JSON.stringify(room))
}


export async function loadRoom(roomId) {
const data = await redis.get(`room:${roomId}`)
return data ? JSON.parse(data) : null
}