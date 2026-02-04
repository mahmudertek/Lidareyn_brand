const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Sütunlar:', Object.keys(data[0]));
console.log('Örnek veri:', data[0]);
