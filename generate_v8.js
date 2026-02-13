const fs = require('fs');
const XLSX = require('xlsx');

// DOSYA YOLLARI
const CATALOG_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const IMAGE_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_Gorseller_Final';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_V8.xlsx';

// TEKNİK BAŞLIK ÇEVİRİLERİ
const HEADER_TR = {
    "L": "L(Uzunluk)",
    "L1": "L1(Çalışma Boyu)",
    "L2": "L2(Toplam Uzunluk)",
    "Ø": "Ø(Çap)",
    "Ømax": "Ømax(Maks. Çap)",
    "max \"": "Boru Diş Ölçüsü",
    "max mm": "mm",
    "A": "A(Ağız Genişliği)",
    "H": "H(Yükseklik)",
    "d": "d(Gövde Çapı)",
    "S": "S(Kalınlık)",
    "R": "R(Bükme Yarıçapı)"
};

// ÜRÜN AÇIKLAMA ÇEVİRİLERİ
const DESC_TR = {
    "pipe wrenches": "Boru Anahtarı",
    "swedish pattern": "İsveç Tipi",
    "stillson pattern": "Stillson Tipi",
    "flat jaws": "Düz Çeneli",
    "slim jaws": "İnce Çeneli",
    "light pattern": "Hafif Tip",
    "heavy duty": "Ağır Hizmet Tipi",
    "reversible": "Çift Yönlü",
    "chain": "Zincirli",
    "spare parts kit": "Yedek Parça Kiti",
    "spare chain": "Yedek Zincir",
    "offset pattern": "Eğik Tip",
    "made from light alloy": "Hafif Alaşımdan",
    "pipe bender": "Boru Bükücü",
    "pipe cutter": "Boru Kesici",
    "adjustable": "Ayarlı",
    "hand taps": "El Kılavuzu",
    "machine taps": "Makine Kılavuzu",
    "metric thread": "Metrik Diş",
    "UNC thread": "UNC Diş",
    "pliers": "Pense",
    "nippers": "Keski",
    "wrenches": "Anahtar"
};

function translateDesc(eng) {
    let tr = eng.toLowerCase();
    Object.entries(DESC_TR).forEach(([e, t]) => {
        tr = tr.replace(new RegExp(e, 'gi'), t);
    });
    return tr.split(' ').filter(w => w).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
        if (m) map[m[0]] = prices.length > 0 ? prices.shift() : 0;
    });
    return map;
}

// GÖRSEL HARİTASI
function buildImageMap(dir) {
    const map = {};
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const name = file.replace(/\.[^.]+$/, '');
            map[name.toLowerCase()] = file;
        });
    }
    return map;
}

// KATALOG PARSE
function parseCatalog(txt, priceMap, imageMap) {
    const lines = txt.split('\n');
    const products = [];

    // 1) Önce tüm açıklamaları topla (model numarası -> açıklama)
    const descMap = {};
    let currentDescBlock = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Sayfa numarası tespiti (örn: "34" tek başına satırda)
        if (/^\d{1,3}$/.test(line) && parseInt(line) < 800) {
            // Bir önceki blok açıklama bloğuydu, şimdi model numaralarıyla eşleştir
            // Bu basitleştirilmiş bir yaklaşım - gerçekte daha kompleks
            continue;
        }
    }

    // 2) Ana döngü - her SKU için ürün oluştur
    let currentModel = '';
    let currentHeaders = [];
    let headerBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Model tespiti (374, 378, 430ASC gibi)
        if (line.match(/^\d{3,4}[A-Z\/]*$/) && !line.match(/\d{7}/)) {
            currentModel = line;
            headerBuffer = [];

            // Yukarı bakarak header'ları topla
            for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                const prevLine = lines[j].trim();
                if (prevLine === '*' || prevLine === '|' || prevLine === '#' || prevLine === '##') continue;
                if (prevLine.match(/^(L|L1|L2|Ø|A|H|d|S|R|max|mm|\")$/)) {
                    headerBuffer.unshift(prevLine);
                } else if (prevLine.match(/^\d{3,4}[A-Z\/]*$/)) {
                    break; // Önceki modele ulaştık
                }
            }

            // Header'ları grupla (L mm Ø max " Ø max mm -> L(mm), Ømax("), Ømax(mm))
            currentHeaders = [];
            let tempHeader = '';
            for (const h of headerBuffer) {
                if (h === 'mm' || h === '"') {
                    if (tempHeader) {
                        currentHeaders.push(tempHeader + '(' + h + ')');
                        tempHeader = '';
                    }
                } else if (h === 'max') {
                    tempHeader += 'max';
                } else {
                    if (tempHeader) currentHeaders.push(tempHeader);
                    tempHeader = h;
                }
            }
            if (tempHeader) currentHeaders.push(tempHeader);
            continue;
        }

        // SKU satırı tespiti
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch && currentModel) {
            const sku = skuMatch[0];
            const beforeSku = line.split(sku)[0].trim();

            // Değerleri ayır (örn: "2501/2" gas211" -> ["250", "1/2\" gas", "21", "1"])
            // Bu karmaşık çünkü değerler bitişik
            const rawValues = beforeSku.split(/\s+/).filter(v => v.length > 0);

            // Model açıklamasını bul (basit yaklaşım: sabit sözlükten)
            let modelDesc = '';
            // PDF'ten direkt çekmek zor, bu yüzden model numarasına göre tahmin
            if (currentModel.startsWith('37') || currentModel.startsWith('36')) {
                modelDesc = 'Boru Anahtarı';
            } else if (currentModel.startsWith('43')) {
                modelDesc = 'El Kılavuzu';
            }

            // Ölçü metnini oluştur
            let specsText = '';
            for (let j = 0; j < Math.min(currentHeaders.length, rawValues.length); j++) {
                const h = currentHeaders[j];
                const trH = HEADER_TR[h] || h;
                specsText += `${trH}: ${rawValues[j]}, `;
            }
            specsText = specsText.replace(/, $/, '');

            // Görsel bul
            let imageUrl = `/gorseller/beta/${currentModel}.png`;
            if (imageMap[currentModel.toLowerCase()]) {
                imageUrl = `/gorsellers/beta/${imageMap[currentModel.toLowerCase()]}`;
            }

            products.push({
                "StokKodu": sku,
                "UrunAdi": `Beta ${currentModel} ${modelDesc}`.trim(),
                "Marka": "Beta",
                "Fiyat": priceMap[sku] || 0,
                "IndirimliFiyat": "",
                "Stok": 50,
                "Kategori": "Hırdavat ve El Aletleri",
                "AltKategori": "Beta Profesyonel",
                "Aciklama": `Beta ${currentModel} ${modelDesc}. Ölçüler: ${specsText}. Profesyonel kullanım için üretilmiştir.`.trim(),
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

console.log(`💰 ${Object.keys(priceMap).length} fiyat`);
console.log(`🖼️ ${Object.keys(imageMap).length} görsel`);

const products = parseCatalog(catalogText, priceMap, imageMap);

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
XLSX.writeFile(wb, OUTPUT_PATH);

console.log(`✅ ${products.length} ürün`);
console.log(`📁 ${OUTPUT_PATH}`);
