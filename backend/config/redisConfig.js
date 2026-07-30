// Redis client + cache helpers.
// Source: Product/backend/config/redisConfig.js
const redis = require('redis');

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
});

client.on('connect', () => console.log('Redis socket connected'));
client.on('ready',   () => console.log('Redis client ready'));
client.on('error',   (err) => console.error('Redis connection error:', err));
client.on('end',     () => console.log('Redis connection closed'));

client.connect().catch(console.error);

async function getCache(key) {
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.error('[Redis] getCache error:', err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 300) {
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[Redis] setCache error:', err.message);
  }
}

async function deleteCache(...keys) {
  try {
    for (const key of keys) {
      if (key.includes('*')) {
        let cursor = '0';
        do {
          const [nextCursor, found] = await client.scan(cursor, 'MATCH', key, 'COUNT', 100);
          cursor = nextCursor;
          if (found.length > 0) await client.del(...found);
        } while (cursor !== '0');
      } else {
        await client.del(key);
      }
    }
  } catch (err) {
    console.error('[Redis] deleteCache error:', err.message);
  }
}

module.exports = { client, getCache, setCache, deleteCache };
