const { Pool } = require('pg');

const useSSL = process.env.DATABASE_URL?.includes('render.com') || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(useSSL && {
    ssl: {
      require: true, 
      rejectUnauthorized: false
    }
  })
});

async function initDB() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Failed to initialize DB', err);
  }
  console.log("📡 Conectando a:", process.env.DATABASE_URL);
}

module.exports = { pool, initDB };
