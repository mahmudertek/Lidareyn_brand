const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';
const outputDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';

console.log('=== SON KONTROL: GÖRSELSİZ ÜRÜNLER ===\n');

const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

// Görselsiz ürünleri bul
const withoutImage = rows.filter(r => !r['GorselDosyaAdi'] || r['GorselDosyaAdi'].trim() === '');
console.log(`Görselsiz ürün sayısı: ${withoutImage.length}\n`);

// Mevcut final görselleri
const finalImages = new Set(fs.readdirSync(outputDir).map(f => f.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase()));

// Orijinal görsel dosyaları
const originalImages = fs.readdirSync(imagesDir);
const imageNameMap = new Map(); // lowercase name -> original filename
originalImages.forEach(f => {
    const name = f.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase();
    imageNameMap.set(name, f);
});

// Görselsiz SKU'ları analiz et
let foundCount = 0;
const stillMissing = [];

withoutImage.forEach(row => {
    const sku = String(row['StokKodu'] || '').trim();
    if (!sku) return;

    // Farklı varyasyonları dene
    const variations = [
        sku,
        sku.replace(/[\/\-\s]/g, '_'),
        sku.replace(/[\/\-\s]/g, ''),
        sku.split(/[\/\-\s]/)[0], // base SKU
        sku.split(' - ')[0].trim(), // "1120ARL - ARG" -> "1120ARL"
        sku.replace(/ - .+$/, ''), // range pattern temizle
        sku.match(/^\d+/) ? sku.match(/^\d+/)[0] : null, // sadece sayısal kısım
    ].filter(v => v);

    let found = false;
    for (const variant of variations) {
        const lowerVariant = variant.toLowerCase();

        // Final klasöründe var mı?
        if (finalImages.has(lowerVariant)) {
            // Mevcut görseli ata
            const existing = fs.readdirSync(outputDir).find(f =>
                f.toLowerCase().startsWith(lowerVariant + '.') ||
                f.toLowerCase() === lowerVariant + '.png'
            );
            if (existing) {
                row['GorselDosyaAdi'] = existing;
                foundCount++;
                found = true;
                break;
            }
        }

        // Orijinal klasörde var mı?
        if (imageNameMap.has(lowerVariant)) {
            const srcFile = imageNameMap.get(lowerVariant);
            const safeSku = sku.replace(/[\/\\:*?"<>|]/g, '_');
            const ext = path.extname(srcFile);
            const destFile = safeSku + ext;

            // Kopyala
            const srcPath = path.join(imagesDir, srcFile);
            const destPath = path.join(outputDir, destFile);
            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(srcPath, destPath);
            }
            row['GorselDosyaAdi'] = destFile;
            foundCount++;
            found = true;
            break;
        }
    }

    if (!found) {
        stillMissing.push(sku);
    }
});

console.log(`Ek eşleşme bulundu: ${foundCount}`);
console.log(`Hala görselsiz: ${stillMissing.length}`);

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[workbook.SheetNames[0]] = newSheet;
const outputExcel = 'c:\\\\Users\\\\pc\\\\Desktop\\\\Beta_Katalog_FINAL.xlsx';
xlsx.writeFile(workbook, outputExcel);
console.log('Dosya kaydedildi:', outputExcel);

// Final durum
const finalWithImage = rows.filter(r => r['GorselDosyaAdi'] && r['GorselDosyaAdi'].trim() !== '').length;
console.log(`\nFinal: ${finalWithImage}/${rows.length} ürünün görseli var (%${((finalWithImage / rows.length) * 100).toFixed(1)})`);

// Hala eksik olanları listele
if (stillMissing.length > 0 && stillMissing.length <= 30) {
    console.log('\nGörseli olmayan ürünler:');
    stillMissing.forEach(s => console.log(`  - ${s}`));
} else if (stillMissing.length > 30) {
    console.log('\nGörseli olmayan örnek ürünler (ilk 30):');
    stillMissing.slice(0, 30).forEach(s => console.log(`  - ${s}`));
}
