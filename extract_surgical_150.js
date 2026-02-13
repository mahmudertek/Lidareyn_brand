const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Configuration
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150_Final.xlsx';
const EXCHANGE_RATE = 41;

// Names and Categories Mapping (Expanded for more accuracy)
const translations = {
    'pipe wrenches': 'Boru Anahtarı',
    'light pattern': 'Hafif Tip',
    'swedish pattern': 'İsveç Tipi',
    'flat jaws': 'Düz Ağız',
    'slim jaws': 'İnce Ağız',
    'heavy duty': 'Ağır Hizmet',
    'reversible': 'Çift Yönlü',
    'chain': 'Zincirli',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'combination pliers': 'Kombine Pense',
    'long nose pliers': 'Karga Burun Pense',
    'diagonal cutting nippers': 'Yan Keski',
    'water pump pliers': 'Su Pompası Pense',
    'hexagon key wrenches': 'Allen Anahtarı',
    'combination wrenches': 'Kombine Anahtar',
    'open end wrenches': 'İki Ağızlı Anahtar',
    'ring wrenches': 'Yıldız Anahtar',
    'hammers': 'Çekiç',
    'screwdrivers': 'Tornavida'
};

function translate(text) {
    if (!text) return '';
    let tr = text.toLowerCase();
    for (const [eng, tur] of Object.entries(translations)) {
        tr = tr.replace(new RegExp(eng, 'g'), tur);
    }
    // Capitalize first letters
    return tr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Load Prices
async function loadPrices() {
    console.log('Loading prices from PriceList...');
    const dataBuffer = fs.readFileSync(PRICE_LIST_PDF);
    const data = await pdfParse(dataBuffer, { max: 400 });
    const text = data.text;
    const priceMap = new Map();

    // Pattern for 9-digit code and price (usually £X.XX or just X.XX)
    const lines = text.split('\n');
    let lastPrice = 0;
    for (const line of lines) {
        const pMatch = line.match(/£?(\d+\.\d{2})/);
        if (pMatch) lastPrice = parseFloat(pMatch[1]);

        const cMatch = line.match(/(00\d{7})/); // 9-digit Beta code starts with 00
        if (cMatch && lastPrice > 0) {
            priceMap.set(cMatch[1], lastPrice);
        }
    }
    console.log(`Loaded ${priceMap.size} prices.`);
    return priceMap;
}

// Find Image File
function findImage(skuRaw) {
    const sku = skuRaw.split(/[^a-zA-Z0-9]/)[0];
    if (!fs.existsSync(IMAGES_DIR)) return '';

    const dirs = fs.readdirSync(IMAGES_DIR);
    const matchDir = dirs.find(d => d.startsWith(sku) || d.includes(sku));
    if (!matchDir) return '';

    const dirPath = path.join(IMAGES_DIR, matchDir);
    if (!fs.statSync(dirPath).isDirectory()) return '';

    const files = fs.readdirSync(dirPath);
    const img = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    return img ? `Beta_Katalog_Gorseller/${matchDir}/${img}` : '';
}

async function main() {
    const prices = await loadPrices();

    console.log('Parsing GP_ENG_2025.pdf...');
    const pdfBuffer = fs.readFileSync(GP_ENG_PDF);
    // Parse first 100 pages to ensure we get enough products
    const pdf = await pdfParse(pdfBuffer, { max: 80 });
    const lines = pdf.text.split('\n').map(l => l.trim()).filter(l => l);

    const products = [];
    let currentCategory = 'El Aletleri';
    let currentProductName = '';
    let currentMainSku = '';
    let currentTableHeaders = [];

    for (let i = 0; i < lines.length && products.length < 150; i++) {
        const line = lines[i];

        // Detect Page Titles/Sections (Roughly)
        if (line.match(/^[A-Z\s]{5,30}$/) && line.length < 40) {
            // Might be a header like "PIPE WRENCHES"
            // We ignore general index headers
        }

        // Detect SKU Block (e.g. "366")
        if (line.match(/^(\d{2,4}[A-Z]*)$/) && line.length < 10) {
            currentMainSku = line;
            // Next line often contains the name
            if (lines[i + 1] && !lines[i + 1].match(/^\d/)) {
                currentProductName = lines[i + 1];
            }
            // Reset headers
            currentTableHeaders = [];
            continue;
        }

        // Detect Table Headers (e.g. "L mm L1 mm g")
        if (line.includes('mm') || line.includes('ø') || line.match(/^[L\d\søA-Z]+$/) && line.length < 50 && line.length > 5) {
            const headers = line.split(/\s+/).filter(h => h && h.length < 10);
            if (headers.length > 1) {
                currentTableHeaders = headers;
            }
        }

        // Detect Product Row (Codes like 003660017)
        // Usually: [Value1] [Value2] ... [ArticleCode]
        const codeMatch = line.match(/(00\d{7})/);
        if (codeMatch && currentMainSku) {
            const articleCode = codeMatch[1];
            const parts = line.split(/\s+/);
            const codeIndex = parts.indexOf(articleCode);

            // Extract values before the code
            const values = parts.slice(0, codeIndex);

            // Map values to headers
            let specs = [];
            if (currentTableHeaders.length > 0) {
                for (let j = 0; j < Math.min(currentTableHeaders.length, values.length); j++) {
                    specs.push(`${currentTableHeaders[j]}: ${values[j]}`);
                }
            } else {
                specs = values.map((v, idx) => `Değer ${idx + 1}: ${v}`);
            }

            const gbpPrice = prices.get(articleCode) || 0;
            const tryPrice = Math.round(gbpPrice * EXCHANGE_RATE * 1.2 * 100) / 100; // Adding a small margin if needed, or strictly exchange rate

            const trName = translate(currentProductName);
            const imageUrl = findImage(currentMainSku);

            products.push({
                StokKodu: articleCode,
                UrunAdi: `Beta ${currentMainSku} ${trName}${values[0] ? ' - ' + values[0] : ''}`.trim(),
                Marka: 'Beta Tools',
                Fiyat: gbpPrice > 0 ? (gbpPrice * EXCHANGE_RATE).toFixed(2) : 0,
                IndirimliFiyat: '',
                Stok: 100,
                Kategori: 'Hırdavat ve El Aletleri',
                AltKategori: currentCategory,
                Aciklama: `${trName} ${currentMainSku}\n\nTeknik Ölçüler:\n${specs.join('\n')}\n\nOrijinal İtalyan Beta kalitesi.`,
                Birim: 'Adet',
                GorselURL: imageUrl,
                Aktif: 'Evet',
                PopulerMi: 'Hayır',
                YeniMi: 'Hayır',
                OneCikan: 'Hayır',
                CokSatan: 'Hayır',
                MarkaVitrini: ''
            });
        }
    }

    console.log(`Extracted ${products.length} products.`);

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);

    // Set headers explicitly in case json_to_sheet messes order
    const headers = ["StokKodu", "UrunAdi", "Marka", "Fiyat", "IndirimliFiyat", "Stok", "Kategori", "AltKategori", "Aciklama", "Birim", "GorselURL", "Aktif", "PopulerMi", "YeniMi", "OneCikan", "CokSatan", "MarkaVitrini"];
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`Excel file created at: ${OUTPUT_FILE}`);
}

main().catch(err => {
    console.error(err);
});
