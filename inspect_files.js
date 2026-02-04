const fs = require('fs');
const xlsx = require('xlsx');
const pdf = require('pdf-parse');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';

async function inspect() {
    console.log('--- Inspecting Excel ---');
    try {
        if (!fs.existsSync(excelPath)) {
            console.error('Excel file not found at:', excelPath);
        } else {
            const workbook = xlsx.readFile(excelPath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            console.log('Sheet Name:', sheetName);
            console.log('First 3 rows:', JSON.stringify(data.slice(0, 3), null, 2));
        }
    } catch (e) {
        console.error('Error reading Excel:', e.message);
    }

    console.log('\n--- Inspecting PDF ---');
    try {
        if (!fs.existsSync(pdfPath)) {
            console.error('PDF file not found at:', pdfPath);
        } else {
            const dataBuffer = fs.readFileSync(pdfPath);
            // pdf-parse processes whole buffer by default
            const data = await pdf(dataBuffer);
            console.log('Number of pages:', data.numpages);
            console.log('Info:', data.info);
            // Show a slice of text to understand structure
            console.log('First 1000 chars of text:\n', data.text.substring(0, 1000));

            // Try to find a line that looks like a price item
            console.log('\nSearching for potential price lines...');
            const lines = data.text.split(/\r?\n/);
            const potentialLines = lines.filter(l => l.includes('GBP') || /\d+\.\d+/.test(l)).slice(0, 5);
            console.log('Sample Price Lines:', potentialLines);
        }
    } catch (e) {
        console.error('Error reading PDF:', e.message);
    }
}

inspect();
