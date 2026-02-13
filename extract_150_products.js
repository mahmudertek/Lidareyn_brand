const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// Türkçe ürün isimleri sözlüğü - daha kapsamlı
const productTranslations = {
    'pipe wrenches, light pattern': 'Hafif Tip Boru Anahtarı',
    'pipe wrenches, swedish pattern, 90° flat jaws': 'İsveç Tipi Boru Anahtarı, 90° Düz Ağız',
    'pipe wrenches, swedish pattern, 45° slim jaws': 'İsveç Tipi Boru Anahtarı, 45° İnce Ağız',
    'heavy duty reversible chain pipe wrenches': 'Ağır Hizmet Çift Yönlü Zincirli Boru Anahtarı',
    'spare chain for item 384': 'Model 384 için Yedek Zincir',
    'complete spare parts kit': 'Komple Yedek Parça Kiti',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'adjustable wrenches with measurement scale': 'Ölçekli Ayarlı Anahtar',
    'combination pliers': 'Kombinasyon Pense',
    'long nose pliers': 'Uzun Burun Pense',
    'diagonal cutting nippers': 'Yan Keski',
    'slip joint pliers': 'Müşir Pense',
    'locking pliers': 'Mengene Pense',
    'water pump pliers': 'Su Pompası Pense',
    'screwdrivers': 'Tornavida',
    'hex key wrenches': 'Allen Anahtar',
    'socket': 'Lokma',
    'ratchet': 'Cırcır',
    'extension bar': 'Uzatma Çubuğu',
    'hammer': 'Çekiç',
    'chisel': 'Keski',
    'punch': 'Zımba',
    'file': 'Törpü',
    'tape measure': 'Şerit Metre',
    'knife': 'Maket Bıçağı',
    'cable cutter': 'Kablo Kesici',
    'wire stripper': 'Kablo Soyucu',
    'torque wrench': 'Tork Anahtarı',
    'workbench': 'Çalışma Tezgahı',
    'tool trolley': 'Takım Arabası',
    'open end wrenches': 'Açık Ağız Anahtar',
    'ring wrenches': 'Yıldız Anahtar',
    'combination wrenches': 'Kombine Anahtar',
    'offset ring wrenches': 'Ofset Yıldız Anahtar'
};

// Ürün ismi çevir
function translateProductName(engName) {
    const lowerName = engName.toLowerCase().trim();
    for (const [eng, tr] of Object.entries(productTranslations)) {
        if (lowerName.includes(eng.toLowerCase())) {
            return tr;
        }
    }
    // Çeviri bulunamazsa orijinal ismi kullan
    return engName;
}

// Görselleri bul
function findImages(sku) {
    const images = [];
    const baseSku = sku.replace(/[^a-zA-Z0-9]/g, '');

    // SKU klasörünü kontrol et
    if (fs.existsSync(IMAGES_DIR)) {
        const dirs = fs.readdirSync(IMAGES_DIR);
        for (const dir of dirs) {
            // SKU ile eşleşen klasörü bul
            const cleanDir = dir.replace(/[^a-zA-Z0-9]/g, '');
            if (cleanDir === baseSku || dir === sku || dir.includes(sku)) {
                const dirPath = path.join(IMAGES_DIR, dir);
                if (fs.statSync(dirPath).isDirectory()) {
                    const files = fs.readdirSync(dirPath);
                    for (const file of files) {
                        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                            images.push(path.join(dir, file).replace(/\\/g, '/'));
                        }
                    }
                }
                break;
            }
        }
    }

    return images;
}

// Fiyat listesinden fiyatları yükle
async function loadPrices() {
    const priceMap = new Map();
    console.log('Fiyat listesi yükleniyor...');

    try {
        const dataBuffer = fs.readFileSync(PRICE_LIST_PDF);
        const data = await pdfParse(dataBuffer, { max: 100 }); // İlk 100 sayfa
        const text = data.text;

        // Fiyat pattern'lerini bul
        // Örnek: 003660225 ... 15.80
        const lines = text.split('\n');
        for (const line of lines) {
            // 9+ haneli kod ve fiyat
            const matches = line.matchAll(/(\d{9,13})\s+.*?(\d+[\.,]\d{2})\s*$/g);
            for (const match of matches) {
                const code = match[1];
                const price = parseFloat(match[2].replace(',', '.'));
                if (price > 0) {
                    priceMap.set(code, price);
                }
            }
        }

        console.log(`Toplam ${priceMap.size} fiyat yüklendi.`);
    } catch (err) {
        console.error('Fiyat yükleme hatası:', err.message);
    }

    return priceMap;
}

