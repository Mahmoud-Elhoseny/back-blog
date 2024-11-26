import User from '../models/User.js';
import bcrypt from 'bcrypt';

export async function createAdminMigration() {
  try {
    // Use Sequelize methods instead of SQLite's db.all
    const adminExists = await User.findOne({
      where: {
        email: 'admin@example.com'
      }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}
