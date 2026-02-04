const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx';
const outputDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';

console.log('=== ARALIK/SET ÜRÜNLERE GÖRSEL ATAMA ===\n');

const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

// Görselsiz ürünleri bul
const withoutImage = rows.filter(r => !r['GorselDosyaAdi'] || r['GorselDosyaAdi'].trim() === '');
console.log(`Görselsiz ürün sayısı: ${withoutImage.length}\n`);

// Mevcut görselleri yükle
const existingImages = new Map();
fs.readdirSync(outputDir).forEach(f => {
    const name = f.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    existingImages.set(name.toLowerCase(), f);
    existingImages.set(name, f);
});

console.log(`Mevcut görsel sayısı: ${existingImages.size / 2}\n`);

// SKU'dan base kısmını çıkar
function extractBaseSku(sku) {
    // "1120ARL - ARG" -> "1120ARL"
    // "1501/1 - 2 - 3" -> "1501"
    // "1585/5I - 6I - 7I" -> "1585"
    // "1488 - 1488L" -> "1488"
    // "1600Q 10" -> "1600Q"

    let base = sku;

    // " - " ile ayrılmış ise ilk parçayı al
    if (sku.includes(' - ')) {
        base = sku.split(' - ')[0].trim();
    }

    // "/" varsa, "/" öncesini al (varyasyon numarası hariç)
    if (base.includes('/')) {
        base = base.split('/')[0].trim();
    }

    // Sadece numara ile bitiyorsa (" 10" gibi), kaldır
    base = base.replace(/\s+\d+$/, '').trim();

    return base;
}

let assignedCount = 0;
const stillMissing = [];

withoutImage.forEach(row => {
    const sku = String(row['StokKodu'] || '').trim();
    if (!sku) return;

    const baseSku = extractBaseSku(sku);

    // Farklı varyasyonları dene
    const variations = [
        baseSku,
        baseSku.replace(/[\/\-\s]/g, '_'),
        baseSku.replace(/[\/\-\s]/g, ''),
        baseSku.match(/^\d+/) ? baseSku.match(/^\d+/)[0] : null,
        baseSku.match(/^\d+[A-Z]*/) ? baseSku.match(/^\d+[A-Z]*/)[0] : null,
    ].filter(v => v);

    let found = false;
    for (const variant of variations) {
        // Mevcut görsellerde ara
        if (existingImages.has(variant)) {
            row['GorselDosyaAdi'] = existingImages.get(variant);
            assignedCount++;
            found = true;
            console.log(`  ✓ ${sku} -> ${existingImages.get(variant)}`);
            break;
        }
        if (existingImages.has(variant.toLowerCase())) {
            row['GorselDosyaAdi'] = existingImages.get(variant.toLowerCase());
            assignedCount++;
            found = true;
            console.log(`  ✓ ${sku} -> ${existingImages.get(variant.toLowerCase())}`);
            break;
        }
    }

    if (!found) {
        stillMissing.push({ sku, base: baseSku });
    }
});

console.log(`\n${assignedCount} ürüne yeni görsel atandı.`);
console.log(`Hala görselsiz: ${stillMissing.length}`);

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[workbook.SheetNames[0]] = newSheet;
xlsx.writeFile(workbook, excelPath);
console.log('\nDosya kaydedildi:', excelPath);

// Final durum
const finalWithImage = rows.filter(r => r['GorselDosyaAdi'] && r['GorselDosyaAdi'].trim() !== '').length;
console.log(`\nFinal: ${finalWithImage}/${rows.length} ürünün görseli var (%${((finalWithImage / rows.length) * 100).toFixed(1)})`);

// Hala eksik olanlar
if (stillMissing.length > 0) {
    console.log('\nHala görseli olmayan ürünler (ilk 20):');
    stillMissing.slice(0, 20).forEach(s => console.log(`  - ${s.sku} (base: ${s.base})`));
}
