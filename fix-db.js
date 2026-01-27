const pool = require('./config/database');

(async () => {
    try {
        console.log('Adding password column to users table...');
        await pool.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL AFTER email');
        console.log('Successfully added password column.');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Password column already exists.');
            process.exit(0);
        }
        console.error('Error altering table:', err);
        process.exit(1);
    }
})();
