/**
 * Migration: add hybrid plagiarism score columns to submissions.
 * Run: node add-hybrid-scores-columns.js
 */
require('dotenv').config();
const pool = require('./config/database');

async function run() {
    try {
        const [cols] = await pool.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'submissions'`
        );
        const names = cols.map((c) => c.COLUMN_NAME);

        const columnsToAdd = [
            { name: 'shingle_score', type: 'DECIMAL(5,2) NULL' },
            { name: 'cosine_score', type: 'DECIMAL(5,2) NULL' },
            { name: 'semantic_score', type: 'DECIMAL(5,2) NULL' },
            { name: 'hybrid_score', type: 'DECIMAL(5,2) NULL' }
        ];

        for (const col of columnsToAdd) {
            if (!names.includes(col.name)) {
                await pool.execute(
                    `ALTER TABLE submissions ADD COLUMN ${col.name} ${col.type}`
                );
                console.log(`Added ${col.name} to submissions.`);
            } else {
                console.log(`${col.name} already exists.`);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
