
const XLSX = require('xlsx');
const fs = require('fs');

// Configuration
const EXCEL_PATH = 'c:/Users/pc/Desktop/Lidareyn_Urunler_2026-02-02.xlsx';
const OUTPUT_PATH = 'c:/Users/pc/Desktop/Beta_Katalog_REVİZE_v2.xlsx';
const PDF_TEXT_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';

// Dictionary for English -> Turkish translation
const DICTIONARY = {
    'adjustable wrench': 'kurbağacık anahtar',
    'combination wrench': 'kombine anahtar',
    'open end wrench': 'iki ağızlı anahtar',
    'offset hex wrench': 'allen anahtar',
    'hex key': 'allen anahtar',
    'socket': 'lokma',
    'sockets': 'lokmalar',
    'ratchet': 'cırcır',
    'extension bar': 'uzatma kolu',
    'pliers': 'pense',
    'nippers': 'keski',
    'diagonal cutter': 'yan keski',
    'cutting nippers': 'keski',
    'long nose pliers': 'kargaburun',
    'screwdriver': 'tornavida',
    'hammer': 'çekiç',
    'mallet': 'tokmak',
    'torque wrench': 'tork anahtarı',
    'sparkproof': 'kıvılcım çıkarmaz',
    'anti-spark': 'kıvılcım çıkarmaz',
    'chrome vanadium': 'krom vanadyum',
    'chrome plated': 'krom kaplama',
    'phosphated': 'fosfat kaplama',
    'insulated': 'izoleli',
    'heavy duty': 'ağır hizmet tipi',
    'professional': 'profesyonel',
    'industrial': 'endüstriyel',
    'high quality': 'yüksek kaliteli',
    'stainless steel': 'paslanmaz çelik',
    'magnetic': 'mıknatıslı',
    'set': 'takım',
    'kit': 'takım',
    'module': 'modül',
    'bits': 'uçlar',
    'hexagon': 'altı köşe',
    'impact': 'havalı',
    'digital': 'dijital',
    'caliper': 'kumpas',
    'micrometer': 'mikrometre',
    'tool trolley': 'takım arabası',
    'cabinet': 'dolap',
    'bag': 'çanta',
    'box': 'kutu',
    'case': 'çanta',
    'drill': 'matkap',
    'grinder': 'taşlama',
    'sander': 'zımpara',
    'polisher': 'polisaj',
    'saw': 'testere',
    'file': 'eğe',
    'chisel': 'keski',
    'punch': 'zımba',
    'extractor': 'çektirme',
    'puller': 'çektirme',
    'tester': 'kontrol kalemi',
    'multimeter': 'multimetre',
    'voltage': 'voltaj',
    'current': 'akım',
    'battery': 'akü',
    'charger': 'şarj cihazı',
    'light': 'lamba', // Generic, but accurate enough
    'lamp': 'lamba',
    'torch': 'fener',
    'knife': 'bıçak',
    'scissors': 'makas',
    'shears': 'makas',
    'clamp': 'işkence',
    'vice': 'mengene',
    'goggles': 'gözlük',
    'gloves': 'eldiven',
    'shoes': 'ayakkabı',
    'boots': 'bot',
    'helmet': 'baret',
    'mask': 'maske',
    'jack': 'kriko',
    'stand': 'sehpa',
    'crane': 'vinç',
    'lift': 'lift',
    'press': 'pres',
    'pump': 'pompa',
    'oil': 'yağ',
    'grease': 'gres',
    'gun': 'tabancası',
    'hose': 'hortum',
    'reel': 'makara',
    'cable': 'kablo',
    'connector': 'konnektör',
    'terminal': 'terminal',
    'fuse': 'sigorta',
    'relay': 'röle',
    'switch': 'anahtar',
    'sensor': 'sensör',
    'valve': 'valf',
    'filter': 'filtre',
    'bearing': 'rulman',
    'bushing': 'burç',
    'seal': 'conta',
    'gasket': 'conta',
    'nut': 'somun',
    'screw': 'vida',
    'bolt': 'cıvata',
    'washer': 'pul',
    'ring': 'halka',
    'clip': 'klips',
    'pin': 'pim',
    'spring': 'yay'
};

