import db from './database.js';

const createAdminMigration = async () => {
  return new Promise((resolve, reject) => {
    // First check if isAdmin column exists
    db.all("PRAGMA table_info(users)", (err, rows) => {
      if (err) {
        console.error('Error checking table info:', err);
        reject(err);
        return;
      }

      // Check if isAdmin column already exists
      const hasIsAdmin = rows.some(row => row.name === 'isAdmin');
      
      if (!hasIsAdmin) {
        // Add isAdmin column if it doesn't exist
        db.run(
          `ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0`,
          (err) => {
            if (err) {
              console.error('Error adding isAdmin column:', err);
              reject(err);
              return;
            }
            setAdmin();
          }
        );
      } else {
        setAdmin();
      }
    });

    // Helper function to set admin user
    function setAdmin() {
      db.run(
        `UPDATE users 
         SET isAdmin = 1 
         WHERE email = ? AND username = ?`,
        ['elhoseny916@gmail.com', 'elhoseny'],
        (err) => {
          if (err) {
            console.error('Error setting admin user:', err);
            reject(err);
            return;
          }
          console.log('Admin migration completed');
          resolve();
        }
      );
    }
  });
};

export default createAdminMigration;
