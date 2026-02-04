const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const names = items.map(i => i.UrunAdi);
const uniqueWords = new Set();
names.forEach(n => n.split(' ').forEach(w => uniqueWords.add(w.toLowerCase())));

console.log('Farklı Kelime Sayısı:', uniqueWords.size);
console.log('Örnek Kelimeler:', Array.from(uniqueWords).slice(0, 50).join(', '));
