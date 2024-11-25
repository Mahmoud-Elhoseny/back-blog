import db from './database.js';
import bcrypt from 'bcrypt';

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Backup existing users
    db.all('SELECT * FROM users', [], (err, existingUsers) => {
      // Drop existing tables
      db.run('DROP TABLE IF EXISTS favorites', (err) => {
        if (err) {
          console.error('Error dropping favorites table:', err);
          reject(err);
          return;
        }

        db.run('DROP TABLE IF EXISTS travels', (err) => {
          if (err) {
            console.error('Error dropping travels table:', err);
            reject(err);
            return;
          }

          db.run('DROP TABLE IF EXISTS users', (err) => {
            if (err) {
              console.error('Error dropping users table:', err);
              reject(err);
              return;
            }

            // Create users table with new structure
            db.run(`
              CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                isAdmin INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `, async (err) => {
              if (err) {
                console.error('Error creating users table:', err);
                reject(err);
                return;
              }

              // Create travels table
              db.run(`
                CREATE TABLE travels (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  story TEXT NOT NULL,
                  visitedLocation TEXT NOT NULL,
                  image TEXT NOT NULL,
                  visitedDate TEXT NOT NULL,
                  userId INTEGER NOT NULL,
                  isFav INTEGER DEFAULT 0,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (userId) REFERENCES users (id)
                )
              `, (err) => {
                if (err) {
                  console.error('Error creating travels table:', err);
                  reject(err);
                  return;
                }

                // Create favorites table
                db.run(`
                  CREATE TABLE favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    travelId INTEGER NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users (id),
                    FOREIGN KEY (travelId) REFERENCES travels (id)
                  )
                `, async (err) => {
                  if (err) {
                    console.error('Error creating favorites table:', err);
                    reject(err);
                    return;
                  }

                  try {
                    // Restore existing users
                    if (existingUsers && existingUsers.length > 0) {
                      for (const user of existingUsers) {
                        await new Promise((resolve, reject) => {
                          db.run(`
                            INSERT INTO users (id, username, email, password, createdAt)
                            VALUES (?, ?, ?, ?, ?)
                          `, [user.id, user.username, user.email, user.password, user.createdAt], (err) => {
                            if (err) reject(err);
                            else resolve();
                          });
                        });
                      }
                    }

                    // Create admin user if it doesn't exist
                    const hashedPassword = await bcrypt.hash('123123123', 10);
                    db.run(`
                      INSERT OR IGNORE INTO users (username, email, password, isAdmin)
                      VALUES (?, ?, ?, ?)
                    `, ['elhoseny', 'elhoseny916@gmail.com', hashedPassword, 1], (err) => {
                      if (err) {
                        console.error('Error creating admin user:', err);
                        reject(err);
                        return;
                      }
                      console.log('Database initialized successfully with admin user');
                      resolve();
                    });
                  } catch (error) {
                    console.error('Error during user restoration:', error);
                    reject(error);
                  }
                });
              });
            });
          });
        });
      });
    });
  });
};

export default initDatabase; 