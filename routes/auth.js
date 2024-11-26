import express from 'express';
import { getUser, login, register } from '../controllers/auth.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/get-user', auth, getUser);

export default router;
