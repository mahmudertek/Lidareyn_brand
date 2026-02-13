const fs = require('fs');
const XLSX = require('xlsx');

// DOSYA YOLLARI
const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_OLCULU_V7.xlsx';

// TEKNİK TERİM SÖZLÜĞÜ
const HEADER_TR = {
    "L": "L(Uzunluk mm)",
    "L1": "L1(Çalışma Boyu mm)",
    "L2": "L2(Toplam Uzunluk mm)",
    "Ø": "Ø(Çap mm)",
    "Ømax": "Ømax(Maks. Çap mm)",
    "A": "A(Ağız Genişliği mm)",
    "H": "H(Yükseklik mm)",
    "d": "d(Gövde Çapı mm)",
    "max": "max(Kapasite)",
    "mm": "",
    "gas": "Boru Diş Ölçüsü"
};

const PRODUCT_TR = {
    "pipe wrenches": "Boru Anahtarı",
    "swedish pattern": "İsveç Tipi",
    "flat jaws": "Düz Çeneli",
    "slim jaws": "İnce Çeneli",
    "light pattern": "Hafif Tip",
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "UNC thread": "UNC Diş",
    "reversible": "Çift Yönlü",
    "chain": "Zincirli",
    "heavy duty": "Ağır Hizmet",
    "spare parts": "Yedek Parça",
    "assortment": "Set/Takım"
};

function translateName(eng) {
    let tr = eng.toLowerCase();
    Object.entries(PRODUCT_TR).forEach(([e, t]) => {
        tr = tr.replace(new RegExp(e, 'gi'), t);
    });
    return tr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// FİYAT HARİTASI
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
        if (m) {
            map[m[0]] = prices.length > 0 ? prices.shift() : 0;
        }
    });
    return map;
}

// GÖRSEL HARİTASI
function buildImageMap(dir) {
    const map = {};
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const name = file.replace(/\.[^.]+$/, '').toLowerCase();
            map[name] = file;
        });
    }
    return map;
}

// ANA İŞLEM
function parseProducts(txt, priceMap, imageMap) {
    const lines = txt.split('\n');
    const products = [];

    let currentModel = '';
    let currentDesc = '';
    let headerLine = '';  // L mm Ø max mm gibi başlık satırını topla

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // MODEL TESPİTİ (376, 378, 430ASC vb)
        const modelMatch = line.match(/^\|?\*?\s*(\d+[A-Z\/]*)\s*$/);
        if (modelMatch) {
            currentModel = modelMatch[1];
            currentDesc = '';
            headerLine = '';
            // Sonraki satırlardan açıklama ve header topla
            for (let j = 1; j < 8; j++) {
                const nextLine = (lines[i + j] || '').trim();
                if (nextLine.match(/00\d{7}/)) break; // SKU'ya ulaştık, dur
                if (nextLine.match(/\b(L|L1|L2|Ø|Ømax|A|H|d|max|mm)\b/)) {
                    headerLine += ' ' + nextLine;
                } else if (nextLine.length > 3 && !nextLine.match(/^\d/)) {
                    currentDesc += (currentDesc ? ', ' : '') + nextLine;
                }
            }
            continue;
        }

        // SKU SATIRI
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            const beforeSku = line.split(sku)[0].trim();

            // Değerleri ayır (250 1/2" gas 21 1 gibi)
            const values = beforeSku.split(/\s+/).filter(v => v.length > 0);

            // Başlıkları ayır
            const headers = headerLine.match(/\b(L2?|Ø|Ømax|A|H|d|max)\b/gi) || [];

            // Ölçü metnini oluştur
            let specsText = '';
            for (let j = 0; j < Math.min(headers.length, values.length); j++) {
                const hdr = headers[j];
                const trHeader = HEADER_TR[hdr] || hdr;
                specsText += `${trHeader}: ${values[j]}, `;
            }
            specsText = specsText.replace(/, $/, '');

            // Türkçe ürün adı
            const trName = translateName(currentDesc || currentModel);

            // Görsel eşleştirme
            const modelKey = currentModel.toLowerCase();
            const skuKey = sku.substring(2); // 00 prefix'i kaldır
            let imageUrl = '';
            if (imageMap[modelKey]) {
                imageUrl = `/gorseller/beta/${imageMap[modelKey]}`;
            } else if (imageMap[skuKey]) {
                imageUrl = `/gorseller/beta/${imageMap[skuKey]}`;
            } else {
                imageUrl = `/gorseller/beta/${currentModel}.png`;
            }

            products.push({
                "StokKodu": sku,
                "UrunAdi": `Beta ${currentModel} ${trName}`.replace(/\s+/g, ' ').trim(),
                "Marka": "Beta",
                "Fiyat": priceMap[sku] || 0,
                "IndirimliFiyat": "",
                "Stok": 50,
                "Kategori": "Hırdavat ve El Aletleri",
                "AltKategori": "Beta Profesyonel Aletler",
                "Aciklama": `Beta ${currentModel} ${trName}. Ölçüler: ${specsText}. Profesyonel endüstriyel kullanım için tasarlanmıştır.`.replace(/\s+/g, ' ').trim(),
                "Birim": "adet",
                "GorselURL": imageUrl,
                "Aktif": "Evet",
                "PopulerMi": "Hayır",
                "YeniMi": "Evet",
                "OneCikan": "Hayır",
                "CokSatan": "Hayır",
                "MarkaVitrini": ""
            });
        }
    }
    return products;
}

// ÇALIŞTIR
console.log("📄 Veriler yükleniyor...");
const catalogText = fs.readFileSync(CATALOG_PATH, 'utf8');
const priceText = fs.readFileSync(PRICE_PATH, 'utf8');

const priceMap = buildPriceMap(priceText);
const imageMap = buildImageMap(IMAGE_DIR);

console.log(`💰 ${Object.keys(priceMap).length} fiyat eşleştirildi.`);
console.log(`🖼️ ${Object.keys(imageMap).length} görsel bulundu.`);

const products = parseProducts(catalogText, priceMap, imageMap);

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
XLSX.writeFile(wb, OUTPUT_PATH);

console.log(`✅ ${products.length} ürün işlendi.`);
console.log(`📁 Dosya: ${OUTPUT_PATH}`);
