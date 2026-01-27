const plagiarismService = require('./services/plagiarismService');
const pool = require('./config/database');

async function debug() {
    try {
        console.log('--- STARTING GLOBAL PLAGIARISM RE-CHECK ---');
        const subId = 4;
        const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [subId]);
        const submission = rows[0];

        if (!submission) {
            console.log('Submission not found');
            process.exit(1);
        }

        console.log(`Re-checking Submission ID: ${subId} (Assignment: ${submission.assignment_id})`);

        // Clear old matches first to see new ones
        await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [subId]);

        const result = await plagiarismService.performPlagiarismCheck(subId, submission.assignment_id, submission.extracted_text);

        console.log('RESULT:', JSON.stringify(result, null, 2));

        // Verify matches
        const [matches] = await pool.query(`
        SELECT pm.*, a.title as matched_assignment_title 
        FROM plagiarism_matches pm
        JOIN submissions s ON pm.matched_submission_id = s.id
        JOIN assignments a ON s.assignment_id = a.id
        WHERE pm.submission_id = ?`, [subId]);

        console.log('NEW MATCHES DETECTED:');
        matches.forEach(m => {
            console.log(`- Match with Sub ID ${m.matched_submission_id} in Assignment "${m.matched_assignment_title}" (${m.similarity_percentage}%)`);
        });

        process.exit(0);
    } catch (err) {
        console.error('--- RE-CHECK FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

debug();
