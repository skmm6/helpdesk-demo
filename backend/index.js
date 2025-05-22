import 'dotenv/config';
import express from "express";
import cors from 'cors';
import ticketRoutes from './routes/tickets.js'
import { initDb } from './db.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/tickets', ticketRoutes);

app.get('/', (reg, res) => {
    res.send('Helpdesk backend us running!');
});

const PORT = process.env.PORT || 3001;

// Сначала создаём таблицу
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
});