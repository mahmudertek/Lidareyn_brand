
const fs = require('fs');
const pdf = require('pdf-parse');

const files = [
    'c:/Users/pc/Desktop/PriceList_2025_GBP.pdf',
    'c:/Users/pc/Desktop/GP_ENG_2025.pdf'
];

async function checkPDFs() {
    for (const file of files) {
        try {
            if (fs.existsSync(file)) {
                console.log(`Checking ${file}...`);
                const dataBuffer = fs.readFileSync(file);
                const data = await pdf(dataBuffer);
                if (data.text.includes('1183BM')) {
                    console.log(`FOUND '1183BM' in ${file}`);
                    // Print context
                    const index = data.text.indexOf('1183BM');
                    console.log('Context:', data.text.substring(index - 50, index + 200));
                } else {
                    console.log(`NOT FOUND in ${file}`);
                }
            } else {
                console.log(`File not found: ${file}`);
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    }
}

checkPDFs();
