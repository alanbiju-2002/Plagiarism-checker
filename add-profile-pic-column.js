const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addProfilePicColumn() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'plagiarism_checker_db'
        });

        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM users LIKE 'profile_picture'"
        );

        if (columns.length === 0) {
            console.log("Adding 'profile_picture' column...");
            await connection.execute(
                "ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL"
            );
            console.log("'profile_picture' column added successfully.");
        } else {
            console.log("'profile_picture' column already exists.");
        }

    } catch (error) {
        console.error('Error updating database schema:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

addProfilePicColumn();
