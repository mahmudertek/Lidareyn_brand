const fs = require('fs');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

const PDFParse = pdfLib.PDFParse || pdfLib;

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final_With_Images.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const outputPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';

async function run() {
    console.log("PDF okunuyor...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });

    const info = await parser.getInfo();
    console.log(`Toplam sayfa: ${info.total}`);

    const priceMap = new Map();
    const BATCH = 50;

    for (let i = 1; i <= info.total; i += BATCH) {
        const end = Math.min(i + BATCH - 1, info.total);
        const pages = [];
        for (let p = i; p <= end; p++) pages.push(p);

        if (i % 100 === 1) console.log(`Sayfa ${i}-${end} işleniyor...`);

        const textResult = await parser.getText({ partial: pages });
        processText(textResult.text, priceMap);
    }

    console.log(`PDF'den ${priceMap.size} fiyat bulundu.`);

    // Bazı örnek fiyatları göster
    console.log("\nÖrnek fiyatlar:");
    let count = 0;
    for (const [sku, price] of priceMap.entries()) {
        if (count < 10) {
            console.log(`  ${sku}: ${price} GBP`);
            count++;
        }
    }

    // Excel'i oku ve güncelle
    console.log("\nExcel güncelleniyor...");
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let updatedCount = 0;
    let notFoundCount = 0;

    rows.forEach(row => {
        const code = String(row['StokKodu'] || '').trim();
        if (code) {
            if (priceMap.has(code)) {
                // Fiyat sütununu güncelle (TL'ye çevirmek için kur kullanılabilir veya direkt GBP)
                // Şimdilik GBP değerini direkt Fiyat sütununa yazıyorum
                row['Fiyat'] = priceMap.get(code);
                row['FiyatListesi_GBP'] = priceMap.get(code);
                updatedCount++;
            } else {
                notFoundCount++;
            }
        }
    });

    console.log(`${updatedCount} satır güncellendi.`);
    console.log(`${notFoundCount} satır için PDF'de fiyat bulunamadı.`);

    const newSheet = xlsx.utils.json_to_sheet(rows);
    workbook.Sheets[sheetName] = newSheet;
    xlsx.writeFile(workbook, outputPath);
    console.log("Dosya kaydedildi:", outputPath);
}

function processText(text, priceMap) {
    if (!text) return;
    const lines = text.split(/\r?\n/);

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) return;

        const code = parts[0];
        let price = null;

        // Fiyatı bul - satırın sonundaki sayıyı ara
        for (let i = parts.length - 1; i >= 1; i--) {
            const token = parts[i];
            // GBP kelimesini atla
            if (token === 'GBP') continue;

            // Fiyat formatı: 12.50, 1,234.56, 0.99 gibi
            if (/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(token) || /^\d+\.\d{1,2}$/.test(token)) {
                price = parseFloat(token.replace(/,/g, ''));
                break;
            }
        }

        if (price !== null && code.length > 1 && !isNaN(price) && price > 0) {
            priceMap.set(code.trim(), price);
        }
    });
}

run();
