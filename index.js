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
app.use('/users', usersRoutes);

initDB();

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  
});
console.log("🌐 DATABASE_URL:", process.env.DATABASE_URL);
