const fs = require('fs');
const pool = require('./config/database');

(async () => {
    try {
        const [columns] = await pool.execute('SHOW COLUMNS FROM classes');
        let output = 'Columns in classes table:\n';
        columns.forEach(col => output += `- ${col.Field} (${col.Type})\n`);
        fs.writeFileSync('schema_classes.txt', output);
        console.log('Schema written to schema_classes.txt');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log('Table classes does not exist');
        } else {
            console.error('Error inspecting table:', err);
        }
        process.exit(1);
    }
})();
