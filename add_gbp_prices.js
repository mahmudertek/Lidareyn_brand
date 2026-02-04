const fs = require('fs');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

const PDFParse = pdfLib.PDFParse || pdfLib;

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final_With_Images.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';

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

    // Excel'i oku ve güncelle
    console.log("Excel güncelleniyor...");
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let updatedCount = 0;
    rows.forEach(row => {
        const code = String(row['StokKodu'] || '').trim();
        if (code && priceMap.has(code)) {
            row['FiyatListesi_GBP'] = priceMap.get(code);
            updatedCount++;
        }
    });

    console.log(`${updatedCount} satır güncellendi.`);

    const newSheet = xlsx.utils.json_to_sheet(rows);
    workbook.Sheets[sheetName] = newSheet;
    const outputPath = 'c:\\\\Users\\\\pc\\\\Desktop\\\\Beta_Katalog_HAZIR.xlsx';
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

        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        const isPrice = (s) => /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(s);

        if (last === 'GBP' && isPrice(secondLast)) price = parseFloat(secondLast.replace(/,/g, ''));
        else if (secondLast === 'GBP' && isPrice(last)) price = parseFloat(last.replace(/,/g, ''));
        else if (isPrice(last) && last.includes('.')) price = parseFloat(last.replace(/,/g, ''));

        if (price !== null && code.length > 2 && !isNaN(price)) {
            priceMap.set(code.trim(), price);
        }
    });
}

run();
