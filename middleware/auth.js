import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: user.id,
        username: user.username
      };
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export default auth; 