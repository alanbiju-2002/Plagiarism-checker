require('dotenv').config();
const mysql = require('mysql2/promise');

async function createExtensionsTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'plagiarism_db'
    });

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS submission_extensions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        granted_by INT NOT NULL,
        extended_until DATETIME NOT NULL,
        reason VARCHAR(255),
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (granted_by) REFERENCES users(id),
        UNIQUE KEY unique_extension (assignment_id, student_id)
      );
    `;

    console.log('Creating submission_extensions table...');
    await connection.query(createTableQuery);
    console.log('Successfully created submission_extensions table.');
    
    await connection.end();
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

createExtensionsTable();
