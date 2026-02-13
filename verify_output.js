const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_FINAL_CLEANED.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('Sample Row:');
console.log(JSON.stringify(items[0], null, 2));

const taps = items.filter(i => i.StokKodu && i.StokKodu.includes('4340027'));
if (taps.length > 0) {
    console.log('--- FOUND 4340027 ---');
    console.log(JSON.stringify(taps[0], null, 2));
} else {
    console.log('4340027 not found in output.');
}
