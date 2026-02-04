const fs = require('fs');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';
const originalImagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';

console.log('=== GÖRSEL ANALİZİ ===\n');

// 1. Orijinal çıkarılan görseller
const originalImages = fs.existsSync(originalImagesDir) ? fs.readdirSync(originalImagesDir) : [];
console.log(`Orijinal PDF'den çıkarılan görsel sayısı: ${originalImages.length}`);

// 2. Final klasöründeki görseller
const finalImages = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
console.log(`SKU ile isimlendirilmiş görsel sayısı: ${finalImages.length}`);

// 3. Excel'deki ürün sayısı
const wb = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
console.log(`Excel'deki toplam ürün sayısı: ${rows.length}`);

// 4. Görseli olan/olmayan ürünler
const withImage = rows.filter(r => r['GorselDosyaAdi']);
const withoutImage = rows.filter(r => !r['GorselDosyaAdi']);
console.log(`\nGörseli olan ürün: ${withImage.length}`);
console.log(`Görseli olmayan ürün: ${withoutImage.length}`);

// 5. Görseli olmayan ürünlerin base SKU analizi
const missingBaseSKUs = new Set();
withoutImage.forEach(r => {
    const sku = String(r.StokKodu || '');
    const base = sku.split(/[\/\-]/)[0];
    missingBaseSKUs.add(base);
});
console.log(`\nGörseli olmayan benzersiz base SKU sayısı: ${missingBaseSKUs.size}`);

// 6. Final klasöründeki görsel isimlerini listele  
const imageSKUs = new Set();
finalImages.forEach(f => {
    const name = f.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    imageSKUs.add(name);
});
console.log(`Final klasöründeki benzersiz görsel SKU: ${imageSKUs.size}`);

// 7. Eksik SKU örnekleri
console.log('\n=== EKSİK GÖRSEL ÖRNEKLERİ ===');
const missingSamples = Array.from(missingBaseSKUs).slice(0, 20);
console.log('Görseli olmayan base SKU örnekleri:');
missingSamples.forEach(s => console.log(`  - ${s}`));

// 8. Mevcut görsel örnekleri
console.log('\n=== MEVCUT GÖRSEL ÖRNEKLERİ ===');
const existingSamples = Array.from(imageSKUs).slice(0, 20);
console.log('Görseli olan SKU örnekleri:');
existingSamples.forEach(s => console.log(`  - ${s}`));
