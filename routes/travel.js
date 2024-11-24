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
import fs from 'fs';
import path from 'path';
import upload from '../multer.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.post('/add-travel', authenticatedToken, addTravel);
router.get('/get-all-travels', authenticatedToken, getTravels);
router.put('/update-travel/:id', authenticatedToken, editTravel);
router.delete('/delete-travel/:id', authenticatedToken, deleteTravel);
router.put('/update-is-fav/:id', authenticatedToken, editFav);
router.post('/search', authenticatedToken, searchTravel);

router.post('/image-upload', upload.single('image'), (req, res) => {
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
