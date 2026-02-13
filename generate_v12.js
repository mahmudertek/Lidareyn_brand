const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_V12.xlsx';

const GBP_TO_TRY = 41;

// GENİŞ TÜRKÇE SÖZLÜK
const TR = {
    // Anahtar
    "combination wrenches": "Kombine Anahtar",
    "open and offset ring ends": "Açık Uçlu ve Yıldız Uçlu",
    "double open end wrenches": "Çift Açık Ağız Anahtar",
    "double ring wrenches": "Çift Yıldız Anahtar",
    "offset ring wrenches": "Eğik Yıldız Anahtar",
    "ratchet ring wrenches": "Cırcırlı Yıldız Anahtar",
    "adjustable wrenches": "Kurbağacık Anahtar",
    "pipe wrenches": "Boru Anahtarı",
    "swedish pattern": "İsveç Tipi",
    "stillson pattern": "Stillson Tipi",
    "hex key wrenches": "Alyan Anahtar",
    "box wrenches": "Kutu Anahtar",
    "crowfoot wrenches": "Karga Ayağı Anahtar",

    // Pense
    "pliers": "Pense",
    "long nose pliers": "Kargaburun Pense",
    "diagonal cutting nippers": "Yan Keski",
    "diagonal nippers": "Yan Keski",
    "combination pliers": "Kombine Pense",
    "slip joint pliers": "Su Pompası Pense",
    "locking pliers": "Grip Pense",
    "water pump pliers": "Su Pompası Pense",
    "cutting pliers": "Kesici Pense",
    "circlip pliers": "Segman Pensesi",
    "needle nose": "İğne Burun",

    // Tornavida
    "screwdrivers": "Tornavida",
    "slotted screwdrivers": "Düz Uçlu Tornavida",
    "phillips screwdrivers": "Yıldız Tornavida",
    "insulated screwdrivers": "İzoleli Tornavida",
    "precision screwdrivers": "Hassas Tornavida",
    "impact screwdrivers": "Darbeli Tornavida",

    // Lokma
    "sockets": "Lokma",
    "socket sets": "Lokma Takımı",
    "ratchet": "Cırcır",
    "extension bar": "Uzatma Çubuğu",
    "spark plug sockets": "Buji Lokması",
    "impact sockets": "Darbeli Lokma",
    "deep sockets": "Uzun Lokma",

    // Çekiç & Zımba
    "hammers": "Çekiç",
    "ball pein hammers": "Bilyalı Çekiç",
    "rubber hammers": "Kauçuk Çekiç",
    "dead blow hammers": "Sektirmez Çekiç",
    "pin punches": "Pim Zımbası",
    "centre punches": "Merkez Zımbası",
    "with handles": "Saplı",
    "long series punches": "Uzun Seri Zımba",
    "automatic centre punches": "Otomatik Merkez Zımbası",
    "punches": "Zımba",

    // Kılavuz
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "UNC thread": "UNC Diş",
    "fine pitch": "İnce Diş",
    "coarse pitch": "Kaba Diş",
    "taps": "Kılavuz",
    "dies": "Pafta",
    "threading tools": "Diş Açma Aletleri",

    // Ölçü Aletleri
    "measuring tools": "Ölçü Aletleri",
    "tape measure": "Şerit Metre",
    "caliper": "Kumpas",
    "micrometer": "Mikrometre",
    "spirit level": "Su Terazisi",
    "angle finder": "Açı Ölçer",

    // Kesici
    "cutting tools": "Kesici Aletler",
    "files": "Eğe",
    "rasps": "Törpü",
    "chisels": "Keski",
    "cold chisels": "Soğuk Keski",
    "hacksaw": "Demir Testeresi",
    "utility knife": "Maket Bıçağı",

    // Diğer
    "sheet metal": "Sac Metal",
    "single door tool cabinet": "Tek Kapılı Alet Dolabı",
    "for workshop equipment": "Atölye Ekipmanı İçin",
    "tool cabinet": "Alet Dolabı",
    "tool trolley": "Alet Arabası",
    "workbench": "Çalışma Tezgahı",
    "bright chrome-plated": "Krom Kaplama",
    "chrome-plated": "Krom Kaplama",
    "made from chrome-steel": "Krom Çelikten",
    "made from": "",
    "heavy duty": "Ağır Hizmet Tipi",
    "light pattern": "Hafif Tip",
    "flat jaws": "Düz Çeneli",
    "slim jaws": "İnce Çeneli",
    "reversible": "Çift Yönlü",
    "spare parts": "Yedek Parça",
    "spare": "Yedek",
    "assortment": "Takım/Set",
    "ring pins": "Halka Pimler",
    "open and offset": "Açık Uçlu ve Yıldız",
    "for": "",
    "with": "",
    "combination": "Kombine"
};

