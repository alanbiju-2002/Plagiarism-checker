const pool = require('./config/database');

async function finalFix() {
    try {
        console.log('--- FINAL SUBMISSIONS REPAIR ---');
        const [cols] = await pool.query('DESCRIBE submissions');
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('checked_at')) {
            console.log('Adding checked_at...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN checked_at TIMESTAMP NULL AFTER submitted_at');
        }

        if (!colNames.includes('rejection_reason')) {
            console.log('Adding rejection_reason...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN rejection_reason TEXT AFTER status');
        }

        console.log('--- REPAIR COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err.message);
        process.exit(1);
    }
}

finalFix();
