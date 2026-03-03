const pool = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE submissions");
        const statusField = rows.find(r => r.Field === 'status');
        console.log('Status Field Info:', statusField);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
