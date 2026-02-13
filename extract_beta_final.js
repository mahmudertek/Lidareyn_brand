const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_Final_150.xlsx';
const EXCHANGE_RATE = 41;

const translations = {
    'pipe wrenches, light pattern': 'Hafif Tip Boru Anahtarı',
    'pipe wrenches, swedish pattern, 90° flat jaws': 'İsveç Tipi Boru Anahtarı, 90° Düz Ağız',
    'pipe wrenches, swedish pattern, 45° slim jaws': 'İsveç Tipi Boru Anahtarı, 45° İnce Ağız',
    'heavy duty pipe wrenches': 'Ağır Hizmet Boru Anahtarı',
    'stillson pattern': 'Stillson Tipi',
    'swedish pattern': 'İsveç Tipi',
    'pipe wrenches': 'Boru Anahtarı',
    'combination wrenches': 'Kombine Anahtar',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'hammers': 'Çekiçler',
    'hammers, ball pein': 'Mühendis Çekici (Bilyalı)',
};

function translateName(name) {
    let tr = name.toLowerCase();
    for (const [eng, tur] of Object.entries(translations)) {
        if (tr.includes(eng)) return tur;
    }
    return name;
}

async function loadPrices() {
    console.log('PriceList okunuyor...');
    const buf = fs.readFileSync(PRICE_LIST_PDF);
    const data = await pdfParse(buf, { max: 500 });
    const text = data.text;
    const priceMap = new Map();

    const lines = text.split('\n');
    let lastP = 0;
    for (const l of lines) {
        // Look for price format XX.XX or £XX.XX or £ XX.XX
        const pm = l.match(/£?\s?(\d+\.\d{2})/);
        if (pm) {
            const val = parseFloat(pm[1]);
            // Filter out common small non-price numbers if needed, 
            // but usually price list rows are specific.
            lastP = val;
        }

        // Look for 9-digit Beta code (starts with 00)
        const cm = l.match(/(00\d{7,9})/);
        if (cm && lastP > 0) {
            priceMap.set(cm[1], lastP);
            // reset lastP after assigning to avoid mis-assignment? 
            // No, same price might apply to multiple items if they are variants.
        }
    }
    console.log(`${priceMap.size} fiyat yüklendi.`);
    return priceMap;
}

function findImage(sku) {
    if (!fs.existsSync(IMAGES_DIR)) return '';
    const cleanSku = sku.replace(/[^a-zA-Z0-9]/g, '');
    const dirs = fs.readdirSync(IMAGES_DIR);
    const foundDir = dirs.find(d => d.replace(/[^a-zA-Z0-9]/g, '').startsWith(cleanSku));
    if (!foundDir) return '';
    const files = fs.readdirSync(path.join(IMAGES_DIR, foundDir));
    const img = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    return img ? `Beta_Katalog_SKU_Gorseller/${foundDir}/${img}` : '';
}

async function main() {
    const prices = await loadPrices();
    const pdfBuf = fs.readFileSync(GP_ENG_PDF);
    const pdf = await pdfParse(pdfBuf, { max: 150 });
    const text = pdf.text;

    // Split text into chunks by SKU indicators (e.g. "| 366 *")
    const chunks = text.split(/\|\s*(\d{2,4}[A-Z]*)\s*\*/g);
    const products = [];

    // chunk 0 is before first SKU, then 1=SKU, 2=Content of that SKU, etc.
    for (let i = 1; i < chunks.length && products.length < 150; i += 2) {
        const sku = chunks[i];
        const content = chunks[i + 1];

        // Find the name above or near the content
        // Names are usually descriptive lines before the technical table
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        let productName = "Beta " + sku;

        // Search for table headers like "L mm"
        let headers = [];
        const headerIndex = lines.findIndex(l => l.includes('mm') || l.includes('Ø'));
        if (headerIndex !== -1) {
            headers = lines[headerIndex].split(/\s+/);
            // The name is likely some lines before the headers (in the previous chunk or top of this chunk)
        }

        // Find rows with Article Codes (00...)
        for (const line of lines) {
            const codeMatch = line.match(/(00\d{7,9})/);
            if (codeMatch) {
                const code = codeMatch[1];
                const parts = line.split(/\s+/).filter(p => !p.includes(' gas'));
                const codeIdx = parts.indexOf(code);
                const values = parts.slice(0, codeIdx);

                let specs = [];
                // If we have headers, map them. Else just list them.
                if (headers.length > 0) {
                    for (let j = 0; j < Math.min(headers.length, values.length); j++) {
                        specs.push(`${headers[j]}: ${values[j]}`);
                    }
                } else {
                    specs = values.map((v, idx) => `Ölçü ${idx + 1}: ${v}`);
                }

                const gbp = prices.get(code) || 0;
                const tryPrice = (gbp * EXCHANGE_RATE).toFixed(2);
                const img = findImage(sku);

                products.push({
                    StokKodu: code,
                    UrunAdi: `Beta ${sku} ${values[0] || ''}`.trim(),
                    Marka: 'Beta Tools',
                    Fiyat: tryPrice,
                    IndirimliFiyat: '',
                    Stok: 100,
                    Kategori: 'Hırdavat ve El Aletleri',
                    AltKategori: 'El Aletleri',
                    Aciklama: `Profesyonel Beta ${sku}.\n\nTeknik Özellikler:\n${specs.join('\n')}\n\nGörsel: ${img}`,
                    Birim: 'Adet',
                    GorselURL: img,
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

    // If not enough products, try a broader search for 9-digit codes
    if (products.length < 150) {
        console.log('Trying broader search...');
        const lines = text.split('\n');
        for (const line of lines) {
            const codeMatch = line.match(/(00\d{7,9})/);
            if (codeMatch && !products.find(p => p.StokKodu === codeMatch[1])) {
                const code = codeMatch[1];
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
                    Aciklama: "Beta profesyonel el aleti.",
                    Birim: "Adet",
                    GorselURL: "",
                    Aktif: "Evet",
                    PopulerMi: "Hayır",
                    YeniMi: "Hayır",
                    OneCikan: "Hayır",
                    CokSatan: "Hayır",
                    MarkaVitrini: ""
                });
                if (products.length >= 150) break;
            }
        }
    }

    const excelHeaders = ["StokKodu", "UrunAdi", "Marka", "Fiyat", "IndirimliFiyat", "Stok", "Kategori", "AltKategori", "Aciklama", "Birim", "GorselURL", "Aktif", "PopulerMi", "YeniMi", "OneCikan", "CokSatan", "MarkaVitrini"];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products, { header: excelHeaders });
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`Final file created: ${OUTPUT_FILE}`);
}

main().catch(err => console.error(err));
