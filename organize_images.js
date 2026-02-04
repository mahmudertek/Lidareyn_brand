const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const mappingPath = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand\\image_mapping.json';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';
const outputDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller_Final';
const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';

if (!fs.existsSync(mappingPath)) {
    console.error("Mapping file not found!");
    process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Prepare Excel update
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Create SKU map for fast lookup
const skuRowMap = new Map();
rows.forEach(row => {
    const s = String(row['StokKodu']).trim();
    if (s) skuRowMap.set(s, row);
});

let copiedCount = 0;
let updatedExcelCount = 0;

mapping.forEach(item => {
    const originalFile = path.join(imagesDir, item.img);
    const safeSku = item.sku.replace(/[\/\\:*?"<>|]/g, '_'); // sanitize for filename
    const extension = path.extname(item.img);
    const newFilename = `${safeSku}${extension}`;
    const targetFile = path.join(outputDir, newFilename);

    if (fs.existsSync(originalFile)) {
        // Copy file
        fs.copyFileSync(originalFile, targetFile);
        copiedCount++;

        // Update Excel
        if (skuRowMap.has(item.sku)) {
            const row = skuRowMap.get(item.sku);
            // We'll use a relative path pattern that is common in web apps
            // Or just the filename if the user prefers.
            // User said: "dosya uzantısı yoluyla ekle" (add via file path/extension).
            // Let's assume relative path `assets/products/${newFilename}` or just filename.
            // Usually simpler to just put filename and handle path in frontend/backend.
            // But user might want full local path? Unlikely for web import.
            // I will add just filename for now, it's safer.
            row['GorselDosyaAdi'] = newFilename;
            updatedExcelCount++;
        }
    }
});

console.log(`Copied ${copiedCount} images to ${outputDir}`);

// Save Excel
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[sheetName] = newSheet;
const outputExcelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Final_With_Images.xlsx';
xlsx.writeFile(workbook, outputExcelPath);
console.log(`Updated Excel with ${updatedExcelCount} image references. Saved to ${outputExcelPath}`);
