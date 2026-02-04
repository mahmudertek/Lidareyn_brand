const xlsx = require('xlsx');

const file = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';

const wb = xlsx.readFile(file);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const headers = Object.keys(rows[0] || {});

console.log('=== SUTUN ISIMLERI ===');
headers.forEach((h, i) => console.log(`${i + 1}. ${h}`));

// Check GBP column
const gbpCol = headers.find(h => h.includes('GBP'));
if (gbpCol) {
    const withPrice = rows.filter(r => r[gbpCol] !== undefined && r[gbpCol] !== null);
    console.log(`\n${gbpCol} sütununda ${withPrice.length} fiyat var.`);
    console.log('Örnek değerler:', rows.slice(0, 5).map(r => `${r.StokKodu}: ${r[gbpCol]} GBP`));
} else {
    console.log('\nGBP sütunu bulunamadı!');
}
