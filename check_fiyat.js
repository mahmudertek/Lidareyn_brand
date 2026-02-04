const xlsx = require('xlsx');

const file = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';

const wb = xlsx.readFile(file);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('=== FIYAT KONTROLU ===');

// Fiyat > 0 olan satırları say
const withPrice = rows.filter(r => r['Fiyat'] && r['Fiyat'] > 0);
console.log(`Fiyat > 0 olan satir sayisi: ${withPrice.length} / ${rows.length}`);

// İlk 10 satırı göster
console.log('\nİlk 10 satır:');
rows.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.StokKodu}: Fiyat=${r.Fiyat}, GBP=${r.FiyatListesi_GBP || 'YOK'}`);
});

// Fiyatı olan örnekler
console.log('\nFiyatı olan örnekler:');
withPrice.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.StokKodu}: Fiyat=${r.Fiyat} GBP`);
});
