require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDB() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected');
  } catch (err) {
    console.error('Failed to initialize DB', err);
  }
}

module.exports = { pool, initDB };