// SKU Prefix fallback map (Key must be string)
const SKU_PREFIX_MAP = {
    '1183': 'Yüksek Performanslı Keski',
    '1150': 'Kombine Pense',
    '1082': 'Yan Keski',
    '1166': 'Kargaburun',
    '1048': 'Papağan Pense',
    '1112': 'Teneke Makası',
    '42': 'Kombine Anahtar',
    '55': 'Açık Ağız Anahtar',
    '90': 'Yıldız Anahtar',
    '96': 'Allen Anahtar Takımı',
    '97': 'Allen Anahtar',
    '900': 'Lokma',
    '920': 'Lokma',
    '910': 'Lokma',
    '142': 'Cırcır Kombine Anahtar',
    '1203': 'Düz Tornavida',
    '1290': 'Tornavida',
    '1292': 'Tornavida',
    '1293': 'Tornavida',
    '1263': 'Tornavida',
    '1719': 'Eğe',
    '30': 'Zımba',
    '31': 'Zımba',
    '1370': 'Çekiç',
    '1390': 'Plastik Çekiç',
    '2424': 'Takım Çantası',
    '2400': 'Takım Arabası'
};

function translateText(text) {
    if (!text) return '';
    let translated = text.toLowerCase();

    // Sort dictionary by length descending to match longest phrases first
    const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        // Use word boundary regex for better matching
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        translated = translated.replace(regex, DICTIONARY[key]);
    }

    // Capitalize first letter
    return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function parsePDFText() {
    if (!fs.existsSync(PDF_TEXT_PATH)) {
        console.log("PDF Text file not found. Skipping PDF lookup.");
        return {};
    }

    console.log("Parsing PDF text...");
    try {
        const text = fs.readFileSync(PDF_TEXT_PATH, 'utf-8');
        const lines = text.split(/\r?\n/);
        const skuMap = {};

        // Headers we are looking for
        const headerKeywords = ['L', 'L1', 'L2', 'A', 'A1', 'S', 'Ø', 'H', 'B', 'Weight', 'g', 'mm', 'GAS', 'M'];
        const headerRegex = new RegExp(`\\b(${headerKeywords.join('|')})\\b`, 'g');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Look for numeric SKU (8-10 digits)
            const skuMatch = line.match(/\b00\d{6,8}\b/);
            if (!skuMatch) continue;

            const skuVal = skuMatch[0];
            const parts = line.split(/\s+/);
            const values = parts.filter(p => /^[\d,.]+(\/[0-9x.]+)?$/.test(p) && p !== skuVal);

            // Look back for headers
            let foundHeaders = [];
            for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
                const prevLine = lines[j].trim();
                const matches = prevLine.match(headerRegex);
                if (matches) {
                    foundHeaders = [...matches, ...foundHeaders];
                }
                // Stop if we hit a new Art or a very long line that looks like a title
                if (prevLine.includes('Art.') || prevLine.length > 50) break;
            }

            // Deduplicate headers
            foundHeaders = [...new Set(foundHeaders)];

            let dimensions = '';
            // Match headers to values. We assume columns are roughly in order.
            // But we keep it simple: if we have N headers, take the first N values.
            if (foundHeaders.length > 0 && values.length > 0) {
                foundHeaders.forEach((h, idx) => {
                    if (values[idx]) {
                        dimensions += `${h}:${values[idx]} `;
                    }
                });
            } else if (values.length > 0) {
                // Fallback: just list values
                dimensions = values.join(' ');
            }

            const entry = {
                text: line,
                dimensions: dimensions.trim()
            };

            skuMap[skuVal] = entry;
            // Also index by stripped version
            skuMap[skuVal.replace(/^0+/, '')] = entry;
        }

        console.log(`Indexed ${Object.keys(skuMap).length} entries from PDF.`);
        return skuMap;
    } catch (e) {
        console.error("Error parsing PDF text:", e);
        return {};
    }
}

function guessNameFromSKU(sku) {
    sku = String(sku);
    for (const prefix of Object.keys(SKU_PREFIX_MAP).sort((a, b) => b.length - a.length)) {
        if (sku.startsWith(prefix)) {
            return SKU_PREFIX_MAP[prefix];
        }
    }
    return null;
}

