const xlsx = require('xlsx');

const filePath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';

console.log('FiyatListesi_GBP sütunu siliniyor...');

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// FiyatListesi_GBP sütununu sil
rows.forEach(row => {
    delete row['FiyatListesi_GBP'];
});

console.log(`${rows.length} satırdan GBP sütunu silindi.`);

// Sütunları göster
const headers = Object.keys(rows[0] || {});
console.log('\nKalan sütunlar:', headers.join(', '));

const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[sheetName] = newSheet;
xlsx.writeFile(workbook, filePath);
console.log('\nDosya kaydedildi:', filePath);
