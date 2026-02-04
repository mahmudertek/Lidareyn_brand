
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:/Users/pc/Desktop/Beta_Katalog_FINAL.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get raw array of arrays

    console.log('Headers:', data[0]);
    console.log('First Row:', data[1]);
} catch (e) {
    console.error('Error:', e.message);
}
