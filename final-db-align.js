const pool = require('./config/database');

async function finalCleanup() {
    try {
        console.log('--- FINAL DATABASE ALIGNMENT ---');

        // Ensure external_sources exists
        console.log('Ensuring external_sources table exists...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS external_sources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        extracted_text TEXT,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

        // Add indexes for performance
        console.log('Adding performance indexes...');
        try {
            await pool.execute('CREATE INDEX idx_submissions_assignment ON submissions(assignment_id)');
        } catch (e) { console.log('Index idx_submissions_assignment already exists or failed.'); }

        try {
            await pool.execute('CREATE INDEX idx_submissions_student ON submissions(student_id)');
        } catch (e) { console.log('Index idx_submissions_student already exists or failed.'); }

        console.log('--- ALIGNMENT COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Alignment failed:', err.message);
        process.exit(1);
    }
}

finalCleanup();
