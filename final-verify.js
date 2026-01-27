const pool = require('./config/database');

async function fullCheck() {
    try {
        console.log('--- FINAL SYSTEM CHECK ---');

        // Check class_students indexes
        const [indexes] = await pool.query('SHOW INDEX FROM class_students');
        console.log('CLASS_STUDENTS INDEXES:');
        indexes.forEach(idx => {
            console.log(`- Index: ${idx.Key_name}, Column: ${idx.Column_name}, Unique: ${idx.Non_unique === 0}`);
        });

        const isUnique = indexes.some(idx => idx.Key_name === 'unique_class_student' || (idx.Non_unique === 0 && idx.Key_name !== 'PRIMARY'));

        if (!isUnique) {
            console.log('Adding missing unique constraint to class_students...');
            await pool.execute('ALTER TABLE class_students ADD UNIQUE INDEX unique_class_student (class_id, student_id)');
            console.log('Unique constraint added.');
        } else {
            console.log('Unique constraint already exists.');
        }

        console.log('--- CHECK COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}

fullCheck();
