const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('--- İlk 50 SKU ---');
items.slice(0, 50).forEach(f => console.log(`SKU: ${f.StokKodu} | Adi: ${f.UrunAdi}`));
