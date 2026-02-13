const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_TURKCE_V10.xlsx';

const GBP_TO_TRY = 41; // Kur çarpanı

// KAPSAMLI TÜRKÇE ÇEVİRİ SÖZLÜĞÜ
const TR = {
    // Anahtar türleri
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

    // Pense türleri
    "pliers": "Pense",
    "long nose pliers": "Kargaburun Pense",
    "diagonal cutting nippers": "Yan Keski",
    "combination pliers": "Kombine Pense",
    "slip joint pliers": "Su Pompası Pense",
    "locking pliers": "Grip Pense",

    // Tornavida
    "screwdrivers": "Tornavida",
    "slotted screwdrivers": "Düz Uçlu Tornavida",
    "phillips screwdrivers": "Yıldız Tornavida",
    "insulated screwdrivers": "İzoleli Tornavida",

    // Lokma
    "sockets": "Lokma",
    "socket sets": "Lokma Takımı",
    "ratchet": "Cırcır",
    "extension bar": "Uzatma Çubuğu",

    // Çekiç ve zımba
    "hammers": "Çekiç",
    "pin punches": "Zımba",
    "centre punches": "Merkez Zımbası",
    "with handles": "Saplı",
    "long series punches": "Uzun Seri Zımba",
    "automatic centre punches": "Otomatik Merkez Zımbası",

    // Kılavuz
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "UNC thread": "UNC Diş",
    "fine pitch": "İnce Diş",
    "coarse pitch": "Kaba Diş",

    // Genel
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
    "for": "",
    "spYıldız": "Yıldız",
    "sp": ""
};

function translateToTurkish(text) {
    if (!text) return "";
    let result = text;

    // Sözlükten çevir (uzun ifadelerden kısalara doğru)
    const sortedKeys = Object.keys(TR).sort((a, b) => b.length - a.length);
    for (const eng of sortedKeys) {
        const regex = new RegExp(eng, 'gi');
        result = result.replace(regex, TR[eng]);
    }

    // Temizlik
    result = result.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
    result = result.replace(/^,\s*/, '').replace(/,\s*$/, '');

    // İlk harfi büyük yap
    if (result) result = result.charAt(0).toUpperCase() + result.slice(1);

    return result;
}

// Fiyat haritası (GBP → TRY)
function buildPriceMap(txt) {
    const map = {};
    const lines = txt.split('\n');
    let prices = [];

    lines.forEach((line, i) => {
        if (line.trim() === '£') {
            let j = i + 1;
            while (j < lines.length && /^\d+[.,]\d{2}$/.test(lines[j].trim())) {
                const gbpPrice = parseFloat(lines[j].trim().replace(',', '.'));
                prices.push(Math.round(gbpPrice * GBP_TO_TRY * 100) / 100); // TL'ye çevir
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

        // Model ve açıklama bul
        let model = '';
        let engDesc = '';
        let headers = [];

        // Geriye doğru model ara
        for (let j = i - 1; j >= Math.max(0, i - 50); j--) {
            const prev = lines[j].trim();

            // Model numarası
            if (prev.match(/^\d{2,4}[A-Z\/]*$/) && !prev.match(/\d{7}/)) {
                const before = lines[j - 1] ? lines[j - 1].trim() : '';
                if (before === '|' || before === '*' || before === '#') {
                    model = prev;
                    break;
                }
            }

            // Header'ları topla
            if (prev.match(/^(L|L1|L2|Ø|A|H|d|S|R|mm)$/)) {
                headers.unshift(prev);
            }
        }

        // İleriye doğru açıklama ara
        for (let j = i + 1; j < Math.min(lines.length, i + 100); j++) {
            const next = lines[j].trim();
            if (next.length > 15 && next.match(/^[a-z]/) && !next.match(/00\d{7}/)) {
                engDesc = next;
                // Devamını da al
                for (let k = j + 1; k < Math.min(lines.length, j + 3); k++) {
                    const cont = lines[k].trim();
                    if (cont.length > 5 && cont.match(/^[a-z]/) && !cont.match(/00\d{7}/)) {
                        engDesc += ' ' + cont;
                    } else break;
                }
                break;
            }
        }

        if (!model) {
            // Model bulunamadıysa, SKU'dan türet
            model = sku.substring(2, 5);
        }

        // Değerleri ayır ve ölçü metni oluştur
        const values = beforeSku.split(/\s+/).filter(v => v.length > 0);

        // Ölçüleri birimlerle yaz
        let specsText = '';
        if (values.length > 0) {
            // İlk değer genellikle ana ölçü
            const mainVal = values[0];

            // Header'ları eşleştir
            const usableHeaders = headers.filter(h => h !== 'mm');

            if (usableHeaders.length > 0 && values.length > 0) {
                for (let h = 0; h < Math.min(usableHeaders.length, values.length); h++) {
                    const hdr = usableHeaders[h];
                    const val = values[h];

                    // Birim ekle
                    let valWithUnit = val;
                    if (!val.includes('mm') && !val.includes('"') && !val.includes('gas')) {
                        valWithUnit = val + ' mm';
                    }

                    // Türkçe başlık
                    let trHeader = hdr;
                    if (hdr === 'L') trHeader = 'L(Uzunluk)';
                    else if (hdr === 'L1') trHeader = 'L1(Çalışma Boyu)';
                    else if (hdr === 'Ø') trHeader = 'Ø(Çap)';
                    else if (hdr === 'A') trHeader = 'A(Genişlik)';
                    else if (hdr === 'H') trHeader = 'H(Yükseklik)';

                    specsText += `${trHeader}: ${valWithUnit}, `;
                }
            } else {
                // Header yoksa sadece değerleri listele
                specsText = values.map(v => v.includes('mm') || v.includes('"') ? v : v + ' mm').join(' x ');
            }
        }
        specsText = specsText.replace(/, $/, '');

        // Türkçe çeviri
        const trDesc = translateToTurkish(engDesc);
        const productName = `Beta ${model} ${trDesc || 'Profesyonel Alet'}`.replace(/\s+/g, ' ').trim();

        // Görsel
        let imgUrl = `/gorseller/beta/${model}.png`;
        if (imageMap[model.toLowerCase()]) {
            imgUrl = `/gorseller/beta/${imageMap[model.toLowerCase()]}`;
        }

        // Açıklama (tamamen Türkçe)
        const description = `${productName}. Ölçüler: ${specsText}. Beta Tools profesyonel endüstriyel kalitede üretilmiştir.`.replace(/\s+/g, ' ');

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
