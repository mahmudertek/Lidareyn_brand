const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

const withSlashes = items.filter(f => f.StokKodu.toString().includes('/'));
console.log('Slashes içeren toplam:', withSlashes.length);

// Farklı tiplerden örnek alalım
const samples = withSlashes.slice(0, 100);
samples.forEach(f => {
    // Sadece rakam olan son kısımları görelim
    const parts = f.StokKodu.toString().split('/');
    const last = parts[parts.length - 1];
    if (last.match(/^\d+$/)) {
        console.log(`${f.StokKodu} -> Olası Ölçü: ${last}`);
    }
});