function run() {
    console.log("Reading Excel...");
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let items = XLSX.utils.sheet_to_json(sheet);

    const pdfMap = parsePDFText();

    console.log("Processing items...");
    let updatedCount = 0;

    items = items.map(item => {
        let sku = String(item.StokKodu || item.SKU || '').trim();
        let urunAdi = item.UrunAdi || '';
        let aciklama = item.Aciklama || '';

        // 1. Remove [Katalog Sayfası: ...]
        aciklama = aciklama.replace(/\[Katalog.*?(?:\]|$)/g, '').trim();

        // 2. Try to get English Name and Dimensions
        let sourceForTranslation = '';
        let dimensions = '';
        if (pdfMap[sku]) {
            const entry = pdfMap[sku];
            sourceForTranslation = entry.text
                .replace(sku, '')
                .replace(/[0-9.,]+$/, '')
                .trim();
            dimensions = entry.dimensions;
        }

        // 3. Determine New Name
        let finalName = '';
        if (sourceForTranslation) {
            finalName = translateText(sourceForTranslation);
        } else {
            const guessed = guessNameFromSKU(sku);
            if (guessed) {
                finalName = guessed;
            } else {
                finalName = urunAdi
                    .replace(/^Beta\s+/i, '')
                    .replace(/Profesyonel El Aleti/i, 'El Aleti')
                    .trim();
                finalName = translateText(finalName);
            }
        }

        // Detect Size/Dimensions
        if (!dimensions) { // If dimensions not found directly by SKU
            // Try partial match or lookup by name/description if SKU is weird (ADM-...)
            // But for now, let's look for any SKU mentioned in current aciklama
            const possibleSkuMatch = aciklama.match(/\b00\d{7,8}\b/);
            if (possibleSkuMatch && pdfMap[possibleSkuMatch[0]]) {
                dimensions = pdfMap[possibleSkuMatch[0]].dimensions;
            }
        }

        const sizeRegex = /\b(\d+\s*mm|\d+\s*cm|\d+\s*("|inch)|L=\d+|\d+x\d+|\d+\/\d+)\b/i;
        let detectedSize = '';
        const skuMatch = sku.match(sizeRegex);
        if (skuMatch) detectedSize = skuMatch[0];

        // Final Size Info
        let sizeInfo = '';
        if (dimensions) {
            sizeInfo = ` Ölçüler: ${dimensions}.`;
        } else if (detectedSize) {
            sizeInfo = ` Ölçü: ${detectedSize}.`;
        }

        let prettyName = finalName || 'Profesyonel El Aleti';

        // Name cleanup
        item.UrunAdi = `Beta ${sku} ${prettyName}${dimensions ? ' (' + dimensions + ')' : ''}`;
        item.UrunAdi = item.UrunAdi.replace(/\s+/g, ' ').trim();

        // 4. Construct Description (NO SKU in text as requested)
        let newDesc = `Beta markalı ${prettyName}.${sizeInfo} `;
        if (sourceForTranslation) {
            newDesc += `Orijinal katalog tanımı: ${translateText(sourceForTranslation)}. `;
        }
        newDesc += `Profesyonel endüstriyel kullanım için yüksek standartlarda üretilmiştir. Dayanıklı yapısı ve ergonomik tasarımı ile uzun ömürlü kullanım sağlar.`;

        if (prettyName.toLowerCase().includes('izole')) newDesc += " 1000V izoleli.";
        if (prettyName.toLowerCase().includes('paslanmaz')) newDesc += " Paslanmaz çelik gövde.";

        item.Aciklama = newDesc;
        item.Olcu = dimensions || detectedSize;

        updatedCount++;
        return item;
    });

    // Save
    const newSheet = XLSX.utils.json_to_sheet(items);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Ürünler");
    XLSX.writeFile(newWorkbook, OUTPUT_PATH);

    console.log(`Process complete. ${updatedCount} items updated.`);
    console.log(`Saved to: ${OUTPUT_PATH}`);
}

run();
