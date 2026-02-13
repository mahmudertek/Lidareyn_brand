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
const productNameTranslations = {
    'pipe wrenches, light pattern': 'Hafif Tip Boru Anahtarı',
    'pipe wrenches, Swedish pattern, 90° flat jaws': 'İsveç Tipi Boru Anahtarı, 90° Düz Ağız',
    'pipe wrenches, Swedish pattern, 45° slim jaws': 'İsveç Tipi Boru Anahtarı, 45° İnce Ağız',
    'spare chain for item 384': 'Model 384 için Yedek Zincir',
    'heavy duty reversible chain pipe wrenches': 'Ağır Hizmet Çift Yönlü Zincirli Boru Anahtarı',
    'complete spare parts kit for items 374 - 375 - 376 - 378': '374, 375, 376, 378 Modelleri için Komple Yedek Parça Kiti',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'adjustable wrenches with scale': 'Ölçekli Ayarlı Anahtar',
    'combination pliers': 'Kombinasyon Pense',
    'long nose pliers': 'Uzun Burun Pense',
    'diagonal cutting nippers': 'Yan Keski',
    'slip joint pliers': 'Kayan Mafsallı Pense',
    'locking pliers': 'Mengene Pense',
    'water pump pliers': 'Su Pompası Pense',
    'screwdrivers for slotted head screws': 'Düz Uçlu Tornavida',
    'screwdrivers for Phillips head screws': 'Phillips Uçlu Tornavida',
    'screwdrivers for Pozidriv head screws': 'Pozidriv Uçlu Tornavida',
    'screwdrivers for Torx head screws': 'Torx Uçlu Tornavida',
    'hex key wrenches': 'Allen Anahtar Seti',
    'ball end hex key wrenches': 'Toplu Uç Allen Anahtar',
    'socket set': 'Lokma Takımı',
    'ratchet': 'Cırcır',
    'extension bar': 'Uzatma Çubuğu',
    'spark plug socket': 'Buji Lokması',
    'universal joint': 'Üniversal Mafsal',
    'hammer': 'Çekiç',
    'ball pein hammer': 'Mühendis Çekici',
    'rubber mallet': 'Lastik Tokmak',
    'dead blow hammer': 'Geri Tepmesiz Çekiç',
    'pry bar': 'Levye',
    'chisel': 'Keski',
    'punch': 'Zımba',
    'file': 'Törpü',
    'measuring tape': 'Şerit Metre',
    'spirit level': 'Su Terazisi',
    'vernier caliper': 'Kumpas',
    'micrometer': 'Mikrometre',
    'tape measure': 'Çelik Şerit Metre',
    'folding rule': 'Katlanır Metre',
    'angle finder': 'Açı Ölçer',
    'knife': 'Maket Bıçağı',
    'utility knife': 'Çok Amaçlı Bıçak',
    'cable cutter': 'Kablo Kesici',
    'wire stripper': 'Kablo Soyucu',
    'crimping tool': 'Sıkma Pensesi',
    'rivet gun': 'Perçin Tabancası',
    'staple gun': 'Zımba Tabancası',
    'caulking gun': 'Silikon Tabancası',
    'grease gun': 'Gres Pompası',
    'oil can': 'Yağdanlık',
    'funnel': 'Huni',
    'drain pan': 'Yağ Toplama Kabı',
    'creeper': 'Yer Kızağı',
    'jack stand': 'Destek Sehpası',
    'hydraulic jack': 'Hidrolik Kriko',
    'torque wrench': 'Tork Anahtarı',
    'impact wrench': 'Pnömatik Somun Sökücü',
    'air compressor': 'Hava Kompresörü',
    'workbench': 'Çalışma Tezgahı',
    'tool trolley': 'Takım Arabası',
    'tool chest': 'Takım Sandığı',
    'safety glasses': 'Koruyucu Gözlük',
    'gloves': 'Eldiven',
    'ear protection': 'Kulak Koruyucu',
    'face shield': 'Yüz Siperliği',
    'respirator': 'Solunum Maskesi',
    'knee pads': 'Dizlik',
    'coverall': 'Tulum',
    'safety shoes': 'Güvenlik Ayakkabısı',
    'hard hat': 'Baret',
    'hi-vis vest': 'Reflektörlü Yelek'
};

