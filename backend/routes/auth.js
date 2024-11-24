import express from 'express';
import { getUser, login, register } from '../controllers/auth.js';
import { authenticatedToken } from '../utilites.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/get-user', authenticatedToken, getUser);

export default router;
