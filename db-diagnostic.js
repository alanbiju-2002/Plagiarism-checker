const pool = require('./config/database');

async function diagnose() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        const results = {};

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);
            results[tableName] = columns;
        }

        console.log('---DIAGNOSTIC_START---');
        console.log(JSON.stringify(results, null, 2));
        console.log('---DIAGNOSTIC_END---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
