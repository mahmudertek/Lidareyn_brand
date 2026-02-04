const fs = require('fs');
const PDFParser = require('pdf2json');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';

console.log("--- EXCEL HEADERS ---");
try {
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];
    console.log(JSON.stringify(headers));
} catch (e) {
    console.error("Excel error:", e);
}

console.log("\n--- PDF STRUCTURE (Page 1) ---");
const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    try {
        console.log("Pages:", pdfData.Pages.length);
        const page = pdfData.Pages[0];
        // Texts: { x, y, w, R: [{ T }] }
        // We want to see if we can identify columns.
        // Let's decode texts and show their positions.

        let items = [];
        page.Texts.forEach(t => {
            const text = decodeURIComponent(t.R[0].T);
            if (text.trim()) {
                items.push({ x: t.x, y: t.y, text: text });
            }
        });

        // Sort by Y (rows) then X (columns)
        items.sort((a, b) => {
            if (Math.abs(a.y - b.y) < 0.5) return a.x - b.x; // Same row prompt
            return a.y - b.y;
        });

        console.log("First 50 text items (Row-sorted):");
        items.slice(0, 50).forEach(i => {
            console.log(`[${i.y.toFixed(2)}, ${i.x.toFixed(2)}] ${i.text}`);
        });

        // Try to identify "Code" and "Price" columns
        // Typically codes are on left, prices on right (or specific column).
        // I want to see if I can find a "Beta" product code.

    } catch (e) {
        console.error("PDF processing error:", e);
    }
});

pdfParser.loadPDF(pdfPath);
