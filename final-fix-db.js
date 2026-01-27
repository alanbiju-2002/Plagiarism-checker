const pool = require('./config/database');

async function finalFix() {
    try {
        console.log('--- STARTING FINAL SCHEMA REPAIR ---');

        const tablesToFix = [
            {
                name: 'users',
                columns: [
                    { name: 'full_name', spec: 'VARCHAR(100) NOT NULL DEFAULT ""' },
                    { name: 'status', spec: "ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'" }
                ]
            },
            {
                name: 'classes',
                columns: [
                    { name: 'class_code', spec: 'VARCHAR(20) NOT NULL UNIQUE' },
                    { name: 'description', spec: 'TEXT' }
                ]
            },
            {
                name: 'assignments',
                columns: [
                    { name: 'max_score', spec: 'INT DEFAULT 100' }
                ]
            },
            {
                name: 'submissions',
                columns: [
                    { name: 'status', spec: "ENUM('pending', 'checked', 'rejected', 'approved') DEFAULT 'pending'" },
                    { name: 'rejection_reason', spec: 'TEXT' }
                ]
            }
        ];

        for (const table of tablesToFix) {
            console.log(`Checking table: ${table.name}`);
            const [cols] = await pool.query(`DESCRIBE \`${table.name}\``);
            const existingCols = cols.map(c => c.Field);

            for (const col of table.columns) {
                if (!existingCols.includes(col.name)) {
                    console.log(`Adding column ${col.name} to ${table.name}`);
                    await pool.execute(`ALTER TABLE \`${table.name}\` ADD COLUMN \`${col.name}\` ${col.spec}`);
                } else {
                    console.log(`Column ${col.name} already exists in ${table.name}`);
                }
            }
        }

        console.log('--- FINAL SCHEMA REPAIR COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error during final fix:', err);
        process.exit(1);
    }
}

finalFix();
