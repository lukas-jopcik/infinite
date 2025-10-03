#!/usr/bin/env node

/**
 * Local test script for SEO article generation
 * Tests the parsing logic without requiring AWS credentials
 */

// Mock the OpenAI response for testing
const mockOpenAIResponse = `## Meta Title
Meteorické roje: Ako ich pozorovať pre začiatočníkov

## Meta Description
Kompletný sprievodca pozorovaním meteorických rojov. Naučte sa, kedy a kde pozorovať meteory, aké vybavenie potrebujete a praktické tipy pre začiatočníkov.

## Úvod
Meteorické roje sú jedným z najdostupnejších astronomických úkazov, ktoré môžete pozorovať voľným okom. Tieto "padajúce hviezdy" fascinujú ľudí už tisíce rokov a predstavujú perfektný úvod do sveta astronómie pre začiatočníkov.

## Hlavný článok

### Čo sú meteorické roje?

Meteorické roje vznikajú, keď Zem prechádza cez prachové častice, ktoré za sebou zanechávajú kométy. Keď sa tieto častice zrazia s atmosférou Zeme, zahoria a vytvoria svetelné stopy na nočnej oblohe.

### Najznámejšie meteorické roje

**Perseidy (12. august)**
- Jeden z najaktívnejších rojov
- Až 100 meteorov za hodinu
- Ideálne pre pozorovanie v lete

**Geminidy (14. december)**
- Zimný roj s vysokou aktivitou
- Až 120 meteorov za hodinu
- Vyžaduje teplé oblečenie

### Ako pozorovať meteory

1. **Vyberte si správne miesto**
   - Mimo svetelného znečistenia
   - S dobrým výhľadom na oblohu
   - Bezpečné a prístupné miesto

2. **Načasovanie je kľúčové**
   - Pozorujte po polnoci
   - Najlepšie v druhej polovici noci
   - Vyhýbajte sa splnu mesiaca

3. **Pripravte sa na pozorovanie**
   - Teplé oblečenie
   - Pohodlné sedenie
   - Trpezlivosť (aspoň 30 minút)

## FAQ

**Kedy je najlepší čas na pozorovanie meteorických rojov?**
Najlepší čas je po polnoci, keď je Zem otočená správnym smerom na prúd prachových častíc.

**Potrebujem teleskop na pozorovanie meteorov?**
Nie, meteory sa najlepšie pozorujú voľným okom. Teleskop by obmedzil váš zorný uhol.

**Koľko meteorov uvidím za hodinu?**
Počet závisí od aktivity roja. Perseidy môžu mať 60-100 meteorov za hodinu, zatiaľ čo slabšie roje len 5-10.

**Môžem pozorovať meteory z mesta?**
Svetelné znečistenie výrazne znižuje počet viditeľných meteorov. Najlepšie je ísť mimo mesta.

**Sú meteory nebezpečné?**
Nie, väčšina meteorov zhorie v atmosfére vo výške 80-120 km nad Zemou.

**Aké počasie je najlepšie na pozorovanie?**
Jasná obloha bez oblačnosti je ideálna. Vyhýbajte sa pozorovaniu pri splne mesiaca.

## Záver

Pozorovanie meteorických rojov je skvelý spôsob, ako začať s astronómiou. Nevyžaduje drahé vybavenie a môže byť zábavné pre celú rodinu. Pamätajte si, že kľúčom k úspechu je trpezlivosť a správne načasovanie.

**Kľúčové rady:**
- Vyberte si tmavé miesto mimo mesta
- Pozorujte po polnoci
- Buďte trpezliví
- Užívajte si zážitok

## Vnútorné odkazy
- Ako začať s astronómiou
- Najlepšie teleskopy pre začiatočníkov
- Pozorovanie planét
- Astrofotografia pre začiatočníkov

## Externé referencie
- NASA Meteor Shower Calendar
- International Meteor Organization
- Sky & Telescope Magazine
- American Meteor Society`;

