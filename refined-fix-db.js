const pool = require('./config/database');

async function refinedFix() {
    try {
        console.log('--- STARTING REFINED SCHEMA FIX ---');

        // 1. Fix classes table
        console.log('Fixing classes table...');
        const [classCols] = await pool.query('DESCRIBE classes');
        const classColNames = classCols.map(c => c.Field);

        if (!classColNames.includes('class_code')) {
            await pool.execute('ALTER TABLE classes ADD COLUMN class_code VARCHAR(20) NOT NULL UNIQUE AFTER class_name');
            console.log('Added class_code to classes.');
        }
        if (!classColNames.includes('description')) {
            await pool.execute('ALTER TABLE classes ADD COLUMN description TEXT AFTER teacher_id');
            console.log('Added description to classes.');
        }

        // 2. Fix class_students table
        console.log('Fixing class_students table...');
        const [csCols] = await pool.query('DESCRIBE class_students');
        const csColNames = csCols.map(c => c.Field);

        // Ensure UNIQUE constraint on (class_id, student_id)
        try {
            await pool.execute('ALTER TABLE class_students ADD UNIQUE INDEX unique_class_student (class_id, student_id)');
            console.log('Added unique_class_student index to class_students.');
        } catch (e) {
            console.log('unique_class_student index might already exist.');
        }

        // 3. Fix assignments table
        console.log('Fixing assignments table...');
        try {
            const [assignCols] = await pool.query('DESCRIBE assignments');
            const assignColNames = assignCols.map(c => c.Field);
            if (!assignColNames.includes('max_score')) {
                await pool.execute('ALTER TABLE assignments ADD COLUMN max_score INT DEFAULT 100 AFTER due_date');
                console.log('Added max_score to assignments.');
            }
        } catch (e) {
            console.log('Error checking assignments (might not exist):', e.message);
            // Create it if it really doesn't exist
            await pool.execute(`
          CREATE TABLE IF NOT EXISTS assignments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            class_id INT NOT NULL,
            teacher_id INT NOT NULL,
            due_date DATETIME,
            max_score INT DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        }

        // 4. Fix submissions table
        console.log('Fixing submissions table...');
        try {
            const [subCols] = await pool.query('DESCRIBE submissions');
            const subColNames = subCols.map(c => c.Field);
            if (!subColNames.includes('rejection_reason')) {
                await pool.execute('ALTER TABLE submissions ADD COLUMN rejection_reason TEXT AFTER status');
                console.log('Added rejection_reason to submissions.');
            }
        } catch (e) {
            console.log('Error checking submissions (might not exist):', e.message);
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS submissions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          assignment_id INT NOT NULL,
          student_id INT NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50),
          file_size INT,
          extracted_text TEXT,
          similarity_score DECIMAL(5,2) DEFAULT 0.00,
          status ENUM('pending', 'checked', 'rejected', 'approved') DEFAULT 'pending',
          rejection_reason TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          checked_at TIMESTAMP NULL,
          FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_assignment_student (assignment_id, student_id)
        )
      `);
        }

        console.log('--- REFINED SCHEMA FIX COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error during refined fix:', err);
        process.exit(1);
    }
}

refinedFix();
