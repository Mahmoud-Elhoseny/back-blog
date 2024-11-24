import fs from 'fs';
import Travel from '../models/Travel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op, Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCustomDate(dateStr) {
  // Remove ordinal indicators (st, nd, rd, th)
  const cleanDate = dateStr.replace(/(st|nd|rd|th)/, '');
  return new Date(cleanDate);
}

export const addTravel = async (req, res) => {
  const { title, story, visitedLocation, isFav, image, visitedDate } = req.body;
  const { id: userId } = req.user;

  const locationArray = Array.isArray(visitedLocation)
    ? visitedLocation
    : JSON.parse(visitedLocation);

  if (!title || !story || !image || !visitedDate || !userId) {
    return res
      .status(400)
      .json({ error: 'Please fill in all required fields.' });
  }

  try {
    const travel = await Travel.create({
      title,
      story,
      visitedLocation: locationArray,
      isFav,
      image,
      visitedDate,
      userId,
    });
    await travel.save();
    res
      .status(201)
      .json({ story: travel, message: 'Travel added successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTravels = async (req, res) => {
  try {
    const travels = await Travel.findAll({
      order: [['isFav', 'DESC']],
      raw: true,
    });

    const transformedTravels = travels.map((travel) => ({
      ...travel,
      visitedLocation: JSON.parse(travel.visitedLocation),
    }));

    res.status(200).json(transformedTravels);
  } catch (error) {
    console.error('Error in getTravels:', error);
    res.status(500).json({ error: error.message });
  }
};

export const editTravel = async (req, res) => {
  const { title, story, visitedLocation, isFav, image, visitedDate } = req.body;
  const { id: userId } = req.user;
  const { id } = req.params;

  const locationArray = Array.isArray(visitedLocation)
    ? visitedLocation
    : JSON.parse(visitedLocation);

  const travel = await Travel.findByPk(id);
  if (!travel) {
    return res.status(404).json({ error: 'Travel not found' });
  }
  if (travel.userId !== userId) {
    return res
      .status(403)
      .json({ error: 'You are not authorized to edit this travel' });
  }

  try {
    travel.title = title;
    travel.story = story;
    travel.visitedLocation = locationArray;
    travel.isFav = isFav;
    travel.image = image;
    travel.visitedDate = visitedDate;
    await travel.save();
    res.status(200).json({ message: 'Travel updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTravel = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  const travel = await Travel.findByPk(id);
  if (!travel) {
    return res.status(404).json({ error: 'Travel not found' });
  }
  if (travel.userId !== userId) {
    return res
      .status(403)
      .json({ error: 'You are not authorized to delete this travel' });
  }
  try {
    const imageUrl = travel.image;
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../uploads', filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    await travel.destroy();
    res.status(200).json({ message: 'Travel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editFav = async (req, res) => {
  const { isFav } = req.body;
  const { id } = req.params;
  const { id: userId } = req.user;
  const travel = await Travel.findByPk(id);
  if (!travel) {
    return res.status(404).json({ error: 'Travel not found' });
  }

  try {
    travel.isFav = isFav;
    await travel.save();
    res.status(200).json({ message: 'Favorite status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchTravel = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const travels = await Travel.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), {
            [Op.like]: `%${query.toLowerCase()}%`,
          }),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('story')), {
            [Op.like]: `%${query.toLowerCase()}%`,
          }),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('visitedLocation')),
            {
              [Op.like]: `%${query.toLowerCase()}%`,
            }
          ),
        ],
      },
      raw: true,
    });
    const transformedTravels = travels.map((travel) => ({
      ...travel,
      visitedLocation: JSON.parse(travel.visitedLocation),
    }));
    res.status(200).json(transformedTravels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
