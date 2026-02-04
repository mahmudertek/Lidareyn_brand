
const XLSX = require('xlsx');

const filePath = 'c:/Users/pc/Desktop/Beta_Katalog_REVİZE_v2.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Checks properties
    if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    }

    const subcats = new Set();
    data.forEach(row => {
        if (row.AltKategori) {
            subcats.add(String(row.AltKategori).trim());
        }
    });

    console.log("Unique Subcategories:", Array.from(subcats).sort());
} catch (e) {
    console.error(e);
}
