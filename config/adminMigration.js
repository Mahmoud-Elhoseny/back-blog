import db from './database.js';

const createAdminMigration = async () => {
  return new Promise((resolve, reject) => {
    // Add isAdmin column if it doesn't exist
    db.run(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS isAdmin INTEGER DEFAULT 0
    `, (err) => {
      if (err) {
        console.error('Error adding isAdmin column:', err);
        reject(err);
        return;
      }

      // Set specific user as admin
      db.run(`
        UPDATE users 
        SET isAdmin = 1 
        WHERE email = ? AND username = ?
        AND EXISTS (SELECT 1 FROM users WHERE email = ? AND username = ?)
      `, ['elhoseny916@gmail.com', 'elhoseny', 'elhoseny916@gmail.com', 'elhoseny'], (err) => {
        if (err) {
          console.error('Error setting admin user:', err);
          reject(err);
          return;
        }
        console.log('Admin migration completed');
        resolve();
      });
    });
  });
};

export default createAdminMigration; 