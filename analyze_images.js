const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';

if (!fs.existsSync(excelPath)) {
    console.error("Excel not found:", excelPath);
    process.exit(1);
}
if (!fs.existsSync(imagesDir)) {
    console.error("Images dir not found:", imagesDir);
    process.exit(1);
}

// 1. Read Excel to get SKUs
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(`Excel has ${data.length} rows.`);

// The structure of image names in folder seems checking:
// g_d0_img_p103_1.png
// This doesn't look like SKUs "1831" etc directly.
// We need to verify if there's a reference or if we made these images.
// Wait, the user said "skusuna göre görselleri dosyaya ayır demiştim"
// It implies he MIGHT have renamed them, OR he expects me to know which one is which?
// "sen aynı skuda birden fazla görsel olduğunu söylüyorsun bu doğru değil... inceledim gördüm"
// This implies the previous "multiple images" claim was about these files.

// Let's check if the excel has any image reference or if we just have to guess.
// Actually, earlier today I might have extracted them.
// If the user extracted them from PDF, they might be named by object ID like `img_p103_1`.
// We need to map `img_p103_1` -> SKU.
// Did we save a mapping?

// Check for mapping file.
if (fs.existsSync('c:\\Users\\pc\\Desktop\\Lidareyn_brand\\pdf_images_mapping.json')) {
    console.log("Found mapping file!");
} else {
    console.log("No mapping file found in current dir.");
}

// Check if SKUs are simple numbers like 1980/12 or 100-200.
console.log("First 5 SKUS:", data.slice(0, 5).map(r => r.StokKodu));

// Check if image names contain SKUs?
const files = fs.readdirSync(imagesDir);
console.log("First 5 files:", files.slice(0, 5));
// "g_d0_img_p103_1.png" -> This comes from `pdf-export-images` or similar tool.
// Page 103, image 1?
