import { Travel, User, Favorite } from '../models/index.js';
import { Op } from 'sequelize';

export const addTravel = async (req, res) => {
  try {
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

    const travel = await Travel.create({
      title,
      story,
      visitedLocation: locationArray,
      image,
      visitedDate,
      userId,
    });

    const travelWithFav = {
      ...travel.toJSON(),
      isFav: false,
    };

    res.status(201).json({
      story: travelWithFav,
      message: 'Travel added successfully.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTravels = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const travels = await Travel.findAll({
      include: [
        {
          model: Favorite,
          where: { userId },
          required: false,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const transformedTravels = travels.map((travel) => ({
      ...travel.toJSON(),
      isFav: !!travel.Favorites?.length,
    }));

    res.status(200).json(transformedTravels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editTravel = async (req, res) => {
  try {
    const { title, story, visitedLocation, image, visitedDate } = req.body;
    const { id } = req.params;

    const locationArray = Array.isArray(visitedLocation)
      ? visitedLocation
      : JSON.parse(visitedLocation);

    const travel = await Travel.findByPk(id);

    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    await travel.update({
      title,
      story,
      visitedLocation: locationArray,
      image,
      visitedDate,
    });

    res.status(200).json({ message: 'Travel updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTravel = async (req, res) => {
  try {
    const { id: travelId } = req.params;

    const travel = await Travel.findByPk(travelId);

    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    await travel.destroy();
    res.status(200).json({ message: 'Travel deleted successfully' });
  } catch (error) {
    console.error('Delete travel error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const editFav = async (req, res) => {
  try {
    const { isFav } = req.body;
    const { id: travelId } = req.params;
    const { id: userId } = req.user;

    const travel = await Travel.findByPk(travelId);

    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    if (isFav) {
      await Favorite.findOrCreate({
        where: { userId, travelId },
      });
      res.status(200).json({ message: 'Added to favorites successfully' });
    } else {
      await Favorite.destroy({
        where: { userId, travelId },
      });
      res.status(200).json({ message: 'Removed from favorites successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchTravel = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const travels = await Travel.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { story: { [Op.iLike]: `%${query}%` } },
          { visitedLocation: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    res.status(200).json(travels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
