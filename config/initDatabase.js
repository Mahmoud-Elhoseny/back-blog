import db from './database.js';
import bcrypt from 'bcrypt';
import createAdminMigration from './adminMigration.js';

const initDatabase = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // التحقق من وجود الجداول أولاً
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, table) => {
        if (err) {
          console.error('Error checking tables:', err);
          reject(err);
          return;
        }

        // إذا كانت الجداول موجودة بالفعل، نقوم فقط بتشغيل migration الأدمن
        if (table) {
          console.log('Database tables already exist');
          await createAdminMigration();
          resolve();
          return;
        }

        // إنشاء جدول المستخدمين فقط إذا لم يكن موجوداً
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            isAdmin INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }

          // إنشاء جدول الرحلات
          db.run(`
            CREATE TABLE IF NOT EXISTS travels (
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

            // إنشاء جدول المفضلة
            db.run(`
              CREATE TABLE IF NOT EXISTS favorites (
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
                // إنشاء حساب الأدمن فقط إذا لم يكن موجوداً
                const hashedPassword = await bcrypt.hash('123123123', 10);
                db.run(`
                  INSERT OR IGNORE INTO users (username, email, password, isAdmin)
                  VALUES (?, ?, ?, ?)
                `, ['elhoseny', 'elhoseny916@gmail.com', hashedPassword, 1], async (err) => {
                  if (err) {
                    console.error('Error creating admin user:', err);
                    reject(err);
                    return;
                  }
                  // تشغيل migration الأدمن بعد إنشاء الجداول
                  await createAdminMigration();
                  console.log('Database initialized successfully');
                  resolve();
                });
              } catch (error) {
                console.error('Error during initialization:', error);
                reject(error);
              }
            });
          });
        });
      });
    } catch (error) {
      console.error('Error in database initialization:', error);
      reject(error);
    }
  });
};

export default initDatabase; 