import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Favorite from './Favorite.js';

const Travel = sequelize.define('Travel', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  story: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visitedLocation: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  visitedDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Travel.belongsTo(User);
Travel.hasMany(Favorite);

export default Travel;
