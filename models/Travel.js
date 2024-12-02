import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Favorite from './Favorite.js';

const Travel = sequelize.define('Travel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
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
  }
}, {
  timestamps: true,
  tableName: 'Travels'
});

export default Travel;
