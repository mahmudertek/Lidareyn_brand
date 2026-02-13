const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_V13.xlsx';

const GBP_TO_TRY = 41;

// MODEL NUMARASINDAN ÜRÜN TİPİ TAHMİNİ
const MODEL_TYPE = {
    // 4xx serisi - Anahtarlar
    "42": "Kombine Anahtar Açık Uçlu ve Yıldız Krom Kaplama",
    "43": "Kombine Anahtar Krom Kaplama",
    "45": "Çift Yıldız Anahtar",
    "46": "Çift Açık Ağız Anahtar",
    "47": "Ayarlı Anahtar",
    "55": "Lokma Anahtar Takımı",

    // 3xx serisi - Boru Aletleri
    "36": "Boru Anahtarı Stillson Tipi",
    "37": "Boru Anahtarı İsveç Tipi",
    "38": "Zincirli Boru Anahtarı",

    // 10xx serisi - Penseler
    "1052": "Kargaburun Pense",
    "1082": "Yan Keski",
    "1084": "Yan Keski Ağır Hizmet",
    "1088": "Kombine Pense",
    "1096": "Su Pompası Pense",
    "1098": "Grip Pense",
    "1112": "Segman Pensesi İç",
    "1122": "Segman Pensesi Dış",
    "1123": "Segman Pensesi İç Eğik",
    "1124": "Segman Pensesi Dış Eğik",
    "1128": "Kablo Kesici",
    "1130": "Kablo Sıkıştırıcı",
    "1132": "Kablo Soyucu",
    "1142": "Tel Keski",
    "1144": "Kablo Bağı Kesici",
    "1149": "Çok Amaçlı Pense",
    "1150": "Kargaburun Pense Düz",
    "1162": "Kargaburun Pense Eğik",
    "1164": "Kargaburun Pense Yuvarlak",
    "1166": "Kargaburun Pense Düz Uzun",
    "1168": "Kargaburun Pense Ekstra Uzun",

    // 12xx serisi - Tornavidalar
    "1201": "Tornavida Düz Uçlu",
    "1202": "Tornavida Yıldız PH",
    "1203": "Tornavida Seti",
    "1204": "Tornavida Düz Uçlu Kısa",
    "1209": "Tornavida Pozidriv PZ",
    "1260": "Tornavida Düz Uçlu İzoleli",
    "1262": "Tornavida Yıldız İzoleli",
    "1264": "Tornavida Düz Uçlu Hassas",
    "1267": "Tornavida Torx",
    "1268": "Tornavida Torx Saplı",
    "1269": "Tornavida Pozidriv",
    "1290": "Tornavida Düz Uçlu",
    "1294": "Tornavida Düz Uçlu Kısa",
    "1298": "Tornavida Torx Saplı",
    "1299": "Tornavida Pozidriv",

    // 14xx - 18xx serisi - Ölçü Aletleri ve Diğer
    "1472": "Maket Bıçağı",
    "1473": "Kablo Soyucu",
    "1497": "Havya",
    "1600": "Kablo Pabucu Sıkıştırıcı",
    "1603": "Kablo Kesici",
    "1651": "Dijital Kumpas",
    "1691": "Şerit Metre",
    "1729": "Manyetik Seviye",
    "1741": "Perçin Tabancası",
    "1777": "Cımbız",
    "1778": "Cımbız Hassas",
    "1783": "Ayna Muayene",
    "1820": "Çalışma Lambası",
    "1822": "Atölye Lambası",
    "1833": "El Feneri",

    // 9xx serisi - Alyan Anahtarlar
    "900": "Alyan Anahtar",
    "910": "Alyan Anahtar Toplu",
    "920": "Alyan Anahtar Seti",
    "935": "Lokma Alyan",
    "937": "Lokma Alyan Uzun",
    "943": "Somun Sıkıştırıcı",
    "951": "Çakma Uçları",

    // 30-31 serisi - Zımbalar
    "30": "Pim Zımbası Saplı",
    "31": "Pim Zımbası Uzun Seri",

    // Diğer
    "default": "El Aleti"
};

function getProductType(model) {
    if (!model) return MODEL_TYPE["default"];

    // Tam eşleşme dene
    if (MODEL_TYPE[model]) return MODEL_TYPE[model];

    // İlk 4 karakter
    const prefix4 = model.substring(0, 4);
    if (MODEL_TYPE[prefix4]) return MODEL_TYPE[prefix4];

    // İlk 3 karakter
    const prefix3 = model.substring(0, 3);
    if (MODEL_TYPE[prefix3]) return MODEL_TYPE[prefix3];

    // İlk 2 karakter
    const prefix2 = model.substring(0, 2);
    if (MODEL_TYPE[prefix2]) return MODEL_TYPE[prefix2];

    return MODEL_TYPE["default"];
}

// Fiyat haritası
function buildPriceMap(txt) {
    const map = {};
    const lines = txt.split('\n');
    let prices = [];
    lines.forEach((line, i) => {
        if (line.trim() === '£') {
            let j = i + 1;
            while (j < lines.length && /^\d+[.,]\d{2}$/.test(lines[j].trim())) {
                const gbp = parseFloat(lines[j].trim().replace(',', '.'));
                prices.push(Math.round(gbp * GBP_TO_TRY * 100) / 100);
                j++;
            }
        }
        const m = line.match(/00\d{7}/);
        if (m) map[m[0]] = prices.length > 0 ? prices.shift() : 0;
    });
    return map;
}

