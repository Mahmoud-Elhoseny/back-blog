import User from './User.js';
import Travel from './Travel.js';
import Favorite from './Favorite.js';

// Clear any existing associations
User.associations = {};
Travel.associations = {};
Favorite.associations = {};

// Define belongsToMany relationships
User.belongsToMany(Travel, {
  through: Favorite,
  foreignKey: 'userId',
  as: 'favorites'
});

Travel.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'travelId',
  as: 'favoritedBy'
});

// Add direct associations for the Favorite model
Favorite.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

Favorite.belongsTo(Travel, {
  foreignKey: 'travelId',
  onDelete: 'CASCADE'
});

// Add reverse associations
User.hasMany(Favorite, {
  foreignKey: 'userId'
});

Travel.hasMany(Favorite, {
  foreignKey: 'travelId'
});

export { User, Travel, Favorite };
