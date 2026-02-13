const fs = require('fs');
const XLSX = require('xlsx');

// 1. DATA LOADING
const catalogText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', 'utf8');
const priceText = fs.readFileSync('c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt', 'utf8');

// 2. PRICE PARSING
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
            if (currentPriceGroup.length > 0) {
                map[sku] = currentPriceGroup.shift();
            } else {
                const priceMatch = l.match(/(\d+[.,]\d{2})/);
                if (priceMatch) map[sku] = parseFloat(priceMatch[1].replace(',', '.'));
            }
        }
    });
    return map;
}

const priceMap = getPriceMap(priceText);

// 3. CATALOG PARSING
function parseCatalog(txt) {
    const lines = txt.split('\n');
    const products = [];
    let currentModel = '';
    let currentHeaders = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Model Detection
        const modelMatch = line.match(/^\|?\*?\s*(\d+[A-Z]*)\s*$/);
        if (modelMatch) {
            currentModel = modelMatch[1];
            currentHeaders = [];
            continue;
        }

        // Header Detection (L, L1, mm, UNC, d, etc.)
        if (line.match(/\b(d|L|L1|L2|Ø|A|H)\b/) && line.includes('mm')) {
            const h = line.match(/\b(d|L|L1|L2|Ø|A|H)\b/g);
            if (h) currentHeaders = h;
            continue;
        }

        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            const beforeSku = line.split(sku)[0];
            const parts = beforeSku.split(/\s+/).filter(p => p.length > 0 && !p.includes('|'));

            let specsInfo = '';
            let mainSize = parts[0] ? parts[0].replace(',', '.') : '';

            // Map headers to parts for the description
            for (let j = 0; j < Math.min(currentHeaders.length, parts.length); j++) {
                specsInfo += `${currentHeaders[j]}: ${parts[j]} `;
            }

            // Headers that the Admin Panel expects:
            products.push({
                "StokKodu": sku,
                "UrunAdi": `Beta ${currentModel} ${mainSize}`.trim(),
                "Marka": "Beta",
                "Fiyat": priceMap[sku] || 0.0,
                "IndirimliFiyat": "",
                "Stok": 20,
                "Kategori": "Hırdavat ve El Aletleri",
                "AltKategori": "Beta Profesyonel Seri",
                "Aciklama": `Beta ${currentModel} ${mainSize}. Teknik Özellikler: ${specsInfo.trim().replace(/\s/g, ' ')}. Profesyonel endüstriyel kullanım.`.trim(),
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

// 4. EXCEL GENERATION
const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

const outputPath = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_REVIZE_v4.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`✅ Toplam ${products.length} ürün hazırlandı.`);
console.log(`📂 Kaydedilen Dosya: ${outputPath}`);
