const pool = require('./config/database');

async function updateSchema() {
    try {
        console.log('Updating schema...');
        await pool.query("ALTER TABLE submissions MODIFY COLUMN status ENUM('pending', 'checked', 'rejected', 'approved', 'accepted') DEFAULT 'pending'");
        console.log('Schema updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
