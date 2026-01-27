const pool = require('./config/database');

(async () => {
    try {
        console.log('Adding timestamp columns to users table...');

        try {
            await pool.execute('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            console.log('Added created_at column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding created_at:', e.message);
            else console.log('created_at already exists.');
        }

        try {
            await pool.execute('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('Added updated_at column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding updated_at:', e.message);
            else console.log('updated_at already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Fatal error updating schema:', err);
        process.exit(1);
    }
})();
