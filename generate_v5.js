const fs = require('fs');
const XLSX = require('xlsx');

// 1. DATA LOADING
const catalogText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', 'utf8');
const priceText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt', 'utf8');

// 2. TURKISH TRANSLATION DICTIONARY (Pattern-based for technical terms)
const TRANSLATIONS = {
    "hand taps": "el kılavuzu",
    "machine taps": "makine kılavuzu",
    "UNC thread": "UNC diş",
    "metric thread": "metrik diş",
    "metric fine pitch": "metrik ince diş",
    "metric coarse pitch": "metrik kaba diş",
    "made from chrome-steel": "krom çelikten üretilmiştir",
    "made from HSS": "HSS (Yüksek Hız Çeliği) malzemeden üretilmiştir",
    "cylindrical GAS (BSP) thread": "silindirik GAS (BSP) diş",
    "blind holes": "kör delikler",
    "through holes": "açık delikler",
    "straight": "düz",
    "bent": "eğri",
    "pliers": "pense",
    "nippers": "yan keski",
    "diagonal cutters": "yan keski",
    "combination": "kombine",
    "long nose": "kargaburun",
    "wrenches": "anahtar",
    "adjustable": "kurbağacık / ayarlı",
    "sockets": "lokma",
    "hammers": "çekiç",
    "screwdrivers": "tornavida",
    "assortment of": "set / takım - ",
    "high speed steel": "yüksek hız çeliği",
    "chrome-plated": "krom kaplama",
    "polished": "parlatılmış",
    "heavy duty": "ağır hizmet tipi",
    "for professional use": "profesyonel kullanım için"
};

function translateToTurkish(engText) {
    let tr = engText.toLowerCase();

    // Apply dictionary translations
    Object.entries(TRANSLATIONS).forEach(([eng, tur]) => {
        const regex = new RegExp(eng, 'gi');
        tr = tr.replace(regex, tur);
    });

    // Cleanup and grammar fixes (Simple)
    tr = tr.replace(/,/g, ' -').replace(/made from/g, '').trim();
    // Capitalize first letter
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
                const priceMatch = l.match(/(\d+[.,]\d{2})/);
                if (priceMatch) map[sku] = parseFloat(priceMatch[1].replace(',', '.'));
            }
        }
    });
    return map;
}

const priceMap = getPriceMap(priceText);

// 4. CATALOG PARSING
function parseCatalog(txt) {
    const lines = txt.split('\n');
    const products = [];
    let currentModel = '';
    let currentEngDesc = '';
    let currentHeaders = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.length < 2) continue;

        // Detect Model Number (e.g., 430ASC)
        const modelMatch = line.match(/^\|?\*?\s*(\d+[A-Z]*)\s*$/);
        if (modelMatch) {
            currentModel = modelMatch[1];
            currentEngDesc = ''; // Reset description for new model
            currentHeaders = [];

            // Look ahead for the English description (usually next few lines before SKU)
            for (let j = 1; j < 5; j++) {
                if (lines[i + j] && !lines[i + j].includes('00') && lines[i + j].length > 10) {
                    currentEngDesc += (currentEngDesc ? ' ' : '') + lines[i + j].trim();
                } else if (lines[i + j] && lines[i + j].includes('00')) break;
            }
            continue;
        }

        // Detect Table Headers
        if (line.match(/\b(L|L1|L2|Ø|A|H|d)\b/i) && (line.includes('mm') || line.includes('UNC'))) {
            const h = line.match(/\b(L|L1|L2|Ø|A|H|d)\b/gi);
            if (h) currentHeaders = h;
            continue;
        }

        // Detect SKU (004300051)
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            const beforeSku = line.split(sku)[0];
            const parts = beforeSku.split(/\s+/).filter(p => p.length > 0 && !p.includes('|'));

            let specsInfo = '';
            let mainSize = parts[0] ? parts[0].replace(',', '.') : '';

            for (let j = 0; j < Math.min(currentHeaders.length, parts.length); j++) {
                specsInfo += `${currentHeaders[j]}: ${parts[j]} `;
            }

            const trName = translateToTurkish(currentEngDesc || currentModel);
            const trDesc = translateToTurkish(currentEngDesc || "");

            products.push({
                "StokKodu": sku,
                "UrunAdi": `Beta ${currentModel} ${trName} - ${mainSize}`.replace(/\s+/g, ' ').trim(),
                "Marka": "Beta",
                "Fiyat": priceMap[sku] || 0.0,
                "IndirimliFiyat": "",
                "Stok": 20,
                "Kategori": "Hırdavat ve El Aletleri",
                "AltKategori": "Beta Profesyonel Seri",
                "Aciklama": `${trDesc}. Teknik Özellikler: ${specsInfo.trim()}. Beta Tools endüstriyel kalite standartlarında üretilmiştir.`.replace(/\s+/g, ' ').trim(),
                "Birim": "adet",
                "GorselURL": `/gorseller/beta/${sku}.png`,
                "Aktif": "Evet",
                "PopulerMi": "Hayır",
                "YeniMi": "Evet",
                "OneCikan": "Hayır",
                "CokSatan": "Hayır",
                "MarkaVitrini": "",
                "Olcu": mainSize
            });
        }
    }
    return products;
}

const products = parseCatalog(catalogText);

// 5. EXCEL GENERATION
const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

const outputPath = 'C:/Users/pc/Desktop/Beta_Katalog_KUSURSUZ_TURKCE_v5.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`✅ Toplam ${products.length} ürün hazırlandı.`);
console.log(`📂 Kusursuz Türkçe Çevirili Dosya: ${outputPath}`);
