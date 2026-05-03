import IORedis from 'ioredis'

const redis = new IORedis(process.env.UPSTASH_REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
})

export default redis