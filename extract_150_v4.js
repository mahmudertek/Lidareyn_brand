const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// Türkçe çeviriler
const translations = {
    'pipe wrenches, light pattern': 'Hafif Tip Boru Anahtarı',
    'pipe wrenches, stillson pattern': 'Stillson Tip Boru Anahtarı',
    'pipe wrenches, swedish pattern, 90° flat jaws': 'İsveç Tipi Boru Anahtarı 90° Düz Ağız',
    'pipe wrenches, swedish pattern, 45° slim jaws': 'İsveç Tipi Boru Anahtarı 45° İnce Ağız',
    'heavy duty reversible chain pipe wrenches': 'Ağır Hizmet Çift Yönlü Zincirli Boru Anahtarı',
    'spare chain for item 384': 'Model 384 için Yedek Zincir',
    'chain pipe wrenches': 'Zincirli Boru Anahtarı',
    'adjustable wrenches': 'Ayarlı Anahtar',
    'adjustable wrenches with measurement scale': 'Ölçekli Ayarlı Anahtar',
    'combination pliers': 'Kombinasyon Pense',
    'long nose pliers': 'Uzun Burun Pense',
    'diagonal cutting nippers': 'Yan Keski',
    'water pump pliers': 'Su Pompası Pense',
    'locking pliers': 'Mengene Pense (Grip)',
    'screwdrivers for slotted head screws': 'Düz Uçlu Tornavida',
    'screwdrivers for phillips head screws': 'Yıldız Uçlu Tornavida (Phillips)',
    'screwdrivers for pozidriv head screws': 'Pozidriv Uçlu Tornavida',
    'screwdrivers for torx head screws': 'Torx Uçlu Tornavida',
    'insulated screwdrivers': 'İzoleli Tornavida',
    'hexagon key wrenches': 'Allen Anahtar (Altigen)',
    'ball head hexagon key wrenches': 'Bilyalı Uç Allen Anahtar',
    'offset hexagon key wrenches': 'Ofset Allen Anahtar',
    't-handle hexagon key wrenches': 'T Saplı Allen Anahtar',
    'torx key wrenches': 'Torx Anahtar',
    'socket wrenches': 'Lokma Anahtar',
    'combination wrenches': 'Kombine Anahtar',
    'open end wrenches': 'Çatal Anahtar (Açık Ağız)',
    'ring wrenches': 'Yıldız Anahtar (Kapalı Ağız)',
    'offset ring wrenches': 'Ofset Yıldız Anahtar',
    'ratchet ring wrenches': 'Cırcırlı Yıldız Anahtar',
    'ratchet': 'Cırcır',
    'extension bar': 'Uzatma Çubuğu',
    'universal joint': 'Üniversal Mafsal',
    'spark plug socket': 'Buji Lokması',
    'impact socket': 'Darbe Lokması',
    'ball pein hammers': 'Mühendis Çekici',
    'soft face hammers': 'Yumuşak Yüzlü Çekiç',
    'rubber hammers': 'Lastik Çekiç',
    'dead blow hammers': 'Geri Tepmesiz Çekiç',
    'club hammers': 'Balyoz',
    'cold chisels': 'Soğuk Keski',
    'centre punches': 'Merkez Zımbası',
    'pin punches': 'Pim Zımbası',
    'files': 'Eğe',
    'measuring tape': 'Şerit Metre',
    'folding rule': 'Katlanır Metre',
    'spirit level': 'Su Terazisi',
    'vernier caliper': 'Kumpas',
    'micrometer': 'Mikrometre',
    'torque wrench': 'Tork Anahtarı',
    'utility knife': 'Maket Bıçağı',
    'cable cutter': 'Kablo Kesici',
    'wire stripper': 'Kablo Soyucu',
    'crimping pliers': 'Sıkma Pensesi',
    'riveting tool': 'Perçin Tabancası',
    'tool trolley': 'Takım Arabası',
    'tool chest': 'Takım Sandığı',
    'tool bag': 'Takım Çantası'
};

