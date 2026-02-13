const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const GP_ENG_PDF = 'C:/Users/pc/Desktop/GP_ENG_2025.pdf';
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// SKU bazlı ürün bilgileri - Türkçe isim ve alt kategori
const skuDatabase = {
    // Boru Anahtarları
    '366': { name: 'Hafif Tip Boru Anahtarı', subcat: 'Boru Anahtarları', description: 'DIN 3113 standardına uygun hafif tip boru anahtarı. Krom vanadyum çelik gövde, siyah fosfat kaplama.' },
    '365R': { name: 'Stillson Tip Boru Anahtarı', subcat: 'Boru Anahtarları', description: 'Stillson pattern boru anahtarı, ağır hizmet tipi.' },
    '378': { name: 'İsveç Tipi Boru Anahtarı 90° Düz Ağız', subcat: 'Boru Anahtarları', description: 'DIN 5234 standardına uygun İsveç tipi boru anahtarı. 90° düz ağız tasarımı, borulara zarar vermez.' },
    '374': { name: 'İsveç Tipi Boru Anahtarı 45° İnce Ağız', subcat: 'Boru Anahtarları', description: '45° açılı ince ağızlı boru anahtarı. Dar alanlarda çalışma için ideal.' },
    '384': { name: 'Zincirli Boru Anahtarı', subcat: 'Boru Anahtarları', description: 'Büyük çaplı borular için zincirli boru anahtarı. Sağlam zincir yapısı.' },
    '384RC': { name: 'Model 384 Yedek Zincir', subcat: 'Yedek Parçalar', description: 'Beta 384 zincirli boru anahtarı için orijinal yedek zincir.' },
    '386A': { name: 'Ağır Hizmet Zincirli Boru Anahtarı', subcat: 'Boru Anahtarları', description: 'Ağır hizmet tipi çift yönlü (reversible) zincirli boru anahtarı.' },

    // Penseler
    '1032': { name: 'Kombinasyon Pense', subcat: 'Penseler', description: 'Profesyonel kombinasyon pense. Krom vanadyum çelik, DIN ISO 5746 standardına uygun.' },
    '1032BA': { name: 'Kombinasyon Pense Çift Malzeme Sap', subcat: 'Penseler', description: 'Ergonomik çift malzeme saplı kombinasyon pense.' },
    '1032HS': { name: 'Kombinasyon Pense Yüksek Mukavemet', subcat: 'Penseler', description: 'Yüksek mukavemetli özel çelik kombinasyon pense.' },
    '1032K': { name: 'Kombinasyon Pense İzoleli 1000V', subcat: 'Penseler', description: '1000V izoleli kombinasyon pense. VDE onaylı, elektrik işleri için güvenli.' },
    '1034': { name: 'Uzun Burun Pense', subcat: 'Penseler', description: 'Düz uzun burun pense. Elektronik ve hassas işler için ideal.' },
    '1034HS': { name: 'Uzun Burun Pense Yüksek Mukavemet', subcat: 'Penseler', description: 'Yüksek mukavemetli uzun burun pense.' },
    '1034K': { name: 'Uzun Burun Pense İzoleli 1000V', subcat: 'Penseler', description: '1000V izoleli uzun burun pense. VDE onaylı.' },
    '1036': { name: 'Yan Keski', subcat: 'Penseler', description: 'Profesyonel yan keski. Yüksek sertlikte kesme ağzı.' },
    '1036BA': { name: 'Yan Keski Çift Malzeme Sap', subcat: 'Penseler', description: 'Ergonomik çift malzeme saplı yan keski.' },
    '1036HS': { name: 'Yan Keski Yüksek Mukavemet', subcat: 'Penseler', description: 'Yüksek mukavemetli yan keski, piano teli kesebilir.' },
    '1036K': { name: 'Yan Keski İzoleli 1000V', subcat: 'Penseler', description: '1000V izoleli yan keski. VDE onaylı.' },
    '1044N': { name: 'Su Pompası Pense', subcat: 'Penseler', description: 'Su pompası pense, çoklu ayar pozisyonlu. Boru ve fitting işleri için.' },
    '1044NK': { name: 'Su Pompası Pense İzoleli 1000V', subcat: 'Penseler', description: '1000V izoleli su pompası pense. VDE onaylı.' },
    '1050': { name: 'Karga Burun Pense', subcat: 'Penseler', description: '90° açılı karga burun pense. Zor erişimli alanlar için.' },
    '1051': { name: 'Mengene Pense (Grip)', subcat: 'Penseler', description: 'Kilitlenebilir mengene pense. Ayarlanabilir çene açıklığı ve kilit mekanizması.' },
    '1051GM': { name: 'Mengene Pense Uzun Ağız', subcat: 'Penseler', description: 'Uzun ağızlı mengene pense.' },
    '1051L': { name: 'Mengene Pense Büyük Boy', subcat: 'Penseler', description: 'Büyük boy mengene pense.' },
    '1082': { name: 'Segman Pense Dış Düz', subcat: 'Penseler', description: 'Dış segman halkaları için düz uçlu pense. 10-25mm arası.' },
    '1082BM': { name: 'Segman Pense Dış Düz Çift Malzeme', subcat: 'Penseler', description: 'Ergonomik çift malzeme saplı dış segman pense.' },
    '1084': { name: 'Segman Pense İç Düz', subcat: 'Penseler', description: 'İç segman halkaları için düz uçlu pense. 12-25mm arası.' },
    '1084BM': { name: 'Segman Pense İç Düz Çift Malzeme', subcat: 'Penseler', description: 'Ergonomik çift malzeme saplı iç segman pense.' },
    '1088': { name: 'Segman Pense Dış Açılı', subcat: 'Penseler', description: 'Dış segman halkaları için 90° açılı uçlu pense.' },
    '1088BM': { name: 'Segman Pense Dış Açılı Çift Malzeme', subcat: 'Penseler', description: 'Ergonomik çift malzeme saplı açılı dış segman pense.' },

    // Tornavidalar
    '1002': { name: 'Tornavida Düz Uç Standart', subcat: 'Tornavidalar', description: 'Standart düz uçlu tornavida. Krom vanadyum çelik gövde.' },
    '1008': { name: 'Tornavida Torx', subcat: 'Tornavidalar', description: 'Torx uçlu tornavida. Yüksek tork aktarımı.' },
    '1008BM': { name: 'Tornavida Torx Çift Malzeme Sap', subcat: 'Tornavidalar', description: 'Ergonomik çift malzeme saplı Torx tornavida.' },
    '1009': { name: 'Tornavida Düz Uç İnce', subcat: 'Tornavidalar', description: 'İnce uçlu düz tornavida, hassas işler için.' },
    '1010': { name: 'Tornavida Yıldız (Phillips)', subcat: 'Tornavidalar', description: 'Phillips (PH) yıldız uçlu tornavida.' },
    '1010BM': { name: 'Tornavida Yıldız Çift Malzeme Sap', subcat: 'Tornavidalar', description: 'Ergonomik çift malzeme saplı Phillips tornavida.' },

    // Lokma ve Cırcır
    '1100BA': { name: 'Lokma Ucu 1/4"', subcat: 'Lokma Takımları', description: '1/4" (6.3mm) kare saplı lokma ucu.' },
    '1101': { name: 'Lokma 1/4" Standart', subcat: 'Lokma Takımları', description: '1/4" standart uzunluk lokma.' },
    '1102': { name: 'Lokma 1/4" Uzun', subcat: 'Lokma Takımları', description: '1/4" uzun tip lokma.' },
    '1122': { name: 'Lokma 3/8" Standart', subcat: 'Lokma Takımları', description: '3/8" (9.5mm) standart uzunluk lokma.' },
    '1122K': { name: 'Lokma 3/8" Şamandıralı', subcat: 'Lokma Takımları', description: '3/8" şamandıralı (wobble) lokma.' },
    '1128': { name: 'Cırcır 1/2"', subcat: 'Cırcır ve Aksesuarlar', description: '1/2" (12.7mm) profesyonel cırcır. 72 dişli mekanizma.' },
    '1128BAX': { name: 'Cırcır 1/2" Çift Malzeme Sap', subcat: 'Cırcır ve Aksesuarlar', description: 'Ergonomik çift malzeme saplı 1/2" cırcır.' },
    '1128BM': { name: 'Cırcır 1/2" Kompakt', subcat: 'Cırcır ve Aksesuarlar', description: 'Kompakt gövdeli 1/2" cırcır.' },
    '1150': { name: 'Lokma 1/2" Standart', subcat: 'Lokma Takımları', description: '1/2" standart uzunluk lokma.' },

    // Kombine ve Çatal Anahtarlar
    '42': { name: 'Kombine Anahtar', subcat: 'Kombine Anahtarlar', description: 'Bir ucu açık, bir ucu yıldız kombine anahtar. DIN 3113 standardına uygun.' },
    '42AS': { name: 'Kombine Anahtar Saten Krom', subcat: 'Kombine Anahtarlar', description: 'Saten krom kaplama kombine anahtar.' },
    '42BA': { name: 'Kombine Anahtar Çift Malzeme Sap', subcat: 'Kombine Anahtarlar', description: 'Ergonomik çift malzeme saplı kombine anahtar.' },
    '42HS': { name: 'Kombine Anahtar Yüksek Mukavemet', subcat: 'Kombine Anahtarlar', description: 'Yüksek mukavemetli kombine anahtar.' },
    '42K': { name: 'Kombine Anahtar İzoleli 1000V', subcat: 'Kombine Anahtarlar', description: '1000V izoleli kombine anahtar. VDE onaylı.' },
    '55': { name: 'Çatal Anahtar (Açık Ağız)', subcat: 'Çatal Anahtarlar', description: 'Çift açık ağızlı çatal anahtar. DIN 3110 standardına uygun.' },
    '55AS': { name: 'Çatal Anahtar Saten Krom', subcat: 'Çatal Anahtarlar', description: 'Saten krom kaplama çatal anahtar.' },
    '55BA': { name: 'Çatal Anahtar Çift Malzeme Sap', subcat: 'Çatal Anahtarlar', description: 'Ergonomik çift malzeme saplı çatal anahtar.' },

    // Yıldız Anahtarlar
    '80': { name: 'Yıldız Anahtar (Ofset)', subcat: 'Yıldız Anahtarlar', description: 'Çift kapalı ağızlı ofset yıldız anahtar. DIN 838 standardına uygun.' },
    '83': { name: 'Yıldız Anahtar Derin Ofset', subcat: 'Yıldız Anahtarlar', description: 'Derin ofset yıldız anahtar, daha fazla erişim mesafesi.' },
    '88': { name: 'Yıldız Anahtar Düz', subcat: 'Yıldız Anahtarlar', description: 'Düz yıldız anahtar.' },

    // Ayarlı Anahtarlar
    '90': { name: 'Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', description: 'Profesyonel ayarlı anahtar. Krom vanadyum çelik, fosfat kaplama.' },
    '90AS': { name: 'Ayarlı Anahtar Saten Krom', subcat: 'Ayarlı Anahtarlar', description: 'Saten krom kaplama ayarlı anahtar.' },
    '90K': { name: 'Ayarlı Anahtar İzoleli 1000V', subcat: 'Ayarlı Anahtarlar', description: '1000V izoleli ayarlı anahtar. VDE onaylı.' },
    '91': { name: 'Ölçekli Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', description: 'Gövde üzerinde ölçü skalası bulunan ayarlı anahtar.' },
    '92': { name: 'Geniş Ağız Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', description: 'Ekstra geniş açılma kapasiteli ayarlı anahtar.' },
    '93': { name: 'İnce Ağız Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', description: 'İnce profilli ayarlı anahtar, dar alanlarda kullanım için.' },

    // Allen Anahtarlar
    '96': { name: 'Allen Anahtar Standart', subcat: 'Allen Anahtarlar', description: 'Standart L tipi allen anahtar.' },
    '96N': { name: 'Allen Anahtar Siyah', subcat: 'Allen Anahtarlar', description: 'Siyah oksit kaplama allen anahtar.' },
    '96BP': { name: 'Allen Anahtar Bilyalı Uç', subcat: 'Allen Anahtarlar', description: 'Bilyalı uç allen anahtar. 25° açıyla çalışabilir.' },
    '96BPA': { name: 'Allen Anahtar Takımı Bilyalı', subcat: 'Allen Anahtarlar', description: 'Bilyalı uç allen anahtar seti.' },
    '96T': { name: 'Allen Anahtar T Saplı', subcat: 'Allen Anahtarlar', description: 'T saplı allen anahtar. Ergonomik tutuş, yüksek tork.' },
    '96L': { name: 'Allen Anahtar Uzun Kol', subcat: 'Allen Anahtarlar', description: 'Uzun kollu allen anahtar.' },

    // Torx Anahtarlar
    '97TX': { name: 'Torx Anahtar', subcat: 'Torx Anahtarlar', description: 'Torx (yıldız) uçlu L tipi anahtar.' },
    '97BTX': { name: 'Torx Anahtar Bilyalı Uç', subcat: 'Torx Anahtarlar', description: 'Bilyalı uç Torx anahtar. Açılı çalışma imkanı.' },
    '97RTX': { name: 'Torx Anahtar Delikli', subcat: 'Torx Anahtarlar', description: 'Ortası delikli (Tamper Proof) Torx anahtar.' },
    '97TTX': { name: 'Torx Anahtar T Saplı', subcat: 'Torx Anahtarlar', description: 'T saplı Torx anahtar.' },

    // Çekiçler
    '1370': { name: 'Mühendis Çekiç (Ball Peen)', subcat: 'Çekiçler', description: 'Mühendis (bilyalı) çekiç. Krom vanadyum çelik kafa.' },
    '1370F': { name: 'Mühendis Çekiç Fiberglas Sap', subcat: 'Çekiçler', description: 'Fiberglas saplı mühendis çekici. Titreşim emici.' },
    '1370T': { name: 'Mühendis Çekiç Titanyum', subcat: 'Çekiçler', description: 'Titanyum kafalı ultra hafif mühendis çekici.' },
    '1375': { name: 'Plastik Çekiç', subcat: 'Çekiçler', description: 'Değiştirilebilir plastik başlı çekiç.' },
    '1377': { name: 'Lastik Çekiç', subcat: 'Çekiçler', description: 'Siyah lastik başlıklı çekiç. Yüzeylere zarar vermez.' },
    '1380': { name: 'Geri Tepmesiz Çekiç', subcat: 'Çekiçler', description: 'İç dolgu sayesinde geri tepmesiz çekiç. Hassas işler için.' },
    '1390': { name: 'Balyoz', subcat: 'Çekiçler', description: 'Profesyonel balyoz. Ağır hizmet tipi.' },

    // Keskiler ve Zımbalar
    '1428': { name: 'Soğuk Keski', subcat: 'Keskiler ve Zımbalar', description: 'Soğuk iş keskisi. Krom vanadyum çelik.' },
    '1429': { name: 'Zımba', subcat: 'Keskiler ve Zımbalar', description: 'Profesyonel zımba. Sertleştirilmiş uç.' },

    // Ölçü Aletleri
    '1650': { name: 'Dijital Kumpas', subcat: 'Ölçü Aletleri', description: 'Dijital kumpas. LCD ekran, mm/inch dönüşüm.' },
    '1682': { name: 'Şerit Metre', subcat: 'Ölçü Aletleri', description: 'Profesyonel şerit metre. Çift taraflı bant.' },
    '1688': { name: 'Su Terazisi', subcat: 'Ölçü Aletleri', description: 'Profesyonel su terazisi. Alüminyum gövde.' },

    // Tork Anahtarları
    '1600': { name: 'Tork Anahtarı Mekanik', subcat: 'Tork Anahtarları', description: 'Mekanik göstergeli tork anahtarı. Kalibre edilmiş.' },
    '1651': { name: 'Tork Anahtarı Dijital', subcat: 'Tork Anahtarları', description: 'Dijital göstergeli tork anahtarı.' },

    // Kesici Aletler
    '1717': { name: 'Maket Bıçağı', subcat: 'Kesici Aletler', description: 'Otomatik bıçak değişimli maket bıçağı.' },
    '1718': { name: 'Maket Bıçağı Yedek Uç', subcat: 'Yedek Parçalar', description: 'Maket bıçağı için yedek bıçaklar.' },

    // Takım Çantaları
    '1719BM': { name: 'Takım Çantası', subcat: 'Takım Çantaları', description: 'Profesyonel takım çantası. Naylon kumaş, su geçirmez.' }
};

