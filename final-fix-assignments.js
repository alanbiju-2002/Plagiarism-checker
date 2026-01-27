const pool = require('./config/database');

async function fix() {
    try {
        console.log('--- DROP FOREIGN KEY AND COLUMN ---');

        // Drop the constraint if it exists
        try {
            await pool.execute('ALTER TABLE assignments DROP FOREIGN KEY assignments_ibfk_1');
            console.log('Dropped foreign key assignments_ibfk_1');
        } catch (e) {
            console.log('Constraint assignments_ibfk_1 not found or already dropped');
        }

        // Drop the index if it exists
        try {
            await pool.execute('ALTER TABLE assignments DROP INDEX classroom_id');
            console.log('Dropped index classroom_id');
        } catch (e) {
            console.log('Index classroom_id not found or already dropped');
        }

        // Drop the column
        try {
            await pool.execute('ALTER TABLE assignments DROP COLUMN classroom_id');
            console.log('Dropped column classroom_id');
        } catch (e) {
            console.log('Column classroom_id not found or already dropped');
        }

        console.log('--- FIX COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Final fix failed:', err.message);
        process.exit(1);
    }
}

fix();
