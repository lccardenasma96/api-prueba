const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clave_secreta';
const express = require('express');
const router = express.Router();
const { pool } = require('./db');
const authenticateToken = require('./auth');


// --------------- Registro de Usuarios ---------------
router.post('/register', async (req, res) => {
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
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '1h' });
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
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '1h' });
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

// --------------- Verificar token ---------------
router.get('/verify-token', authenticateToken, async (req, res) => {
  res.json({ 
    message: 'Token válido', 
    user: { 
      id: req.user.id, 
      name: req.user.name, 
      email: req.user.email 
    } 
  });
});

// --------------- Favoritos de Lugares ---------------
router.post('/favorite-places', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  if (!place_id) {
    return res.status(400).json({ error: 'place_id es requerido' });
  }

  try {
    await pool.query(
      `INSERT INTO favorite_places (user_id, place_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, place_id) DO NOTHING`,
      [req.user.id, place_id]
    );

    res.status(201).json({ message: 'Lugar agregado a favoritos' });
  } catch (err) {
    console.error('Error al agregar lugar favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/favorite-places', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.image, p.location, m.name as municipio_name
      FROM favorite_places f
      JOIN places p ON f.place_id = p.id
      JOIN municipios m ON p.municipio_id = m.id
      WHERE f.user_id = $1
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener lugares favoritos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/favorite-places/:place_id', authenticateToken, async (req, res) => {
  const { place_id } = req.params;

  try {
    await pool.query(
      'DELETE FROM favorite_places WHERE user_id = $1 AND place_id = $2',
      [req.user.id, place_id]
    );

    res.json({ message: 'Lugar eliminado de favoritos' });
  } catch (err) {
    console.error('Error al eliminar lugar favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
router.get('/favorite-places/:event_id', authenticateToken, async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT e.id, e.name, e.description, e.image, e.location, m.id as municipio_id
       FROM favorite_places f
       JOIN places e ON f.event_id = e.id
       JOIN municipios m ON e.municipio_id = m.id
       WHERE f.user_id = $1 AND f.event_id = $2`,
      [req.user.id, event_id]
    );

    // Siempre devuelve un array, aunque esté vacío
    res.json(result.rows);
  } catch (err) {
    console.error('Error al verificar evento favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// --------------- Favoritos de Eventos ---------------
router.post('/favorite-events', authenticateToken, async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: 'event_id es requerido' });
  }

  try {
    await pool.query(
      `INSERT INTO favorite_events (user_id, event_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, event_id) DO NOTHING`,
      [req.user.id, event_id]
    );

    res.status(201).json({ message: 'Evento agregado a favoritos' });
  } catch (err) {
    console.error('Error al agregar favorito de evento:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/favorite-events', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.name, e.description, e.start_date, e.end_date, e.image, e.location, m.name as municipio_name
      FROM favorite_events f
      JOIN events e ON f.event_id = e.id
      JOIN municipios m ON e.municipio_id = m.id
      WHERE f.user_id = $1
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener eventos favoritos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/favorite-events/:event_id', authenticateToken, async (req, res) => {
  const { event_id } = req.params;

  try {
    await pool.query(
      'DELETE FROM favorite_events WHERE user_id = $1 AND event_id = $2',
      [req.user.id, event_id]
    );

    res.json({ message: 'Evento eliminado de favoritos' });
  } catch (err) {
    console.error('Error al eliminar evento favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/favorite-events/:event_id', authenticateToken, async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT e.id, e.name, e.description, e.image, e.start_date, e.end_date, e.location, m.name as municipio_name
       FROM favorite_events f
       JOIN events e ON f.event_id = e.id
       JOIN municipios m ON e.municipio_id = m.id
       WHERE f.user_id = $1 AND f.event_id = $2`,
      [req.user.id, event_id]
    );

    // Siempre devuelve un array, aunque esté vacío
    res.json(result.rows);
  } catch (err) {
    console.error('Error al verificar evento favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// --------------- Lugares Visitados ---------------
router.post('/visited', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  if (!place_id) return res.status(400).json({ error: 'place_id is required' });

  try {
    await pool.query(
      'INSERT INTO visited (user_id, place_id) VALUES ($1, $2) ON CONFLICT (user_id, place_id) DO NOTHING',
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
      SELECT p.id, p.name, p.description, p.location, p.image, v.visited_date, m.name as municipio_name
      FROM visited v
      JOIN places p ON v.place_id = p.id
      JOIN municipios m ON p.municipio_id = m.id
      WHERE v.user_id = $1
      ORDER BY v.visited_date DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching visited places:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/visited/:place_id', authenticateToken, async (req, res) => {
  const { place_id } = req.params;

  try {
    await pool.query(
      'DELETE FROM visited WHERE user_id = $1 AND place_id = $2',
      [req.user.id, place_id]
    );

    res.json({ message: 'Lugar eliminado de visitados' });
  } catch (err) {
    console.error('Error al eliminar lugar visitado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------------- Calendario de Eventos ---------------
router.post('/calendar', authenticateToken, async (req, res) => {
  const { event_id } = req.body;
  if (!event_id) return res.status(400).json({ error: 'event_id is required' });

  try {
    await pool.query(
      'INSERT INTO calendar (user_id, event_id) VALUES ($1, $2) ON CONFLICT (user_id, event_id) DO NOTHING',
      [req.user.id, event_id]
    );
    res.json({ message: 'Event added to calendar' });
  } catch (err) {
    console.error('Error adding event to calendar:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.name, e.description, e.start_date, e.end_date, e.image, e.location, m.name as municipio_name
      FROM calendar c
      JOIN events e ON c.event_id = e.id
      JOIN municipios m ON e.municipio_id = m.id
      WHERE c.user_id = $1
      ORDER BY e.start_date ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/calendar/:event_id', authenticateToken, async (req, res) => {
  const { event_id } = req.params;

  try {
    await pool.query(
      'DELETE FROM calendar WHERE user_id = $1 AND event_id = $2',
      [req.user.id, event_id]
    );

    res.json({ message: 'Evento eliminado del calendario' });
  } catch (err) {
    console.error('Error al eliminar evento del calendario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------------- Agregar nuevo lugar ---------------
router.post('/places', async (req, res) => {
  const { name, description, location, image, municipio_id } = req.body;

  if (!name || !description || !location || !image || !municipio_id) {
    return res.status(400).json({ error: 'name, description, location, image, and municipio_id are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO places (name, description, location, image, municipio_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, location, image, municipio_id',
      [name, description, location, image, municipio_id]
    );

    const place = result.rows[0];
    res.status(201).json({ message: 'Place added successfully', place });
  } catch (err) {
    console.error('Error adding place:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/places', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, m.name as municipio_name 
      FROM places p 
      JOIN municipios m ON p.municipio_id = m.id
      ORDER BY p.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los lugares:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/places/:id', async (req, res) => {
  const placeId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT p.*, m.name as municipio_name 
      FROM places p 
      JOIN municipios m ON p.municipio_id = m.id
      WHERE p.id = $1
    `, [placeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching place:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Municipios ---------------
router.get('/municipios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM municipios ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los municipios:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/municipios/:id', async (req, res) => {
  const municipioId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM municipios WHERE id = $1', [municipioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Municipio not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching municipio:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Eventos ---------------
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, m.name as municipio_name 
      FROM events e 
      JOIN municipios m ON e.municipio_id = m.id
      ORDER BY e.start_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los eventos:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/events/:id', async (req, res) => {
  const eventId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT e.*, m.name as municipio_name 
      FROM events e 
      JOIN municipios m ON e.municipio_id = m.id
      WHERE e.id = $1
    `, [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Lugares por Municipio ---------------
router.get('/municipios/:id/places', async (req, res) => {
  const municipioId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT p.*, m.name as municipio_name 
      FROM places p 
      JOIN municipios m ON p.municipio_id = m.id
      WHERE p.municipio_id = $1
      ORDER BY p.name ASC
    `, [municipioId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching places by municipio:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------- Eventos por Municipio ---------------
router.get('/municipios/:id/events', async (req, res) => {
  const municipioId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT e.*, m.name as municipio_name 
      FROM events e 
      JOIN municipios m ON e.municipio_id = m.id
      WHERE e.municipio_id = $1
      ORDER BY e.start_date ASC
    `, [municipioId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events by municipio:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

module.exports = router;