// SKU'dan Türkçe isim ve açıklama bul
function getProductInfo(sku, context = '') {
    // Önce bilinen SKU'ları kontrol et
    const skuMappings = {
        '366': { name: 'Hafif Tip Boru Anahtarı', cat: 'Boru Anahtarları', desc: 'DIN 3113 standardına uygun, hafif ve kullanışlı boru anahtarı' },
        '378': { name: 'İsveç Tipi Boru Anahtarı 90° Düz Ağız', cat: 'Boru Anahtarları', desc: 'DIN 5234 standardına uygun 90° düz ağızlı İsveç tipi boru anahtarı' },
        '374': { name: 'İsveç Tipi Boru Anahtarı 45° İnce Ağız', cat: 'Boru Anahtarları', desc: '45° açılı ince ağızlı boru anahtarı, dar alanlarda kullanım için ideal' },
        '384': { name: 'Zincirli Boru Anahtarı', cat: 'Boru Anahtarları', desc: 'Büyük çaplı borular için zincirli boru anahtarı' },
        '384RC': { name: 'Model 384 Yedek Zincir', cat: 'Yedek Parçalar', desc: 'Model 384 zincirli boru anahtarı için yedek zincir' },
        '386A': { name: 'Ağır Hizmet Zincirli Boru Anahtarı', cat: 'Boru Anahtarları', desc: 'Ağır hizmet tipi çift yönlü zincirli boru anahtarı' },
        '42': { name: 'Kombine Anahtar', cat: 'Kombine Anahtarlar', desc: 'Bir ucu açık, bir ucu yıldız kombine anahtar' },
        '55': { name: 'Çatal Anahtar (Açık Ağız)', cat: 'Çatal Anahtarlar', desc: 'Çift açık ağızlı çatal anahtar' },
        '80': { name: 'Yıldız Anahtar', cat: 'Yıldız Anahtarlar', desc: 'Çift kapalı ağızlı ofset yıldız anahtar' },
        '90': { name: 'Ayarlı Anahtar', cat: 'Ayarlı Anahtarlar', desc: 'Krom vanadyum çelik ayarlı anahtar' },
        '91': { name: 'Ölçekli Ayarlı Anahtar', cat: 'Ayarlı Anahtarlar', desc: 'Ölçekli gövde ayarlı anahtar' },
        '92': { name: 'Geniş Ağız Ayarlı Anahtar', cat: 'Ayarlı Anahtarlar', desc: 'Ekstra geniş açılma kapasiteli ayarlı anahtar' },
        '96BP': { name: 'Bilyalı Uç Allen Anahtar', cat: 'Allen Anahtarlar', desc: 'Bilyalı uç uzun kol allen anahtar, 25° açıyla çalışabilir' },
        '96N': { name: 'Allen Anahtar', cat: 'Allen Anahtarlar', desc: 'Standart altıgen allen anahtar' },
        '96T': { name: 'T Saplı Allen Anahtar', cat: 'Allen Anahtarlar', desc: 'Ergonomik T saplı allen anahtar' },
        '97TX': { name: 'Torx Anahtar', cat: 'Torx Anahtarlar', desc: 'Torx yıldız uçlu anahtar' },
        '97BTX': { name: 'Bilyalı Uç Torx Anahtar', cat: 'Torx Anahtarlar', desc: 'Bilyalı uç torx anahtar, açılı çalışma imkanı' },
        '1032': { name: 'Kombinasyon Pense', cat: 'Penseler', desc: 'Krom vanadyum çelik profesyonel kombinasyon pense' },
        '1034': { name: 'Uzun Burun Pense', cat: 'Penseler', desc: 'Düz uzun burun pense, elektronik işleri için ideal' },
        '1036': { name: 'Yan Keski', cat: 'Penseler', desc: 'Yüksek kalite çelik yan keski' },
        '1044N': { name: 'Su Pompası Pense', cat: 'Penseler', desc: 'Çoklu ayar pozisyonlu su pompası pense' },
        '1050': { name: 'Karga Burun Pense', cat: 'Penseler', desc: 'Karga burun pense, 90° açılı burun' },
        '1051': { name: 'Mengene Pense (Grip)', cat: 'Penseler', desc: 'Kilitlenebilir mengene pense, ayarlanabilir çene açıklığı' },
        '1082': { name: 'Segman Pense (Dış)', cat: 'Penseler', desc: 'Dış segman halkalar için pense' },
        '1084': { name: 'Segman Pense (İç)', cat: 'Penseler', desc: 'İç segman halkalar için pense' },
        '1128': { name: 'Cırcır (1/2")', cat: 'Cırcır ve Lokma', desc: '1/2" kare saplı profesyonel cırcır' },
        '1150': { name: '1/2" Lokma Takımı', cat: 'Lokma Takımları', desc: '1/2" lokma takımı, çantada' },
        '1370': { name: 'Mühendis Çekiç', cat: 'Çekiçler', desc: 'Krom vanadyum çelik mühendis (bilyalı) çekiç' },
        '1377': { name: 'Lastik Çekiç', cat: 'Çekiçler', desc: 'Siyah lastik başlıklı çekiç' },
        '1380': { name: 'Geri Tepmesiz Çekiç', cat: 'Çekiçler', desc: 'İç dolgu sayesinde geri tepmesiz çekiç' },
        '1600': { name: 'Tork Anahtarı', cat: 'Tork Anahtarları', desc: 'Mekanik göstergeli tork anahtarı' },
        '1682': { name: 'Şerit Metre', cat: 'Ölçü Aletleri', desc: 'Profesyonel şerit metre, metrik/inç' },
        '1717': { name: 'Maket Bıçağı', cat: 'Kesici Aletler', desc: 'Autodock bıçak değişimli maket bıçağı' }
    };

    // Exact match
    if (skuMappings[sku]) {
        return skuMappings[sku];
    }

    // Prefix match
    for (const [key, val] of Object.entries(skuMappings)) {
        if (sku.startsWith(key)) {
            return { ...val, name: val.name + ` (${sku})` };
        }
    }

    // Default
    return { name: 'Beta El Aleti', cat: 'El Aletleri', desc: 'Profesyonel Beta marka el aleti' };
}

