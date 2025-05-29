import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ticketRoutes from './routes/tickets.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import authMiddleware from './middleware/auth.js';
import { pool } from './db.js';

// Ловим синхронные «падения» 
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
  // не выходим из процесса
});

// Ловим необработанные rejected-про́мисы
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // не выходим из процесса
});

const app = express();

app.use(cors());
app.use(express.json());

// Применяем аутентификацию к защищенным маршрутам
app.use('/tickets', authMiddleware, ticketRoutes);
app.use('/categories', authMiddleware, categoriesRouter);
// Маршруты для авторизации
app.use('/auth', authRouter);

// Тестовый корневой маршрут
app.get('/', (req, res) => {
  res.send('Helpdesk backend is running!');
});

app.use((err, req, res, next) => {
  console.error('❌ Unexpected error:', err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

// Проверка соединения с БД
pool.query('SELECT 1')
  .then(() => console.log('✅ DB connection established'))
  .catch(err => console.error('❌ DB connection error:', err));

// Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
