const pool = require('./config/database');

async function cleanup() {
    try {
        console.log('--- CLEANING UP SCHEMA ---');

        // Fix assignments
        const [assignCols] = await pool.query('DESCRIBE assignments');
        const assignColNames = assignCols.map(c => c.Field);
        if (assignColNames.includes('classroom_id')) {
            console.log('Dropping redundant classroom_id from assignments...');
            await pool.execute('ALTER TABLE assignments DROP COLUMN classroom_id');
        }

        // Fix submissions (optional but good for consistency)
        const [subCols] = await pool.query('DESCRIBE submissions');
        const subColNames = subCols.map(c => c.Field);
        if (subColNames.includes('is_rejected')) {
            console.log('Dropping redundant is_rejected from submissions (using status instead)...');
            await pool.execute('ALTER TABLE submissions DROP COLUMN is_rejected');
        }

        console.log('--- CLEANUP COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err.message);
        process.exit(1);
    }
}

cleanup();
