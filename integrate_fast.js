const fs = require('fs');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const outputPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';

async function run() {
    console.log("Reading PDF (Fast Mode)...");
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        let data;

        // Handle export type
        const pdfFunc = typeof pdfLib === 'function' ? pdfLib : pdfLib.PDFParse;
        if (typeof pdfFunc !== 'function') {
            throw new Error(`pdf-parse export is not a function. Type: ${typeof pdfLib}`);
        }

        data = await pdfFunc(dataBuffer);

        console.log(`PDF Parsed. Pages: ${data.numpages}`);
        // console.log("Text sample:", data.text.substring(0, 500)); 

        const lines = data.text.split(/\r?\n/);
        const priceMap = new Map();

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 2) return;

            // Heuristic for Beta price list
            // Code often at start. Price at end.
            const code = parts[0];
            let price = null;

            // Look for implicit price at end
            const last = parts[parts.length - 1];
            const secondLast = parts[parts.length - 2];

            // value check regex
            const isPrice = (s) => /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(s); // allow 1 decimal? usually 2.

            if (last === 'GBP' && isPrice(secondLast)) {
                price = parseFloat(secondLast.replace(/,/g, ''));
            }
            else if (secondLast === 'GBP' && isPrice(last)) {
                price = parseFloat(last.replace(/,/g, ''));
            }
            else if (isPrice(last) && last.includes('.')) { // strict dot check if no GBP
                price = parseFloat(last.replace(/,/g, ''));
            }

            if (price !== null && code.length > 2 && !isNaN(price)) {
                priceMap.set(code, price);
            }
        });

        console.log(`Found ${priceMap.size} product codes in PDF.`);

        if (priceMap.size === 0) {
            console.log("Warning: No prices found. Check regex or text format.");
            console.log("Sample Lines:", lines.slice(100, 110));
            return;
        }

        console.log("Reading Excel...");
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Use sheet_to_json
        const rows = xlsx.utils.sheet_to_json(sheet);
        console.log(`Excel rows: ${rows.length}`);

        let updatedCount = 0;
        rows.forEach(row => {
            const code = row['StokKodu'];
            if (code) {
                const c = String(code).trim();
                // Check direct match
                if (priceMap.has(c)) {
                    row['FiyatListesi_GBP'] = priceMap.get(c);
                    updatedCount++;
                } else {
                    // Try removing slashes or spaces if not found
                    // Beta code variations
                    const cClean = c.replace(/[\/\s-]/g, '');
                    // We need to check map keys stripped too? Expensive.
                    // For now simple match.
                }
            }
        });

        console.log(`Updated ${updatedCount} rows.`);

        const newSheet = xlsx.utils.json_to_sheet(rows);
        workbook.Sheets[sheetName] = newSheet;
        xlsx.writeFile(workbook, outputPath);
        console.log("Saved to:", outputPath);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
