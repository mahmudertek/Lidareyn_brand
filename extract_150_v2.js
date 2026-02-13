const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// Türkçe ürün isimleri sözlüğü
const productTranslations = {
    'pipe wrenches': 'Boru Anahtarı',
    'light pattern': 'Hafif Tip',
    'swedish pattern': 'İsveç Tipi',
    'flat jaws': 'Düz Ağız',
    'slim jaws': 'İnce Ağız',
    'heavy duty': 'Ağır Hizmet',
    'reversible': 'Çift Yönlü',
    'chain': 'Zincirli',
    'spare chain': 'Yedek Zincir',
    'spare parts': 'Yedek Parça',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'measurement scale': 'Ölçekli',
    'combination pliers': 'Kombinasyon Pense',
    'long nose pliers': 'Uzun Burun Pense',
    'diagonal cutting nippers': 'Yan Keski',
    'hexagon key wrenches': 'Allen Anahtar',
    'ball head': 'Bilyalı Uç',
    'offset': 'Ofset',
    'socket set': 'Lokma Takımı',
    'ratchet': 'Cırcır',
    'extension bar': 'Uzatma Çubuğu',
    'screwdrivers': 'Tornavida',
    'slotted head': 'Düz Uç',
    'phillips head': 'Yıldız Uç',
    'torx head': 'Torx Uç',
    'open end wrenches': 'Açık Ağız Anahtar',
    'ring wrenches': 'Yıldız Anahtar',
    'combination wrenches': 'Kombine Anahtar',
    'hammer': 'Çekiç',
    'ball peen': 'Mühendis Çekici',
    'dead blow': 'Geri Tepmesiz',
    'torque wrench': 'Tork Anahtarı',
    'impact wrench': 'Darbe Anahtarı',
    'angle finder': 'Açı Ölçer',
    'measuring tape': 'Şerit Metre',
    'folding rule': 'Katlanır Metre',
    'spirit level': 'Su Terazisi',
    'vernier caliper': 'Kumpas',
    'micrometer': 'Mikrometre'
};

// Görselleri bul
function findImages(sku) {
    const images = [];

    if (fs.existsSync(IMAGES_DIR)) {
        const dirs = fs.readdirSync(IMAGES_DIR);
        for (const dir of dirs) {
            // SKU ile eşleşen klasörü bul
            if (dir === sku || dir.startsWith(sku) || dir.replace(/[^a-zA-Z0-9]/g, '') === sku.replace(/[^a-zA-Z0-9]/g, '')) {
                const dirPath = path.join(IMAGES_DIR, dir);
                if (fs.statSync(dirPath).isDirectory()) {
                    const files = fs.readdirSync(dirPath);
                    for (const file of files) {
                        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                            images.push(`${dir}/${file}`);
                        }
                    }
                }
                if (images.length > 0) break;
            }
        }
    }

    return images;
}

// Ana fonksiyon
async function main() {
    console.log('Başlatılıyor...');
    console.log('GP_ENG_2025.pdf okunuyor...');

    // PDF'den metin çıkar
    const dataBuffer = fs.readFileSync(GP_ENG_PDF);
    const data = await pdfParse(dataBuffer, { max: 100 }); // İlk 100 sayfa
    const text = data.text;

    console.log(`Toplam ${data.numpages} sayfa, ${text.length} karakter okundu.`);

    // Ürün kodlarını ve ölçüleri regex ile bul
    // Pattern: Ölçüler + boşluk + 9 haneli kod (0009XXXXX formatında)
    const productPattern = /(\d+[\.,]?\d*)\s*(\d{9,10})/g;

    const products = [];
    const seenCodes = new Set();
    let match;
    let currentContext = '';

    // Metni satırlara böl
    const lines = text.split('\n');
    let currentProductType = '';
    let currentMainSku = '';

    console.log('Ürünler analiz ediliyor...');

    for (let i = 0; i < lines.length && products.length < 150; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Ürün tipi/açıklama satırlarını bul
        if (line.match(/^[a-z]/i) && line.length > 15 && !line.match(/\d{5,}/)) {
            currentProductType = line;
        }

        // Ana SKU satırlarını bul (örn: 96BP, 96BPA, 366, 378)
        const skuMatch = line.match(/^(\d{2,4}[A-Z]{0,4}(?:\/[A-Z0-9]+)?)\s*$/);
        if (skuMatch) {
            currentMainSku = skuMatch[1];
        }

        // Ürün kodu içeren satırları bul (9-10 haneli kod)
        const codeMatches = line.matchAll(/(\d{9,10})/g);
        for (const cm of codeMatches) {
            const code = cm[1];

            // Kod zaten eklendi mi?
            if (seenCodes.has(code)) continue;
            seenCodes.add(code);

            // Satırdan ölçüleri çıkar
            const beforeCode = line.substring(0, cm.index);
            const measurements = beforeCode.match(/[\d,\.\/]+(?:\s*[xX×]\s*[\d,\.\/]+)?/g) || [];

            // SKU'yu koddan veya satırdan bul
            let sku = currentMainSku;
            if (!sku) {
                // Kodun ilk 4-5 karakterinden SKU türet
                sku = code.substring(3, 6);
            }

            // Görselleri bul
            const images = findImages(sku);

            // Ölçü açıklaması oluştur
            let measurementDesc = measurements.length > 0 ? `Ölçüler: ${measurements.join(', ')}` : '';

            // Ürün ismini oluştur
            let productName = `Beta ${sku}`;
            if (currentProductType) {
                // Türkçeye çevir
                let turkishName = currentProductType;
                for (const [eng, tr] of Object.entries(productTranslations)) {
                    turkishName = turkishName.replace(new RegExp(eng, 'gi'), tr);
                }
                productName += ` ${turkishName}`;
            }

            // Ebat bilgisi varsa ekle
            if (measurements.length > 0) {
                productName += ` - ${measurements[0]}`;
            }

            products.push({
                StokKodu: code,
                UrunAdi: productName.trim(),
                Marka: 'Beta Tools',
                Fiyat: 0, // Fiyat ayrıca eklenecek
                IndirimliFiyat: '',
                Stok: 100,
                Kategori: 'Hırdavat ve El Aletleri',
                AltKategori: 'El Aletleri',
                Aciklama: `${currentProductType}\n\n${measurementDesc}\n\nGörsel: ${images.join(', ')}`,
                Birim: 'Adet',
                GorselURL: images.length > 0 ? images[0] : '',
                Aktif: 'Evet',
                PopulerMi: 'Hayır',
                YeniMi: 'Hayır',
                OneCikan: 'Hayır',
                CokSatan: 'Hayır',
                MarkaVitrini: ''
            });
        }
    }

    console.log(`\nToplam ${products.length} ürün bulundu.`);

    if (products.length > 0) {
        console.log('\nİlk 10 ürün:');
        products.slice(0, 10).forEach((p, i) => {
            console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi.substring(0, 60)}`);
        });

        // Excel'e yaz
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(products);
        XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
        XLSX.writeFile(wb, OUTPUT_FILE);

        console.log(`\nExcel dosyası oluşturuldu: ${OUTPUT_FILE}`);
    } else {
        console.log('Hiç ürün bulunamadı.');
    }
}

main().catch(console.error);
