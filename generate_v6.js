const fs = require('fs');
const XLSX = require('xlsx');

// 1. DATA LOADING
const catalogText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', 'utf8');
const priceText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt', 'utf8');

// 2. TECHNICAL DICTIONARY & TRANSLATION
const TECH_TERMS = {
    "L": "L (Uzunluk)",
    "L1": "L1 (Çalışma Boyu)",
    "L2": "L2 (Toplam Uzunluk)",
    "Ø": "Ø (Çap)",
    "Ømax": "Ømax (Maksimum Çap)",
    "A": "A (Genişlik/Ağız)",
    "H": "H (Yükseklik)",
    "d": "d (Gövde Çapı)",
    "max": "max (Maksimum Kapasite)",
    "mm": "mm (Milimetre)",
    "gas": "gas (Boru Diş Ölçüsü)",
    "hand taps": "el kılavuzu",
    "machine taps": "makine kılavuzu",
    "pipe wrenches": "boru anahtarı",
    "Swedish pattern": "İsveç tipi",
    "flat jaws": "düz çeneler",
    "slim jaws": "ince çeneler",
    "light pattern": "hafif tip",
    "made from chrome-steel": "krom çelikten üretilmiştir",
    "chrome-plated": "krom kaplama"
};

function translateText(text) {
    let tr = text.toLowerCase();
    Object.entries(TECH_TERMS).forEach(([eng, tur]) => {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        tr = tr.replace(regex, tur);
    });
    return tr.charAt(0).toUpperCase() + tr.slice(1);
}

// 3. PRICE PARSING
function getPriceMap(txt) {
    const map = {};
    const lines = txt.split('\n');
    let currentPriceGroup = [];
    lines.forEach((line, i) => {
        const l = line.trim();
        if (l === '£') {
            let j = i + 1;
            while (j < lines.length && /^\d+[.,]\d{2}$/.test(lines[j].trim())) {
                currentPriceGroup.push(parseFloat(lines[j].trim().replace(',', '.')));
                j++;
            }
        }
        const skuMatch = l.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            if (currentPriceGroup.length > 0) map[sku] = currentPriceGroup.shift();
            else {
                const pMatch = l.match(/(\d+[.,]\d{2})/);
                if (pMatch) map[sku] = parseFloat(pMatch[1].replace(',', '.'));
            }
        }
    });
    return map;
}
const priceMap = getPriceMap(priceText);

// 4. CATALOG & SPECS PARSING
function parseAllProducts(txt) {
    const lines = txt.split('\n');
    const products = [];
    let currentModel = '';
    let currentEngDesc = '';
    let currentHeaders = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Model Detection (378, 430ASC etc)
        const modelMatch = line.match(/^\|?\*?\s*(\d+[A-Z\/]*)\s*$/);
        if (modelMatch) {
            currentModel = modelMatch[1];
            currentHeaders = [];
            currentEngDesc = "";
            // Look for description below model
            for (let j = 1; j < 5; j++) {
                if (lines[i + j] && !lines[i + j].includes('00') && lines[i + j].length > 5) {
                    currentEngDesc += (currentEngDesc ? " " : "") + lines[i + j].trim();
                } else break;
            }
            continue;
        }

        // Header Detection (L, Ø, mm etc)
        if (line.match(/\b(L|L1|L2|Ø|Ømax|A|H|d|max)\b/)) {
            const found = line.match(/\b(L|L1|L2|Ø|Ømax|A|H|d|max)\b/g);
            if (found) currentHeaders = found;
            continue;
        }

        // SKU Line Detection
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            const beforeSku = line.split(sku)[0].trim();
            const parts = beforeSku.split(/\s+/).filter(p => p.length > 0 && !p.includes('|'));

            let specsStr = "";
            let mainValue = parts[0] || "";

            // Build detailed specs with Turkish meanings
            for (let j = 0; j < Math.min(currentHeaders.length, parts.length); j++) {
                const header = currentHeaders[j];
                const meaning = TECH_TERMS[header] || header;
                specsStr += `${meaning}: ${parts[j]} `;
            }

            const trName = translateText(currentEngDesc || currentModel);
            const trDesc = translateText(currentEngDesc || "");

            products.push({
                "StokKodu": sku,
                "UrunAdi": `Beta ${currentModel} ${trName} - ${mainValue}`.replace(/\s+/g, ' ').trim(),
                "Marka": "Beta",
                "Fiyat": priceMap[sku] || 0.0,
                "IndirimliFiyat": "",
                "Stok": 50,
                "Kategori": "Hırdavat ve El Aletleri",
                "AltKategori": "Beta Profesyonel",
                "Aciklama": `${trDesc}. Teknik Detaylar: ${specsStr.trim()}. Bu ürün Beta Tools endüstriyel kalite standartlarına göre profesyonel kullanım için üretilmiştir.`.replace(/\s+/g, ' ').trim(),
                "Birim": "adet",
                "GorselURL": `/gorseller/beta/${sku.substring(2)}.png`,
                "Aktif": "Evet",
                "PopulerMi": "Hayır",
                "YeniMi": "Evet",
                "OneCikan": "Hayır",
                "CokSatan": "Hayır",
                "MarkaVitrini": "",
                "Olcu": mainValue
            });
        }
    }
    return products;
}

const allProducts = parseAllProducts(catalogText);

// 5. EXCEL GENERATION
const ws = XLSX.utils.json_to_sheet(allProducts);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

const outputPath = 'C:/Users/pc/Desktop/Beta_Katalog_TEKNIK_DETAYLI_V6.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`✅ İşlem Tamamlandı: ${allProducts.length} ürün işlendi.`);
console.log(`📂 Dosya Masaüstünde: ${outputPath}`);
