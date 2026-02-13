const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_V11.xlsx';

const GBP_TO_TRY = 41;

// TÜRKÇE ÇEVİRİ SÖZLÜĞÜ
const TR = {
    "combination wrenches": "Kombine Anahtar",
    "open and offset ring ends": "Açık Uçlu ve Yıldız",
    "double open end wrenches": "Çift Açık Ağız Anahtar",
    "double ring wrenches": "Çift Yıldız Anahtar",
    "offset ring wrenches": "Eğik Yıldız Anahtar",
    "ratchet ring wrenches": "Cırcırlı Yıldız Anahtar",
    "adjustable wrenches": "Kurbağacık Anahtar",
    "pipe wrenches": "Boru Anahtarı",
    "swedish pattern": "İsveç Tipi",
    "stillson pattern": "Stillson Tipi",
    "pliers": "Pense",
    "long nose pliers": "Kargaburun Pense",
    "diagonal cutting nippers": "Yan Keski",
    "combination pliers": "Kombine Pense",
    "slip joint pliers": "Su Pompası Pense",
    "locking pliers": "Grip Pense",
    "screwdrivers": "Tornavida",
    "slotted screwdrivers": "Düz Uçlu Tornavida",
    "phillips screwdrivers": "Yıldız Tornavida",
    "insulated screwdrivers": "İzoleli Tornavida",
    "sockets": "Lokma",
    "socket sets": "Lokma Takımı",
    "ratchet": "Cırcır",
    "extension bar": "Uzatma Çubuğu",
    "hammers": "Çekiç",
    "pin punches": "Zımba",
    "centre punches": "Merkez Zımbası",
    "with handles": "Saplı",
    "long series punches": "Uzun Seri Zımba",
    "automatic centre punches": "Otomatik Merkez Zımbası",
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "UNC thread": "UNC Diş",
    "fine pitch": "İnce Diş",
    "coarse pitch": "Kaba Diş",
    "bright chrome-plated": "Krom Kaplama",
    "chrome-plated": "Krom Kaplama",
    "made from chrome-steel": "Krom Çelikten",
    "heavy duty": "Ağır Hizmet Tipi",
    "light pattern": "Hafif Tip",
    "flat jaws": "Düz Çeneli",
    "slim jaws": "İnce Çeneli",
    "reversible": "Çift Yönlü",
    "spare parts": "Yedek Parça",
    "assortment": "Takım/Set",
    "ring pins": "Halka Pimler",
    "open and offset": "Açık Uçlu ve Yıldız"
};

