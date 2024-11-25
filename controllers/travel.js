import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addTravel = async (req, res) => {
  const { title, story, visitedLocation, image, visitedDate } = req.body;
  const { id: userId } = req.user;

  const locationArray = Array.isArray(visitedLocation)
    ? visitedLocation
    : JSON.parse(visitedLocation);

  if (!title || !story || !image || !visitedDate || !userId) {
    return res
      .status(400)
      .json({ error: 'Please fill in all required fields.' });
  }

  const sql = `
    INSERT INTO travels (title, story, visitedLocation, image, visitedDate, userId)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, story, JSON.stringify(locationArray), image, visitedDate, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get(
        'SELECT * FROM travels WHERE id = ?',
        [this.lastID],
        (err, travel) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            story: {
              ...travel,
              visitedLocation: JSON.parse(travel.visitedLocation),
              isFav: false,
            },
            message: 'Travel added successfully.',
          });
        }
      );
    }
  );
};

export const getTravels = async (req, res) => {
  const { id: userId } = req.user;

  const sql = `
    SELECT t.*, 
           CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as isFav
    FROM travels t
    LEFT JOIN favorites f ON t.id = f.travelId AND f.userId = ?
    ORDER BY t.createdAt DESC
  `;

  db.all(sql, [userId], (err, travels) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const transformedTravels = travels.map((travel) => ({
      ...travel,
      visitedLocation: JSON.parse(travel.visitedLocation),
      isFav: Boolean(travel.isFav),
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

  // First check if user is admin
  db.get('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get('SELECT * FROM travels WHERE id = ?', [id], (err, travel) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!travel) {
        return res.status(404).json({ error: 'Travel not found' });
      }

      // Allow edit if user is admin or the post creator
      if (user.isAdmin || travel.userId === userId) {
        const sql = `
          UPDATE travels 
          SET title = ?, story = ?, visitedLocation = ?, isFav = ?, image = ?, visitedDate = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        db.run(
          sql,
          [
            title,
            story,
            JSON.stringify(locationArray),
            isFav,
            image,
            visitedDate,
            id,
          ],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Travel updated successfully' });
          }
        );
      } else {
        return res.status(403).json({ error: 'Not authorized to edit this travel' });
      }
    });
  });
};

export const deleteTravel = async (req, res) => {
  const { id: travelId } = req.params;
  const { id: userId } = req.user;

  // First check if user is admin
  db.get('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get the travel post
    db.get('SELECT * FROM travels WHERE id = ?', [travelId], (err, travel) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!travel) {
        return res.status(404).json({ error: 'Travel not found' });
      }

      // Allow deletion if user is admin or the post creator
      if (user.isAdmin || travel.userId === userId) {
        db.run('DELETE FROM travels WHERE id = ?', [travelId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'Travel deleted successfully' });
        });
      } else {
        return res.status(403).json({ error: 'Not authorized' });
      }
    });
  });
};

export const editFav = async (req, res) => {
  const { isFav } = req.body;
  const { id: travelId } = req.params;
  const { id: userId } = req.user;

  db.get('SELECT * FROM travels WHERE id = ?', [travelId], (err, travel) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    if (isFav) {
      db.run(
        'INSERT OR IGNORE INTO favorites (userId, travelId) VALUES (?, ?)',
        [userId, travelId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'Added to favorites successfully' });
        }
      );
    } else {
      db.run(
        'DELETE FROM favorites WHERE userId = ? AND travelId = ?',
        [userId, travelId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res
            .status(200)
            .json({ message: 'Removed from favorites successfully' });
        }
      );
    }
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
