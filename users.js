const express = require('express');
const router = express.Router();
const { pool } = require('./db');

router.use(express.json()); // para poder leer JSON en el body

// GET usuarios (ya tienes este)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST para agregar usuario
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
    