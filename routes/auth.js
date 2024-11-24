import express from 'express';
import { getUser, login, register } from '../controllers/auth.js';
import { authenticatedToken } from '../utilites.js';
import cors from 'cors';

const router = express.Router();

// Add OPTIONS handler for preflight requests
router.options('/register', cors());
router.options('/login', cors());
router.options('/get-user', cors());

// Update all routes to handle CORS headers consistently
router.post('/register', (req, res) => {
  register(req, res);
});

router.post('/login', (req, res) => {
  login(req, res);
});

router.get('/get-user', authenticatedToken, (req, res) => {
  getUser(req, res);
});

export default router;
