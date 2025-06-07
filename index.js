const express = require('express');
const app = express();
const usersRoutes = require('./users'); // Asegúrate que el path esté bien
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Esto es necesario para leer req.body

app.use('/', usersRoutes); // Usa el prefijo correcto

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
