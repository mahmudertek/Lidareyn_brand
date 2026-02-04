const xlsx = require('xlsx');

const wb = xlsx.readFile('c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('=== BETA_KATALOG_FINAL.xlsx SON KONTROL ===\n');

// Sütunlar
const headers = Object.keys(rows[0] || {});
console.log('Sütunlar:', headers.join(', '));

// Sayılar
console.log(`\nToplam ürün: ${rows.length}`);

// Fiyat kontrolü
const withPrice = rows.filter(r => r.Fiyat && r.Fiyat > 0);
console.log(`Fiyatı olan: ${withPrice.length} (%${((withPrice.length / rows.length) * 100).toFixed(1)})`);

// Görsel kontrolü
const withImage = rows.filter(r => r.GorselDosyaAdi && r.GorselDosyaAdi.trim() !== '');
console.log(`Görseli olan: ${withImage.length} (%${((withImage.length / rows.length) * 100).toFixed(1)})`);

// Kategori kontrolü
const withCat = rows.filter(r => r.Kategori && r.Kategori.trim() !== '');
const withSubCat = rows.filter(r => r.AltKategori && r.AltKategori.trim() !== '');
console.log(`Kategorisi olan: ${withCat.length}`);
console.log(`Alt kategorisi olan: ${withSubCat.length}`);

// Örnek satır
console.log('\n=== ÖRNEK ÜRÜN ===');
const sample = rows[50];
Object.entries(sample).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
});

console.log('\n✅ DOSYA İÇE AKTARIMA HAZIR!');
