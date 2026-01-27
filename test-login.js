const pool = require('./config/database');
const bcrypt = require('bcryptjs');

(async () => {
  const username = 'student_demo';
  const password = 'Student123!';
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (rows.length === 0) {
      console.log('User not found in DB:', username);
      process.exit(0);
    }
    const user = rows[0];
    console.log('User found. id=%d, username=%s, role=%s, status=%s', user.id, user.username, user.role, user.status);
    if (!user.hashed_password) {
      console.log('No password stored for this user.');
      process.exit(0);
    }
    const match = await bcrypt.compare(password, user.hashed_password);
    console.log('Password match:', match);
    process.exit(0);
  } catch (err) {
    console.error('Error checking user:', err.message || err);
    process.exit(1);
  }
})();
