import express from 'express';
import {
  addTravel,
  getTravels,
  editTravel,
  deleteTravel,
  editFav,
  searchTravel,
} from '../controllers/travel.js';
import { authenticatedToken } from '../utilites.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import upload from '../multer.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const corsOptions = {
  origin: [
    'https://front-blog-eight.vercel.app',
    'https://front-blog-76i4gd87g-mahmoudelhosenys-projects.vercel.app',
    'http://localhost:3000',
    'https://back-blog-1.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Add OPTIONS handlers for all routes
router.options('*', cors(corsOptions));

// Apply cors to all routes
router.post('/add-travel', cors(corsOptions), authenticatedToken, addTravel);
router.get('/get-all-travels', cors(corsOptions), authenticatedToken, getTravels);
router.put('/update-travel/:id', cors(corsOptions), authenticatedToken, editTravel);
router.delete('/delete-travel/:id', cors(corsOptions), authenticatedToken, deleteTravel);
router.put('/update-is-fav/:id', cors(corsOptions), authenticatedToken, editFav);
router.post('/search', cors(corsOptions), authenticatedToken, searchTravel);

router.post('/image-upload', cors(corsOptions), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
