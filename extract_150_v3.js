const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const PRICE_LIST_PDF = 'C:/Users/pc/Desktop/PriceList_2025_GBP.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// SKU'dan Türkçe ürün ismi ve kategori belirle
const skuToProduct = {
    '366': { name: 'Hafif Tip Boru Anahtarı', category: 'Boru Anahtarları' },
    '378': { name: 'İsveç Tipi Boru Anahtarı 90° Düz Ağız', category: 'Boru Anahtarları' },
    '374': { name: 'İsveç Tipi Boru Anahtarı 45° İnce Ağız', category: 'Boru Anahtarları' },
    '384': { name: 'Zincirli Boru Anahtarı', category: 'Boru Anahtarları' },
    '384RC': { name: 'Model 384 için Yedek Zincir', category: 'Yedek Parçalar' },
    '386A': { name: 'Ağır Hizmet Çift Yönlü Zincirli Boru Anahtarı', category: 'Boru Anahtarları' },
    '96BP': { name: 'Allen Anahtar - Bilyalı Uç', category: 'Allen Anahtarlar' },
    '96BPA': { name: 'Allen Anahtar Takımı Bilyalı', category: 'Allen Anahtarlar' },
    '96T': { name: 'T Saplı Allen Anahtar', category: 'Allen Anahtarlar' },
    '96N': { name: 'Allen Anahtar Seti', category: 'Allen Anahtarlar' },
    '97TX': { name: 'Torx Anahtar Seti', category: 'Torx Anahtarlar' },
    '97BTX': { name: 'Torx Anahtar Bilyalı Uç', category: 'Torx Anahtarlar' },
    '42': { name: 'Kombine Anahtar', category: 'Kombine Anahtarlar' },
    '42AS': { name: 'Kombine Anahtar Seti', category: 'Kombine Anahtarlar' },
    '55': { name: 'Çatal Anahtar', category: 'Çatal Anahtarlar' },
    '55AS': { name: 'Çatal Anahtar Seti', category: 'Çatal Anahtarlar' },
    '80': { name: 'Yıldız Anahtar', category: 'Yıldız Anahtarlar' },
    '90': { name: 'Ayarlı Anahtar', category: 'Ayarlı Anahtarlar' },
    '91': { name: 'Ayarlı Anahtar Ölçekli', category: 'Ayarlı Anahtarlar' },
    '92': { name: 'Ayarlı Anahtar Geniş Ağız', category: 'Ayarlı Anahtarlar' },
    '1001': { name: 'Tornavida Düz Uç', category: 'Tornavidalar' },
    '1002': { name: 'Tornavida Yıldız Uç (Phillips)', category: 'Tornavidalar' },
    '1008': { name: 'Tornavida Torx', category: 'Tornavidalar' },
    '1032': { name: 'Pense Kombinasyon', category: 'Penseler' },
    '1034': { name: 'Pense Uzun Burun', category: 'Penseler' },
    '1036': { name: 'Yan Keski', category: 'Penseler' },
    '1044N': { name: 'Su Pompası Pense', category: 'Penseler' },
    '1050': { name: 'Karga Burun Pense', category: 'Penseler' },
    '1051': { name: 'Mengene Pense', category: 'Penseler' },
    '1082': { name: 'Halka Pense', category: 'Penseler' },
    '1084': { name: 'İç Halka Pense', category: 'Penseler' },
    '1088': { name: 'Dış Halka Pense', category: 'Penseler' },
    '1100BA': { name: 'Lokma Ucu', category: 'Lokma Takımları' },
    '1101': { name: 'Lokma Anahtar', category: 'Lokma Takımları' },
    '1102': { name: 'Uzun Lokma', category: 'Lokma Takımları' },
    '1128': { name: 'Cırcır', category: 'Cırcır ve Aksesuarlar' },
    '1150': { name: 'Lokma Takımı', category: 'Lokma Takımları' },
    '1370': { name: 'Çekiç Mühendis', category: 'Çekiçler' },
    '1375': { name: 'Çekiç Plastik', category: 'Çekiçler' },
    '1377': { name: 'Çekiç Lastik', category: 'Çekiçler' },
    '1380': { name: 'Çekiç Geri Tepmesiz', category: 'Çekiçler' },
    '1390': { name: 'Çekiç Balyoz', category: 'Çekiçler' },
    '1428': { name: 'Keski', category: 'Keskiler ve Zımbalar' },
    '1429': { name: 'Zımba', category: 'Keskiler ve Zımbalar' },
    '1600': { name: 'Tork Anahtarı', category: 'Tork Anahtarları' },
    '1650': { name: 'Dijital Kumpas', category: 'Ölçü Aletleri' },
    '1682': { name: 'Şerit Metre', category: 'Ölçü Aletleri' },
    '1688': { name: 'Su Terazisi', category: 'Ölçü Aletleri' },
    '1700N': { name: 'Havşe Freze', category: 'Kesici Aletler' },
    '1710': { name: 'Eğe Seti', category: 'Eğeler' },
    '1717': { name: 'Maket Bıçağı', category: 'Kesici Aletler' },
    '1718': { name: 'Maket Bıçağı Yedek Uç', category: 'Yedek Parçalar' },
    '1719BM': { name: 'Takım Çantası', category: 'Takım Çantaları' },
    '1750': { name: 'Menteşe Sıkma Aparatı', category: 'Özel Aletler' },
    '1758': { name: 'Fren Disk Kaliper', category: 'Oto Aletleri' }
};

