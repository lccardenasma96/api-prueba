require('dotenv').config();

const express = require('express');
const app = express();
const usersRoutes = require('./users');
const cors = require('cors');
const { initDB } = require('./db');

const PORT = process.env.PORT;
if (!PORT) throw new Error('❌ La variable PORT no está definida');

app.use(cors());
app.use(express.json());
app.use('/users', usersRoutes);

initDB();

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

console.log("🌐 DATABASE_URL:", process.env.DATABASE_URL);
