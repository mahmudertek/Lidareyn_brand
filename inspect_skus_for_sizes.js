const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('--- Ölçü İçerebilecek SKU Örnekleri ---');
const withSlash = items.filter(f => f.StokKodu.toString().includes('/'));
const withSizeSuffix = items.filter(f => f.StokKodu.toString().match(/\d{3,}$/) && f.StokKodu.toString().length > 5);

console.log('Slash (/) içeren SKU sayısı:', withSlash.length);
withSlash.slice(0, 10).forEach(f => console.log(`${f.StokKodu} | ${f.UrunAdi}`));

console.log('\nUzun nümerik SKU sayısı:', withSizeSuffix.length);
withSizeSuffix.slice(0, 10).forEach(f => console.log(`${f.StokKodu} | ${f.UrunAdi}`));
