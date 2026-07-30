import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL)

redis.on('connect', () => {
    console.log("Redis connected")
})

redis.on('error', (err) => {
    console.log(err)
})

export async function refreshTTL(sandboxId) {
    await redis.expire(`sandbox:${sandboxId}`, 120)
}


export default redis  