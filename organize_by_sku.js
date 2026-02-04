const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = 'c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx';
const baseImagesDir = 'c:/Users/pc/Desktop/Beta_Katalog_Gorseller';
const outputDir = 'c:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const items = XLSX.utils.sheet_to_json(sheet);

console.log(`${items.length} adet ürün işleniyor...`);

const allImages = fs.readdirSync(baseImagesDir);
console.log(`Kaynak klasörde ${allImages.length} adet görsel bulundu.`);

let matchCount = 0;

items.forEach((item, index) => {
    const sku = (item.StokKodu || item.SKU || '').toString().trim().replace(/[\/:*?"<>|]/g, '_');
    const aciklama = (item.Aciklama || '').toString();

    // Daha esnek regex: "Sayfası: 24" veya "Sayfa: 24" veya "Sayfa Numarası: 24"
    const pageMatch = aciklama.match(/(?:Sayfası|Sayfa|Numarası):\s*(\d+)/i);

    if (sku && pageMatch) {
        const pageNum = pageMatch[1];
        const skuDir = path.join(outputDir, sku);

        // Bu sayfaya ait görselleri bul (Format: g_d0_img_p24_1.png)
        // DİKKAT: Sayfa numarasının önünde 'p' olmalı ve tam sayı eşleşmeli
        const pagePattern = `_p${pageNum}_`;
        const skuImages = allImages.filter(img => img.includes(pagePattern));

        if (skuImages.length > 0) {
            matchCount++;
            if (!fs.existsSync(skuDir)) {
                fs.mkdirSync(skuDir, { recursive: true });
            }

            skuImages.forEach(img => {
                const srcPath = path.join(baseImagesDir, img);
                const destPath = path.join(skuDir, img);
                try {
                    fs.copyFileSync(srcPath, destPath);
                } catch (e) { }
            });

            if (index % 500 === 0) {
                console.log(`İşleniyor: ${index}/${items.length} - SKU: ${sku} (Sayfa ${pageNum}, ${skuImages.length} görsel)`);
            }
        }
    }
});

console.log(`İşlem tamamlandı! ${matchCount} ürün için görsel eşleşmesi yapıldı.`);
