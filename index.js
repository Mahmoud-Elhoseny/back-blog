import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import travelRoutes from './routes/travel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/travel', travelRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
