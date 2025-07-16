require('dotenv').config();
const { Pool } = require('pg');

const useSSL = process.env.DATABASE_URL?.includes('render.com') || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL
    ? { require: true, rejectUnauthorized: false }
    : undefined
});

async function initDB() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Failed to initialize DB', err);
  }
}

module.exports = { pool, initDB };
