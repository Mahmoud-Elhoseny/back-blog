import db from '../config/database.js';

const setAdmin = () => {
  const email = 'elhoseny916@gmail.com';
  const username = 'elhoseny';

  // First check if the user exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Error checking user:', err);
      return;
    }

    if (user) {
      // If user exists, update to make them admin
      db.run(
        'UPDATE users SET isAdmin = 1 WHERE email = ?',
        [email],
        (err) => {
          if (err) {
            console.error('Error updating admin status:', err);
            return;
          }
          console.log('Admin privileges granted successfully');
        }
      );
    } else {
      console.log('User not found. Please make sure the user exists first.');
    }
  });
};

setAdmin(); 