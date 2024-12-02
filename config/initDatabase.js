import sequelize from './database.js';
import { createAdminMigration } from './adminMigration.js';

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Drop existing tables
    await sequelize.drop(); // This will drop all tables
    
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    await createAdminMigration();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
