const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Yapılandırma
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150_vFINAL.xlsx';
const EXCHANGE_RATE = 41;

// Katalog başlıkları için Türkçe karşılıklar (Genişletildi)
const catalogTranslations = {
    "combination wrenches": "Kombine Anahtar",
    "pipe wrenches": "Boru Anahtarı",
    "light pattern": "Hafif Tip",
    "swedish pattern": "İsveç Tipi",
    "90° flat jaws": "90° Düz Ağız",
    "45° slim jaws": "45° İnce Ağız",
    "heavy duty": "Ağır Hizmet Tipi",
    "stillson pattern": "Stillson Tipi",
    "reversible chain": "Çift Yönlü Zincirli",
    "adjustable wrenches": "Ayarlı Anahtar",
    "double open end wrenches": "İki Ağızlı Çatal Anahtar",
    "double offset ring wrenches": "İki Ağızlı Yıldız Anahtar",
    "ratcheting": "Cırcırlı",
    "pliers": "Pense",
    "nippers": "Yan Keski",
    "hammers": "Çekiç",
    "hex key": "Allen Anahtar",
    "screwdrivers": "Tornavida",
    "bright finish": "Parlak Yüzey",
    "chrome plated": "Krom Kaplama"
};

// Teknik başlık eşleştirmeleri - Kullanıcının kesin talebi: Başlık(Anlamı)
const headerMap = {
    "L": "L(Uzunluk)",
    "L1": "L1(Uzunluk)",
    "L2": "L2(Uzunluk)",
    "Ø": "Q(Çap)",
    "Q": "Q(Çap)",
    "A": "A(Genişlik)",
    "A1": "A1(Genişlik)",
    "B": "B(Genişlik)",
    "B1": "B1(Genişlik)",
    "C": "C(Genişlik)",
    "S": "S(Kalınlık)",
    "H": "H(Yükseklik)",
    "g": "g(Ağırlık)",
    "kg": "kg(Ağırlık)",
    "mm": "mm(Milimetre)",
    "max": "Maks",
    "min": "Min"
};

async function loadPrices() {
    console.log('Fiyatlar yükleniyor...');
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

// Bir değeri ve birimini temizler
function formatValue(val, header) {
    if (!val) return '';
    let clean = val.replace(/\s+/g, ' ').trim();
    // Eğer başlık bir boyutsa ve değerde birim yoksa mm ekle
    const isDimension = header.includes('Uzunluk') || header.includes('Genişlik') || header.includes('Çap') || header.includes('Kalınlık') || header.includes('Yükseklik');
    if (isDimension && !clean.toLowerCase().includes('mm') && !clean.includes('"') && !isNaN(parseFloat(clean))) {
        clean += 'mm';
    }
    return clean;
}

async function main() {
    const prices = await loadPrices();
    console.log('PDF analiz ediliyor...');
    const pdfBuf = fs.readFileSync(GP_ENG_PDF);
    const pdf = await pdfParse(pdfBuf, { max: 300 });
    const text = pdf.text;

    const chunkRegex = /\|\s*\n?\s*(\d{2,4}[A-Z\/\.\d]*)\s*\n?\s*\*/g;
    const chunks = [];
    let lastIdx = 0;
    let match;
    const skus = [];

    while ((match = chunkRegex.exec(text)) !== null) {
        chunks.push(text.substring(lastIdx, match.index));
        skus.push(match[1].trim());
        lastIdx = chunkRegex.lastIndex;
    }
    chunks.push(text.substring(lastIdx));

    const products = [];
    for (let i = 0; i < skus.length && products.length < 150; i++) {
        const sku = skus[i];
        const content = chunks[i + 1];
        const prevText = chunks[i];

        // Bağlamdan isim çıkarma (Genişletilmiş arama)
        const context = (prevText.slice(-500) + content.slice(0, 200)).toLowerCase();
        let trName = "";

        // Çoklu eşleşme kontrolü
        const foundTerms = [];
        for (const [eng, tur] of Object.entries(catalogTranslations)) {
            if (context.includes(eng)) {
                foundTerms.push({ eng, tur });
            }
        }
        // En uzun eşleşmeyi başa al (örn: "heavy duty pipe wrenches" > "pipe wrenches")
        foundTerms.sort((a, b) => b.eng.length - a.eng.length);

        if (foundTerms.length > 0) {
            // İlk ana terimi al, diğerlerini yanına ekle (eğer farklıysa)
            trName = foundTerms[0].tur;
            for (let j = 1; j < Math.min(3, foundTerms.length); j++) {
                if (!trName.includes(foundTerms[j].tur)) trName += " " + foundTerms[j].tur;
            }
        } else {
            trName = "El Aleti";
        }

        const lines = content.split('\n').map(l => l.trim()).filter(l => l);

        // Tablo başlıklarını bul
        let headers = [];
        const headerIndex = lines.findIndex(l => l.includes('mm') || l.includes('Ø') || l.match(/^[L\d\søA-Z\s]+$/) && l.length < 50 && l.length > 3);
        if (headerIndex !== -1) {
            headers = lines[headerIndex].replace(/mm/g, '').split(/\s+/).filter(h => h && h.length < 10);
        }

        for (const line of lines) {
            const articleMatch = line.match(/(00\d{7,9})/);
            if (articleMatch) {
                const code = articleMatch[1];
                // Değerleri ayıkla (koddan önceki kısımlar)
                const partsBeforeCode = line.split(code)[0].trim().split(/\s+/).filter(p => !['gas', '"', '#', '*', '|'].includes(p));

                // Teknik Detayları Oluştur
                const specs = [];
                for (let j = 0; j < Math.max(headers.length, partsBeforeCode.length); j++) {
                    let h = headers[j] || (partsBeforeCode[j] ? `Ölçü ${j + 1}` : null);
                    if (!h) continue;

                    const fullH = headerMap[h] || h;
                    let val = partsBeforeCode[j] || "";

                    // Eğer değer ve başlık birleşmişse (örn: 10x10172) ayırmaya çalış
                    if (val.length > 5 && val.includes('x')) {
                        // Basit bir ayırma mantığı
                    }

                    if (val) {
                        specs.push(`${fullH}:${formatValue(val, fullH)}`);
                    }
                }

                const gbp = prices.get(code) || 0;
                const priceTry = (gbp * EXCHANGE_RATE).toFixed(2);
                const visual = findImage(sku);

                products.push({
                    StokKodu: code,
                    UrunAdi: `Beta ${sku} ${trName} ${partsBeforeCode[0] || ''}`.trim(),
                    Marka: 'Beta Tools',
                    Fiyat: priceTry,
                    IndirimliFiyat: '',
                    Stok: 100,
                    Kategori: 'Hırdavat ve El Aletleri',
                    AltKategori: 'El Aletleri',
                    Aciklama: `Beta ${sku} ${trName}\n\nTeknik Özellikler:\n${specs.join(', ')}`,
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

    // Sütun genişlikleri
    ws['!cols'] = excelHeaders.map(() => ({ wch: 20 }));
    ws['!cols'][1].wch = 50; // UrunAdi
    ws['!cols'][8].wch = 100; // Aciklama (Ölçüler için geniş)
    ws['!cols'][10].wch = 60; // GorselURL

    XLSX.utils.book_append_sheet(wb, ws, 'Sayfa1');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`\n✅ Başarıyla tamamlandı!`);
    console.log(`📂 Dosya: ${OUTPUT_FILE}`);
    console.log(`📊 Toplam Ürün: ${products.length}`);
}

main().catch(err => {
    console.error('\n❌ Hata oluştu:', err.message);
});
