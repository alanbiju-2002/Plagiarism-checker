const pool = require('./config/database');
const plagiarismService = require('./services/plagiarismService');

async function recheckAll() {
    try {
        console.log("Fetching all submissions for re-checking with Jaccard algorithm...");
        const [submissions] = await pool.execute('SELECT id, assignment_id, extracted_text FROM submissions');
        
        console.log(`Found ${submissions.length} submissions.`);

        for (const sub of submissions) {
            console.log(`Re-checking submission ID: ${sub.id}...`);
            // Clean up existing matches first
            await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [sub.id]);
            
            // Perform check
            const result = await plagiarismService.performPlagiarismCheck(
                sub.id,
                sub.assignment_id,
                sub.extracted_text
            );
            console.log(`Result for ${sub.id}: Similarity=${result.similarityScore}%, Status=${result.status}`);
        }

        console.log("All submissions re-checked with Jaccard algorithm.");
        process.exit(0);
    } catch (error) {
        console.error("Error during re-check:", error);
        process.exit(1);
    }
}

recheckAll();
