const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo_Final.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const targets = ['42/17', '111/150', '96/5', '10/12x13'];
const samples = items.filter(i => targets.includes(i.StokKodu.toString()));

samples.forEach(item => {
    console.log(`SKU: ${item.StokKodu}`);
    console.log(`Açıklama: ${item.Aciklama}`);
    console.log('---------------------------');
});
