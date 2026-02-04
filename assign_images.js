const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';

console.log('Gelişmiş görsel ataması yapılıyor...\n');

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Mevcut görselleri listele ve normalize et
const imageFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
console.log(`Klasörde ${imageFiles.length} görsel dosyası var.`);

// SKU'yu normalize et (özel karakterleri _ yap)
function normalizeSku(sku) {
    return String(sku).trim().replace(/[\/\\:*?"<>|]/g, '_');
}

// Base SKU'yu çıkar
function getBaseSku(sku) {
    // 111E/D3 -> 111E, 437C/RM14 -> 437C, 100/KIT -> 100
    return String(sku).split(/[\/\-]/)[0].trim();
}

// Görsel dosyalarından SKU haritası oluştur
const imageMap = new Map(); // normalizedSku -> filename
imageFiles.forEach(f => {
    const nameWithoutExt = f.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    imageMap.set(nameWithoutExt, f);
    imageMap.set(nameWithoutExt.toLowerCase(), f);
});

// İlk geçiş: Mevcut atanmış görselleri topla
const skuWithImage = new Map(); // sku -> imageName
rows.forEach(row => {
    if (row['GorselDosyaAdi']) {
        const sku = String(row['StokKodu']).trim();
        skuWithImage.set(sku, row['GorselDosyaAdi']);

        // Base SKU'yu da kaydet
        const base = getBaseSku(sku);
        if (!skuWithImage.has(base)) {
            skuWithImage.set(base, row['GorselDosyaAdi']);
        }
    }
});

console.log(`Zaten görsel atanmış: ${skuWithImage.size} SKU`);

// İkinci geçiş: Görselsiz ürünlere ata
let directMatch = 0;
let baseMatch = 0;
let noMatch = 0;

rows.forEach(row => {
    const sku = String(row['StokKodu'] || '').trim();
    if (!sku) return;

    // Zaten görseli varsa atla
    if (row['GorselDosyaAdi']) return;

    const normalized = normalizeSku(sku);
    const baseSku = getBaseSku(sku);
    const baseNormalized = normalizeSku(baseSku);

    // 1. Direkt eşleşme (dosya adı = SKU)
    if (imageMap.has(normalized)) {
        row['GorselDosyaAdi'] = imageMap.get(normalized);
        directMatch++;
        return;
    }

    // 2. Base SKU ile eşleşme
    if (imageMap.has(baseNormalized)) {
        row['GorselDosyaAdi'] = imageMap.get(baseNormalized);
        baseMatch++;
        return;
    }

    // 3. Daha önce aynı base SKU'ya atanmış görsel var mı?
    if (skuWithImage.has(baseSku)) {
        row['GorselDosyaAdi'] = skuWithImage.get(baseSku);
        baseMatch++;
        return;
    }

    // 4. Sayısal base SKU dene (100, 111, 437 gibi)
    const numericBase = baseSku.match(/^\d+/);
    if (numericBase) {
        if (imageMap.has(numericBase[0])) {
            row['GorselDosyaAdi'] = imageMap.get(numericBase[0]);
            baseMatch++;
            return;
        }
        if (skuWithImage.has(numericBase[0])) {
            row['GorselDosyaAdi'] = skuWithImage.get(numericBase[0]);
            baseMatch++;
            return;
        }
    }

    noMatch++;
});

console.log(`\nDirekt eşleşme: ${directMatch}`);
console.log(`Base SKU eşleşme: ${baseMatch}`);
console.log(`Eşleşme bulunamadı: ${noMatch}`);

// Sonuç
const totalWithImage = rows.filter(r => r['GorselDosyaAdi']).length;
console.log(`\nToplam: ${totalWithImage}/${rows.length} ürünün görseli var.`);

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[sheetName] = newSheet;
xlsx.writeFile(workbook, filePath);
console.log('\nDosya kaydedildi:', filePath);

// Görseli olmayan ilk 15 ürünü göster
const noImage = rows.filter(r => !r['GorselDosyaAdi']).slice(0, 15);
if (noImage.length > 0) {
    console.log('\nGörseli olmayan örnek ürünler:');
    noImage.forEach(r => console.log(`  - ${r.StokKodu}`));
}
