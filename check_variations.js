const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const target = '110BA';
const variations = items.filter(f => f.StokKodu.toString().startsWith(target));
console.log(`'${target}' ile başlayan SKUlar:`, variations.length);
variations.forEach(v => console.log(`${v.StokKodu} | ${v.UrunAdi}`));

const anotherTarget = '1082';
const variations2 = items.filter(f => f.StokKodu.toString().startsWith(anotherTarget));
console.log(`\n'${anotherTarget}' ile başlayan SKUlar:`, variations2.length);
variations2.forEach(v => console.log(`${v.StokKodu} | ${v.UrunAdi}`));
