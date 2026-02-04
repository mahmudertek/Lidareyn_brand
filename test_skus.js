const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const testSkus = ['1066', '1067', '1077', '1078', '1082', '1084'];
const found = items.filter(item => testSkus.some(s => item.StokKodu.toString().includes(s)));

console.log('Bulunan Test Ürünleri:', found.length);
found.slice(0, 10).forEach(f => console.log(`${f.StokKodu} | ${f.UrunAdi}`));
