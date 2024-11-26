import express from 'express';
import {
  addTravel,
  getTravels,
  editTravel,
  deleteTravel,
  editFav,
  searchTravel,
} from '../controllers/travel.js';
import fs from 'fs';
import path from 'path';
import upload from '../multer.js';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
router.use(auth);

router.post('/add-travel', addTravel);

router.get('/get-all-travels', getTravels);

router.put('/update-travel/:id', editTravel);
router.delete('/delete-travel/:id', deleteTravel);

router.put('/update-is-fav/:id', editFav);
router.post('/search', searchTravel);

// image upload

router.post('/image-upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://back-blog-2-gdeh.onrender.com'
        : process.env.BASE_URL;

    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// delete image

router.delete('/delete-image', async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'No image url provided' });
  }
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
