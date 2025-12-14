// ============================================
// KATEGORI VERİLERİ - RESELS E-TİCARET
// ============================================

const categoriesData = {
    'erkek': {
        title: 'Erkek',
        description: 'Erkek giyim, ayakkabı ve aksesuar modasının en trend parçaları.',
        icon: 'fa-person',
        image: 'gorseller/mega_menu_men_products.png',
        subcategories: [
            { name: 'Giyim', items: ['Tişört', 'Pantolon', 'Mont'], icon: 'fa-shirt' },
            { name: 'Ayakkabı', items: ['Spor Ayakkabı', 'Klasik', 'Bot'], icon: 'fa-shoe-prints' },
            { name: 'Aksesuar', items: ['Saat', 'Kemer', 'Gözlük'], icon: 'fa-user-tie' }
        ]
    },
    'kadin': {
        title: 'Kadın',
        description: 'Kadın modasının zarif ve şık koleksiyonları. Elbise, bluz, etek ve daha fazlası.',
        icon: 'fa-person-dress',
        image: 'gorseller/mega_menu_women_products.png',
        subcategories: [
            { name: 'Giyim', items: ['Elbise', 'Bluz', 'Etek'], icon: 'fa-person-dress' },
            { name: 'Ayakkabı', items: ['Topuklu', 'Sandalet', 'Bot'], icon: 'fa-shoe-prints' },
            { name: 'Çanta', items: ['Omuz Çantası', 'Sırt Çantası', 'Cüzdan'], icon: 'fa-bag-shopping' }
        ]
    },
    'bebek-cocuk': {
        title: 'Bebek & Çocuk',
        description: 'Bebek ve çocuklar için konforlu kıyafetler, güvenli oyuncaklar ve bakım ürünleri.',
        icon: 'fa-baby',
        image: 'gorseller/bebek_special_v2.jpg',
        subcategories: [
            { name: 'Giyim', items: ['Bebek Tulum', 'Çocuk Takım', 'Mont'], icon: 'fa-shirt' },
            { name: 'Oyuncak', items: ['Eğitici Oyuncak', 'Bebek Oyuncağı', 'Araba'], icon: 'fa-shapes' },
            { name: 'Bakım', items: ['Bebek Bezi', 'Şampuan', 'Biberon'], icon: 'fa-pump-soap' }
        ]
    },
    'elektronik': {
        title: 'Elektronik',
        description: 'Son teknoloji bilgisayarlar, telefonlar, tabletler ve aksesuarlar.',
        icon: 'fa-laptop',
        image: 'gorseller/elektronik_beige.png',
        subcategories: [
            { name: 'Bilgisayar', items: ['Laptop', 'Masaüstü', 'Tablet'], icon: 'fa-laptop' },
            { name: 'Telefon', items: ['Akıllı Telefon', 'Akıllı Saat', 'Kılıf'], icon: 'fa-mobile' },
            { name: 'Aksesuar', items: ['Kulaklık', 'Powerbank', 'Şarj Aleti'], icon: 'fa-headphones' }
        ]
    },
    'koku-parfum': {
        title: 'Koku & Parfüm',
        description: 'En seçkin markaların kadın ve erkek parfümleri, oda kokuları ve deodorantlar.',
        icon: 'fa-spray-can',
        image: 'gorseller/mega_menu_fragrance_products.png',
        subcategories: [
            { name: 'Parfüm', items: ['Kadın Parfüm', 'Erkek Parfüm', 'Unisex'], icon: 'fa-spray-can-sparkles' },
            { name: 'Deodorant', items: ['Sprey', 'Roll-on', 'Stick'], icon: 'fa-wind' },
            { name: 'Ev Kokusu', items: ['Oda Spreyi', 'Bambu Çubuklu', 'Mum'], icon: 'fa-fire' }
        ]
    },
    'hirdavat-teknik-malzemeler': {
        title: 'Hırdavat & Teknik Malzemeler',
        description: 'Hırdavat ve teknik malzemeler. Elektrik, tesisat, boya ekipmanları ve profesyonel el aletleri.',
        icon: 'fa-screwdriver-wrench',
        image: 'gorseller/mega_menu_hardware_products.png',
        subcategories: [
            { name: 'Elektrikli El Aletleri', items: ['Matkaplar (Darbeli, Darbesiz)', 'Vidalayıcılar (Akülü, Elektrikli)', 'Kırıcı-Deliciler (SDS Max, SDS Plus)', 'Karot Makineleri', 'Taşlama ve Kesme Makineleri (Avuç İçi, Büyük)', 'Zımparalar (Titreşim, Eksantrik, Şerit)', 'Planyalar', 'Frezeler', 'Dekupaj Testereler', 'Daire Testereler', 'Gönye Kesmeler', 'Sıcak Hava Tabancaları', 'Kaynak Makineleri (Inverter, Gazaltı)', 'Akülü Alet Setleri'], icon: 'fa-plug' },
            { name: 'Ölçme & Kontrol Aletleri', items: ['Lazerli Ölçüm Cihazları (Mesafe Ölçer)', 'Lazer Hizalamalar (Çizgi, Nokta)', 'Şerit Metreler', 'Çelik Metreler', 'Kumpaslar (Dijital, Analog)', 'Mikrometreler', 'Su Terazileri (Dijital, Klasik)', 'Açı Ölçerler', 'Dijital Tartılar', 'Endoskoplar'], icon: 'fa-ruler-combined' },
            { name: 'El Aletleri', items: ['Anahtar Takımları (Lokma, Kombine, Alyen)', 'Tornavidalar (Düz, Yıldız, Tork)', 'Pense ve Yan Keski Çeşitleri', 'Çekiçler (Demirci, Lastik, Kaya)', 'Maket Bıçakları ve Yedekleri', 'Testereler (El Testereleri, Budama Testereleri)', 'Eğeler ve Raspalar', 'Keski ve Zımbalar', 'Mengene ve Kelepçeler'], icon: 'fa-wrench' },
            { name: 'Bağlantı ve Sabitleme Elemanları', items: ['Vidalar (Sunta, Alçıpan, Metrik)', 'Somun ve Rondelalar', 'Civatalar', 'Dübel Çeşitleri (Plastik, Çelik, Kimyasal)', 'Perçinler', 'Kancalar ve Halkalar', 'Tel ve Zincirler'], icon: 'fa-link' },
            { name: 'İş Güvenliği ve İş Giysileri', items: ['Koruyucu Eldivenler (İş, Kaynak, Montaj)', 'İş Ayakkabıları ve Botları (Çelik Burunlu)', 'İş Elbiseleri ve Tulumlar', 'Koruyucu Gözlük ve Maskeler', 'Baretler', 'İşitme Koruyucular', 'İlk Yardım Malzemeleri'], icon: 'fa-helmet-safety' },
            { name: 'Yapı ve İnşaat Malzemeleri', items: ['Silikon, Mastik ve Köpükler', 'Yapıştırıcılar (Epoksi, Japon, Poliüretan)', 'Boyalar ve Boya Malzemeleri (Fırça, Rulo, Tiner)', 'Harç ve Beton Malzemeleri', 'İzolasyon Malzemeleri', 'Kilitler ve Menteşeler'], icon: 'fa-trowel' },
            { name: 'Hortumlar ve Bağlantı Parçaları', items: ['Hava ve Su Hortumları', 'Bahçe Hortumları', 'Rekorlar ve Vanalar', 'Hortum Kelepçeleri'], icon: 'fa-faucet' },
            { name: 'Aşındırıcı ve Kesici Uçlar', items: ['Matkap Uçları (Metal, Ahşap, Beton)', 'Taşlama Diskleri', 'Kesme Diskleri', 'Zımpara Kağıtları ve Bantları', 'Freze Uçları', 'Karot Uçları'], icon: 'fa-dharmachakra' },
            { name: 'Oto Bakım ve Tamir Malzemeleri', items: ['Kriko ve Sehpalar', 'Akü Takviye Kabloları', 'Yağlama Pompaları ve Gres Tabancaları', 'Lastik Tamir Kitleri', 'Alet Çantaları ve Takım Dolapları'], icon: 'fa-car' }
        ]
    },
    'nalbur-yapi-malzemeleri': {
        title: 'Yapı Malzemeleri & Nalburiye',
        description: 'Profesyonel nalbur malzemeleri ve yapı ürünleri. Tamir ve tadilat işleriniz için her şey.',
        icon: 'fa-hammer',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Yapıştırıcı, Dolgu ve Kimyasallar', items: ['Silikon, Mastik ve Akrilikler', 'Poliüretan Köpükler', 'Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)', 'Tiner ve Çözücüler', 'Çimento Esaslı Harçlar', 'Alçı ve Alçı Ürünleri', 'Derz Dolgular'], icon: 'fa-fill-drip' },
            { name: 'Yalıtım ve Kaplama', items: ['Isı Yalıtım Levhaları (EPS, XPS, Taş Yünü)', 'Su Yalıtım Malzemeleri (Membran, Sürme İzolasyon)', 'Ses Yalıtım Ürünleri', 'Çatı Malzemeleri (Shingle, Kiremit, O.S.B.)', 'İç/Dış Cephe Kaplamaları (Siding, Fuga, Dekoratif Paneller)'], icon: 'fa-layer-group' },
            { name: 'Nalburiye & Bağlantı Elemanları', items: ['Cıvata, Vida ve Somunlar', 'Dübel ve Ankrajlar (Kimyasal ve Mekanik)', 'Çivi ve Teller', 'Rondelalar', 'Perçinler', 'Zincir ve Halatlar', 'Kilitler ve Asma Kilitler'], icon: 'fa-screwdriver' },
            { name: 'Kaynak Malzemeleri', items: ['Elektrotlar (Rutil, Bazik)', 'Kaynak Telleri (Gazaltı, Tig)', 'Kaynak Maskeleri ve Eldivenleri', 'Kaynak Makineleri ve Aksesuarları'], icon: 'fa-fire-burner' },
            { name: 'Boyalar ve Boya Malzemeleri', items: ['İç Cephe Boyaları (Plastik, Silikonlu)', 'Dış Cephe Boyaları (Akrilik, Silikonlu)', 'Vernikler ve Cilalar', 'Astar Boyalar', 'Fırça ve Rulolar', 'Spatula ve Mala Çeşitleri'], icon: 'fa-paint-roller' },
            { name: 'Kapı, Pencere & Çerçeve Sistemleri', items: ['PVC Pencere ve Kapı Sistemleri', 'Alüminyum Doğrama Sistemleri', 'Ahşap Kapı ve Pencere', 'Kapı Pencere Aksesuarları (Menteşe, Kol, Kilit Karşılığı)', 'Panjur ve Kepenk Sistemleri'], icon: 'fa-door-open' },
            { name: 'Tesisat Malzemeleri', items: ['Su Tesisatı Boru ve Ek Parçaları (PVC, PEX)', 'Musluk ve Bataryalar', 'Sifon ve Rezervuar Sistemleri', 'Isıtma Tesisatı Malzemeleri (Radyatör, Kombi Bağlantı)', 'Hava ve Havalandırma Kanalları'], icon: 'fa-faucet-drip' },
            { name: 'Hırdavat ve El Aletleri', items: ['Ölçü Aletleri (Metre, Su Terazisi, Gönye)', 'Kesici ve Delici Aletler (Testere, Matkap Uçları)', 'Sıkıştırma ve Tutma Aletleri (Pense, İngiliz Anahtarı, Mengene)', 'Vurucu Aletler (Çekiç, Balta)'], icon: 'fa-wrench' },
            { name: 'İş Güvenliği ve Çalışma Ekipmanları', items: ['Koruyucu Giyim (İş Elbisesi, Eldiven)', 'Ayak ve Baş Koruyucuları (Baret, Çelik Burunlu Ayakkabı)', 'Göz ve Kulak Koruyucuları', 'İş İskelesi ve Merdivenler'], icon: 'fa-helmet-safety' }
        ]
    },
    'ev-mobilya': {
        title: 'Ev & Mobilya',
        description: 'Eviniz için modern mobilyalar, dekoratif ürünler ve tekstil malzemeleri.',
        icon: 'fa-couch',
        image: 'gorseller/mega_menu_mobilya.png',
        subcategories: [
            { name: 'Mobilya', items: ['Koltuk', 'Masa', 'Sandalye'], icon: 'fa-chair' },
            { name: 'Tekstil', items: ['Nevresim', 'Perde', 'Halı'], icon: 'fa-rug' },
            { name: 'Dekorasyon', items: ['Aydınlatma', 'Tablo', 'Vazo'], icon: 'fa-lightbulb' }
        ]
    },
    'kozmetik': {
        title: 'Kozmetik',
        description: 'Makyaj, cilt bakımı, saç bakımı ve kişisel bakım ürünleri.',
        icon: 'fa-wand-magic-sparkles',
        image: 'gorseller/mega_menu_kozmetik.png',
        subcategories: [
            { name: 'Makyaj', items: ['Ruj', 'Rimel', 'Fondöten'], icon: 'fa-eye' },
            { name: 'Cilt Bakımı', items: ['Krem', 'Serum', 'Tonik'], icon: 'fa-pump-soap' },
            { name: 'Saç', items: ['Şampuan', 'Saç Kremi', 'Boya'], icon: 'fa-scissors' }
        ]
    },
    'ayakkabi-canta': {
        title: 'Ayakkabı & Çanta',
        description: 'Her tarza uygun kadın, erkek ve çocuk ayakkabıları ve çantaları.',
        icon: 'fa-shoe-prints',
        image: 'gorseller/mega_menu_canta.png',
        subcategories: [
            { name: 'Ayakkabı', items: ['Spor', 'Klasik', 'Bot'], icon: 'fa-shoe-prints' },
            { name: 'Çanta', items: ['Sırt Çantası', 'El Çantası', 'Cüzdan'], icon: 'fa-bag-shopping' },
            { name: 'Valiz', items: ['Kabin Boy', 'Orta Boy', 'Büyük Boy'], icon: 'fa-suitcase' }
        ]
    },
    'otomobil-motosiklet': {
        title: 'Otomobil & Motosiklet',
        description: 'Oto aksesuar, bakım ürünleri, lastik ve motosiklet ekipmanları.',
        icon: 'fa-car',
        image: 'gorseller/mega_menu_oto_moto.png',
        subcategories: [
            { name: 'Oto Aksesuar', items: ['Paspas', 'Kılıf', 'Telefon Tutucu'], icon: 'fa-car-side' },
            { name: 'Bakım', items: ['Yağ', 'Katkı', 'Temizlik'], icon: 'fa-oil-can' },
            { name: 'Motosiklet', items: ['Kask', 'Mont', 'Eldiven'], icon: 'fa-motorcycle' }
        ]
    }
};

// Kategori listesini döndür
function getAllCategories() {
    return Object.keys(categoriesData).map(slug => ({
        slug: slug,
        ...categoriesData[slug]
    }));
}

// Belirli bir kategoriyi getir
function getCategoryBySlug(slug) {
    return categoriesData[slug] || null;
}
