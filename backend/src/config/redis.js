// Redis cache configuration
// Will be implemented in Step 2

import { createClient } from 'redis';
import env from './env.js';

let client;

export const initializeRedis = async () => {
  client = createClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    socket: {
      reconnectStrategy: (retries) => Math.min(50 * Math.pow(2, retries), 500),
      connectTimeout: 5000
    }
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Redis connected'));

  await client.connect();
  return client;
};

export const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis not initialized. Call initializeRedis first.');
  }
  return client;
};

export const closeRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};

// Cache utilities
export const cacheGet = async (key) => {
  try {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Cache get error for key ${key}:`, err);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = env.CACHE_TTL) => {
  try {
    await getRedisClient().setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error(`Cache set error for key ${key}:`, err);
  }
};

export const cacheDel = async (key) => {
  try {
    await getRedisClient().del(key);
  } catch (err) {
    console.error(`Cache delete error for key ${key}:`, err);
  }
};

export const cacheInvalidate = async (pattern) => {
  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length > 0) {
      await getRedisClient().del(keys);
    }
  } catch (err) {
    console.error(`Cache invalidate error for pattern ${pattern}:`, err);
  }
};

export default {
  initializeRedis,
  getRedisClient,
  closeRedis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidate
};
