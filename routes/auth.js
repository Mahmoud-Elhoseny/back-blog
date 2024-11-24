import express from 'express';
import { getUser, login, register } from '../controllers/auth.js';
import { authenticatedToken } from '../utilites.js';
import cors from 'cors';

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

// Add OPTIONS handler for preflight requests
router.options('/register', cors(corsOptions));
router.options('/login', cors(corsOptions));
router.options('/get-user', cors(corsOptions));

// Update all routes to handle CORS headers consistently
router.post('/register', cors(corsOptions), (req, res) => {
  register(req, res);
});

router.post('/login', cors(corsOptions), (req, res) => {
  login(req, res);
});

router.get('/get-user', cors(corsOptions), authenticatedToken, (req, res) => {
  getUser(req, res);
});

export default router;
