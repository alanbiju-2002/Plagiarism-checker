/**
 * One-time migration: add plagiarism_score and originality_score to submissions.
 * Run: node add-plagiarism-score-columns.js
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

    if (!names.includes('plagiarism_score')) {
      await pool.execute(
        `ALTER TABLE submissions ADD COLUMN plagiarism_score DECIMAL(5,2) NULL AFTER similarity_score`
      );
      console.log('Added plagiarism_score to submissions.');
    } else {
      console.log('plagiarism_score already exists.');
    }

    if (!names.includes('originality_score')) {
      await pool.execute(
        `ALTER TABLE submissions ADD COLUMN originality_score DECIMAL(5,2) NULL AFTER plagiarism_score`
      );
      console.log('Added originality_score to submissions.');
    } else {
      console.log('originality_score already exists.');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
