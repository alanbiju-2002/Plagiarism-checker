const pool = require('./config/database');

async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('---START_TABLES---');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
        console.log('---END_TABLES---');
        process.exit(0);
    } catch (err) {
        console.error('Error listing tables:', err);
        process.exit(1);
    }
}

listTables();
