const plagiarismService = require('./services/plagiarismService');

function test() {
    const text1 = "This is a test document for plagiarism checking.";
    const text2 = "This is a test document for plagiarism checking.";
    const dice_70 = 0.7021;
    const expected_jaccard_70 = dice_70 / (2 - dice_70);

    console.log("Testing Jaccard Similarity Conversion:");
    console.log(`Identical: ${plagiarismService.calculateSimilarity(text1, text2)}% (Expected 100)`);
    console.log(`Conversion Check: 70.21% Dice should be ~${(expected_jaccard_70 * 100).toFixed(2)}% Jaccard`);
}

test();
