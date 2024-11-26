import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ id: user.id, username, email, token });
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
    const user = await User.findOne({ where: { email } });
    
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'username', 'email'] 
    });

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
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error while fetching user'
    });
  }
};