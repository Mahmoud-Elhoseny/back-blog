import sequelize from './database.js';
import { createAdminMigration } from './adminMigration.js';

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');

    // Create admin user if doesn't exist
    await createAdminMigration();
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
