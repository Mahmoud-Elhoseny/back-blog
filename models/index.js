import User from './User.js';
import Travel from './Travel.js';
import Favorite from './Favorite.js';

User.belongsToMany(Travel, { 
  through: Favorite,
  foreignKey: 'userId'
});

Travel.belongsToMany(User, { 
  through: Favorite,
  foreignKey: 'travelId'
});

export { User, Travel, Favorite };
