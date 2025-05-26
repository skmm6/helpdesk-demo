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

// Создать тикет (ДИНАМИЧЕСКИЕ поля!)
router.post('/', async (req, res) => {
  const { category_id, fields, created_by } = req.body

  // Валидируем входящие данные
  if (
    !category_id ||
    !fields ||
    typeof fields !== 'object' ||
    !created_by ||
    typeof created_by !== 'string'
  ) {
    return res
      .status(400)
      .json({ error: 'category_id, fields и created_by обязательны' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO tickets (category_id, fields, status, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        category_id,
        JSON.stringify(fields), // или просто fields, если столбец JSONB
        'Новый',
        created_by
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить тикет (например, статус или назначенного)
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

// Частичное обновление тикета
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
