const fs = require('fs');
const path = require('path');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

const PDFParse = pdfLib.PDFParse || pdfLib;

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';
const outputDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';

async function run() {
    console.log('=== KAPSAMLI GÖRSEL EŞLEŞTİRME ===\n');

    // 1. Excel'den SKU'ları al
    const workbook = xlsx.readFile(excelPath);
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const allSkus = rows.map(r => String(r.StokKodu || '').trim()).filter(s => s);
    console.log(`Excel'de ${allSkus.length} ürün var.`);

    // 2. Mevcut görsel dosyalarını oku
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`Orijinal klasörde ${imageFiles.length} görsel var.`);

    // Sayfa bazlı görsel grupla
    const pageImages = {};
    imageFiles.forEach(f => {
        const m = f.match(/p(\d+)_(\d+)\./);
        if (m) {
            const page = parseInt(m[1]);
            const idx = parseInt(m[2]);
            if (!pageImages[page]) pageImages[page] = [];
            pageImages[page].push({ file: f, index: idx });
        }
    });

    // 3. PDF'den sayfa bazlı SKU'ları çıkar
    console.log('\nPDF analiz ediliyor...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });

    const skuSet = new Set(allSkus);
    const pageSkus = {}; // page -> [skus found on that page]

    const info = await parser.getInfo();
    const BATCH = 50;

    for (let i = 1; i <= info.total; i += BATCH) {
        const end = Math.min(i + BATCH - 1, info.total);
        const pages = [];
        for (let p = i; p <= end; p++) pages.push(p);

        if (i % 200 === 1) console.log(`Sayfa ${i}-${end} analiz ediliyor...`);

        // Her sayfayı ayrı ayrı analiz et
        for (const pageNum of pages) {
            try {
                const textResult = await parser.getText({ partial: [pageNum] });
                const text = textResult.text || '';
                const tokens = text.split(/\s+/).map(t => t.trim());

                const foundSkus = tokens.filter(t => skuSet.has(t));
                const uniqueFound = [...new Set(foundSkus)];

                if (uniqueFound.length > 0) {
                    pageSkus[pageNum] = uniqueFound;
                }
            } catch (e) {
                // Skip errors
            }
        }
    }

    console.log(`\n${Object.keys(pageSkus).length} sayfada SKU bulundu.`);

    // 4. Eşleştirme yap
    const skuToImage = new Map();
    let matchCount = 0;

    for (const [page, skus] of Object.entries(pageSkus)) {
        const pageNum = parseInt(page);
        const images = pageImages[pageNum] || [];

        if (images.length === 0) continue;

        // Görselleri index'e göre sırala
        images.sort((a, b) => a.index - b.index);

        // Eşit sayıda SKU ve görsel varsa, sırayla eşleştir
        if (skus.length === images.length) {
            for (let k = 0; k < skus.length; k++) {
                if (!skuToImage.has(skus[k])) {
                    skuToImage.set(skus[k], images[k].file);
                    matchCount++;
                }
            }
        }
        // Tek görsel varsa, tüm SKU'lara aynı görseli ata
        else if (images.length === 1) {
            skus.forEach(sku => {
                if (!skuToImage.has(sku)) {
                    skuToImage.set(sku, images[0].file);
                    matchCount++;
                }
            });
        }
        // Görsel > SKU ise, ilk N görseli eşleştir
        else if (images.length > skus.length) {
            for (let k = 0; k < skus.length; k++) {
                if (!skuToImage.has(skus[k])) {
                    skuToImage.set(skus[k], images[k].file);
                    matchCount++;
                }
            }
        }
        // SKU > Görsel ise, görselleri tekrarla
        else {
            for (let k = 0; k < skus.length; k++) {
                const imgIdx = k % images.length;
                if (!skuToImage.has(skus[k])) {
                    skuToImage.set(skus[k], images[imgIdx].file);
                    matchCount++;
                }
            }
        }
    }

    console.log(`Toplam ${skuToImage.size} SKU ile görsel eşleştirildi.`);

    // 5. Görselleri kopyala ve Excel'i güncelle
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    let copyCount = 0;
    let excelUpdateCount = 0;

    // SKU -> row map
    const skuRowMap = new Map();
    rows.forEach(row => {
        const s = String(row['StokKodu']).trim();
        if (s) skuRowMap.set(s, row);
    });

    for (const [sku, imgFile] of skuToImage.entries()) {
        const srcPath = path.join(imagesDir, imgFile);
        const safeSku = sku.replace(/[\/\\:*?"<>|]/g, '_');
        const ext = path.extname(imgFile);
        const destPath = path.join(outputDir, safeSku + ext);

        if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
            copyCount++;
        }

        // Excel güncelle
        if (skuRowMap.has(sku)) {
            skuRowMap.get(sku)['GorselDosyaAdi'] = safeSku + ext;
            excelUpdateCount++;
        }
    }

    // Varyasyonlara da görsel ata (base SKU eşleşmesi)
    rows.forEach(row => {
        if (row['GorselDosyaAdi']) return; // Zaten var

        const sku = String(row['StokKodu'] || '').trim();
        const baseSku = sku.split(/[\/\-]/)[0];

        // Base SKU'nun görseli var mı?
        if (skuToImage.has(baseSku)) {
            const imgFile = skuToImage.get(baseSku);
            const safeSku = baseSku.replace(/[\/\\:*?"<>|]/g, '_');
            const ext = path.extname(imgFile);
            row['GorselDosyaAdi'] = safeSku + ext;
            excelUpdateCount++;
        }
    });

    console.log(`\n${copyCount} yeni görsel kopyalandı.`);
    console.log(`${excelUpdateCount} Excel satırı güncellendi.`);

    // Excel'i kaydet
    const newSheet = xlsx.utils.json_to_sheet(rows);
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    xlsx.writeFile(workbook, excelPath);

    // Final durum
    const finalWithImage = rows.filter(r => r['GorselDosyaAdi']).length;
    console.log(`\nFinal: ${finalWithImage}/${rows.length} ürünün görseli var.`);
}

run().catch(console.error);
