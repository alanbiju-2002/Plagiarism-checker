const pool = require('./config/database');

async function fixSubmissions() {
    try {
        console.log('--- FIXING SUBMISSIONS TABLE ---');
        const [cols] = await pool.query('DESCRIBE submissions');
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('file_name')) {
            console.log('Adding file_name...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN file_name VARCHAR(255) NOT NULL AFTER file_path');
        }
        if (!colNames.includes('file_type')) {
            console.log('Adding file_type...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN file_type VARCHAR(50) AFTER file_name');
        }
        if (!colNames.includes('file_size')) {
            console.log('Adding file_size...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN file_size INT AFTER file_type');
        }

        if (colNames.includes('content_text') && !colNames.includes('extracted_text')) {
            console.log('Renaming content_text to extracted_text...');
            await pool.execute('ALTER TABLE submissions CHANGE COLUMN content_text extracted_text TEXT');
        } else if (!colNames.includes('extracted_text')) {
            console.log('Adding extracted_text...');
            await pool.execute('ALTER TABLE submissions ADD COLUMN extracted_text TEXT AFTER file_size');
        }

        if (colNames.includes('is_rejected')) {
            console.log('Dropping redundant is_rejected...');
            await pool.execute('ALTER TABLE submissions DROP COLUMN is_rejected');
        }

        // Ensure plagiarism_matches exists
        console.log('Ensuring plagiarism_matches table exists...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS plagiarism_matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        submission_id INT NOT NULL,
        matched_submission_id INT,
        matched_source_type ENUM('submission', 'external') NOT NULL,
        matched_external_url VARCHAR(500),
        similarity_percentage DECIMAL(5,2) NOT NULL,
        matched_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (matched_submission_id) REFERENCES submissions(id) ON DELETE SET NULL
      )
    `);

        console.log('--- SUBMISSIONS FIX COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing submissions:', err.message);
        process.exit(1);
    }
}

fixSubmissions();
