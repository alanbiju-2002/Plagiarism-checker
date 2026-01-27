const pool = require('./config/database');

async function fixAssignments() {
    try {
        console.log('--- FIXING ASSIGNMENTS TABLE ---');
        const [cols] = await pool.query('DESCRIBE assignments');
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('class_id')) {
            console.log('Adding class_id...');
            await pool.execute('ALTER TABLE assignments ADD COLUMN class_id INT NOT NULL AFTER description');
        }
        if (!colNames.includes('teacher_id')) {
            console.log('Adding teacher_id...');
            await pool.execute('ALTER TABLE assignments ADD COLUMN teacher_id INT NOT NULL AFTER class_id');
        }
        if (!colNames.includes('due_date')) {
            console.log('Adding due_date...');
            await pool.execute('ALTER TABLE assignments ADD COLUMN due_date DATETIME AFTER teacher_id');
        }
        if (!colNames.includes('max_score')) {
            console.log('Adding max_score...');
            await pool.execute('ALTER TABLE assignments ADD COLUMN max_score INT DEFAULT 100 AFTER due_date');
        }

        console.log('--- ASSIGNMENTS FIX COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing assignments:', err.message);
        process.exit(1);
    }
}

fixAssignments();
