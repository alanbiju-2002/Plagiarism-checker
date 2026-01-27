const fs = require('fs');
const pool = require('./config/database');

(async () => {
    try {
        const [columns] = await pool.execute('SHOW COLUMNS FROM users');
        let output = 'Columns in users table:\n';
        columns.forEach(col => output += `- ${col.Field} (${col.Type})\n`);
        fs.writeFileSync('schema_output.txt', output);
        console.log('Schema written to schema_output.txt');
        process.exit(0);
    } catch (err) {
        console.error('Error inspecting table:', err);
        process.exit(1);
    }
})();
