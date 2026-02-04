const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo_Guncel.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('--- GÜNCEL VERİ ÖRNEĞİ ---');
items.slice(0, 5).forEach(item => {
    console.log(`SKU: ${item.StokKodu}`);
    console.log(`İsim: ${item.UrunAdi}`);
    console.log(`Açıklama: ${item.Aciklama}`);
    console.log('---------------------------');
});
