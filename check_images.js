const xlsx = require('xlsx');

const file = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';

const wb = xlsx.readFile(file);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

const withImage = rows.filter(r => r['GorselDosyaAdi'] && r['GorselDosyaAdi'].trim() !== '');
const withoutImage = rows.filter(r => !r['GorselDosyaAdi'] || r['GorselDosyaAdi'].trim() === '');

console.log('=== GÖRSEL DURUMU ===');
console.log(`Görseli olan: ${withImage.length}`);
console.log(`Görseli olmayan: ${withoutImage.length}`);
console.log(`Toplam: ${rows.length}`);
console.log(`Oran: %${((withImage.length / rows.length) * 100).toFixed(1)}`);

console.log('\nGörseli olan ilk 10:');
withImage.slice(0, 10).forEach(r => {
    console.log(`  ${r.StokKodu}: ${r.GorselDosyaAdi}`);
});

console.log('\nGörseli olmayan ilk 10:');
withoutImage.slice(0, 10).forEach(r => {
    console.log(`  ${r.StokKodu}`);
});
