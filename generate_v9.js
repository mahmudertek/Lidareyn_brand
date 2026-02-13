const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_DOGRU_V9.xlsx';

// İngilizce-Türkçe çeviriler
const TR = {
    "combination wrenches": "Kombine Anahtar",
    "open and offset ring ends": "Açık Uçlu ve Yıldız",
    "bright chrome-plated": "Krom Kaplama",
    "pipe wrenches": "Boru Anahtarı",
    "swedish pattern": "İsveç Tipi",
    "stillson pattern": "Stillson Tipi",
    "flat jaws": "Düz Çeneli",
    "slim jaws": "İnce Çeneli",
    "light pattern": "Hafif Tip",
    "heavy duty": "Ağır Hizmet",
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "reversible": "Çift Yönlü",
    "chain pipe": "Zincirli Boru",
    "adjustable": "Ayarlı",
    "spare parts": "Yedek Parça",
    "pliers": "Pense",
    "long nose": "Kargaburun",
    "diagonal": "Yan Keski",
    "screwdrivers": "Tornavida",
    "sockets": "Lokma",
    "ratchet": "Cırcır",
    "hex key": "Alyan Anahtar",
    "double open end": "Çift Açık Ağız",
    "offset": "Eğik",
    "ring": "Yıldız"
};

function translate(eng) {
    let result = eng.toLowerCase();
    Object.entries(TR).forEach(([e, t]) => {
        result = result.replace(new RegExp(e, 'gi'), t);
    });
    return result.split(',').map(s => s.trim()).filter(s => s).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
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
                prices.push(parseFloat(lines[j].trim().replace(',', '.')));
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

// Ana katalog işleme
function parseCatalog(txt, priceMap, imageMap) {
    const lines = txt.split('\n');
    const products = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // SKU tespiti
        const skuMatch = line.match(/00\d{7}/);
        if (!skuMatch) continue;

        const sku = skuMatch[0];
        const beforeSku = line.split(sku)[0].trim();

        // Geriye doğru git: model numarasını bul
        let model = '';
        let headers = [];
        let engDesc = '';

        for (let j = i - 1; j >= Math.max(0, i - 100); j--) {
            const prevLine = lines[j].trim();

            // Model numarası (42MP, 378, 430ASC gibi)
            if (prevLine.match(/^\d+[A-Z\/]*$/) && prevLine.length >= 2 && prevLine.length <= 10) {
                // Önceki satır | veya * ise bu model
                const before = lines[j - 1] ? lines[j - 1].trim() : '';
                if (before === '|' || before === '*' || before === '#') {
                    model = prevLine;

                    // Şimdi açıklamayı bul - daha ileride olabilir
                    for (let k = j + 1; k < Math.min(lines.length, j + 150); k++) {
                        const descLine = lines[k].trim();
                        // İngilizce açıklama genellikle küçük harfle başlar ve uzundur
                        if (descLine.length > 20 && descLine.match(/^[a-z]/)) {
                            engDesc = descLine;
                            // Sonraki satırlar da açıklamanın devamı olabilir
                            for (let m = k + 1; m < Math.min(lines.length, k + 5); m++) {
                                const nextDesc = lines[m].trim();
                                if (nextDesc.length > 5 && nextDesc.match(/^[a-z]/) && !nextDesc.match(/00\d{7}/)) {
                                    engDesc += ' ' + nextDesc;
                                } else break;
                            }
                            break;
                        }
                    }
                    break;
                }
            }

            // Header'ları topla (L, mm, Ø gibi)
            if (prevLine.match(/^(L|L1|L2|Ø|mm|A|H|d|S)$/)) {
                headers.unshift(prevLine);
            }
        }

        if (!model) continue;

        // Değerleri ayır
        const values = beforeSku.split(/\s+/).filter(v => v.length > 0);

        // Ölçü metni oluştur
        let specsText = '';
        const headerLabels = { "L": "L(Uzunluk mm)", "Ø": "Ø(Çap)", "A": "A(Genişlik mm)", "H": "H(Yükseklik mm)" };
        let usableHeaders = headers.filter(h => h !== 'mm');
        for (let h = 0; h < Math.min(usableHeaders.length, values.length); h++) {
            const hdr = usableHeaders[h];
            const label = headerLabels[hdr] || hdr;
            specsText += `${label}: ${values[h]}, `;
        }
        specsText = specsText.replace(/, $/, '') || values.join(' x ');

        // Türkçe çeviri
        const trDesc = engDesc ? translate(engDesc) : '';
        const productName = `Beta ${model} ${trDesc}`.replace(/\s+/g, ' ').trim();

        // Görsel
        let imgUrl = `/gorseller/beta/${model}.png`;
        if (imageMap[model.toLowerCase()]) imgUrl = `/gorseller/beta/${imageMap[model.toLowerCase()]}`;

        products.push({
            "StokKodu": sku,
            "UrunAdi": productName.substring(0, 200),
            "Marka": "Beta",
            "Fiyat": priceMap[sku] || 0,
            "IndirimliFiyat": "",
            "Stok": 50,
            "Kategori": "Hırdavat ve El Aletleri",
            "AltKategori": "Beta Profesyonel",
            "Aciklama": `${productName}. Ölçüler: ${specsText}. Profesyonel endüstriyel kalitede üretilmiştir.`.substring(0, 500),
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

console.log(`💰 ${Object.keys(priceMap).length} fiyat`);
console.log(`🖼️ ${Object.keys(imageMap).length} görsel`);

const products = parseCatalog(catalogText, priceMap, imageMap);

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
XLSX.writeFile(wb, OUTPUT_PATH);

console.log(`✅ ${products.length} ürün`);
console.log(`📁 ${OUTPUT_PATH}`);
