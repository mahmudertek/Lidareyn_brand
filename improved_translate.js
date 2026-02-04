
const XLSX = require('xlsx');
const fs = require('fs');

// Configuration
const EXCEL_PATH = 'c:/Users/pc/Desktop/Beta_Katalog_FINAL.xlsx';
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
    const text = fs.readFileSync(PDF_TEXT_PATH, 'utf-8');
    const lines = text.split('\n');
    const skuMap = {};

    // Simple heuristic parser for Price List format: SKU Description Price
    // Example: 011830001 1183BM/150 HIGH LEVERAGE COMBINATION PLIERS

    for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        // Try to match SKU pattern. Beta SKUs often are 8-10 digits or code like 1183BM
        // Regex for Beta SKU (Code): \b[0-9]{3,5}[A-Z0-9\/]*\b
        // Let's grab the first "word" as SKU if it looks like a SKU

        const parts = cleanLine.split(/\s+/);
        if (parts.length < 2) continue;

        const potentialSku = parts[0];
        const potentialSku2 = parts[1];

        // Sometimes PDF text lines are messy.
        // We look for parts that match our SKUs in Excel.
        // But for now, let's just store lines indexed by words that look like SKUs

        // Store broad matches
        if (potentialSku.length > 3) skuMap[potentialSku] = cleanLine;
        if (potentialSku2 && potentialSku2.length > 3) skuMap[potentialSku2] = cleanLine;
    }

    console.log(`Indexed ${Object.keys(skuMap).length} potential SKU lines from PDF.`);
    return skuMap;
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

        // 2. Try to get English Name
        let englishName = '';
        let sourceForTranslation = '';

        // Try PDF Map
        if (pdfMap[sku]) {
            // Extract English Description roughly
            // Assume line is: SKU EnglishDesc Price
            // Remove SKU and Price (digits/currency)
            sourceForTranslation = pdfMap[sku]
                .replace(sku, '')
                .replace(/[0-9.,]+$/, '') // Remove trailing price
                .trim();
        } else {
            // Try to use UrunAdi if it starts with Beta but has other text?
            // But UrunAdi is currently "Beta 1183BM Profesyonel El Aleti"
            // If we assume "Profesyonel El Aleti" is GARBAGE, we ignore it.
        }

        // 3. Determine New Name
        let finalName = '';

        if (sourceForTranslation) {
            // Translate the English source
            finalName = translateText(sourceForTranslation);
        } else {
            // Fallback: Guess from SKU
            const guessed = guessNameFromSKU(sku);
            if (guessed) {
                finalName = guessed;
            } else {
                // Fallback 2: Keep generic but clean "Beta" and "Profesyonel"
                finalName = urunAdi
                    .replace(/^Beta\s+/i, '')
                    .replace(/Profesyonel El Aleti/i, 'El Aleti') // Make it slightly less annoying
                    .trim();

                // Use dictionary on existing name?
                finalName = translateText(finalName);
            }
        }

        // 4. Construct Description
        // "Beta 1183BM - Yüksek Performanslı Keski"
        // "Beta markalı yüksek kaliteli..."

        // If we have a specific name (not El Aleti), use it.
        let prettyName = finalName || 'Profesyonel El Aleti';

        // Format: "Beta [SKU] [Name]"
        item.UrunAdi = `Beta ${sku} ${prettyName}`;

        // Clean up double spaces
        item.UrunAdi = item.UrunAdi.replace(/\s+/g, ' ').trim();

        // Description
        // Ensure description doesn't have duplicate info or old tags
        let newDesc = `Beta markalı ${prettyName} (${sku}). `;
        if (sourceForTranslation) {
            newDesc += `Orijinal katalog tanımı: ${translateText(sourceForTranslation)}. `; // Translated full text
        }
        newDesc += `Profesyonel kullanım için tasarlanmıştır.`;

        // Add specific features based on keywords
        if (prettyName.toLowerCase().includes('izole')) newDesc += " 1000V izoleli.";
        if (prettyName.toLowerCase().includes('paslanmaz')) newDesc += " Paslanmaz çelik gövde.";

        item.Aciklama = newDesc;

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
