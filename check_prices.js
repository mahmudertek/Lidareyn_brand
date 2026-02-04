const xlsx = require('xlsx');

const finalFile = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final_With_Images.xlsx';

const wb = xlsx.readFile(finalFile);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const headers = Object.keys(rows[0] || {});

console.log('=== SUTUN ISIMLERI ===');
headers.forEach((h, i) => console.log(`${i + 1}. ${h}`));

console.log('\n=== ILK 3 SATIR ===');
rows.slice(0, 3).forEach((row, i) => {
    console.log(`\n--- Satir ${i + 1} ---`);
    Object.entries(row).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
    });
});
