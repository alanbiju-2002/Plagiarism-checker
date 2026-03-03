const pool = require('./config/database');

async function check() {
    try {
        const [dbResult] = await pool.query('SELECT DATABASE()');
        console.log('Current Database:', dbResult[0]['SELECT DATABASE()']);

        const [cols] = await pool.query('DESCRIBE submissions');
        console.log('Available columns:', cols.map(c => c.Field).join(', '));
        const statusCol = cols.find(c => c.Field === 'status');
        if (statusCol) {
            console.log('Status column exists in submissions');
        } else {
            console.log('Status column MISSING in submissions');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
