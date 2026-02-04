const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo_Final.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('--- FINAL VERİ ÖRNEĞİ (Ölçülerle) ---');
items.filter(i => i.StokKodu.toString().includes('/')).slice(0, 10).forEach(item => {
    console.log(`SKU: ${item.StokKodu}`);
    console.log(`Açıklama: ${item.Aciklama}`);
    console.log('---------------------------');
});
