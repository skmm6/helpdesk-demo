import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Получить все тикеты 
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tickets ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать тикет
router.post('/', async (req, res) => {
    const { full_name, phone, email, category, description, screenshot_url } = req.body;

    if (!full_name || !phone || !email || !category || !description) {
        return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tickets (full_name, phone, email, category, description, screenshot_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [full_name, phone, email, category, description, screenshot_url || null, 'Новый']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить тикет
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    try {
        const result = await pool.query(
            "UPDATE tickets SET status = $1, assigned_to = $2 WHERE id = $3 RETURNING *",
            [status, assigned_to, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// обновить часть полей 
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tickets SET status = $1, assigned_to = $2 WHERE id = $3 RETURNING *",
      [status, assigned_to, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;