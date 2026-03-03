const SpellChecker = require('simple-spellchecker');

console.log('Testing simple-spellchecker...');

try {
    SpellChecker.getDictionary('en-US', (err, dict) => {
        if (err) {
            console.error('✘ Error loading dictionary:', err.message);
            process.exit(1);
        }
        if (!dict) {
            console.error('✘ Dictionary is null');
            process.exit(1);
        }
        console.log('✔ Dictionary loaded successfully');
        const word = 'hello';
        const isOk = dict.spellCheck(word);
        console.log(`✔ Spell check for "${word}":`, isOk);

        const typo = 'hellloooo';
        const isTypo = dict.spellCheck(typo);
        console.log(`✔ Spell check for "${typo}":`, isTypo);

        process.exit(0);
    });
} catch (e) {
    console.error('✘ Exception during spell checker test:', e.message);
    process.exit(1);
}

// Timeout after 10 seconds
setTimeout(() => {
    console.error('✘ Timeout waiting for dictionary');
    process.exit(1);
}, 10000);
