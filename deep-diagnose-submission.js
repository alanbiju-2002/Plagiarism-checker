const fs = require('fs').promises;
const path = require('path');
const fileService = require('./services/fileService');
const plagiarismService = require('./services/plagiarismService');
const pool = require('./config/database');

async function diagnose() {
    console.log('--- DEEP SUBMISSION DIAGNOSTIC ---');

    // 1. Check DB Connection
    try {
        await pool.query('SELECT 1');
        console.log('✔ Database connection OK');
    } catch (err) {
        console.error('✘ Database connection FAILED:', err.message);
        return;
    }

    // 2. Mock Submission Data
    const mockFile = path.join(__dirname, 'uploads', 'test-diagnostic.txt');
    const assignmentId = 1;
    const studentId = 3; // Existing student from previous check

    try {
        await fs.writeFile(mockFile, 'This is a test diagnostic submission content.');
        console.log('✔ Mock file created');
    } catch (err) {
        console.error('✘ Failed to create mock file:', err.message);
        return;
    }

    // 3. Test Text Extraction
    let extractedText = '';
    try {
        extractedText = await fileService.extractText(mockFile, 'text/plain');
        console.log('✔ Text extraction OK:', extractedText.substring(0, 20) + '...');
    } catch (err) {
        console.error('✘ Text extraction FAILED:', err.message);
    }

    // 4. Test Database Insertion (Atomic transaction test)
    let submissionId = null;
    try {
        const [result] = await pool.execute(
            `INSERT INTO submissions 
             (assignment_id, student_id, file_path, file_name, file_type, file_size, extracted_text, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [assignmentId, studentId, mockFile, 'test-diagnostic.txt', 'text/plain', 50, extractedText]
        );
        submissionId = result.insertId;
        console.log('✔ Database insertion OK, ID:', submissionId);
    } catch (err) {
        console.error('✘ Database insertion FAILED:', err.message);
        console.error('Full Error:', JSON.stringify(err, null, 2));
    }

    // 5. Test Plagiarism Check
    if (submissionId) {
        try {
            console.log('Running plagiarism check...');
            const result = await plagiarismService.performPlagiarismCheck(submissionId, assignmentId, extractedText);
            console.log('✔ Plagiarism check OK');
            console.log('Similarity:', result.similarityScore);
            console.log('Plagiarism Score (Writing):', result.plagiarismScore);
            console.log('Spelling Errors:', result.spellingErrorsCount);
        } catch (err) {
            console.error('✘ Plagiarism check FAILED:', err.message);
            console.error('Full Error:', err);
        }
    }

    // Cleanup
    if (submissionId) {
        await pool.execute('DELETE FROM submissions WHERE id = ?', [submissionId]).catch(() => { });
        console.log('Cleaned up mock submission');
    }
    await fs.unlink(mockFile).catch(() => { });

    console.log('--- DIAGNOSTIC COMPLETE ---');
    process.exit(0);
}

diagnose();
