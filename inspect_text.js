const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';

async function run() {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);

        console.log("Total Pages:", data.numpages);

        // Look at first 3000 chars
        const text = data.text;
        console.log("--- START TEXT SAMPLE ---");
        console.log(text.substring(0, 3000));
        console.log("--- END TEXT SAMPLE ---");

        // Analyze lines
        const lines = text.split(/\r?\n/); // Handle CR/LF
        console.log("Total Text Lines:", lines.length);

        // Try to filter for what looks like product rows
        // Beta codes often: 1XXX or something.
        // Price: X.XX

        // Just show first 50 non-empty lines
        const sample = lines.filter(l => l.trim().length > 0).slice(0, 50);
        console.log("First 50 Lines:");
        sample.forEach((l, i) => console.log(`${i}: ${l}`));

    } catch (e) {
        console.error(e);
    }
}
run();
