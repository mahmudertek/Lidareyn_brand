const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

let count = 0;
const examples = [];

items.forEach(item => {
    const sku = item.StokKodu.toString();
    const match = sku.match(/[\/\- ](\d+)([a-zA-Z]*)$/);
    if (match) {
        count++;
        if (examples.length < 20) {
            examples.push(`${sku} -> Ölçü: ${match[1]}${match[2]}`);
        }
    }
});

console.log('Tahmin edilebilir ölçülü SKU sayısı:', count);
console.log('Örnekler:');
examples.forEach(e => console.log(e));
