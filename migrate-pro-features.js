const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'plagiarism_checker_db'
    });

    console.log('Connected to database for professional features migration...');

    try {
        // Add ai_score column
        try {
            await connection.execute(`ALTER TABLE submissions ADD COLUMN ai_score DECIMAL(5,2) DEFAULT 0.00`);
            console.log('Successfully added ai_score column.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMNNAME') console.log('ai_score column already exists.');
            else throw e;
        }

        // Add sentence_analysis column
        try {
            await connection.execute(`ALTER TABLE submissions ADD COLUMN sentence_analysis LONGTEXT DEFAULT NULL`);
            console.log('Successfully added sentence_analysis column.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMNNAME') console.log('sentence_analysis column already exists.');
            else throw e;
        }

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await connection.end();
    }
}

run();
