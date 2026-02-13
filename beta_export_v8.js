const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Configuration
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_Technical_150.xlsx';
const EXCHANGE_RATE = 41;

// Detailed Header Mapping
const headerMap = {
    "L": "L(uzunluk)",
    "L1": "L1(uzunluk)",
    "L2": "L2(uzunluk)",
    "Ø": "Ø(çap)",
    "A": "A(genişlik)",
    "A1": "A1(genişlik)",
    "B": "B(genişlik)",
    "B1": "B1(genişlik)",
    "C": "C(genişlik)",
    "S": "S(kalınlık)",
    "H": "H(yükseklik)",
    "g": "g(ağırlık)",
    "kg": "kg(ağırlık)",
    "mm": "mm(milimetre)"
};

// Translation Map for Catalog Names
const catalogTranslations = {
    "pipe wrenches, light pattern": "Hafif Tip Boru Anahtarı",
    "pipe wrenches, swedish pattern, 90° flat jaws": "İsveç Tipi Boru Anahtarı, 90° Düz Ağız",
    "pipe wrenches, swedish pattern, 45° slim jaws": "İsveç Tipi Boru Anahtarı, 45° İnce Ağız",
    "heavy duty pipe wrenches made from light alloy": "Hafif Alaşımlı Ağır Hizmet Tipi Boru Anahtarı",
    "pipe wrenches, stillson pattern": "Stillson Tipi Boru Anahtarı",
    "heavy duty reversible chain pipe wrenches": "Ağır Hizmet Tipi Çift Yönlü Zincirli Boru Anahtarı",
    "pipe wrenches, swedish pattern": "İsveç Tipi Boru Anahtarı",
    "combination wrenches": "Kombine Anahtar",
    "double open end wrenches": "İki Ağızlı Çatal Anahtar",
    "double offset ring wrenches": "İki Ağızlı Yıldız Anahtar",
    "adjustable wrenches": "Ayarlı Anahtar",
    "ratcheting combination wrenches": "Cırcırlı Kombine Anahtar",
    "pliers": "Pense",
    "diagonal cutting nippers": "Yan Keski",
    "long nose pliers": "Uzun Burun Pense",
    "water pump pliers": "Su Pompası Pense",
    "locking pliers": "Ayarlı Pense",
    "hammers": "Çekiç",
    "hex key wrenches": "Allen Anahtar",
    "screwdrivers": "Tornavida"
};

async function loadPrices() {
    console.log('Fiyat listesi yükleniyor...');
    const buf = fs.readFileSync(PRICE_LIST_PDF);
    const data = await pdfParse(buf, { max: 500 });
    const text = data.text;
    const priceMap = new Map();
    const lines = text.split('\n');
    let lastPrice = 0;
    for (const l of lines) {
        const pm = l.match(/(\d+[\.,]\d{2})/);
        if (pm) lastPrice = parseFloat(pm[1].replace(',', '.'));
        const cm = l.match(/(00\d{7,9})/);
        if (cm && lastPrice > 0) priceMap.set(cm[1], lastPrice);
    }
    console.log(`${priceMap.size} fiyat yüklendi.`);
    return priceMap;
}

function findImage(sku) {
    if (!fs.existsSync(IMAGES_DIR)) return '';
    const cleanSku = sku.replace(/[^a-zA-Z0-9]/g, '');
    const dirs = fs.readdirSync(IMAGES_DIR);
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
    console.log('PDF analiz ediliyor...');
    const pdfBuf = fs.readFileSync(GP_ENG_PDF);
    const pdf = await pdfParse(pdfBuf, { max: 200 }); // Analyzing enough pages for 150 products
    const text = pdf.text;

    // Improved chunking to catch actual tool sections
    const chunks = text.split(/\|\s*(\d{2,4}[A-Z\/\.\d]*)\s*\*/g);
    const products = [];

    for (let i = 1; i < chunks.length && products.length < 150; i += 2) {
        const sku = chunks[i].trim();
        const content = chunks[i + 1];

        if (sku.length > 8 || sku.match(/^20/)) continue;

        // Better name extraction: searching for descriptive English text in context
        const contextText = (chunks[i - 1].slice(-500) + content.slice(0, 200));
        let trName = "Beta Tool " + sku;
        let foundMatch = null;

        // Find best match in catalogTranslations
        for (const [eng, tur] of Object.entries(catalogTranslations)) {
            if (contextText.toLowerCase().includes(eng.toLowerCase())) {
                if (!foundMatch || eng.length > foundMatch.length) {
                    foundMatch = eng;
                    trName = tur;
                }
            }
        }

        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        let headers = [];
        let headerLine = lines.find(l => l.includes('mm') || l.includes('Ø') || l.includes('kg'));
        if (headerLine) {
            headers = headerLine.replace(/mm/g, '').split(/\s+/).filter(h => h && h.length < 10);
        }

        for (const line of lines) {
            const articleMatch = line.match(/(00\d{7,9})/);
            if (articleMatch) {
                const code = articleMatch[1];
                const parts = line.split(/\s+/).filter(p => !['gas', '"', '#', '...', '|', '*'].includes(p));
                const codeIdx = parts.indexOf(code);
                const vals = parts.slice(0, codeIdx);

                // Construct technical details format: header(full name):value unit
                const specs = [];
                for (let j = 0; j < Math.min(headers.length, vals.length); j++) {
                    const h = headers[j];
                    const fullH = headerMap[h] || h;
                    const val = vals[j];
                    const hasUnit = (fullH.includes('genişlik') || fullH.includes('uzunluk') || fullH.includes('çap') || fullH.includes('yükseklik'));
                    specs.push(`${fullH}:${val}${hasUnit ? 'mm' : ''}`);
                }

                const gbp = prices.get(code) || 0;
                const priceTry = (gbp * EXCHANGE_RATE).toFixed(2);
                const visual = findImage(sku);

                products.push({
                    StokKodu: code,
                    UrunAdi: `Beta ${sku} ${trName} ${vals[0] || ''}`.trim(),
                    Marka: 'Beta Tools',
                    Fiyat: priceTry,
                    IndirimliFiyat: '',
                    Stok: 100,
                    Kategori: 'Hırdavat ve El Aletleri',
                    AltKategori: 'El Aletleri',
                    Aciklama: `${trName} ${sku}\n\nTeknik Veriler:\n${specs.join(', ')}\n\nGörsel: ${visual}`,
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

    const excelHeaders = ["StokKodu", "UrunAdi", "Marka", "Fiyat", "IndirimliFiyat", "Stok", "Kategori", "AltKategori", "Aciklama", "Birim", "GorselURL", "Aktif", "PopulerMi", "YeniMi", "OneCikan", "CokSatan", "MarkaVitrini"];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products, { header: excelHeaders });

    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`Excel dosyası oluşturuldu: ${OUTPUT_FILE}`);
}

main().catch(err => console.error(err));
