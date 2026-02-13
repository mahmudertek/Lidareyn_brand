const fs = require('fs');

const text = fs.readFileSync('pdf_text_output.txt', 'utf-8');
const lines = text.split(/\r?\n/);

const headerKeywords = ['L', 'L1', 'L2', 'A', 'A1', 'S', 'Ø', 'H', 'B', 'Weight', 'g', 'mm', 'GAS'];

function parseTest() {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('004340027')) {
            console.log('--- FOUND 004340027 ---');
            console.log('Line:', line);

            // Look up for headers
            for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
                const prevLine = lines[j].trim();
                const headers = prevLine.match(/\b(L|L1|L2|mm|Ø|A|S)\b/g);
                if (headers) {
                    console.log('Found Headers at line', j, ':', headers);
                    // Match values
                    const values = line.match(/[\d,.]+/g);
                    console.log('Values in SKU line:', values);
                    break;
                }
            }
        }
    }
}

parseTest();
