const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const longCodes = items.filter(f => f.StokKodu.toString().length === 9 && f.StokKodu.toString().startsWith('0'));
console.log('9 Haneli Stok Kodu sayısı:', longCodes.length);
longCodes.slice(0, 10).forEach(f => console.log(`${f.StokKodu} | ${f.UrunAdi}`));
