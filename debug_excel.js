const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('Toplam ürün:', items.length);
for (let i = 0; i < 5; i++) {
    console.log(`Ürün ${i}:`, items[i].StokKodu, '| Açıklama:', items[i].Aciklama);
}
