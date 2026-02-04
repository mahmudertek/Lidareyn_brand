const fs = require('fs');
const pdfLib = require('pdf-parse');
const xlsx = require('xlsx');

// Resolve PDFParse
const PDFParse = pdfLib.PDFParse || pdfLib;

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo_Updated.xlsx';
const pdfPath = 'c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf';
const imagesDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';

async function run() {
    // 1. Load Excel SKUs
    console.log("Loading Excel...");
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const validSkus = new Set(rows.map(r => String(r.StokKodu).trim()));
    console.log(`Loaded ${validSkus.size} unique SKUs from Excel.`);

    // 2. Load Image Files
    console.log("Loading Image list...");
    const files = fs.readdirSync(imagesDir);
    // Map: PageNum -> [filenames]
    const pageImages = {};
    files.forEach(f => {
        // Match pattern: g_d0_img_p{PAGE}_{INDEX}.png  OR  img_p{PAGE}_{INDEX}.png
        const m = f.match(/p(\d+)_(\d+)\./);
        if (m) {
            const page = parseInt(m[1]);
            if (!pageImages[page]) pageImages[page] = [];
            pageImages[page].push({
                file: f,
                index: parseInt(m[2])
            });
        }
    });
    console.log(`Found images for ${Object.keys(pageImages).length} pages.`);

    // 3. Scan PDF for SKUs per page
    console.log("Scanning PDF text...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const info = await parser.getInfo();

    // Process pages
    let matchCount = 0;
    const renamePlan = []; // { old: "path", new: "path" }
    const excelUpdates = []; // { sku: "abc", path: "abc.jpg" }

    const BATCH = 50;
    for (let i = 1; i <= info.total; i += BATCH) {
        const end = Math.min(i + BATCH - 1, info.total);
        const pages = [];
        for (let p = i; p <= end; p++) pages.push(p);

        const textData = await parser.getText({ partial: pages });
        // textData.text is all concatenated. We need per-page?
        // simple pdf-parse just gives one text blob for range... 
        // Wait, textData structure from getPageText logic implies we get text. 
        // But `getText` returns concatenated text with "pageJoiner" if defined but we didn't define.
        // Actually, let's just do one by one or rely on page markers if any.
        // OR better: use logic "if text contains SKU".

        // Simpler approach: pdf-parse `data.text` separates pages with form feed `\f` usually?
        // Let's rely on `pageImages`. We only care about pages that HAVE images.
        // So iterate through pages with images only?
        // No, `getText({ partial: [page] })` works.
    }

    // Optimized: Only check pages that actually have images
    const pagesWithImages = Object.keys(pageImages).map(Number).sort((a, b) => a - b);
    console.log(`Analyzing ${pagesWithImages.length} pages that contain images...`);

    for (const pageNum of pagesWithImages) {
        if (pagesWithImages.indexOf(pageNum) % 20 === 0) console.log(` analyzing page ${pageNum}...`);

        const data = await parser.getText({ partial: [pageNum] });
        const text = data.text;

        // Find SKUs on this page
        // We split text into tokens
        const tokens = text.split(/\s+/).map(t => t.trim());
        const foundSkus = tokens.filter(t => validSkus.has(t));
        // De-duplicate
        const uniqueFound = [...new Set(foundSkus)];

        const imagesOnPage = pageImages[pageNum].sort((a, b) => a.index - b.index); // Sort by index

        // Match logic
        if (uniqueFound.length === 0) {
            // console.log(`Page ${pageNum}: Images but no SKU found.`);
        } else if (uniqueFound.length === 1 && imagesOnPage.length === 1) {
            // Perfect Match 1-1
            const sku = uniqueFound[0];
            const img = imagesOnPage[0].file;
            renamePlan.push({ page: pageNum, sku: sku, img: img, type: "1-to-1" });
        } else if (uniqueFound.length > 1 && imagesOnPage.length === 1) {
            // Multiple SKUs but 1 image. 
            // Maybe the image applies to all? User said "tek görsel".
            // We'll assign it to the FIRST sku found? Or all?
            // Usually header image.
            renamePlan.push({ page: pageNum, sku: uniqueFound[0], img: imagesOnPage[0].file, type: "Many-to-1" });
        } else if (uniqueFound.length === imagesOnPage.length) {
            // Count Matches. Assume order matches.
            for (let k = 0; k < uniqueFound.length; k++) {
                renamePlan.push({ page: pageNum, sku: uniqueFound[k], img: imagesOnPage[k].file, type: "N-to-N" });
            }
        } else {
            // Mismatch
            // console.log(`Page ${pageNum}: Mismatch. SKUs: ${uniqueFound.length}, Imgs: ${imagesOnPage.length}`);
            // If we have 1 image, assign to first SKU as fallback
            if (imagesOnPage.length === 1 && uniqueFound.length > 0) {
                renamePlan.push({ page: pageNum, sku: uniqueFound[0], img: imagesOnPage[0].file, type: "Many-to-1-Fallback" });
            }
        }
    }

    console.log(`Generated ${renamePlan.length} file associations.`);

    // Create mapping JSON to review
    fs.writeFileSync('c:\\Users\\pc\\Desktop\\Lidareyn_brand\\image_mapping.json', JSON.stringify(renamePlan, null, 2));

    // Execute renaming?
    // We should create a new folder "Beta_Products_Final"
    // User wants "skusuna göre tek görselin bulunduğu dosyalara ayır"
    // -> Separate into files (files named by SKU) OR folders (folder Named SKU/image.jpg)?
    // "skusuna göre... dosyalara ayır" -> likely "Files".
    // "sonrada içe aktar yapacağımız... excel dosyasina dosya uzantisi yoluyla ekle"

}
run();
