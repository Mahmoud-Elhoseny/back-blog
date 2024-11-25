import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addTravel = async (req, res) => {
  const { title, story, visitedLocation, isFav, image, visitedDate } = req.body;
  const { id: userId } = req.user;

  const locationArray = Array.isArray(visitedLocation)
    ? visitedLocation
    : JSON.parse(visitedLocation);

  if (!title || !story || !image || !visitedDate || !userId) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const sql = `
    INSERT INTO travels (title, story, visitedLocation, isFav, image, visitedDate, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, story, JSON.stringify(locationArray), isFav, image, visitedDate, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT * FROM travels WHERE id = ?', [this.lastID], (err, travel) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          story: {...travel, visitedLocation: JSON.parse(travel.visitedLocation)}, 
          message: 'Travel added successfully.' 
        });
      });
    }
  );
};

export const getTravels = async (req, res) => {
  const sql = `SELECT * FROM travels ORDER BY isFav DESC`;
  
  db.all(sql, [], (err, travels) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const transformedTravels = travels.map((travel) => ({
      ...travel,
      visitedLocation: JSON.parse(travel.visitedLocation),
    }));

    res.status(200).json(transformedTravels);
  });
};

export const editTravel = async (req, res) => {
  const { title, story, visitedLocation, isFav, image, visitedDate } = req.body;
  const { id: userId } = req.user;
  const { id } = req.params;

  const locationArray = Array.isArray(visitedLocation)
    ? visitedLocation
    : JSON.parse(visitedLocation);

  db.get('SELECT * FROM travels WHERE id = ?', [id], (err, travel) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }
    if (travel.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to edit this travel' });
    }

    const sql = `
      UPDATE travels 
      SET title = ?, story = ?, visitedLocation = ?, isFav = ?, image = ?, visitedDate = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      sql,
      [title, story, JSON.stringify(locationArray), isFav, image, visitedDate, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Travel updated successfully' });
      }
    );
  });
};

export const deleteTravel = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  db.get('SELECT * FROM travels WHERE id = ?', [id], (err, travel) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }
    if (travel.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this travel' });
    }

    const imageUrl = travel.image;
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../uploads', filename);
    
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

    db.run('DELETE FROM travels WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Travel deleted successfully' });
    });
  });
};

export const editFav = async (req, res) => {
  const { isFav } = req.body;
  const { id } = req.params;
  const { id: userId } = req.user;

  db.get('SELECT * FROM travels WHERE id = ?', [id], (err, travel) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    db.run(
      'UPDATE travels SET isFav = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [isFav, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Favorite status updated successfully' });
      }
    );
  });
};

export const searchTravel = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchQuery = `%${query.toLowerCase()}%`;
  const sql = `
    SELECT * FROM travels 
    WHERE LOWER(title) LIKE ? 
    OR LOWER(story) LIKE ? 
    OR LOWER(visitedLocation) LIKE ?
  `;

  db.all(sql, [searchQuery, searchQuery, searchQuery], (err, travels) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const transformedTravels = travels.map((travel) => ({
      ...travel,
      visitedLocation: JSON.parse(travel.visitedLocation),
    }));
    
    res.status(200).json(transformedTravels);
  });
};
