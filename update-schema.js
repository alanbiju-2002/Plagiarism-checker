const pool = require('./config/database');

(async () => {
    try {
        console.log('Updating users table schema...');

        // Add full_name if missing
        try {
            await pool.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NOT NULL DEFAULT ""');
            console.log('Added full_name column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding full_name:', e.message);
            else console.log('full_name already exists.');
        }

        // Add status if missing
        try {
            await pool.execute("ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
            console.log('Added status column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding status:', e.message);
            else console.log('status already exists.');
        }

        // Update existing rows to have compatible data
        // If is_approved exists, map it to status
        try {
            await pool.execute("UPDATE users SET status = 'approved' WHERE is_approved = 1 AND status = 'pending'");
            console.log('Migrated is_approved to status.');
        } catch (e) {
            // Ignore if is_approved doesn't exist
        }

        process.exit(0);
    } catch (err) {
        console.error('Fatal error updating schema:', err);
        process.exit(1);
    }
})();