// PDF'den metin çıkar
async function extractPDFText(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

// Görselleri bul
function findImages(sku) {
    const skuDir = path.join(IMAGES_DIR, sku);
    const images = [];

    if (fs.existsSync(skuDir)) {
        const files = fs.readdirSync(skuDir);
        files.forEach(file => {
            if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                images.push(path.join(skuDir, file));
            }
        });
    }

    return images;
}

// Fiyat listesinden fiyat bul
async function loadPrices() {
    const priceMap = new Map();
    try {
        const text = await extractPDFText(PRICE_LIST_PDF);
        // Fiyat formatını analiz et
        const lines = text.split('\n');
        let currentSku = '';

        for (const line of lines) {
            // SKU ve fiyat pattern'i bul
            const match = line.match(/(\d{9,})\s+.*?\s+(\d+[\.,]\d{2})/);
            if (match) {
                const sku = match[1];
                const price = parseFloat(match[2].replace(',', '.'));
                priceMap.set(sku, price);
            }
        }
    } catch (err) {
        console.log('Fiyat listesi yüklenemedi:', err.message);
    }
    return priceMap;
}

// Ana fonksiyon
async function main() {
    console.log('GP_ENG_2025.pdf okunuyor...');

    // PDF'den metin çıkar
    const text = await extractPDFText(GP_ENG_PDF);

    // Fiyatları yükle
    console.log('Fiyat listesi okunuyor...');
    const prices = await loadPrices();
    console.log('Toplam fiyat sayısı:', prices.size);

    // Ürün pattern'lerini bul
    const products = [];
    const lines = text.split('\n');

    let currentSku = '';
    let currentName = '';
    let currentDescription = '';
    let lineCount = 0;

    // PDF yapısını analiz et
    for (let i = 0; i < Math.min(lines.length, 5000); i++) {
        const line = lines[i].trim();

        // SKU pattern: sayıyla başlayan satırlar (366, 378, 374, etc.)
        const skuMatch = line.match(/^(\d{2,4}[A-Z]*[\/\-]?[A-Z0-9]*)\s*$/);
        if (skuMatch && line.length < 20) {
            currentSku = skuMatch[1];
            currentName = '';
            currentDescription = '';
            continue;
        }

        // Ürün detayları pattern
        const detailMatch = line.match(/^(\d{9,})\s+(.+)/);
        if (detailMatch && currentSku) {
            const fullSku = detailMatch[1];
            const rest = detailMatch[2];

            // Ölçüler ve fiyatı ayır
            const parts = rest.split(/\s+/);

            // Fiyatı al
            const price = prices.get(fullSku) || 0;

            // Görsel bul
            const images = findImages(currentSku);
            const imageUrl = images.length > 0 ? images[0] : '';

            products.push({
                StokKodu: fullSku,
                UrunAdi: `Beta ${currentSku} ${currentName || ''}`.trim(),
                Marka: 'Beta Tools',
                Fiyat: price,
                IndirimliFiyat: '',
                Stok: 100,
                Kategori: 'Hırdavat ve El Aletleri',
                AltKategori: 'El Aletleri',
                Aciklama: `${currentDescription}\n\nÖlçüler: ${parts.join(' ')}\n\nGörsel: ${imageUrl}`,
                Birim: 'Adet',
                GorselURL: imageUrl,
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

    console.log('Toplam ürün:', products.length);
    console.log('İlk 5 ürün:');
    products.slice(0, 5).forEach(p => console.log(p.StokKodu, p.UrunAdi));

    // Excel'e yaz
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);

    console.log('\nExcel dosyası oluşturuldu:', OUTPUT_FILE);
}

main().catch(console.error);
