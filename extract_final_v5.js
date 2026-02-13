const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Dosya yolları
const IMAGES_DIR = 'C:/Users/pc/Desktop/Beta_Katalog_SKU_Gorseller';
const OUTPUT_FILE = 'C:/Users/pc/Desktop/Beta_Products_150.xlsx';

// SKU bazlı ürün bilgileri - Türkçe isim ve alt kategori
const skuDatabase = {
    // Boru Anahtarları
    '366': { name: 'Hafif Tip Boru Anahtarı', subcat: 'Boru Anahtarları', desc: 'DIN 3113 standardına uygun hafif tip boru anahtarı. Krom vanadyum çelik gövde.' },
    '365R': { name: 'Stillson Tip Boru Anahtarı', subcat: 'Boru Anahtarları', desc: 'Stillson pattern ağır hizmet boru anahtarı.' },
    '378': { name: 'İsveç Tipi Boru Anahtarı 90° Düz Ağız', subcat: 'Boru Anahtarları', desc: 'DIN 5234 standardına uygun İsveç tipi boru anahtarı.' },
    '374': { name: 'İsveç Tipi Boru Anahtarı 45° İnce Ağız', subcat: 'Boru Anahtarları', desc: '45° açılı ince ağızlı boru anahtarı.' },
    '384': { name: 'Zincirli Boru Anahtarı', subcat: 'Boru Anahtarları', desc: 'Büyük çaplı borular için zincirli boru anahtarı.' },
    '384RC': { name: 'Model 384 Yedek Zincir', subcat: 'Yedek Parçalar', desc: 'Beta 384 için yedek zincir.' },
    '386A': { name: 'Ağır Hizmet Zincirli Boru Anahtarı', subcat: 'Boru Anahtarları', desc: 'Çift yönlü ağır hizmet zincirli boru anahtarı.' },

    // Penseler
    '1032': { name: 'Kombinasyon Pense', subcat: 'Penseler', desc: 'Profesyonel kombinasyon pense, DIN ISO 5746.' },
    '1032BA': { name: 'Kombinasyon Pense Çift Malzeme Sap', subcat: 'Penseler', desc: 'Ergonomik çift malzeme saplı kombinasyon pense.' },
    '1032HS': { name: 'Kombinasyon Pense Yüksek Mukavemet', subcat: 'Penseler', desc: 'Yüksek mukavemetli kombinasyon pense.' },
    '1032K': { name: 'Kombinasyon Pense İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli kombinasyon pense.' },
    '1033': { name: 'Telefon Pense', subcat: 'Penseler', desc: 'Telefon/elektronik pense.' },
    '1033K': { name: 'Telefon Pense İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli telefon pense.' },
    '1034': { name: 'Uzun Burun Pense', subcat: 'Penseler', desc: 'Düz uzun burun pense.' },
    '1034HS': { name: 'Uzun Burun Pense Yüksek Mukavemet', subcat: 'Penseler', desc: 'Yüksek mukavemetli uzun burun pense.' },
    '1034K': { name: 'Uzun Burun Pense İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli uzun burun pense.' },
    '1034L': { name: 'Uzun Burun Pense Ekstra Uzun', subcat: 'Penseler', desc: 'Ekstra uzun burunlu pense.' },
    '1036': { name: 'Yan Keski', subcat: 'Penseler', desc: 'Profesyonel yan keski.' },
    '1036BA': { name: 'Yan Keski Çift Malzeme Sap', subcat: 'Penseler', desc: 'Ergonomik çift malzeme saplı yan keski.' },
    '1036HS': { name: 'Yan Keski Yüksek Mukavemet', subcat: 'Penseler', desc: 'Piano teli kesebilen yüksek mukavemetli yan keski.' },
    '1036K': { name: 'Yan Keski İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli yan keski.' },
    '1037': { name: 'Ön Keski', subcat: 'Penseler', desc: 'Ön kesici pense.' },
    '1037K': { name: 'Ön Keski İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli ön keski.' },
    '1038': { name: 'Mini Keski', subcat: 'Penseler', desc: 'Mini boy yan keski.' },
    '1038HS': { name: 'Mini Keski Yüksek Mukavemet', subcat: 'Penseler', desc: 'Yüksek mukavemetli mini keski.' },
    '1038K': { name: 'Mini Keski İzoleli 1000V', subcat: 'Penseler', desc: '1000V izoleli mini keski.' },
    '1039': { name: 'Elektronik Keski', subcat: 'Penseler', desc: 'Elektronik işler için hassas keski.' },
    '1044N': { name: 'Su Pompası Pense', subcat: 'Penseler', desc: 'Çoklu pozisyonlu su pompası pense.' },
    '1044NK': { name: 'Su Pompası Pense İzoleli 1000V', subcat: 'Penseler', desc: '1000V VDE izoleli su pompası pense.' },
    '1046BA': { name: 'Su Pompası Pense Düğmeli Ayar', subcat: 'Penseler', desc: 'Düğmeli ayar mekanizmalı su pompası pense.' },
    '1047': { name: 'Su Pompası Pense Cobra Tip', subcat: 'Penseler', desc: 'Cobra tip su pompası pense.' },
    '1048': { name: 'Kıskaç Pense', subcat: 'Penseler', desc: 'Ayarlanabilir kıskaç pense.' },
    '1048BM': { name: 'Kıskaç Pense Çift Malzeme Sap', subcat: 'Penseler', desc: 'Ergonomik çift malzeme saplı kıskaç pense.' },
    '1048N': { name: 'Kıskaç Pense Siyah', subcat: 'Penseler', desc: 'Siyah kaplama kıskaç pense.' },
    '1048VN': { name: 'Kıskaç Pense V Ağız', subcat: 'Penseler', desc: 'V ağızlı kıskaç pense.' },
    '1050': { name: 'Karga Burun Pense', subcat: 'Penseler', desc: '90° açılı karga burun pense.' },
    '1051': { name: 'Mengene Pense (Grip)', subcat: 'Penseler', desc: 'Kilitlenebilir mengene pense.' },
    '1051GM': { name: 'Mengene Pense Uzun Ağız', subcat: 'Penseler', desc: 'Uzun ağızlı mengene pense.' },
    '1051L': { name: 'Mengene Pense Büyük Boy', subcat: 'Penseler', desc: 'Büyük boy mengene pense.' },
    '1051XL': { name: 'Mengene Pense Ekstra Büyük', subcat: 'Penseler', desc: 'Ekstra büyük mengene pense.' },
    '1052': { name: 'C Tipi Mengene Pense', subcat: 'Penseler', desc: 'C tipi mengene pense.' },
    '1052BA': { name: 'C Tipi Mengene Pense Çift Malzeme', subcat: 'Penseler', desc: 'Ergonomik saplı C tipi mengene pense.' },

    // Segman Penseler
    '1082': { name: 'Segman Pense Dış Düz', subcat: 'Penseler', desc: 'Dış segman halkaları için düz uçlu pense.' },
    '1082BA': { name: 'Segman Pense Dış Düz Çift Malzeme', subcat: 'Penseler', desc: 'Ergonomik saplı dış segman pense.' },
    '1082BM': { name: 'Segman Pense Dış Düz Soft Grip', subcat: 'Penseler', desc: 'Soft grip saplı dış segman pense.' },
    '1082G': { name: 'Segman Pense Dış Açılı', subcat: 'Penseler', desc: 'Açılı uçlu dış segman pense.' },
    '1082K': { name: 'Segman Pense Dış Düz İzoleli', subcat: 'Penseler', desc: 'İzoleli dış segman pense.' },
    '1084': { name: 'Segman Pense İç Düz', subcat: 'Penseler', desc: 'İç segman halkaları için düz uçlu pense.' },
    '1084BM': { name: 'Segman Pense İç Düz Soft Grip', subcat: 'Penseler', desc: 'Soft grip saplı iç segman pense.' },
    '1084G': { name: 'Segman Pense İç Açılı', subcat: 'Penseler', desc: 'Açılı uçlu iç segman pense.' },
    '1084K': { name: 'Segman Pense İç Düz İzoleli', subcat: 'Penseler', desc: 'İzoleli iç segman pense.' },
    '1088': { name: 'Segman Pense Dış 90° Açılı', subcat: 'Penseler', desc: '90° açılı dış segman pense.' },
    '1088BM': { name: 'Segman Pense Dış 90° Soft Grip', subcat: 'Penseler', desc: 'Soft grip 90° dış segman pense.' },
    '1088K': { name: 'Segman Pense Dış 90° İzoleli', subcat: 'Penseler', desc: 'İzoleli 90° dış segman pense.' },

    // Tornavidalar
    '1002': { name: 'Tornavida Düz Uç', subcat: 'Tornavidalar', desc: 'Standart düz uçlu tornavida.' },
    '1008': { name: 'Tornavida Torx', subcat: 'Tornavidalar', desc: 'Torx uçlu tornavida.' },
    '1008BM': { name: 'Tornavida Torx Soft Grip', subcat: 'Tornavidalar', desc: 'Soft grip Torx tornavida.' },
    '1009': { name: 'Tornavida Düz İnce Uç', subcat: 'Tornavidalar', desc: 'İnce uçlu düz tornavida.' },
    '1010': { name: 'Tornavida Phillips (Yıldız)', subcat: 'Tornavidalar', desc: 'Phillips (PH) yıldız tornavida.' },
    '1010BM': { name: 'Tornavida Phillips Soft Grip', subcat: 'Tornavidalar', desc: 'Soft grip Phillips tornavida.' },
    '1010MQ': { name: 'Tornavida Phillips Çift Malzeme', subcat: 'Tornavidalar', desc: 'Çift malzeme saplı Phillips tornavida.' },

    // Lokma ve Cırcır
    '1100BA': { name: 'Lokma Ucu 1/4"', subcat: 'Lokma Takımları', desc: '1/4" lokma ucu.' },
    '1101': { name: 'Lokma 1/4" Standart', subcat: 'Lokma Takımları', desc: '1/4" standart lokma.' },
    '1102': { name: 'Lokma 1/4" Uzun', subcat: 'Lokma Takımları', desc: '1/4" uzun lokma.' },
    '1122': { name: 'Lokma 3/8" Standart', subcat: 'Lokma Takımları', desc: '3/8" standart lokma.' },
    '1122K': { name: 'Lokma 3/8" Şamandıralı', subcat: 'Lokma Takımları', desc: '3/8" wobble lokma.' },
    '1128': { name: 'Cırcır 1/2"', subcat: 'Cırcır ve Aksesuarlar', desc: '1/2" profesyonel cırcır, 72 diş.' },
    '1128BAX': { name: 'Cırcır 1/2" Ergonomik Sap', subcat: 'Cırcır ve Aksesuarlar', desc: 'Ergonomik saplı 1/2" cırcır.' },
    '1128BM': { name: 'Cırcır 1/2" Kompakt', subcat: 'Cırcır ve Aksesuarlar', desc: 'Kompakt 1/2" cırcır.' },
    '1128FX': { name: 'Cırcır 1/2" Esnek Kafa', subcat: 'Cırcır ve Aksesuarlar', desc: 'Esnek kafalı 1/2" cırcır.' },
    '1150': { name: 'Lokma 1/2" Standart', subcat: 'Lokma Takımları', desc: '1/2" standart lokma.' },
    '1150BM': { name: 'Lokma 1/2" Soft Grip', subcat: 'Lokma Takımları', desc: 'Soft grip 1/2" lokma.' },
    '1150G': { name: 'Lokma 1/2" Açılı', subcat: 'Lokma Takımları', desc: 'Açılı 1/2" lokma.' },
    '1150K': { name: 'Lokma 1/2" İzoleli', subcat: 'Lokma Takımları', desc: 'İzoleli 1/2" lokma.' },

    // Kombine Anahtarlar
    '42': { name: 'Kombine Anahtar', subcat: 'Kombine Anahtarlar', desc: 'Bir ucu açık, bir ucu yıldız kombine anahtar.' },
    '42AS': { name: 'Kombine Anahtar Saten Krom', subcat: 'Kombine Anahtarlar', desc: 'Saten krom kombine anahtar.' },
    '42BA': { name: 'Kombine Anahtar Çift Malzeme Sap', subcat: 'Kombine Anahtarlar', desc: 'Ergonomik saplı kombine anahtar.' },
    '42HS': { name: 'Kombine Anahtar Yüksek Mukavemet', subcat: 'Kombine Anahtarlar', desc: 'Yüksek mukavemetli kombine anahtar.' },
    '42K': { name: 'Kombine Anahtar İzoleli 1000V', subcat: 'Kombine Anahtarlar', desc: '1000V VDE izoleli kombine anahtar.' },
    '42MP': { name: 'Kombine Anahtar Cırcırlı', subcat: 'Kombine Anahtarlar', desc: 'Cırcır mekanizmalı kombine anahtar.' },
    '42LMP': { name: 'Kombine Anahtar Uzun Cırcırlı', subcat: 'Kombine Anahtarlar', desc: 'Uzun kollu cırcırlı kombine anahtar.' },
    '42SLIM': { name: 'Kombine Anahtar İnce Profil', subcat: 'Kombine Anahtarlar', desc: 'İnce profilli kombine anahtar.' },

    // Çatal Anahtarlar
    '55': { name: 'Çatal Anahtar (Açık Ağız)', subcat: 'Çatal Anahtarlar', desc: 'Çift açık ağızlı çatal anahtar.' },
    '55AS': { name: 'Çatal Anahtar Saten Krom', subcat: 'Çatal Anahtarlar', desc: 'Saten krom çatal anahtar.' },
    '55BA': { name: 'Çatal Anahtar Çift Malzeme Sap', subcat: 'Çatal Anahtarlar', desc: 'Ergonomik saplı çatal anahtar.' },
    '55HS': { name: 'Çatal Anahtar Yüksek Mukavemet', subcat: 'Çatal Anahtarlar', desc: 'Yüksek mukavemetli çatal anahtar.' },
    '55K': { name: 'Çatal Anahtar İzoleli 1000V', subcat: 'Çatal Anahtarlar', desc: '1000V VDE izoleli çatal anahtar.' },

    // Yıldız Anahtarlar
    '78': { name: 'Yıldız Anahtar Düz', subcat: 'Yıldız Anahtarlar', desc: 'Düz yıldız anahtar.' },
    '78AS': { name: 'Yıldız Anahtar Saten Krom', subcat: 'Yıldız Anahtarlar', desc: 'Saten krom yıldız anahtar.' },
    '78BA': { name: 'Yıldız Anahtar Ergonomik Sap', subcat: 'Yıldız Anahtarlar', desc: 'Ergonomik saplı yıldız anahtar.' },
    '80': { name: 'Yıldız Anahtar Ofset', subcat: 'Yıldız Anahtarlar', desc: 'Ofset yıldız anahtar.' },
    '83': { name: 'Yıldız Anahtar Derin Ofset', subcat: 'Yıldız Anahtarlar', desc: 'Derin ofset yıldız anahtar.' },
    '83AS': { name: 'Yıldız Anahtar Derin Ofset Saten', subcat: 'Yıldız Anahtarlar', desc: 'Saten derin ofset yıldız anahtar.' },
    '88': { name: 'Yıldız Anahtar 12 Köşe', subcat: 'Yıldız Anahtarlar', desc: '12 köşeli yıldız anahtar.' },

    // Ayarlı Anahtarlar
    '90': { name: 'Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'Profesyonel ayarlı anahtar.' },
    '90AS': { name: 'Ayarlı Anahtar Saten Krom', subcat: 'Ayarlı Anahtarlar', desc: 'Saten krom ayarlı anahtar.' },
    '90K': { name: 'Ayarlı Anahtar İzoleli 1000V', subcat: 'Ayarlı Anahtarlar', desc: '1000V VDE izoleli ayarlı anahtar.' },
    '91': { name: 'Ölçekli Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'Ölçekli gövde ayarlı anahtar.' },
    '91BA': { name: 'Ölçekli Ayarlı Anahtar Ergonomik', subcat: 'Ayarlı Anahtarlar', desc: 'Ergonomik saplı ölçekli ayarlı anahtar.' },
    '91HS': { name: 'Ölçekli Ayarlı Anahtar Yüksek Muk.', subcat: 'Ayarlı Anahtarlar', desc: 'Yüksek mukavemetli ölçekli ayarlı anahtar.' },
    '92': { name: 'Geniş Ağız Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'Ekstra geniş açılma kapasiteli ayarlı anahtar.' },
    '92BA': { name: 'Geniş Ağız Ayarlı Anahtar Ergonomik', subcat: 'Ayarlı Anahtarlar', desc: 'Ergonomik saplı geniş ağız ayarlı anahtar.' },
    '92HS': { name: 'Geniş Ağız Ayarlı Yüksek Muk.', subcat: 'Ayarlı Anahtarlar', desc: 'Yüksek mukavemetli geniş ağız ayarlı anahtar.' },
    '93': { name: 'İnce Profil Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'İnce profilli ayarlı anahtar.' },
    '93BA': { name: 'İnce Profil Ayarlı Ergonomik', subcat: 'Ayarlı Anahtarlar', desc: 'Ergonomik saplı ince profil ayarlı anahtar.' },
    '93HS': { name: 'İnce Profil Ayarlı Yüksek Muk.', subcat: 'Ayarlı Anahtarlar', desc: 'Yüksek mukavemetli ince profil ayarlı anahtar.' },
    '93K': { name: 'İnce Profil Ayarlı İzoleli', subcat: 'Ayarlı Anahtarlar', desc: 'İzoleli ince profil ayarlı anahtar.' },
    '94': { name: 'Micro Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'Micro boyut ayarlı anahtar.' },
    '94K': { name: 'Micro Ayarlı Anahtar İzoleli', subcat: 'Ayarlı Anahtarlar', desc: 'İzoleli micro ayarlı anahtar.' },
    '95': { name: 'Kısa Kol Ayarlı Anahtar', subcat: 'Ayarlı Anahtarlar', desc: 'Kısa kollu ayarlı anahtar.' },
    '95BA': { name: 'Kısa Kol Ayarlı Ergonomik', subcat: 'Ayarlı Anahtarlar', desc: 'Ergonomik saplı kısa kol ayarlı anahtar.' },
    '95FTX': { name: 'Kısa Kol Ayarlı Fiberglas Sap', subcat: 'Ayarlı Anahtarlar', desc: 'Fiberglas saplı kısa kol ayarlı anahtar.' },

    // Allen Anahtarlar
    '96': { name: 'Allen Anahtar', subcat: 'Allen Anahtarlar', desc: 'L tipi allen anahtar.' },
    '96N': { name: 'Allen Anahtar Siyah', subcat: 'Allen Anahtarlar', desc: 'Siyah oksit kaplama allen anahtar.' },
    '96BP': { name: 'Allen Anahtar Bilyalı Uç', subcat: 'Allen Anahtarlar', desc: 'Bilyalı uç allen anahtar, 25° açıyla çalışabilir.' },
    '96BPA': { name: 'Allen Anahtar Takımı Bilyalı', subcat: 'Allen Anahtarlar', desc: 'Bilyalı uç allen anahtar seti.' },
    '96BPC': { name: 'Allen Anahtar Bilyalı Renkli', subcat: 'Allen Anahtarlar', desc: 'Renkli bilyalı uç allen anahtar.' },
    '96T': { name: 'T Saplı Allen Anahtar', subcat: 'Allen Anahtarlar', desc: 'T saplı allen anahtar, yüksek tork.' },
    '96TBP': { name: 'T Saplı Allen Bilyalı Uç', subcat: 'Allen Anahtarlar', desc: 'T saplı bilyalı uç allen anahtar.' },
    '96L': { name: 'Allen Anahtar Uzun Kol', subcat: 'Allen Anahtarlar', desc: 'Uzun kollu allen anahtar.' },
    '96LBP': { name: 'Allen Anahtar Uzun Kol Bilyalı', subcat: 'Allen Anahtarlar', desc: 'Uzun kol bilyalı uç allen anahtar.' },

    // Torx Anahtarlar
    '97TX': { name: 'Torx Anahtar', subcat: 'Torx Anahtarlar', desc: 'L tipi Torx anahtar.' },
    '97BTX': { name: 'Torx Anahtar Bilyalı Uç', subcat: 'Torx Anahtarlar', desc: 'Bilyalı uç Torx anahtar.' },
    '97RTX': { name: 'Torx Anahtar Delikli', subcat: 'Torx Anahtarlar', desc: 'Tamper proof delikli Torx anahtar.' },
    '97TTX': { name: 'T Saplı Torx Anahtar', subcat: 'Torx Anahtarlar', desc: 'T saplı Torx anahtar.' },
    '97BTXL': { name: 'Torx Anahtar Bilyalı Uzun', subcat: 'Torx Anahtarlar', desc: 'Uzun kollu bilyalı Torx anahtar.' },

    // Çekiçler
    '1370': { name: 'Mühendis Çekiç (Ball Peen)', subcat: 'Çekiçler', desc: 'Mühendis çekici, krom vanadyum çelik.' },
    '1370BA': { name: 'Mühendis Çekiç Ergonomik Sap', subcat: 'Çekiçler', desc: 'Ergonomik saplı mühendis çekici.' },
    '1370F': { name: 'Mühendis Çekiç Fiberglas Sap', subcat: 'Çekiçler', desc: 'Fiberglas saplı mühendis çekici.' },
    '1370T': { name: 'Mühendis Çekiç Titanyum', subcat: 'Çekiçler', desc: 'Titanyum kafalı ultra hafif mühendis çekici.' },
    '1375': { name: 'Plastik Çekiç', subcat: 'Çekiçler', desc: 'Değiştirilebilir plastik başlı çekiç.' },
    '1375A': { name: 'Plastik Çekiç Yedek Baş', subcat: 'Yedek Parçalar', desc: 'Plastik çekiç için yedek baş.' },
    '1377': { name: 'Lastik Çekiç', subcat: 'Çekiçler', desc: 'Siyah lastik başlıklı çekiç.' },
    '1377T': { name: 'Lastik Çekiç Fiberglas Sap', subcat: 'Çekiçler', desc: 'Fiberglas saplı lastik çekiç.' },
    '1378': { name: 'Beyaz Lastik Çekiç', subcat: 'Çekiçler', desc: 'Beyaz lastik başlıklı çekiç.' },
    '1380': { name: 'Geri Tepmesiz Çekiç', subcat: 'Çekiçler', desc: 'Geri tepmesiz çekiç.' },
    '1380BA': { name: 'Geri Tepmesiz Çekiç Ergonomik', subcat: 'Çekiçler', desc: 'Ergonomik saplı geri tepmesiz çekiç.' },
    '1380S': { name: 'Geri Tepmesiz Çekiç Yumuşak Baş', subcat: 'Çekiçler', desc: 'Yumuşak başlı geri tepmesiz çekiç.' },
    '1381': { name: 'Geri Tepmesiz Çekiç Küçük', subcat: 'Çekiçler', desc: 'Küçük boy geri tepmesiz çekiç.' },
    '1390': { name: 'Balyoz', subcat: 'Çekiçler', desc: 'Ağır hizmet balyoz.' },
    '1390BA': { name: 'Balyoz Ergonomik Sap', subcat: 'Çekiçler', desc: 'Ergonomik saplı balyoz.' },
    '1390R': { name: 'Balyoz Fiberglas Sap', subcat: 'Çekiçler', desc: 'Fiberglas saplı balyoz.' },

    // Keskiler ve Zımbalar  
    '1428': { name: 'Soğuk Keski', subcat: 'Keskiler ve Zımbalar', desc: 'Soğuk iş keskisi.' },
    '1429': { name: 'Zımba', subcat: 'Keskiler ve Zımbalar', desc: 'Profesyonel zımba.' },

    // Ölçü Aletleri
    '1650': { name: 'Dijital Kumpas', subcat: 'Ölçü Aletleri', desc: 'Dijital kumpas, mm/inch.' },
    '1682': { name: 'Şerit Metre', subcat: 'Ölçü Aletleri', desc: 'Profesyonel şerit metre.' },
    '1688': { name: 'Su Terazisi', subcat: 'Ölçü Aletleri', desc: 'Alüminyum gövde su terazisi.' },

    // Tork Anahtarları
    '1600': { name: 'Tork Anahtarı', subcat: 'Tork Anahtarları', desc: 'Mekanik tork anahtarı.' },
    '1602': { name: 'Tork Anahtarı 1/4"', subcat: 'Tork Anahtarları', desc: '1/4" tork anahtarı.' },
    '1603': { name: 'Tork Anahtarı 3/8"', subcat: 'Tork Anahtarları', desc: '3/8" tork anahtarı.' },

    // Kesici Aletler
    '1717': { name: 'Maket Bıçağı', subcat: 'Kesici Aletler', desc: 'Otomatik bıçak değişimli maket bıçağı.' },
    '1717A': { name: 'Maket Bıçağı Otomatik', subcat: 'Kesici Aletler', desc: 'Otomatik geri çekilmeli maket bıçağı.' },
    '1717B': { name: 'Maket Bıçağı Profesyonel', subcat: 'Kesici Aletler', desc: 'Profesyonel maket bıçağı.' },
    '1717BA': { name: 'Maket Bıçağı Ergonomik', subcat: 'Kesici Aletler', desc: 'Ergonomik saplı maket bıçağı.' },
    '1718': { name: 'Maket Bıçağı Yedek Uç', subcat: 'Yedek Parçalar', desc: 'Maket bıçağı yedek bıçaklar.' }
};

// Ana fonksiyon
function main() {
    console.log('===================================');
    console.log('Beta Ürün Çıkarma - v5 FINAL');
    console.log('===================================\n');

    // Tüm görsel klasörlerini al
    const allFolders = fs.readdirSync(IMAGES_DIR);
    console.log(`Toplam ${allFolders.length} klasör bulundu.`);

    // Geçerli klasörleri filtrele
    const validFolders = allFolders.filter(f => {
        if (f.includes('E+') || f.match(/^[\d,\.]+MT$/)) return false;
        const dirPath = path.join(IMAGES_DIR, f);
        if (!fs.statSync(dirPath).isDirectory()) return false;
        // İçinde görsel var mı kontrol et
        const files = fs.readdirSync(dirPath);
        return files.some(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    });

    console.log(`${validFolders.length} geçerli görsel klasörü.`);

    // Ürünleri oluştur - HER KLASÖR İÇİN AYRI ÜRÜN
    const products = [];

    for (const folder of validFolders) {
        if (products.length >= 150) break;

        // Klasördeki görselleri bul
        const dirPath = path.join(IMAGES_DIR, folder);
        const files = fs.readdirSync(dirPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        if (files.length === 0) continue;

        // SKU'yu çıkar
        const baseSku = folder.split(' ')[0].split('_')[0].split('-')[0];

        // Varyant bilgisini çıkar
        let variant = '';
        if (folder.includes('_')) {
            variant = folder.split('_').slice(1).join(' ');
        } else if (folder.includes('-') && !folder.match(/^\d+-/)) {
            variant = folder.split('-').slice(1).join(' ');
        } else if (folder.includes(' ')) {
            variant = folder.split(' ').slice(1).join(' ');
        }

        // Ürün bilgilerini al
        let info = skuDatabase[folder] || skuDatabase[baseSku];

        // Prefix ile ara
        if (!info) {
            for (const [key, val] of Object.entries(skuDatabase)) {
                if (baseSku.startsWith(key) || key.startsWith(baseSku)) {
                    info = val;
                    break;
                }
            }
        }

        // Default
        if (!info) {
            let subcat = 'El Aletleri';
            let name = 'El Aleti';

            if (baseSku.match(/^10[0-9]{2}/)) { subcat = 'Penseler ve Tornavidalar'; name = 'Pense/Tornavida'; }
            else if (baseSku.match(/^11[0-9]{2}/)) { subcat = 'Lokma Takımları'; name = 'Lokma/Aksesuar'; }
            else if (baseSku.match(/^12[0-9]{2}/)) { subcat = 'Uçlar'; name = 'Uç'; }
            else if (baseSku.match(/^13[0-9]{2}/)) { subcat = 'Çekiçler ve Keskiler'; name = 'Çekiç/Keski'; }
            else if (baseSku.match(/^14[0-9]{2}/)) { subcat = 'Özel Aletler'; name = 'Özel Alet'; }
            else if (baseSku.match(/^15[0-9]{2}/)) { subcat = 'Hidrolik Aletler'; name = 'Hidrolik Alet'; }
            else if (baseSku.match(/^16[0-9]{2}/)) { subcat = 'Ölçü Aletleri'; name = 'Ölçü Aleti'; }
            else if (baseSku.match(/^17[0-9]{2}/)) { subcat = 'Kesici Aletler'; name = 'Kesici Alet'; }
            else if (baseSku.match(/^9[0-7]/)) { subcat = 'Anahtarlar'; name = 'Anahtar'; }

            info = { name, subcat, desc: 'Profesyonel Beta marka el aleti. İtalyan üretimi.' };
        }

        // Stok kodu oluştur
        const numericPart = baseSku.replace(/[^0-9]/g, '');
        const articleCode = '000' + numericPart.padStart(6, '0') + (variant ? variant.replace(/[^0-9]/g, '').substring(0, 2) : '');

        // Görsel yolları
        const imageUrls = files.map(f => `Beta_Katalog_SKU_Gorseller/${folder}/${f}`);

        // Ürün adı
        let productName = `Beta ${folder} ${info.name}`;
        if (variant && !info.name.includes(variant)) {
            productName += ` ${variant}`;
        }

        products.push({
            StokKodu: articleCode.substring(0, 12),
            UrunAdi: productName.trim(),
            Marka: 'Beta Tools',
            Fiyat: 0,
            IndirimliFiyat: '',
            Stok: 100,
            Kategori: 'Hırdavat ve El Aletleri',
            AltKategori: info.subcat,
            Aciklama: `${info.desc}\n\nGörsel: ${imageUrls.join(', ')}`,
            Birim: 'Adet',
            GorselURL: imageUrls[0],
            Aktif: 'Evet',
            PopulerMi: 'Hayır',
            YeniMi: 'Hayır',
            OneCikan: 'Hayır',
            CokSatan: 'Hayır',
            MarkaVitrini: ''
        });
    }

    console.log(`\n${products.length} ürün oluşturuldu.`);

    // Kategori dağılımı
    const cats = {};
    products.forEach(p => { cats[p.AltKategori] = (cats[p.AltKategori] || 0) + 1; });
    console.log('\nKategori dağılımı:');
    Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  - ${k}: ${v} ürün`));

    // İlk 15 ürün
    console.log('\nİlk 15 ürün:');
    products.slice(0, 15).forEach((p, i) => {
        console.log(`${i + 1}. ${p.StokKodu}: ${p.UrunAdi}`);
    });

    // Excel'e yaz
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products);

    ws['!cols'] = [
        { wch: 12 }, { wch: 55 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
        { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 80 }, { wch: 8 },
        { wch: 60 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
        { wch: 10 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, OUTPUT_FILE);

    console.log(`\n✅ Excel dosyası oluşturuldu: ${OUTPUT_FILE}`);
}

main();
