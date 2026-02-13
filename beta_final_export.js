const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150_vFINAL.xlsx';
const EXCHANGE_RATE = 41;

// Translation dictionary for common Beta tool names
const translations = {
    'pipe wrenches, light pattern': 'Hafif Tip Boru Anahtarı',
    'pipe wrenches, swedish pattern': 'İsveç Tipi Boru Anahtarı',
    'combination wrenches': 'Kombine Anahtar',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'double open end wrenches': 'İki Ağızlı Çatal Anahtar',
    'double offset ring wrenches': 'İki Ağızlı Yıldız Anahtar',
    'ratcheting combination wrenches': 'Cırcırlı Kombine Anahtar',
    'hammers': 'Çekiçler',
    'pliers': 'Penseler',
    'screwdrivers': 'Tornavidalar',
    'heavy duty': 'Ağır Hizmet',
    '90° flat jaws': '90° Düz Ağız',
    '45° slim jaws': '45° İnce Ağız',
    'light alloy': 'Hafif Alaşım'
};

function translateName(name) {
    if (!name) return "";
    let clean = name.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const [eng, tur] of Object.entries(translations)) {
        if (clean.includes(eng)) return tur;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// Robust Price Loading
async function loadPrices() {
    console.log('Fiyat listesi yükleniyor...');
    const buf = fs.readFileSync(PRICE_LIST_PDF);
    const data = await pdfParse(buf, { max: 500 });
    const text = data.text;
    const priceMap = new Map();
    const lines = text.split('\n');
    let lastPrice = 0;

    // Pattern 1: GBP decimal prices
    // Pattern 2: Integer prices or joined values
    for (const l of lines) {
        // Greedy search for anything that looks like a decimal price
        const pm = l.match(/(\d+[\.,]\d{2})/);
        if (pm) {
            lastPrice = parseFloat(pm[1].replace(',', '.'));
        }

        // Beta codes usually are 9 digits starting with 00
        const codes = l.matchAll(/(00\d{7,9})/g);
        for (const cm of codes) {
            // If we found a code but no decimal price on this or previous line, 
            // check if there's a suspicious number before the code
            if (lastPrice === 0) {
                const parts = l.split(/\s+/);
                const idx = parts.indexOf(cm[1]);
                if (idx > 0) {
                    const candidate = parseFloat(parts[idx - 1]);
                    if (!isNaN(candidate) && candidate > 1) {
                        // Fallback for cases like '230 5 000421619' where 23.0 might be implied or 230 is the price in GBP decimals? 
                        // Actually Beta prices are usually like 15.50.
                    }
                }
            }
            if (lastPrice > 0) {
                priceMap.set(cm[1], lastPrice);
            }
        }
    }

    // Broad match for PriceList (Price Code)
    const broadMatches = text.matchAll(/(00\d{7,9})\s+[\d\.,]+\s+(\d+[\.,]\d{2})/g);
    for (const bm of broadMatches) {
        priceMap.set(bm[1], parseFloat(bm[2].replace(',', '.')));
    }

    console.log(`${priceMap.size} adet fiyat tanımlandı.`);
    return priceMap;
}

// Image Search
function findImage(sku) {
    if (!fs.existsSync(IMAGES_DIR)) return '';
    const cleanSku = sku.replace(/[^a-zA-Z0-9]/g, '');
    const dirs = fs.readdirSync(IMAGES_DIR);
    // Find directory that matches SKU
    const matchDir = dirs.find(d => {
        const dClean = d.replace(/[^a-zA-Z0-9]/g, '');
        return dClean === cleanSku || dClean.startsWith(cleanSku);
    });
    if (!matchDir) return '';
    const fullPath = path.join(IMAGES_DIR, matchDir);
    const files = fs.readdirSync(fullPath);
    const imgFile = files.find(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    return imgFile ? `Beta_Katalog_SKU_Gorseller/${matchDir}/${imgFile}` : '';
}

async function main() {
    const prices = await loadPrices();
    console.log('GP_ENG PDF analiz ediliyor...');
    const pdfBuf = fs.readFileSync(GP_ENG_PDF);
    const pdf = await pdfParse(pdfBuf, { max: 150 });
    const text = pdf.text;

    // Split text into chunks by SKU headers pattern: e.g. "| 366 *"
    const chunks = text.split(/\|\s*(\d{2,4}[A-Z\/\.]*)\s*\*/g);
    const products = [];

    for (let i = 1; i < chunks.length && products.length < 150; i += 2) {
        const sku = chunks[i].trim();
        const content = chunks[i + 1];

        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        let sectionName = "";

        // Peek back a bit in the previous chunk text for the section name? 
        // Or look at the very first lines of this chunk.
        // Actually, the section name usually precedes the SKU.
        const prevChunk = chunks[i - 1];
        const prevLines = prevChunk.split('\n').map(l => l.trim()).filter(l => l);
        if (prevLines.length > 0) {
            sectionName = prevLines[prevLines.length - 1];
            if (sectionName.match(/^[A-Z0-9\W\s]*$/)) {
                // Likely a header
            }
        }

        let headers = [];
        let headerLine = lines.find(l => l.includes('mm') || l.includes('Ø') || l.includes('kg'));
        if (headerLine) {
            headers = headerLine.split(/\s+/).filter(h => h.length < 10);
        }

        for (const line of lines) {
            const articleMatch = line.match(/(00\d{7,9})/);
            if (articleMatch) {
                const code = articleMatch[1];
                const parts = line.split(/\s+/).filter(p => p !== 'gas');
                const codeIdx = parts.indexOf(code);
                const vals = parts.slice(0, codeIdx);

                // Construct technical specs
                const specs = [];
                if (headers.length > 0) {
                    for (let j = 0; j < Math.min(headers.length, vals.length); j++) {
                        specs.push(`${headers[j]}: ${vals[j]}`);
                    }
                } else {
                    specs.push(`Boyut: ${vals[0] || 'Standart'}`);
                }

                const gbp = prices.get(code) || 0;
                const priceTry = (gbp * EXCHANGE_RATE).toFixed(2);
                const visual = findImage(sku);
                const trName = translateName(sectionName || productName);

                products.push({
                    StokKodu: code,
                    UrunAdi: `Beta ${sku} ${vals[0] || ''}`.trim(),
                    Marka: 'Beta Tools',
                    Fiyat: priceTry,
                    IndirimliFiyat: '',
                    Stok: 100,
                    Kategori: 'Hırdavat ve El Aletleri',
                    AltKategori: 'El Aletleri',
                    Aciklama: `${trName} ${sku}\n\nTeknik Veriler:\n${specs.join('\n')}\n\nGörsel: ${visual}`,
                    Birim: 'Adet',
                    GorselURL: visual,
                    Aktif: 'Evet',
                    PopulerMi: 'Hayır',
                    YeniMi: 'Hayır',
                    OneCikan: 'Hayır',
                    CokSatan: 'Hayır',
                    MarkaVitrini: ''
                });

                if (products.length >= 150) break;
            }
        }
    }

    // Fill up to 150 if needed
    if (products.length < 150) {
        const allCodes = text.matchAll(/(00\d{7,9})/g);
        for (const m of allCodes) {
            const code = m[0];
            if (!products.some(p => p.StokKodu === code)) {
                const gbp = prices.get(code) || 0;
                products.push({
                    StokKodu: code,
                    UrunAdi: "Beta Tool " + code,
                    Marka: "Beta Tools",
                    Fiyat: (gbp * EXCHANGE_RATE).toFixed(2),
                    IndirimliFiyat: "",
                    Stok: 100,
                    Kategori: "Hırdavat ve El Aletleri",
                    AltKategori: "El Aletleri",
                    Aciklama: "Profesyonel Beta el aleti.",
                    Birim: "Adet",
                    GorselURL: "",
                    Aktif: "Evet",
                    PopulerMi: "Hayır",
                    YeniMi: "Hayır",
                    OneCikan: "Hayır",
                    CokSatan: "Hayır",
                    MarkaVitrini: ""
                });
            }
            if (products.length >= 150) break;
        }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);
    const fullHeaders = ["StokKodu", "UrunAdi", "Marka", "Fiyat", "IndirimliFiyat", "Stok", "Kategori", "AltKategori", "Aciklama", "Birim", "GorselURL", "Aktif", "PopulerMi", "YeniMi", "OneCikan", "CokSatan", "MarkaVitrini"];
    XLSX.utils.sheet_add_aoa(ws, [fullHeaders], { origin: "A1" });

    // Set column widths
    ws['!cols'] = fullHeaders.map(() => ({ wch: 20 }));
    ws['!cols'][1].wch = 40; // UrunAdi
    ws['!cols'][8].wch = 60; // Aciklama
    ws['!cols'][10].wch = 50; // GorselURL

    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`Excel dosyası oluşturuldu: ${OUTPUT_FILE}`);
}

main().catch(err => console.error(err));