// Görselleri bul
function findImages(sku) {
    const images = [];

    if (!fs.existsSync(IMAGES_DIR)) return images;

    const dirs = fs.readdirSync(IMAGES_DIR);
    for (const dir of dirs) {
        // Çeşitli eşleşme kontrolleri
        if (dir === sku ||
            dir.startsWith(sku + '_') ||
            dir.startsWith(sku + '-') ||
            dir.startsWith(sku + ' ') ||
            dir.replace(/[^a-zA-Z0-9]/g, '') === sku.replace(/[^a-zA-Z0-9]/g, '')) {

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
    console.log('===================================');
    console.log('Beta Ürün Çıkarma - Final Versiyon');
    console.log('===================================\n');

    // Görsel klasörlerini al
    const allSkuFolders = fs.readdirSync(IMAGES_DIR);
    console.log(`Toplam ${allSkuFolders.length} SKU klasörü mevcut.`);

    // Geçerli SKU'ları filtrele
    const validSkuFolders = allSkuFolders.filter(f => {
        if (f.includes('E+') || f.match(/^[\d,\.]+MT$/)) return false;
        return true;
    });

    console.log(`${validSkuFolders.length} geçerli SKU klasörü.`);

    // Ürünleri oluştur
    const products = [];
    const processedSkus = new Set();

    console.log('\nÜrünler oluşturuluyor...');

    for (const folder of validSkuFolders) {
        if (products.length >= 150) break;

        // SKU'yu çıkar
        const sku = folder.split(' ')[0].split('_')[0].split('-')[0];

        // Zaten işlendiyse atla
        if (processedSkus.has(sku)) continue;
        processedSkus.add(sku);

        // Görselleri bul
        const images = findImages(folder);
        if (images.length === 0) continue;

        // Ürün bilgilerini al
        let info = skuDatabase[sku];

        // Eğer veritabanında yoksa, prefix ile ara
        if (!info) {
            for (const [key, val] of Object.entries(skuDatabase)) {
                if (sku.startsWith(key) || key.startsWith(sku)) {
                    info = { ...val, name: `${val.name} (${sku})` };
                    break;
                }
            }
        }

        // Hala yoksa default değer
        if (!info) {
            // SKU'ya göre kategori tahmin et
            let subcat = 'El Aletleri';
            let name = 'Beta El Aleti';

            if (sku.match(/^10[0-9]{2}/)) {
                subcat = 'Penseler ve Tornavidalar';
                name = 'Pense/Tornavida';
            } else if (sku.match(/^11[0-9]{2}/)) {
                subcat = 'Lokma Takımları';
                name = 'Lokma';
            } else if (sku.match(/^12[0-9]{2}/)) {
                subcat = 'Uçlar ve Aksesuarlar';
                name = 'Uç/Aksesuar';
            } else if (sku.match(/^13[0-9]{2}/)) {
                subcat = 'Çekiçler ve Keskiler';
                name = 'Çekiç/Keski';
            } else if (sku.match(/^14[0-9]{2}/)) {
                subcat = 'Özel Aletler';
                name = 'Özel Alet';
            } else if (sku.match(/^15[0-9]{2}/)) {
                subcat = 'Hidrolik Aletler';
                name = 'Hidrolik Alet';
            } else if (sku.match(/^16[0-9]{2}/)) {
                subcat = 'Ölçü Aletleri';
                name = 'Ölçü Aleti';
            } else if (sku.match(/^17[0-9]{2}/)) {
                subcat = 'Kesici Aletler';
                name = 'Kesici Alet';
            } else if (sku.match(/^9[0-7]/)) {
                subcat = 'Anahtarlar';
                name = 'Anahtar';
            }

            info = {
                name: name,
                subcat: subcat,
                description: 'Profesyonel Beta marka el aleti. İtalyan üretimi, yüksek kalite.'
            };
        }

        // Ürün kodu oluştur
        const numericPart = sku.replace(/[^0-9]/g, '');
        const articleCode = '000' + numericPart.padStart(6, '0');

        products.push({
            StokKodu: articleCode,
            UrunAdi: `Beta ${sku} ${info.name}`,
            Marka: 'Beta Tools',
            Fiyat: 0,
            IndirimliFiyat: '',
            Stok: 100,
            Kategori: 'Hırdavat ve El Aletleri',
            AltKategori: info.subcat,
            Aciklama: `${info.description}\n\nGörsel: ${images.join(', ')}`,
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

    // İlk 20 ürünü göster
    console.log('\nİlk 20 ürün:');
    products.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi}`);
        console.log(`   Kategori: ${p.AltKategori}`);
    });

    // Excel'e yaz
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);

    // Sütun genişliklerini ayarla
    ws['!cols'] = [
        { wch: 12 }, // StokKodu
        { wch: 50 }, // UrunAdi
        { wch: 12 }, // Marka
        { wch: 10 }, // Fiyat
        { wch: 12 }, // IndirimliFiyat
        { wch: 8 },  // Stok
        { wch: 25 }, // Kategori
        { wch: 25 }, // AltKategori
        { wch: 80 }, // Aciklama
        { wch: 8 },  // Birim
        { wch: 60 }, // GorselURL
        { wch: 8 },  // Aktif
        { wch: 10 }, // PopulerMi
        { wch: 8 },  // YeniMi
        { wch: 10 }, // OneCikan
        { wch: 10 }, // CokSatan
        { wch: 12 }  // MarkaVitrini
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);

    console.log(`\n✅ Excel dosyası oluşturuldu: ${OUTPUT_FILE}`);
    console.log(`\n📊 Özet:`);
    console.log(`   - Toplam ürün: ${products.length}`);
    console.log(`   - Kategoriler: ${[...new Set(products.map(p => p.AltKategori))].length} farklı alt kategori`);
}

main().catch(console.error);
