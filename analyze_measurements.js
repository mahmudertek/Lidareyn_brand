const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log('--- DETAYLI VERİ ANALİZİ ---');
items.slice(0, 20).forEach(item => {
    console.log(`StokKodu: ${item.StokKodu} | UrunAdi: ${item.UrunAdi}`);
});
