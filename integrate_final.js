const fs = require('fs');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

// Resolve the class
const PDFParse = pdfLib.PDFParse || pdfLib;

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const outputPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';

async function run() {
    console.log("Loading PDF buffer...");
    let dataBuffer;
    try {
        dataBuffer = fs.readFileSync(pdfPath);
    } catch (e) {
        console.error("Could not read PDF file:", e.message);
        return;
    }

    const priceMap = new Map();

    try {
        console.log("Initializing PDFParser...");
        const parser = new PDFParse({ data: dataBuffer });

        console.log("Getting Info...");
        const info = await parser.getInfo();
        const totalPages = info.total;
        console.log(`Total Pages: ${totalPages}`);

        const BATCH_SIZE = 50; // Process 50 pages at a time

        for (let i = 1; i <= totalPages; i += BATCH_SIZE) {
            const end = Math.min(i + BATCH_SIZE - 1, totalPages);
            const pages = [];
            for (let p = i; p <= end; p++) pages.push(p);

            console.log(`Processing pages ${i}-${end}...`);
            const textResult = await parser.getText({ partial: pages });
            processText(textResult.text, priceMap);
        }

    } catch (e) {
        console.error("PDF Processing Error:", e);
        // Continue to verify if we got any data
    }

    console.log(`Extraction complete. Found ${priceMap.size} unique prices.`);

    if (priceMap.size === 0) {
        console.warn("No prices found! Aborting Excel update.");
        return;
    }

    // Update Excel
    updateExcel(priceMap);
}

function processText(text, priceMap) {
    if (!text) return;
    const lines = text.split(/\r?\n/);
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) return;

        const code = parts[0];
        let price = null;

        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        const isPrice = (s) => /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(s);

        if (last === 'GBP' && isPrice(secondLast)) price = parseFloat(secondLast.replace(/,/g, ''));
        else if (secondLast === 'GBP' && isPrice(last)) price = parseFloat(last.replace(/,/g, ''));
        else if (isPrice(last) && last.includes('.')) price = parseFloat(last.replace(/,/g, ''));

        if (price !== null && code.length > 2 && !isNaN(price)) {
            // Clean code: remove invisible chars?
            // Beta often has "1400/10"
            priceMap.set(code.trim(), price);
        }
    });
}

function updateExcel(priceMap) {
    try {
        console.log("Reading Excel file...");
        if (!fs.existsSync(excelPath)) {
            console.error("Excel file missing!");
            return;
        }
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`Excel loaded. Rows: ${rows.length}`);

        let count = 0;
        rows.forEach(row => {
            const code = String(row['StokKodu'] || '').trim();
            if (code) {
                if (priceMap.has(code)) {
                    // Update user request: "entegre edebilir misin"
                    // Adding specific column
                    row['FiyatListesi_GBP'] = priceMap.get(code);
                    count++;
                }
            }
        });

        console.log(`Matched and updated ${count} rows.`);

        const newSheet = xlsx.utils.json_to_sheet(rows);
        workbook.Sheets[sheetName] = newSheet;
        xlsx.writeFile(workbook, outputPath);
        console.log("Successfully saved updated file to:", outputPath);

    } catch (e) {
        console.error("Excel Error:", e);
    }
}

run();
