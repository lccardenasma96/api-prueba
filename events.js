const express = require('express');
const router = express.Router();
const pool = require('./db'); 

//Crear favorito

router.post('/favorite-events', async (req, res) => {
    const { user_id, event_id } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO favorite_events (user_id, event_id) VALUES ($1, $2) RETURNING *',
        [user_id, event_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al guardar evento favorito', error);
      res.status(500).json({ error: 'Error al guardar favorito' });
    }
  });

  //Eliminar favorito

  router.delete('/favorite-events', async (req, res) => {
    const { user_id, event_id } = req.body;
    try {
      await pool.query(
        'DELETE FROM favorite_events WHERE user_id = $1 AND event_id = $2',
        [user_id, event_id]
      );
      res.status(200).json({ message: 'Favorito eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar favorito', error);
      res.status(500).json({ error: 'Error al eliminar favorito' });
    }
  });

  //Ver todos los favoritos
  router.get('/favorite-events/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const result = await pool.query(
        `SELECT fe.id AS favorite_id, e.*
         FROM favorite_events fe
         JOIN events e ON fe.event_id = e.id
         WHERE fe.user_id = $1`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener favoritos', error);
      res.status(500).json({ error: 'Error al obtener favoritos' });
    }
  });
  
  module.exports = router;