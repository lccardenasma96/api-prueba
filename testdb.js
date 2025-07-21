require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Conectado correctamente");
    const res = await client.query('SELECT NOW()');
    console.log(res.rows);
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  } finally {
    await client.end();
  }
})();
