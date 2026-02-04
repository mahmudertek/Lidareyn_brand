const fs = require('fs');
const PDFParser = require('pdf2json');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const outputPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';

const pdfParser = new PDFParser();

console.log("Starting integration process...");

pdfParser.on("pdfParser_dataError", errData => console.error("PDF Error:", errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("PDF parsed. Processing pages...");
    const priceMap = new Map();

    pdfData.Pages.forEach(page => {
        // Group texts into lines
        const texts = page.Texts.map(t => ({
            x: t.x,
            y: t.y,
            text: decodeURIComponent(t.R[0].T)
        })).sort((a, b) => {
            if (Math.abs(a.y - b.y) < 0.5) return a.x - b.x;
            return a.y - b.y;
        });

        let currentY = -1;
        let currentLine = "";

        texts.forEach(t => {
            if (currentY === -1 || Math.abs(t.y - currentY) > 0.6) { // slightly larger tolerance
                if (currentLine) processLine(currentLine, priceMap);
                currentLine = t.text;
                currentY = t.y;
            } else {
                currentLine += " " + t.text;
            }
        });
        if (currentLine) processLine(currentLine, priceMap);
    });

    console.log(`Found ${priceMap.size} unique product codes with prices in PDF.`);

    // Process Excel
    updateExcel(priceMap);
});

function processLine(line, priceMap) {
    // Attempt to extract Code and Price
    // Heuristic: Code is often first token. Price is a number at the end, often followed by GBP or just a float.
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) return;

    // Check for Price (allow 1,234.56 format)
    let price = null;
    let code = parts[0];

    // Look for implicit price at end
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];

    // Format: ... 12.50 GBP
    if (last === 'GBP' && /^\d{1,3}(,\d{3})*(\.\d+)?$/.test(secondLast)) {
        price = parsePriceValue(secondLast);
    }
    // Format: ... GBP 12.50
    else if (secondLast === 'GBP' && /^\d{1,3}(,\d{3})*(\.\d+)?$/.test(last)) {
        price = parsePriceValue(last);
    }
    // Format: ... 12.50 (no GBP, assume end of line matches price pattern)
    else if (/^\d{1,3}(,\d{3})*(\.\d{2})$/.test(last)) {
        price = parsePriceValue(last);
    }

    if (price !== null && code.length > 2) { // minimal code length check
        // Clean code (remove trailing dots etc if any)
        priceMap.set(code, price);
    }
}

function parsePriceValue(str) {
    return parseFloat(str.replace(/,/g, ''));
}

function updateExcel(priceMap) {
    console.log("Reading Excel...");
    try {
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(`Excel has ${data.length} rows.`);

        if (data.length > 0 && !data[0].hasOwnProperty('StokKodu')) {
            // Try to find matching column
            console.log("Headers found:", Object.keys(data[0]));
            // If headers are missing or different, logic fails.
        }

        let updatedCount = 0;
        data.forEach(row => {
            const code = row['StokKodu'];
            if (!code) return;

            const codeStr = String(code).trim();
            if (priceMap.has(codeStr)) {
                row['FiyatListesi_GBP'] = priceMap.get(codeStr);
                updatedCount++;
            }
        });

        console.log(`Matched and updated ${updatedCount} rows.`);

        // Write output
        const newSheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = newSheet;
        xlsx.writeFile(workbook, outputPath);
        console.log("Success! File saved to:", outputPath);

    } catch (e) {
        console.error("Excel Error:", e);
    }
}

pdfParser.loadPDF(pdfPath);
