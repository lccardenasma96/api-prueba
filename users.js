const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clave_secreta';
const express = require('express');
const router = express.Router();
const { pool } = require('./db');
const authenticateToken = require('./auth');


// --------------- Registro de Usuarios ---------------
router.post('/', async (req, res) => {
  console.log('POST recibido en /', req.body);
  const { name, email, password } = req.body;
  console.log('Datos:', name, email, password);
  if (!name || !email || !password) {
    console.log('Faltan datos');
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hasheado');
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    console.log('Usuario insertado:', result.rows[0]);
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Login ---------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Obtener perfil ---------------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// --------------- Favoritos ---------------
router.post('/favorites', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  if (!place_id) return res.status(400).json({ error: 'place_id is required' });

  try {
    await pool.query(
      'INSERT INTO favorite_places (user_id, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, place_id]
    );
    res.json({ message: 'Place added to favorites' });
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.location
      FROM favorite_places f
      JOIN places p ON f.place_id = p.id
      WHERE f.user_id = $1
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/favoritesall', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Obtenemos el ID del usuario autenticado

  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.location
      FROM favorite_places fp
      JOIN places p ON fp.place_id = p.id
      WHERE fp.user_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener favoritos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// --------------- Visitados ---------------
router.post('/visited', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  if (!place_id) return res.status(400).json({ error: 'place_id is required' });

  try {
    await pool.query(
      'INSERT INTO visited_places (user_id, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, place_id]
    );
    res.json({ message: 'Place marked as visited' });
  } catch (err) {
    console.error('Error adding visited place:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/visited', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.location, v.visit_date
      FROM visited_places v
      JOIN places p ON v.place_id = p.id
      WHERE v.user_id = $1
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching visited places:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Calificaciones ---------------
router.post('/ratings', authenticateToken, async (req, res) => {
  const { place_id, rating, comment } = req.body;
  if (!place_id || !rating) return res.status(400).json({ error: 'place_id and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be between 1 and 5' });

  try {
    await pool.query(`
      INSERT INTO place_ratings (user_id, place_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, place_id)
      DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
    `, [req.user.id, place_id, rating, comment]);

    res.json({ message: 'Rating saved' });
  } catch (err) {
    console.error('Error saving rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Agregar nuevo lugar con eventos ---------------
router.post('/places', async (req, res) => {
  const { name, description, location, image, events } = req.body;

  if (!name || !description || !location || !image) {
    return res.status(400).json({ error: 'name, description, location, and image are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insertar lugar
    const placeResult = await client.query(
      'INSERT INTO places (name, description, location, image) VALUES ($1, $2, $3, $4) RETURNING id, name, description, location, image',
      [name, description, location, image]
    );

    const place = placeResult.rows[0];

    // Insertar eventos si existen
    if (Array.isArray(events)) {
      for (const event of events) {
        const { name: eventName, date, info } = event;
        if (!eventName || !date) continue;

        await client.query(
          `INSERT INTO place_events (place_id, name, event_date, info) 
           VALUES ($1, $2, $3, $4)`,
          [place.id, eventName, date, info || null]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Place and events added', place });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding place and events:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});
router.get('/places/:id/events', async (req, res) => {
  const placeId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT id, name, event_date, info, created_at
       FROM place_events
       WHERE place_id = $1
       ORDER BY event_date ASC`,
      [placeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching place events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/places', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM places');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los lugares:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/ratings/:place_id', async (req, res) => {
  const place_id = req.params.place_id;
  try {
    const result = await pool.query(`
      SELECT AVG(rating)::numeric(3,2) as average_rating, COUNT(*) as total_ratings
      FROM place_ratings
      WHERE place_id = $1
    `, [place_id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});
module.exports = router;
