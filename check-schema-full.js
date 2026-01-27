const pool = require('./config/database');

async function checkSchema() {
    try {
        const tables = ['users', 'submissions', 'classes', 'assignments'];
        for (const table of tables) {
            const [cols] = await pool.query(`DESCRIBE \`${table}\``);
            console.log(`---TABLE: ${table}---`);
            cols.forEach(col => {
                console.log(`Column: ${col.Field}, Type: ${col.Type}, Key: ${col.Key}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
