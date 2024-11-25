import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import travelRoutes from './routes/travel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fs from 'fs';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 8000;

// CORS configuration
const corsOptions = {
  origin: 'https://front-blog-eight.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 7200,
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Remove the old CORS middleware
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/travel', travelRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/users', userRoutes);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
