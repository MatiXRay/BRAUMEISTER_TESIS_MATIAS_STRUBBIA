import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkAuth } from './middlewares/requireAuth';
import { connectDB } from './config/db';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(clerkAuth);

app.use('/api', routes);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error al conectar MongoDB:', err);
    process.exit(1);
  });
