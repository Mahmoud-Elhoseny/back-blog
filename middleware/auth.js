import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.error('User not found:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false
    };
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export default auth; 