// Görselleri bul
function findImages(sku) {
    const images = [];

    if (!fs.existsSync(IMAGES_DIR)) return images;

    const dirs = fs.readdirSync(IMAGES_DIR);
    for (const dir of dirs) {
        // SKU eşleşmesi kontrol et
        const dirClean = dir.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const skuClean = sku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        if (dir === sku || dirClean === skuClean || dir.startsWith(sku + '_') || dir.startsWith(sku + '-') || dir.startsWith(sku + ' ')) {
            const dirPath = path.join(IMAGES_DIR, dir);
            if (fs.statSync(dirPath).isDirectory()) {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                        images.push(`Beta_Katalog_SKU_Gorseller/${dir}/${file}`);
                    }
                }
            }
            if (images.length > 0) break;
        }
    }

    return images;
}

// Ana fonksiyon
async function main() {
    console.log('Beta Ürün Çıkarma - v4');
    console.log('========================\n');

    // Görsel klasörlerinden SKU listesi al
    const allSkuFolders = fs.readdirSync(IMAGES_DIR);
    console.log(`Toplam ${allSkuFolders.length} SKU klasörü bulundu.`);

    // Geçerli SKU'ları filtrele
    const validSkuFolders = allSkuFolders.filter(f => {
        // Geçersiz isimleri atla
        if (f.includes('E+') || f.match(/^[\d,\.]+MT$/)) return false;
        return true;
    }).slice(0, 200); // İlk 200 SKU

    console.log(`${validSkuFolders.length} geçerli SKU seçildi.`);

    // PDF'den veri çıkar (opsiyonel - ölçü bilgileri için)
    console.log('\nGP_ENG_2025.pdf okunuyor...');
    const dataBuffer = fs.readFileSync(GP_ENG_PDF);
    const pdfData = await pdfParse(dataBuffer, { max: 100 });
    console.log(`PDF okundu: ${pdfData.text.length} karakter.`);

    // Ürünleri oluştur
    const products = [];
    const processedSkus = new Set();

    console.log('\nÜrünler oluşturuluyor...');

    for (const folder of validSkuFolders) {
        if (products.length >= 150) break;

        // SKU'yu çıkar
        const sku = folder.split(' ')[0].split('_')[0];

        // Zaten işlendiyse atla
        if (processedSkus.has(sku)) continue;
        processedSkus.add(sku);

        // Görselleri bul
        const images = findImages(folder);
        if (images.length === 0) continue;

        // Ürün bilgilerini al
        const info = getProductInfo(sku);

        // Ürün kodu oluştur
        const baseCode = sku.replace(/[^0-9]/g, '');
        const articleCode = '000' + baseCode.padStart(6, '0');

        // Variant bilgisi (klasör isminden)
        let variant = '';
        if (folder.includes('_')) {
            variant = folder.split('_').slice(1).join(' ');
        }

        // Ölçü bilgisi (basit tahmin)
        let measurements = '';
        if (sku.match(/^\d+$/)) {
            // Sayısal SKU'lar genelde ölçü içerir
            measurements = `Model: ${sku}`;
        }

        products.push({
            StokKodu: articleCode,
            UrunAdi: `Beta ${sku} ${info.name}${variant ? ' ' + variant : ''}`.trim(),
            Marka: 'Beta Tools',
            Fiyat: 0,
            IndirimliFiyat: '',
            Stok: 100,
            Kategori: 'Hırdavat ve El Aletleri',
            AltKategori: info.cat,
            Aciklama: `${info.desc}\n\n${measurements ? 'Ölçüler: ' + measurements + '\n\n' : ''}Görsel: ${images.join(', ')}`,
            Birim: 'Adet',
            GorselURL: images[0] || '',
            Aktif: 'Evet',
            PopulerMi: 'Hayır',
            YeniMi: 'Hayır',
            OneCikan: 'Hayır',
            CokSatan: 'Hayır',
            MarkaVitrini: ''
        });
    }

    console.log(`\n${products.length} ürün oluşturuldu.`);

    // İlk 15 ürünü göster
    console.log('\nİlk 15 ürün:');
    products.slice(0, 15).forEach((p, i) => {
        console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi}`);
    });

    // Excel'e yaz
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);

    console.log(`\n✓ Excel dosyası oluşturuldu: ${OUTPUT_FILE}`);
}

main().catch(console.error);
