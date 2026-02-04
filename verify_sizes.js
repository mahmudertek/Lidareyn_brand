const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo_Final.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const sizedItems = items.filter(i => i.Aciklama && (i.Aciklama.includes('Ölçü:') || i.Aciklama.includes('Uzunluk:')));
console.log('Ölçü bilgisi eklenen ürün sayısı:', sizedItems.length);

console.log('--- Örnekler ---');
sizedItems.slice(0, 10).forEach(item => {
    console.log(`[${item.StokKodu}]`);
    console.log(item.Aciklama);
    console.log('-');
});