function translate(text) {
    if (!text) return "";
    let result = text;
    const sortedKeys = Object.keys(TR).sort((a, b) => b.length - a.length);
    for (const eng of sortedKeys) {
        result = result.replace(new RegExp(eng, 'gi'), TR[eng]);
    }
    result = result.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
    if (result) result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
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

// Ölçü değerini parse et (imkansız değerleri filtrele)
function parseSpecValue(raw) {
    // Eğer değer çok uzunsa (5+ karakter ve sadece rakam), muhtemelen yanlış birleşmiş
    if (raw.match(/^\d{5,}$/) || raw.match(/^\d+x\d+\d{4,}$/)) {
        // İlk mantıklı kısmı al
        const match = raw.match(/^(\d{1,3}x\d{1,3})/) || raw.match(/^(\d{1,4})/);
        if (match) return match[1];
        return null; // Bu değeri atla
    }
    return raw;
}

// Katalog parse
function parseCatalog(txt, priceMap, imageMap) {
    const lines = txt.split('\n');
    const products = [];

    // Önce tüm model-açıklama eşleşmelerini bul
    const modelDescMap = {};
    let currentModel = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Model tespiti (tekli satırda, | veya * sonrası)
        if (line.match(/^\d{2,4}[A-Z\/]*$/) && !line.match(/\d{7}/)) {
            const prev = lines[i - 1] ? lines[i - 1].trim() : '';
            if (prev === '|' || prev === '*') {
                currentModel = line;
            }
        }

        // Açıklama tespiti (küçük harfle başlayan uzun satır)
        if (line.length > 20 && line.match(/^[a-z]/) && currentModel) {
            if (!modelDescMap[currentModel]) {
                modelDescMap[currentModel] = line;
                // Devamını da ekle
                for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
                    const next = lines[j].trim();
                    if (next.length > 5 && next.match(/^[a-z]/)) {
                        modelDescMap[currentModel] += ' ' + next;
                    } else break;
                }
            }
        }
    }

    // Şimdi ürünleri işle
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const skuMatch = line.match(/00\d{7}/);
        if (!skuMatch) continue;

        const sku = skuMatch[0];
        const beforeSku = line.split(sku)[0].trim();

        // Model bul (geriye doğru)
        let model = '';
        let headers = [];

        for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
            const prev = lines[j].trim();

            if (prev.match(/^\d{2,4}[A-Z\/]*$/) && !prev.match(/\d{7}/) && prev.length <= 8) {
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

        // Model bulunamadıysa, bu ürünü spesifik olmadan ekle
        const engDesc = model ? (modelDescMap[model] || '') : '';
        const trDesc = translate(engDesc);

        // Ürün adı - model yoksa veya tanımsızsa sadece Türkçe açıklama kullan
        let productName = '';
        if (model && trDesc) {
            productName = `Beta ${model} ${trDesc}`;
        } else if (trDesc) {
            productName = `Beta ${trDesc}`;
        } else if (model) {
            productName = `Beta ${model}`;
        } else {
            productName = 'Beta Profesyonel Alet';
        }
        productName = productName.replace(/\s+/g, ' ').trim();

        // Ölçüleri parse et
        const rawValues = beforeSku.split(/\s+/).filter(v => v.length > 0);
        let specsText = '';

        const usableHeaders = headers.filter(h => h !== 'mm');

        if (usableHeaders.length > 0) {
            for (let h = 0; h < Math.min(usableHeaders.length, rawValues.length); h++) {
                const hdr = usableHeaders[h];
                let val = parseSpecValue(rawValues[h]);

                if (!val) continue; // İmkansız değeri atla

                // Birim ekle
                if (!val.includes('mm') && !val.includes('"') && !val.includes('gas')) {
                    val = val + ' mm';
                }

                // Türkçe başlık
                let trHdr = hdr;
                if (hdr === 'L') trHdr = 'L(Uzunluk)';
                else if (hdr === 'L1') trHdr = 'L1(Çalışma Boyu)';
                else if (hdr === 'Ø') trHdr = 'Ø(Çap)';
                else if (hdr === 'A') trHdr = 'A(Genişlik)';
                else if (hdr === 'H') trHdr = 'H(Yükseklik)';

                specsText += `${trHdr}: ${val}, `;
            }
        } else if (rawValues.length > 0) {
            // Header yoksa ilk değeri ölçü olarak al
            const val = parseSpecValue(rawValues[0]);
            if (val) {
                specsText = `Ölçü: ${val.includes('mm') ? val : val + ' mm'}`;
            }
        }
        specsText = specsText.replace(/, $/, '');

        // Görsel
        let imgUrl = model ? `/gorseller/beta/${model}.png` : `/gorseller/beta/default.png`;
        if (model && imageMap[model.toLowerCase()]) {
            imgUrl = `/gorseller/beta/${imageMap[model.toLowerCase()]}`;
        }

        // Açıklama
        let description = productName;
        if (specsText) description += `. Ölçüler: ${specsText}`;
        description += '. Beta Tools profesyonel endüstriyel kalitede üretilmiştir.';

        products.push({
            "StokKodu": sku,
            "UrunAdi": productName.substring(0, 200),
            "Marka": "Beta",
            "Fiyat": priceMap[sku] || 0,
            "IndirimliFiyat": "",
            "Stok": 50,
            "Kategori": "Hırdavat ve El Aletleri",
            "AltKategori": "Beta Profesyonel",
            "Aciklama": description.substring(0, 500),
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

// Çalıştır
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
