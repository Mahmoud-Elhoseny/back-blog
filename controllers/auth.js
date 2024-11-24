import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Please fill in all required fields.' });
  }

  try {
    db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (user) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
          INSERT INTO users (username, email, password)
          VALUES (?, ?, ?)
        `;

        db.run(sql, [username, email, hashedPassword], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const token = jwt.sign(
            { id: this.lastID, username },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );

          res.status(201).json({
            id: this.lastID,
            username,
            email,
            token,
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          token,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    db.get(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({
            error: true,
            message: 'Internal server error while fetching user'
          });
        }

        if (!user) {
          return res.status(404).json({
            error: true,
            message: 'User not found'
          });
        }

        return res.status(200).json({
          error: false,
          message: 'User found successfully',
          user
        });
      }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error while fetching user'
    });
  }
};