function translate(text) {
    if (!text) return "";
    let result = text.toLowerCase();

    // Uzun ifadelerden kısalara doğru sırala
    const sortedKeys = Object.keys(TR).sort((a, b) => b.length - a.length);
    for (const eng of sortedKeys) {
        result = result.replace(new RegExp(eng, 'gi'), TR[eng]);
    }

    // Temizlik
    result = result.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
    result = result.replace(/^,\s*/, '').replace(/,\s*$/, '');

    // Her kelimenin ilk harfini büyük yap
    result = result.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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

// Ölçü parse
function parseSpec(raw) {
    if (!raw) return null;
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

    // 1. Önce tüm model-açıklama eşleşmelerini bul
    const modelDescMap = {};
    let currentModel = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Model tespiti
        if (line.match(/^\d{2,4}[A-Z\/]*$/) && !line.match(/\d{7}/) && line.length <= 10) {
            const prev = lines[i - 1] ? lines[i - 1].trim() : '';
            if (prev === '|' || prev === '*') {
                currentModel = line;
            }
        }

        // Açıklama tespiti
        if (line.length > 15 && line.match(/^[a-z]/) && currentModel && !modelDescMap[currentModel]) {
            let desc = line;
            for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                const next = lines[j].trim();
                if (next.length > 3 && next.match(/^[a-z]/) && !next.match(/00\d{7}/)) {
                    desc += ' ' + next;
                } else break;
            }
            modelDescMap[currentModel] = desc;
        }
    }

    console.log(`📋 ${Object.keys(modelDescMap).length} model açıklaması bulundu`);

    // 2. Ürünleri işle
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const skuMatch = line.match(/00\d{7}/);
        if (!skuMatch) continue;

        const sku = skuMatch[0];
        const beforeSku = line.split(sku)[0].trim();

        // Model bul
        let model = '';
        let headers = [];

        for (let j = i - 1; j >= Math.max(0, i - 40); j--) {
            const prev = lines[j].trim();

            if (prev.match(/^\d{2,4}[A-Z\/]*$/) && !prev.match(/\d{7}/) && prev.length <= 10) {
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

        // Açıklama bul
        let engDesc = model ? modelDescMap[model] : '';

        // Model bulunamadıysa, çevredeki açıklamayı ara
        if (!engDesc) {
            for (let j = i + 1; j < Math.min(lines.length, i + 50); j++) {
                const next = lines[j].trim();
                if (next.length > 15 && next.match(/^[a-z]/)) {
                    engDesc = next;
                    for (let k = j + 1; k < Math.min(lines.length, j + 3); k++) {
                        const cont = lines[k].trim();
                        if (cont.length > 3 && cont.match(/^[a-z]/) && !cont.match(/00\d{7}/)) {
                            engDesc += ' ' + cont;
                        } else break;
                    }
                    break;
                }
            }
        }

        // Türkçe çeviri
        const trDesc = translate(engDesc);

        // Ürün adı - ASLA "Profesyonel Alet" yazma, mutlaka spesifik ol
        let productName = '';
        if (model && trDesc) {
            productName = `Beta ${model} ${trDesc}`;
        } else if (trDesc) {
            productName = `Beta ${trDesc}`;
        } else if (model) {
            // Model var ama açıklama yok - geriye bak
            productName = `Beta ${model}`;
        } else {
            // Hiçbiri yok - SKU'dan atla bu ürünü değil, ama genel isim koyma
            productName = `Beta Endüstriyel Alet`;
        }
        productName = productName.replace(/\s+/g, ' ').trim();

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

                if (!val.includes('mm') && !val.includes('"') && !val.includes('gas')) {
                    val = val + ' mm';
                }

                let trHdr = hdr;
                if (hdr === 'L') trHdr = 'L(Uzunluk)';
                else if (hdr === 'L1') trHdr = 'L1(Çalışma Boyu)';
                else if (hdr === 'Ø') trHdr = 'Ø(Çap)';
                else if (hdr === 'A') trHdr = 'A(Genişlik)';
                else if (hdr === 'H') trHdr = 'H(Yükseklik)';

                specs.push(`${trHdr}: ${val}`);
            }
            specsText = specs.join(', ');
        } else if (rawValues.length > 0) {
            const val = parseSpec(rawValues[0]);
            if (val) {
                specsText = val.includes('mm') || val.includes('"') ? val : val + ' mm';
            }
        }

        // Görsel
        let imgUrl = model ? `/gorseller/beta/${model}.png` : `/gorseller/beta/default.png`;
        if (model && imageMap[model.toLowerCase()]) {
            imgUrl = `/gorseller/beta/${imageMap[model.toLowerCase()]}`;
        }

        // Açıklama - "Ölçüler: Ölçü:" tekrarını önle
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
