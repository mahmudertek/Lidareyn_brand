
const XLSX = require('xlsx');
const fs = require('fs');

function checkExcelHeaders() {
    try {
        const workbook = XLSX.readFile('C:\\Users\\pc\\Desktop\\Lidareyn_Urunler_2026-02-02.xlsx');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = data[0];
        fs.writeFileSync('excel_headers.json', JSON.stringify({ headers, firstRow: data[1] }, null, 2));
        console.log('Headers written to excel_headers.json');
    } catch (error) {
        console.error('Error reading Excel:', error);
    }
}

checkExcelHeaders();
