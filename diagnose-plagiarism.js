const plagiarismService = require('./services/plagiarismService');
const pool = require('./config/database');

async function debug() {
    try {
        console.log('--- STARTING PLAGIARISM DIAGNOSTIC ---');

        // Get info for submission 2
        const [rows] = await pool.query('SELECT * FROM submissions WHERE id = 2');
        const submission = rows[0];

        if (!submission) {
            console.log('Submission 2 not found');
            process.exit(1);
        }

        console.log('Submission ID: 2');
        console.log('Assignment ID:', submission.assignment_id);
        console.log('Extracted Text Sample:', (submission.extracted_text || '').substring(0, 50));

        console.log('Running plagiarismService.performPlagiarismCheck(2, ...)');
        const result = await plagiarismService.performPlagiarismCheck(2, submission.assignment_id, submission.extracted_text);

        console.log('RESULT:', JSON.stringify(result, null, 2));

        // Verify after update
        const [newRows] = await pool.query('SELECT id, similarity_score, status, rejection_reason FROM submissions WHERE id = 2');
        console.log('DB STATE AFTER CHECK:', JSON.stringify(newRows[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error('--- DIAGNOSTIC FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

debug();
