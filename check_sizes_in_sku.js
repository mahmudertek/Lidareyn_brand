const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const samples = items.filter(f => f.StokKodu.toString().match(/[\/\-]/));
console.log('Örnek Karmaşık SKUlar:', samples.length);
samples.slice(0, 10).forEach(f => console.log(`${f.StokKodu} | ${f.UrunAdi}`));
