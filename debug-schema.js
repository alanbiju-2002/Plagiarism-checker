const pool = require('./config/database');

(async () => {
    try {
        const [columns] = await pool.execute('SHOW COLUMNS FROM users');
        console.log('Columns in users table:');
        columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
        process.exit(0);
    } catch (err) {
        console.error('Error inspecting table:', err);
        process.exit(1);
    }
})();
