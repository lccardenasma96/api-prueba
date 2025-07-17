require('dotenv').config(); // 👈 Necesario para leer el .env

const express = require('express');
const app = express();
const usersRoutes = require('./users'); // ✅ Asegúrate de que el archivo users.js exporte un router
const cors = require('cors');
const { initDB } = require('./db');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Usa el prefijo '/users' para que coincida con la ruta que usas en Postman
app.use('/', usersRoutes);

initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
