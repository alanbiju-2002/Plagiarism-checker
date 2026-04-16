const plagiarismService = require('./services/plagiarismService');

function test() {
    const text1 = "This is a test document for plagiarism checking.";
    const text2 = "This is a test document for plagiarism checking.";
    const text3 = "Something completely different.";
    const text4 = "This is a test document for plagiarism detection."; // One word changed

    console.log("Testing Similarity Calculation:");
    console.log(`Identical: ${plagiarismService.calculateSimilarity(text1, text2)}% (Expected 100)`);
    console.log(`Different: ${plagiarismService.calculateSimilarity(text1, text3)}% (Expected low)`);
    console.log(`Slightly different: ${plagiarismService.calculateSimilarity(text1, text4)}% (Expected high but < 100)`);
}

test();
