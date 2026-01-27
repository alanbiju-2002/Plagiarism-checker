const pool = require('./config/database');

async function check() {
    try {
        const [dbResult] = await pool.query('SELECT DATABASE()');
        console.log('Current Database:', dbResult[0]['SELECT DATABASE()']);

        const [cols] = await pool.query('DESCRIBE submissions');
        const statusCol = cols.find(c => c.Field === 'status');
        if (statusCol) {
            console.log('Status column exists in submissions:', JSON.stringify(statusCol));
        } else {
            console.log('Status column MISSING in submissions');
            console.log('Available columns:', cols.map(c => c.Field).join(', '));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
