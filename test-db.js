const pool = require('./config/database');

(async () => {
  try {
    const [rows] = await pool.execute('SELECT 1 AS ok');
    console.log('DB connection test result:', rows);
    process.exit(0);
  } catch (err) {
    console.error('DB connection test error:', err.message || err);
    process.exit(1);
  }
})();
