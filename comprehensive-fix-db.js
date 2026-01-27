const pool = require('./config/database');

async function fixSchema() {
    try {
        console.log('Fixing Users table...');
        // Check users table columns
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('hashed_password') && columnNames.includes('password')) {
            await pool.execute('ALTER TABLE users CHANGE COLUMN password hashed_password VARCHAR(255) NOT NULL');
            console.log('Renamed password to hashed_password');
        }

        if (!columnNames.includes('full_name')) {
            await pool.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NOT NULL DEFAULT ""');
            console.log('Added full_name column');
        }

        if (!columnNames.includes('status')) {
            await pool.execute("ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
            console.log('Added status column');
        }

        console.log('Ensuring all tables exist...');

        // Create classes table
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_name VARCHAR(100) NOT NULL,
        class_code VARCHAR(20) UNIQUE NOT NULL,
        teacher_id INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Checked classes table');

        // Create class_students table
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS class_students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_class_student (class_id, student_id)
      )
    `);
        console.log('Checked class_students table');

        // Create assignments table
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
        console.log('Checked assignments table');

        // Create submissions table
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
        console.log('Checked submissions table');

        console.log('Schema fix complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing schema:', err);
        process.exit(1);
    }
}

fixSchema();
