
const XLSX = require('xlsx');

// Try to open Beta_Katalog_FINAL.xlsx
const filePath = 'c:/Users/pc/Desktop/Beta_Katalog_FINAL.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Print only the headers (first row)
    console.log('Headers:', JSON.stringify(data[0]));

    // Print first 3 rows to see data samples
    console.log('Row 1:', JSON.stringify(data[1]));
    console.log('Row 2:', JSON.stringify(data[2]));
} catch (e) {
    console.error('Error:', e);
}