// Görselleri bul
function findImages(sku) {
    const images = [];
    const cleanSku = sku.replace(/[^a-zA-Z0-9_\-]/g, '');

    if (fs.existsSync(IMAGES_DIR)) {
        const dirs = fs.readdirSync(IMAGES_DIR);
        for (const dir of dirs) {
            const cleanDir = dir.replace(/[^a-zA-Z0-9_\-]/g, '');
            // Tam eşleşme veya başlangıç eşleşmesi
            if (cleanDir === cleanSku || dir === sku || dir.startsWith(sku + '_') || dir.startsWith(sku + '-')) {
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
    }

    return images;
}

// Fiyatları yükle
async function loadPrices() {
    const priceMap = new Map();
    console.log('Fiyat listesi okunuyor...');

    try {
        const dataBuffer = fs.readFileSync(PRICE_LIST_PDF);
        const data = await pdfParse(dataBuffer, { max: 50 });
        const text = data.text;

        // Fiyat pattern'ini bul - çeşitli formatlar
        const patterns = [
            /(\d{9,12})\s+[\d\.,]+\s+([\d\.,]+)/g,
            /(\d{9,12}).*?([\d]+\.[\d]{2})/g
        ];

        for (const pattern of patterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const code = match[1];
                const price = parseFloat(match[2].replace(',', '.'));
                if (price > 0 && price < 10000) {
                    priceMap.set(code, price);
                }
            }
        }

        console.log(`${priceMap.size} fiyat bulundu.`);
    } catch (err) {
        console.error('Fiyat yükleme hatası:', err.message);
    }

    return priceMap;
}

// Ana fonksiyon
async function main() {
    console.log('Beta Ürün Çıkarma Başlatılıyor...');

    // Görsel klasörlerinden SKU listesi al
    const skuFolders = fs.readdirSync(IMAGES_DIR).slice(0, 500);
    console.log(`${skuFolders.length} SKU klasörü bulundu.`);

    // PDF'den metin çıkar
    console.log('GP_ENG_2025.pdf okunuyor...');
    const dataBuffer = fs.readFileSync(GP_ENG_PDF);
    const data = await pdfParse(dataBuffer, { max: 150 });
    const text = data.text;
    console.log(`PDF okundu: ${text.length} karakter.`);

    // Fiyatları yükle
    const prices = await loadPrices();

    // Ürünleri oluştur
    const products = [];
    const processedSkus = new Set();

    console.log('Ürünler oluşturuluyor...');

    for (const skuFolder of skuFolders) {
        if (products.length >= 150) break;

        // Geçersiz klasör isimlerini atla
        if (skuFolder.includes('E+') || skuFolder.startsWith('0,') || skuFolder.startsWith('1,') || skuFolder.startsWith('2,')) {
            continue;
        }

        const sku = skuFolder.split(' ')[0].split('_')[0].split('-')[0];
        if (processedSkus.has(sku)) continue;
        processedSkus.add(sku);

        // Görselleri bul
        const images = findImages(skuFolder);
        if (images.length === 0) continue;

        // Ürün bilgilerini belirle
        let productInfo = skuToProduct[sku];
        if (!productInfo) {
            // SKU'nun ilk karakterlerine göre kategori tahmin et
            if (sku.match(/^9[0-9]/)) {
                productInfo = { name: 'Anahtar', category: 'Anahtarlar' };
            } else if (sku.match(/^10[0-9]{2}/)) {
                productInfo = { name: 'Pense/Tornavida', category: 'Penseler ve Tornavidalar' };
            } else if (sku.match(/^11[0-9]{2}/)) {
                productInfo = { name: 'Lokma', category: 'Lokma Takımları' };
            } else if (sku.match(/^12[0-9]{2}/)) {
                productInfo = { name: 'Uç', category: 'Uçlar ve Aksesuarlar' };
            } else if (sku.match(/^13[0-9]{2}/)) {
                productInfo = { name: 'Çekiç/Keski', category: 'Çekiçler ve Keskiler' };
            } else if (sku.match(/^14[0-9]{2}/)) {
                productInfo = { name: 'Özel Alet', category: 'Özel Aletler' };
            } else if (sku.match(/^15[0-9]{2}/)) {
                productInfo = { name: 'Hidrolik Alet', category: 'Hidrolik Aletler' };
            } else if (sku.match(/^16[0-9]{2}/)) {
                productInfo = { name: 'Ölçü Aleti', category: 'Ölçü Aletleri' };
            } else if (sku.match(/^17[0-9]{2}/)) {
                productInfo = { name: 'Kesici Alet', category: 'Kesici Aletler' };
            } else {
                productInfo = { name: 'El Aleti', category: 'El Aletleri' };
            }
        }

        // Ürün kodu oluştur (9 haneli)
        const articleCode = '000' + sku.replace(/[^0-9]/g, '').padStart(6, '0');

        // Fiyatı bul
        const price = prices.get(articleCode) || 0;

        // Ürün oluştur
        products.push({
            StokKodu: articleCode,
            UrunAdi: `Beta ${sku} ${productInfo.name}`,
            Marka: 'Beta Tools',
            Fiyat: price,
            IndirimliFiyat: '',
            Stok: 100,
            Kategori: 'Hırdavat ve El Aletleri',
            AltKategori: productInfo.category,
            Aciklama: `Beta ${sku} - ${productInfo.name}\n\nProfesyonel el aleti, yüksek kalite İtalyan üretimi.\n\nGörsel: ${images.join(', ')}`,
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

    console.log(`\n${products.length} ürün oluşturuldu.`);

    // İlk 10 ürünü göster
    console.log('\nİlk 10 ürün:');
    products.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi}`);
    });

    // Excel'e yaz
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);

    console.log(`\nExcel dosyası oluşturuldu: ${OUTPUT_FILE}`);
}

main().catch(console.error);
