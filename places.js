const express = require('express');
const router = express.Router();
const { pool } = require('./db');

router.use(express.json()); // para poder leer JSON en el body


// que me guarde los lugares favoritos
// que me guarde los lugarees visitados
// que yo pueda calificar 
// que yo pueda ver la calificacion total 
