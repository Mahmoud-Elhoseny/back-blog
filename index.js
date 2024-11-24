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

// Simplified CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://front-blog-76i4gd87g-mahmoudelhosenys-projects.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/travel', travelRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