// Import the parsing function (we'll need to extract it)
function parseSeoArticleResponse(content) {
	const sections = {
		metaTitle: '',
		metaDescription: '',
		intro: '',
		article: '',
		faq: '',
		conclusion: '',
		internalLinks: [],
		externalRefs: []
	};

	// Split content by section headers
	const lines = content.split('\n');
	let currentSection = '';
	let currentContent = [];

	for (const line of lines) {
		const trimmedLine = line.trim();
		
		if (trimmedLine.startsWith('## Meta Title')) {
			currentSection = 'metaTitle';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Meta Description')) {
			currentSection = 'metaDescription';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Úvod')) {
			currentSection = 'intro';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Hlavný článok')) {
			currentSection = 'article';
			currentContent = [];
		} else if (trimmedLine.startsWith('## FAQ')) {
			currentSection = 'faq';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Záver')) {
			currentSection = 'conclusion';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Vnútorné odkazy')) {
			currentSection = 'internalLinks';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Externé referencie')) {
			currentSection = 'externalRefs';
			currentContent = [];
		} else if (trimmedLine && !trimmedLine.startsWith('##')) {
			currentContent.push(line);
		}

		// Store content when section changes
		if (currentSection && currentContent.length > 0) {
			const contentStr = currentContent.join('\n').trim();
			
			switch (currentSection) {
				case 'metaTitle':
					sections.metaTitle = contentStr;
					break;
				case 'metaDescription':
					sections.metaDescription = contentStr;
					break;
				case 'intro':
					sections.intro = contentStr;
					break;
				case 'article':
					sections.article = contentStr;
					break;
				case 'faq':
					sections.faq = contentStr;
					break;
				case 'conclusion':
					sections.conclusion = contentStr;
					break;
				case 'internalLinks':
					sections.internalLinks = contentStr.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/^[-*]\s*/, ''));
					break;
				case 'externalRefs':
					sections.externalRefs = contentStr.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/^[-*]\s*/, ''));
					break;
			}
		}
	}

	return sections;
}

async function testSeoArticleParsing() {
    console.log('🧪 Testing SEO Article Parsing Logic...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        console.log('📝 Parsing mock OpenAI response...');
        const result = parseSeoArticleResponse(mockOpenAIResponse);
        
        console.log('✅ Parsing completed successfully!');
        console.log('');
        
        // Display results
        console.log('📊 Parsed Results:');
        console.log(`  • Meta Title: "${result.metaTitle}"`);
        console.log(`  • Meta Description: "${result.metaDescription}"`);
        console.log(`  • Intro Length: ${result.intro.length} characters`);
        console.log(`  • Article Length: ${result.article.length} characters`);
        console.log(`  • FAQ Length: ${result.faq.length} characters`);
        console.log(`  • Conclusion Length: ${result.conclusion.length} characters`);
        console.log(`  • Internal Links: ${result.internalLinks.length} items`);
        console.log(`  • External References: ${result.externalRefs.length} items`);
        console.log('');
        
        // Show previews
        console.log('📋 Meta Title:');
        console.log(`  "${result.metaTitle}"`);
        console.log('');
        
        console.log('📋 Meta Description:');
        console.log(`  "${result.metaDescription}"`);
        console.log('');
        
        console.log('📋 Introduction Preview:');
        console.log(`  ${result.intro.substring(0, 150)}...`);
        console.log('');
        
        console.log('🔗 Internal Links:');
        result.internalLinks.forEach((link, index) => {
            console.log(`  ${index + 1}. ${link}`);
        });
        console.log('');
        
        console.log('🌐 External References:');
        result.externalRefs.forEach((ref, index) => {
            console.log(`  ${index + 1}. ${ref}`);
        });
        console.log('');
        
        // Calculate total word count
        const totalContent = [
            result.intro,
            result.article,
            result.faq,
            result.conclusion
        ].filter(Boolean).join(' ');
        
        const wordCount = totalContent.split(/\s+/).filter(Boolean).length;
        console.log(`📊 Total Word Count: ${wordCount} words`);
        
        // Validation
        console.log('🔍 Validation Results:');
        const validations = {
            'Meta Title Length': result.metaTitle.length <= 60,
            'Meta Description Length': result.metaDescription.length <= 160,
            'Has Introduction': result.intro.length > 0,
            'Has Article': result.article.length > 0,
            'Has FAQ': result.faq.length > 0,
            'Has Conclusion': result.conclusion.length > 0,
            'Has Internal Links': result.internalLinks.length > 0,
            'Has External References': result.externalRefs.length > 0,
            'Minimum Word Count': wordCount >= 2000
        };
        
        Object.entries(validations).forEach(([check, passed]) => {
            console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
        });
        
        const allPassed = Object.values(validations).every(v => v);
        console.log('');
        console.log(`🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
    } catch (error) {
        console.error('❌ Error during parsing test:');
        console.error(error.message);
        console.error('');
        console.error('Full error:', error);
    }
}

// Run the test
testSeoArticleParsing()
    .then(() => {
        console.log('');
        console.log('🏁 Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
