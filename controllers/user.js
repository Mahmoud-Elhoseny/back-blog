import db from '../config/database.js';

export const getAllUsers = async (req, res) => {
  // Simple query to check all users in database
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error fetching users" });
    }
    
    // Count total users
    const totalUsers = rows.length;
    
    // Remove password from response for security
    const users = rows.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      totalUsers,
      users
    });
  });
}; 