// Ana fonksiyon
async function main() {
    console.log('Başlatılıyor...');
    console.log('GP_ENG_2025.pdf okunuyor...');

    // PDF'den metin çıkar - ilk 50 sayfa
    const dataBuffer = fs.readFileSync(GP_ENG_PDF);
    const data = await pdfParse(dataBuffer, { max: 50 });
    const text = data.text;

    console.log(`Toplam ${data.numpages} sayfa okundu.`);

    // Fiyatları yükle
    const prices = await loadPrices();

    // Ürünleri bul
    const products = [];
    const lines = text.split('\n');

    let currentMainSku = '';      // Ana SKU (366, 378, etc.)
    let currentProductName = '';  // Ürün açıklaması
    let currentMeasurementHeaders = []; // Ölçü başlıkları (L1, L2, g, etc.)

    console.log('Ürünler analiz ediliyor...');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Ana SKU pattern: Tek satırda sadece 2-5 karakterlik kod (366, 378, 374, 384RC, 386A)
        const mainSkuMatch = line.match(/^(\d{2,4}[A-Z]{0,3}[\/\-]?\.{0,3})$/);
        if (mainSkuMatch && line.length <= 10) {
            currentMainSku = line.replace('...', '').trim();
            currentProductName = '';
            currentMeasurementHeaders = [];

            // Sonraki satırlarda ürün ismini ara
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.match(/^\d/) && nextLine.length > 10) {
                    currentProductName = nextLine;
                    break;
                }
            }
            continue;
        }

        // Ölçü başlıkları pattern (L, L1, L2, A, B, g, kg, ø, etc.)
        if (line.match(/^[L\dABCDEFgkøØmmnN\s"'°½¼¾\-\/]+$/) && line.length < 50) {
            const headers = line.split(/\s+/).filter(h => h.length > 0);
            if (headers.length >= 2) {
                currentMeasurementHeaders = headers;
            }
        }

        // Ürün satırı pattern: 9-13 haneli kod ile başlayan satırlar
        const productMatch = line.match(/^(\d{9,13})\s+(.+)/);
        if (productMatch && currentMainSku) {
            const articleCode = productMatch[1];
            const restOfLine = productMatch[2];

            // Ölçüleri çıkar
            const parts = restOfLine.split(/\s+/);

            // Ölçüleri açıklama formatına dönüştür
            let measurementDesc = '';
            if (currentMeasurementHeaders.length > 0 && parts.length > 0) {
                const measurements = [];
                for (let m = 0; m < Math.min(currentMeasurementHeaders.length, parts.length); m++) {
                    const value = parts[m];
                    if (value && !isNaN(value.replace(',', '.').replace('"', '').replace("'", '').replace('/', '').replace('-', ''))) {
                        measurements.push(`${currentMeasurementHeaders[m]}: ${value}`);
                    }
                }
                if (measurements.length > 0) {
                    measurementDesc = measurements.join(', ');
                }
            }

            // Görselleri bul
            const images = findImages(currentMainSku);
            const imageUrls = images.join(', ');

            // Fiyatı bul
            const price = prices.get(articleCode) || 0;

            // Ürün ismini Türkçeye çevir
            const turkishName = translateProductName(currentProductName);

            // Size/variant bilgisini bul
            const sizeInfo = parts[0] || '';

            products.push({
                StokKodu: articleCode,
                UrunAdi: `Beta ${currentMainSku} ${turkishName}${sizeInfo ? ' - ' + sizeInfo : ''}`.trim(),
                Marka: 'Beta Tools',
                Fiyat: price,
                IndirimliFiyat: '',
                Stok: 100,
                Kategori: 'Hırdavat ve El Aletleri',
                AltKategori: 'Boru Anahtarları',
                Aciklama: `${turkishName}\n\nÖlçüler: ${measurementDesc}\n\nGörsel: ${imageUrls}`,
                Birim: 'Adet',
                GorselURL: imageUrls,
                Aktif: 'Evet',
                PopulerMi: 'Hayır',
                YeniMi: 'Hayır',
                OneCikan: 'Hayır',
                CokSatan: 'Hayır',
                MarkaVitrini: ''
            });

            if (products.length >= 150) {
                console.log('150 ürüne ulaşıldı!');
                break;
            }
        }
    }

    console.log(`\nToplam ${products.length} ürün bulundu.`);

    if (products.length > 0) {
        console.log('\nİlk 5 ürün:');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi}`);
        });

        // Excel'e yaz
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(products);
        XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
        XLSX.writeFile(wb, OUTPUT_FILE);

        console.log(`\nExcel dosyası oluşturuldu: ${OUTPUT_FILE}`);
    } else {
        console.log('Hiç ürün bulunamadı. PDF yapısı farklı olabilir.');

        // Debug: İlk 100 satırı göster
        console.log('\nPDF yapısı analizi (ilk 100 satır):');
        lines.slice(0, 100).forEach((line, i) => {
            if (line.trim()) {
                console.log(`${i}: ${line.substring(0, 100)}`);
            }
        });
    }
}

main().catch(console.error);
