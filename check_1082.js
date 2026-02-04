const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const found = items.filter(f => f.StokKodu.toString().includes('1082'));
found.forEach(f => console.log(`SKU: ${f.StokKodu} | Adi: ${f.UrunAdi}`));
