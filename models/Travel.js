import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Travel = sequelize.define(
  'travel',
  {
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
      allowNull: true
    },
    isFav: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visitedDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'travel',
    timestamps: true,
  }
);

export default Travel;