// Görsel haritası
function buildImageMap(dir) {
    const map = {};
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            map[file.replace(/\.[^.]+$/, '').toLowerCase()] = file;
        });
    }
    return map;
}

// Ölçü parse
function parseSpec(raw) {
    if (!raw) return null;
    // İmkansız değerleri filtrele
    if (raw.match(/^\d{5,}$/) || raw.match(/^\d+x\d+\d{4,}$/)) {
        const match = raw.match(/^(\d{1,3}x\d{1,3})/) || raw.match(/^(\d{1,4})/);
        if (match) return match[1];
        return null;
    }
    return raw;
}

// Katalog parse
function parseCatalog(txt, priceMap, imageMap) {
    const lines = txt.split('\n');
    const products = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const skuMatch = line.match(/00\d{7}/);
        if (!skuMatch) continue;

        const sku = skuMatch[0];
        const beforeSku = line.split(sku)[0].trim();

        // Model bul
        let model = '';
        let headers = [];

        for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
            const prev = lines[j].trim();

            // Model numarası tespiti
            if (prev.match(/^\d{2,5}[A-Z\/]*[A-Z]?$/) && !prev.match(/\d{7}/) && prev.length >= 2 && prev.length <= 12) {
                const before = lines[j - 1] ? lines[j - 1].trim() : '';
                if (before === '|' || before === '*' || before === '#') {
                    model = prev;
                    break;
                }
            }

            if (prev.match(/^(L|L1|L2|Ø|A|H|d|S|R)$/)) {
                headers.unshift(prev);
            }
        }

        // Ürün tipi belirle
        const productType = getProductType(model);

        // Ürün adı
        const productName = model ? `Beta ${model} ${productType}` : `Beta ${productType}`;

        // Ölçüleri parse et
        const rawValues = beforeSku.split(/\s+/).filter(v => v.length > 0);
        let specsText = '';

        const usableHeaders = headers.filter(h => h !== 'mm');

        if (usableHeaders.length > 0) {
            let specs = [];
            for (let h = 0; h < Math.min(usableHeaders.length, rawValues.length); h++) {
                const hdr = usableHeaders[h];
                let val = parseSpec(rawValues[h]);
                if (!val) continue;

                // Birim ekle
                if (!val.includes('mm') && !val.includes('"') && !val.includes('gas') && !val.includes('x')) {
                    val = val + ' mm';
                }

                let trHdr = hdr;
                if (hdr === 'L') trHdr = 'L(Uzunluk)';
                else if (hdr === 'L1') trHdr = 'L1(Çalışma Boyu)';
                else if (hdr === 'Ø') trHdr = 'Ø(Çap)';
                else if (hdr === 'A') trHdr = 'A(Genişlik)';
                else if (hdr === 'H') trHdr = 'H(Yükseklik)';
                else if (hdr === 'S') trHdr = 'S(Kalınlık)';

                specs.push(`${trHdr}: ${val}`);
            }
            specsText = specs.join(', ');
        } else if (rawValues.length > 0) {
            // Header yoksa ilk değeri kullan
            const val = parseSpec(rawValues[0]);
            if (val) {
                const withUnit = val.includes('mm') || val.includes('"') || val.includes('x') ? val : val + ' mm';
                specsText = `Ölçü: ${withUnit}`;
            }
        }

        // Görsel
        let imgUrl = model ? `/gorseller/beta/${model}.png` : `/gorseller/beta/default.png`;
        if (model && imageMap[model.toLowerCase()]) {
            imgUrl = `/gorseller/beta/${imageMap[model.toLowerCase()]}`;
        }

        // Açıklama
        let description = productName;
        if (specsText) {
            description += `. Teknik Özellikler: ${specsText}`;
        }
        description += '. Beta Tools profesyonel endüstriyel kalitede üretilmiştir.';

        products.push({
            "StokKodu": sku,
            "UrunAdi": productName.substring(0, 250),
            "Marka": "Beta",
            "Fiyat": priceMap[sku] || 0,
            "IndirimliFiyat": "",
            "Stok": 50,
            "Kategori": "Hırdavat ve El Aletleri",
            "AltKategori": "Beta Profesyonel",
            "Aciklama": description.substring(0, 600),
            "Birim": "adet",
            "GorselURL": imgUrl,
            "Aktif": "Evet",
            "PopulerMi": "Hayır",
            "YeniMi": "Evet",
            "OneCikan": "Hayır",
            "CokSatan": "Hayır",
            "MarkaVitrini": ""
        });
    }

    return products;
}

// ÇALIŞTIR
console.log("📄 Yükleniyor...");
const catalogText = fs.readFileSync(CATALOG_PATH, 'utf8');
const priceText = fs.readFileSync(PRICE_PATH, 'utf8');
const priceMap = buildPriceMap(priceText);
const imageMap = buildImageMap(IMAGE_DIR);

console.log(`💰 ${Object.keys(priceMap).length} fiyat (x${GBP_TO_TRY} TL)`);
console.log(`🖼️ ${Object.keys(imageMap).length} görsel`);

const products = parseCatalog(catalogText, priceMap, imageMap);

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
XLSX.writeFile(wb, OUTPUT_PATH);

console.log(`✅ ${products.length} ürün`);
console.log(`📁 ${OUTPUT_PATH}`);
