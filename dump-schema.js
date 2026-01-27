const pool = require('./config/database');
const fs = require('fs');

async function dump() {
    try {
        const [rows] = await pool.query('SHOW CREATE TABLE assignments');
        fs.writeFileSync('assignments_create.txt', rows[0]['Create Table']);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
dump();
