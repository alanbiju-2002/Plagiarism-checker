const pool = require('./config/database');

(async () => {
    try {
        const [rows] = await pool.execute("SHOW COLUMNS FROM users LIKE 'password'");
        if (rows.length > 0) {
            console.log('PASSWORD_COLUMN_EXISTS');
        } else {
            console.log('PASSWORD_COLUMN_MISSING');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
