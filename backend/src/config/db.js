// PostgreSQL connection pool configuration
// Will be implemented in Step 2

import pkg from 'pg';
import env from './env.js';

const { Pool } = pkg;

let pool;

export const initializePool = () => {
  pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

export const getPool = () => {
  if (!pool) {
    initializePool();
  }
  return pool;
};

export const query = async (text, params) => {
  return getPool().query(text, params);
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export default {
  initializePool,
  getPool,
  query,
  closePool
};
