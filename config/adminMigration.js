import User from '../models/User.js';
import bcrypt from 'bcrypt';

export async function createAdminMigration() {
  try {
    const adminExists = await User.findOne({
      where: {
        email: 'elhoseny916@gmail.com',
      },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123123123', 10);
      await User.create({
        username: 'elhoseny',
        email: 'elhoseny916@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}
