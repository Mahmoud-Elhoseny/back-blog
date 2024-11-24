import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Please fill in all fields',
      });
    }

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        error: true,
        message: 'Email already exists',
      });
    }

    const fullNameExists = await User.findOne({ where: { fullName } });
    if (fullNameExists) {
      return res.status(400).json({
        error: true,
        message: 'This username is already taken',
      });
    }

    const user = await User.create({
      fullName,
      email,
      password: bcrypt.hashSync(password, 8),
      createdAt: new Date(),
    });
    await user.save();
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '72h',
    });
    res.status(201).json({
      user,
      token,
      message: 'User created successfully',
      error: false,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '72h',
    });

    return res.status(200).json({
      error: false,
      message: 'User logged in successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error during login',
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      error: false,
      message: 'User found successfully',
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error while fetching user',
    });
  }
};
