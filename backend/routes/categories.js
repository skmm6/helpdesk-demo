import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Получить все категории
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новую категорию
router.post('/', async (req, res) => {
  const { name, fields } = req.body;
  if (!name || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'name и fields (массив параметров) обязательны' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, fields) VALUES ($1, $2) RETURNING *',
      [name, JSON.stringify(fields)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить категорию
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, fields } = req.body;
  if (!name || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'name и fields обязательны' });
  }
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, fields = $2 WHERE id = $3 RETURNING *',
      [name, JSON.stringify(fields), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить категорию
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
