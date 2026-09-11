// Redis client + cache helpers.
const redis = require('redis');

const client = redis.createClient({
  url:      `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
});

client.on('connect', () => console.log('Redis socket connected'));
client.on('ready',   () => console.log('Redis client ready'));
client.on('error',   (err) => console.error('Redis connection error:', err));
client.on('end',     () => console.log('Redis connection closed'));

// Resolves true once connected, false on connection failure (never rejects — the
// caller decides: dev degrades to memory fallbacks, prod refuses to boot).
const redisReady = client.connect()
  .then(() => true)
  .catch((err) => {
    console.error('[Redis] Initial connect failed:', err.message);
    return false;
  });

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
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
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
          const { cursor: nextCursor, keys: found } = await client.scan(cursor, {
            MATCH: key,
            COUNT: 100,
          });
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

module.exports = { client, redisReady, getCache, setCache, deleteCache };
