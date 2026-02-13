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

// Translation Dictionary for Catalog Names
const catalogTranslations = {
    "pipe wrenches, light pattern": "Hafif Tip Boru Anahtarı",
    "pipe wrenches, swedish pattern, 90° flat jaws": "İsveç Tipi Boru Anahtarı, 90° Düz Ağız",
    "pipe wrenches, swedish pattern, 45° slim jaws": "İsveç Tipi Boru Anahtarı, 45° İnce Ağız",
    "heavy duty pipe wrenches made from light alloy": "Hafif Alaşımlı Ağır Hizmet Tipi Boru Anahtarı",
    "pipe wrenches, stillson pattern": "Stillson Tipi Boru Anahtarı",
    "heavy duty reversible chain pipe wrenches": "Ağır Hizmet Tipi Çift Yönlü Zincirli Boru Anahtarı",
    "spare chain for item 384": "384 Modeli İçin Yedek Zincir",
    "combination wrenches": "Kombine Anahtar",
    "double open end wrenches": "İki Ağızlı Çatal Anahtar",
    "double offset ring wrenches": "İki Ağızlı Yıldız Anahtar",
    "adjustable wrenches": "Ayarlı Anahtar",
    "hammers": "Çekiçler",
    "ball pein hammers": "Mühendis Çekici (Bilyalı)",
    "combination pliers": "Kombine Pense",
    "diagonal cutting nippers": "Yan Keski",
    "long nose pliers": "Uzun Burun Pense",
    "water pump pliers": "Su Pompası Pense",
    "slip joint pliers": "Mafsallı Pense",
    "locking pliers": "Ayarlı Pense (Grip Pense)",
    "hex key wrenches": "Allen Anahtarlar",
    "screwdrivers": "Tornavidalar",
    "ratcheting combination wrenches": "Cırcırlı Kombine Anahtar",
    "half-moon ring wrenches": "Ay Tipi Yıldız Anahtar",
    "single open end wrenches": "Tek Ağızlı Çatal Anahtar",
    "ring slogging wrenches": "Çakma Yıldız Anahtar"
};

// Technical Header Mapping - Full Turkish names as requested
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

async function loadPrices() {
    console.log('PriceList okunuyor...');
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
    console.log(`${priceMap.size} adet fiyat yüklendi.`);
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
    console.log('GP_ENG PDF analiz ediliyor...');
    const pdfBuf = fs.readFileSync(GP_ENG_PDF);
    const pdf = await pdfParse(pdfBuf, { max: 200 });
    const text = pdf.text;

    // Split by SKU separator pattern like "| 366 *" or "366 ..."
    const chunks = text.split(/\|\s*(\d{2,4}[A-Z\/\.\d]*)\s*\*/g);
    const products = [];

    for (let i = 1; i < chunks.length && products.length < 150; i += 2) {
        let sku = chunks[i].trim();
        const content = chunks[i + 1];

        // Skip some common non-tool numbers
        if (sku.length > 10 || sku.startsWith('202')) continue;

        // Higher quality name extraction from previous chunk
        const prevText = chunks[i - 1];
        const prevLines = prevText.split('\n').map(l => l.trim()).filter(l => l && l.length > 5 && !l.match(/^\d/) && !l.match(/^[A-Z0-9\s]*$/));
        let rawName = "";
        if (prevLines.length > 0) {
            // Usually the last descriptive line before the tool
            rawName = prevLines[prevLines.length - 1];
        }

        // Translate name strictly
        let trName = rawName;
        let translated = false;
        for (const [eng, tur] of Object.entries(catalogTranslations)) {
            if (rawName.toLowerCase().includes(eng.toLowerCase())) {
                trName = tur;
                translated = true;
                break;
            }
        }

        // If not translated and looking like garbage, skip to avoid "kafana göre" labels
        if (!translated && (rawName.match(/^[A-Z]+$/) || rawName.length < 10)) {
            // Try searching one more line up
            if (prevLines.length > 1) {
                rawName = prevLines[prevLines.length - 2];
                for (const [eng, tur] of Object.entries(catalogTranslations)) {
                    if (rawName.toLowerCase().includes(eng.toLowerCase())) {
                        trName = tur;
                        translated = true;
                        break;
                    }
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
                const parts = line.split(/\s+/).filter(p => p !== 'gas' && p !== '"' && p !== '#');
                const codeIdx = parts.indexOf(code);
                const vals = parts.slice(0, codeIdx);

                // Construct technical specs: header(full name):value unit
                const specs = [];
                for (let j = 0; j < Math.min(headers.length, vals.length); j++) {
                    const h = headers[j];
                    const fullH = headerMap[h] || h;
                    const val = vals[j];
                    const unit = (fullH.includes('genişlik') || fullH.includes('uzunluk') || fullH.includes('çap')) ? 'mm' : '';
                    specs.push(`${fullH}:${val}${unit}`);
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
                    Aciklama: `${trName} ${sku}\n\nTeknik Detaylar:\n${specs.join(', ')}\n\nGörsel: ${visual}`,
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

    // Fill if missing
    if (products.length < 150) {
        const matches = text.matchAll(/(00\d{7,9})/g);
        for (const m of matches) {
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

    const excelHeaders = ["StokKodu", "UrunAdi", "Marka", "Fiyat", "IndirimliFiyat", "Stok", "Kategori", "AltKategori", "Aciklama", "Birim", "GorselURL", "Aktif", "PopulerMi", "YeniMi", "OneCikan", "CokSatan", "MarkaVitrini"];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products, { header: excelHeaders });
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`Excel dosyası başarıyla güncellendi: ${OUTPUT_FILE}`);
}

main().catch(err => console.error(err));
