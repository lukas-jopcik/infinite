/**
 * Test script for headline validation
 * Tests the validation function with good and bad examples
 */

// Copy the validation function from content-processor
function validateHeadline(headline, language = 'sk') {
	const issues = [];
	
	// Banned superlatives - comprehensive list with case-insensitive matching
	const bannedWords = {
		en: /\b(amazing|stunning|unbelievable|incredible|breathtaking|spectacular|phenomenal|extraordinary|astonishing|astounding|remarkable|fabulous|magnificent|marvelous|sensational|mind-blowing|jaw-dropping)\b/gi,
		// Slovak - match root + any ending (no \b as it doesn't work with accented chars)
		sk: /([úÚ]žasn|[oO]hromuj|[nN]euveriteľn|[nN]eskutočn|[fF]antastick|[vV]eľkolep|[sS]enzačn|[pP]ôsobiv|[dD]ych\s*berc|[oO]húruj|[oO]bdivuhodn|[vV]ýnimoč|[mM]imoriadn)\w*/g
	};
	
	// Check for banned words
	const bannedPattern = bannedWords[language] || bannedWords.sk;
	const matches = headline.match(bannedPattern);
	if (matches && matches.length > 0) {
		issues.push(`Contains banned superlatives: ${matches.join(', ')}`);
	}
	
	// Word count validation (5-9 words for flexibility)
	const words = headline.trim().split(/\s+/).filter(Boolean);
	const wordCount = words.length;
	if (wordCount < 5) {
		issues.push(`Too short: ${wordCount} words (minimum 5)`);
	} else if (wordCount > 9) {
		issues.push(`Too long: ${wordCount} words (maximum 9)`);
	}
	
	// Check for repetitive words (same word used twice)
	const wordLower = words.map(w => w.toLowerCase().replace(/[?!.,]/g, ''));
	const duplicates = wordLower.filter((word, idx) => wordLower.indexOf(word) !== idx && word.length > 3);
	if (duplicates.length > 0) {
		issues.push(`Repetitive words: ${duplicates.join(', ')}`);
	}
	
	// Check minimum length
	if (headline.trim().length < 10) {
		issues.push('Headline too short (less than 10 characters)');
	}
	
	return {
		valid: issues.length === 0,
		issues: issues,
		wordCount: wordCount
	};
}

console.log('🧪 Testing Headline Validation\n');
console.log('='.repeat(70));

// Test cases
const testCases = [
	// GOOD headlines
	{ headline: 'What Secrets Does the Veil Nebula Hold?', lang: 'en', expected: true, label: 'GOOD - Question format' },
	{ headline: 'Aké tajomstvá skrýva Hmlovina závoj?', lang: 'sk', expected: true, label: 'GOOD - Slovak question' },
	{ headline: 'A Glimpse at the Veil Nebula\'s Hidden History', lang: 'en', expected: true, label: 'GOOD - 8 words' },
	{ headline: 'Pohľad na skrytú históriu Hmloviny závoj', lang: 'sk', expected: true, label: 'GOOD - 6 words' },
	{ headline: 'The Witch\'s Broom Reveals Cosmic Secrets', lang: 'en', expected: true, label: 'GOOD - curiosity-driven' },
	
	// BAD headlines - superlatives
	{ headline: 'Ancient Supernova\'s Ghost Revealed in Stunning Photo', lang: 'en', expected: false, label: 'BAD - Contains "stunning"' },
	{ headline: 'Prastará supernova odhalená v ohromujúcej fotografii', lang: 'sk', expected: false, label: 'BAD - Contains "ohromujúcej"' },
	{ headline: 'An Amazing Discovery in Deep Space Tonight', lang: 'en', expected: false, label: 'BAD - Contains "amazing"' },
	{ headline: 'Úžasný pohľad na vesmír v novej fotografii', lang: 'sk', expected: false, label: 'BAD - Contains "úžasný"' },
	{ headline: 'This Incredible Nebula Will Blow Your Mind', lang: 'en', expected: false, label: 'BAD - Contains "incredible" and "mind-blowing"' },
	
	// BAD headlines - length issues
	{ headline: 'Too Short', lang: 'en', expected: false, label: 'BAD - Only 2 words (min 6)' },
	{ headline: 'This is an extremely long headline that contains way too many words for our requirement', lang: 'en', expected: false, label: 'BAD - 15 words (max 9)' },
	
	// BAD headlines - repetitive
	{ headline: 'Nebula Nebula Shows Amazing Cosmic Display Today', lang: 'en', expected: false, label: 'BAD - Repetitive "Nebula" + superlative' },
];

let passed = 0;
let failed = 0;

console.log('\nRunning validation tests...\n');

testCases.forEach((test, idx) => {
	const result = validateHeadline(test.headline, test.lang);
	const success = result.valid === test.expected;
	
	console.log(`Test ${idx + 1}: ${success ? '✅ PASS' : '❌ FAIL'} - ${test.label}`);
	console.log(`  Headline: "${test.headline}"`);
	console.log(`  Language: ${test.lang}`);
	console.log(`  Word count: ${result.wordCount}`);
	console.log(`  Valid: ${result.valid} (expected: ${test.expected})`);
	
	if (result.issues.length > 0) {
		console.log(`  Issues: ${result.issues.join(', ')}`);
	}
	
	if (!success) {
		console.log(`  ⚠️  MISMATCH: Expected ${test.expected ? 'valid' : 'invalid'} but got ${result.valid ? 'valid' : 'invalid'}`);
		failed++;
	} else {
		passed++;
	}
	
	console.log('');
});

console.log('='.repeat(70));
console.log(`\n📊 Test Results: ${passed}/${testCases.length} passed, ${failed} failed\n`);

if (failed === 0) {
	console.log('✅ All tests passed! Validation is working correctly.');
} else {
	console.log(`❌ ${failed} test(s) failed. Review validation logic.`);
	process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('📝 Banned Words List:');
console.log('\nEnglish:');
console.log('  amazing, stunning, unbelievable, incredible, breathtaking,');
console.log('  spectacular, phenomenal, extraordinary, astonishing, astounding,');
console.log('  remarkable, fabulous, magnificent, marvelous, sensational,');
console.log('  mind-blowing, jaw-dropping');

console.log('\nSlovak:');
console.log('  úžasný, ohromujúci, neuveriteľný, neskutočný, fantastický,');
console.log('  veľkolepý, senzačný, pôsobivý, dych berúci, ohúrujúci,');
console.log('  obdivuhodný, výnimočný, mimoriadny');
console.log('  (includes all conjugations via regex pattern)');

console.log('\n' + '='.repeat(70));
console.log('✅ Validation function is ready for deployment!');

