// ============================================
// KATEGORI VERİLERİ - KARAKÖY TÜCCARI E-TİCARET
// ============================================

const categoriesData = {
    'elektrikli-el-aletleri': {
        title: 'Elektrikli El Aletleri',
        description: 'Profesyonel kullanım için yüksek performanslı elektrikli el aletleri.',
        icon: 'fa-plug',
        image: 'gorseller/mega_menu_men_products.png', // Image name kept for now, should be updated later
        subcategories: [
            { name: 'Delme & Vidalama', items: ['Matkaplar (Darbeli, Darbesiz)', 'Vidalayıcılar (Akülü, Elektrikli)', 'Kırıcı-Deliciler (SDS Max, SDS Plus)', 'Karot Makineleri'], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: ['Taşlama ve Kesme Makineleri (Avuç İçi, Büyük)', 'Dekupaj Testereler', 'Daire Testereler', 'Gönye Kesmeler'], icon: 'fa-scissors' },
            { name: 'Yüzey İşleme', items: ['Zımparalar (Titreşim, Eksantrik, Şerit)', 'Planyalar', 'Frezeler', 'Sıcak Hava Tabancaları'], icon: 'fa-eraser' },
            { name: 'Diğer Makineler', items: ['Kaynak Makineleri (Inverter, Gazaltı)', 'Akülü Alet Setleri'], icon: 'fa-toolbox' }
        ]
    },
    'olcme-ve-kontrol-aletleri': {
        title: 'Ölçme & Kontrol Aletleri',
        description: 'Hassas ölçüm ve kontrol işlemleri için profesyonel cihazlar.',
        icon: 'fa-ruler-combined',
        image: 'gorseller/mega_menu_women_products.png',
        subcategories: [
            { name: 'Lazerli Ölçüm', items: ['Lazerli Ölçüm Cihazları (Mesafe Ölçer)', 'Lazer Hizalamalar (Çizgi, Nokta)'], icon: 'fa-crosshairs' },
            { name: 'Mekanik Ölçüm', items: ['Şerit Metreler', 'Çelik Metreler', 'Kumpaslar (Dijital, Analog)', 'Mikrometreler'], icon: 'fa-ruler' },
            { name: 'Terazi & Açı', items: ['Su Terazileri (Dijital, Klasik)', 'Açı Ölçerler', 'Dijital Tartılar'], icon: 'fa-scale-balanced' },
            { name: 'Görüntüleme', items: ['Endoskoplar'], icon: 'fa-eye' }
        ]
    },
    'el-aletleri': {
        title: 'El Aletleri',
        description: 'Profesyonel ve hobi kullanımı için dayanıklı ve ergonomik el aletleri.',
        icon: 'fa-screwdriver-wrench',
        image: 'gorseller/bebek_special_v2.jpg', // Keep image for now or use generic if available
        subcategories: [
            { name: 'Anahtarlar & Vidalama', items: ['Anahtar Takımları (Lokma, Kombine, Alyen)', 'Tornavidalar (Düz, Yıldız, Tork)'], icon: 'fa-screwdriver' },
            { name: 'Kesme & Şekillendirme', items: ['Pense ve Yan Keski Çeşitleri', 'Maket Bıçakları ve Yedekleri', 'Testereler (El, Budama)', 'Eğeler ve Raspalar'], icon: 'fa-scissors' },
            { name: 'Vurma & Sabitleme', items: ['Çekiçler (Demirci, Lastik, Kaya)', 'Keski ve Zımbalar', 'Mengene ve Kelepçeler'], icon: 'fa-hammer' }
        ]
    },
    'baglanti-ve-sabitleme': {
        title: 'Bağlantı ve Sabitleme Elemanları',
        description: 'Her türlü montaj ve sabitleme işleriniz için gerekli vida, cıvata, dübel ve bağlantı elemanları.',
        icon: 'fa-link',
        image: 'gorseller/elektronik_beige.png', // Placeholder, ideally update if image available
        subcategories: [
            { name: 'Vidalar & Cıvatalar', items: ['Vidalar (Sunta, Alçıpan, Metrik)', 'Civatalar', 'Somun ve Rondelalar'], icon: 'fa-screwdriver' },
            { name: 'Dübel & Ankraj', items: ['Dübel Çeşitleri (Plastik, Çelik, Kimyasal)'], icon: 'fa-anchor' },
            { name: 'Diğer Bağlantı', items: ['Perçinler', 'Kancalar ve Halkalar', 'Tel ve Zincirler'], icon: 'fa-link' }
        ]
    },
    'oto-bakim-tamir': {
        title: 'Oto Bakım ve Tamir Malzemeleri',
        description: 'Otomobil bakımı ve onarımı için gerekli profesyonel ekipmanlar.',
        icon: 'fa-car-wrench',
        image: 'gorseller/mega_menu_hardware_products.png', // Check image logic later or keep generic
        subcategories: [
            { name: 'Kaldırma ve Taşıma', items: ['Kriko ve Sehpalar'], icon: 'fa-truck-pickup' },
            { name: 'Takviye ve Bakım', items: ['Akü Takviye Kabloları', 'Yağlama Pompaları ve Gres Tabancaları'], icon: 'fa-car-battery' },
            { name: 'Lastik Onarım', items: ['Lastik Tamir Kitleri'], icon: 'fa-dharmachakra' },
            { name: 'Depolama', items: ['Alet Çantaları ve Takım Dolapları'], icon: 'fa-toolbox' }
        ]
    },
    'yapi-insaat-malzemeleri': {
        title: 'Yapı ve İnşaat Malzemeleri',
        description: 'İnşaat, tadilat ve tamirat işleriniz için profesyonel yapı kimyasalları ve malzemeleri.',
        icon: 'fa-trowel-bricks',
        image: 'gorseller/mega_menu_home_living_products.png', // Placeholder
        subcategories: [
            { name: 'Kimyasal & Yapıştırıcı', items: ['Silikon, Mastik ve Köpükler', 'Yapıştırıcılar (Epoksi, Japon, Poliüretan)', 'Harç ve Beton Malzemeleri'], icon: 'fa-flask' },
            { name: 'Boya & İzolasyon', items: ['Boyalar ve Boya Malzemeleri (Fırça, Rulo, Tiner)', 'İzolasyon Malzemeleri'], icon: 'fa-paint-roller' },
            { name: 'Donanım', items: ['Kilitler ve Menteşeler'], icon: 'fa-lock' }
        ]
    },

    'hortumlar-baglanti': {
        title: 'Hortumlar ve Bağlantı Parçaları',
        description: 'Endüstriyel ve ev tipi hortumlar, rekorlar, vanalar ve kelepçeler.',
        icon: 'fa-faucet',
        image: 'gorseller/mega_menu_kozmetik.png', // Placeholder
        subcategories: [
            { name: 'Hortum Çeşitleri', items: ['Hava ve Su Hortumları', 'Bahçe Hortumları'], icon: 'fa-hose' }, // No exact fa-hose, fallback possibly or use fa-water if needed. Let's use fa-water or similar if custom logic exists, but keep generic. fa-faucet is good.
            { name: 'Bağlantı Elemanları', items: ['Rekorlar ve Vanalar', 'Hortum Kelepçeleri'], icon: 'fa-link' }
        ]
    },
    'asindirici-kesici': {
        title: 'Aşındırıcı ve Kesici Uçlar',
        description: 'Her türlü yüzey işlemi için profesyonel kesme, taşlama ve zımparalama ürünleri.',
        icon: 'fa-compact-disc',
        image: 'gorseller/mega_menu_canta.png', // Placeholder
        subcategories: [
            { name: 'Delici & Vidalama', items: ['Matkap Uçları (Metal, Ahşap, Beton)', 'Freze Uçları', 'Karot Uçları'], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: ['Taşlama Diskleri', 'Kesme Diskleri'], icon: 'fa-compact-disc' },
            { name: 'Aşındırma ve Zımpara', items: ['Zımpara Kağıtları ve Bantları'], icon: 'fa-note-sticky' }
        ]
    },
    'otomobil-motosiklet': {
        title: 'Otomobil & Motosiklet',
        description: 'Oto aksesuar, bakım ürünleri, lastik ve motosiklet ekipmanları.',
        icon: 'fa-car-side',
        image: 'gorseller/mega_menu_oto_moto.png',
        subcategories: [
            { name: 'Oto Aksesuar', items: ['Paspas', 'Kılıf', 'Telefon Tutucu'], icon: 'fa-car-side' },
            { name: 'Bakım', items: ['Yağ', 'Katkı', 'Temizlik'], icon: 'fa-oil-can' },
            { name: 'Motosiklet', items: ['Kask', 'Mont', 'Eldiven'], icon: 'fa-motorcycle' }
        ]
    },
    'yapi-kimyasallari': {
        title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
        description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
        icon: 'fa-flask',
        image: 'gorseller/mega_menu_yapi_market.png', // Placeholder
        subcategories: [
            { name: 'Yapıştırıcılar', items: ['Silikon, Mastik ve Akrilikler', 'Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)', 'Poliüretan Köpükler'], icon: 'fa-glue' }, // fa-glue doesn't exist, use fa-flask or similar? fa-droplet works. Let's use fa-fill-drip
            { name: 'Dolgu ve Harçlar', items: ['Çimento Esaslı Harçlar', 'Alçı ve Alçı Ürünleri', 'Derz Dolgular'], icon: 'fa-trowel' },
            { name: 'Kimyasallar', items: ['Tiner ve Çözücüler'], icon: 'fa-bottle-droplet' }
        ]
    },
    'yalitim-ve-kaplama': {
        title: 'Yalıtım ve Kaplama',
        description: 'Isı, su ve ses yalıtımı için profesyonel çözümler.',
        icon: 'fa-layer-group',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Isı ve Ses Yalıtımı', items: ['Isı Yalıtım Levhaları (EPS, XPS, Taş Yünü)', 'Ses Yalıtım Ürünleri'], icon: 'fa-temperature-arrow-down' },
            { name: 'Su Yalıtımı', items: ['Su Yalıtım Malzemeleri (Membran, Sürme İzolasyon)'], icon: 'fa-droplet-slash' },
            { name: 'Çatı ve Cephe', items: ['Çatı Malzemeleri (Shingle, Kiremit, O.S.B.)', 'İç/Dış Cephe Kaplamaları (Siding, Fuga, Dekoratif Paneller)'], icon: 'fa-house-chimney' }
        ]
    },
    'nalburiye-baglanti-elemanlari': {
        title: 'Nalburiye & Bağlantı Elemanları',
        description: 'Vida, cıvata, dübel ve kilit sistemleri.',
        icon: 'fa-link',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Vidalama & Sabitleme', items: ['Cıvata, Vida ve Somunlar', 'Dübel ve Ankrajlar (Kimyasal ve Mekanik)', 'Rondelalar'], icon: 'fa-screw' },
            { name: 'Nalburiye Sarf', items: ['Çivi ve Teller', 'Perçinler'], icon: 'fa-hammer' },
            { name: 'Güvenlik & Yük', items: ['Zincir ve Halatlar', 'Kilitler ve Asma Kilitler'], icon: 'fa-lock' }
        ]
    },
    'kaynak-malzemeleri': {
        title: 'Kaynak Malzemeleri',
        description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
        icon: 'fa-fire-burner',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Sarf Malzemeleri', items: ['Elektrotlar (Rutil, Bazik)', 'Kaynak Telleri (Gazaltı, Tig)'], icon: 'fa-bolt' },
            { name: 'Koruyucu Ekipman', items: ['Kaynak Maskeleri ve Eldivenleri'], icon: 'fa-helmet-safety' },
            { name: 'Makine ve Aksesuar', items: ['Kaynak Makineleri ve Aksesuarları'], icon: 'fa-plug' }
        ]
    },
    'boyalar-boya-malzemeleri': {
        title: 'Boyalar ve Boya Malzemeleri',
        description: 'İç ve dış cephe boyaları, vernikler ve boya malzemeleri.',
        icon: 'fa-paint-roller',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Boya Çeşitleri', items: ['İç Cephe Boyaları (Plastik, Silikonlu)', 'Dış Cephe Boyaları (Akrilik, Silikonlu)', 'Astar Boyalar'], icon: 'fa-fill-drip' },
            { name: 'Ahşap & Metal', items: ['Vernikler ve Cilalar'], icon: 'fa-brush' },
            { name: 'Uygulama Ekipmanları', items: ['Fırça ve Rulolar', 'Spatula ve Mala Çeşitleri'], icon: 'fa-paint-roller' }
        ]
    },
    'kapi-pencere-cerceve': {
        title: 'Kapı, Pencere & Çerçeve Sistemleri',
        description: 'PVC, alüminyum ve ahşap doğrama sistemleri ve aksesuarları.',
        icon: 'fa-door-open',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Kapı ve Pencere', items: ['PVC Pencere ve Kapı Sistemleri', 'Alüminyum Doğrama Sistemleri', 'Ahşap Kapı ve Pencere'], icon: 'fa-door-open' },
            { name: 'Tamamlayıcılar', items: ['Panjur ve Kepenk Sistemleri'], icon: 'fa-border-all' },
            { name: 'Aksesuarlar', items: ['Kapı Pencere Aksesuarları (Menteşe, Kol, Kilit Karşılığı)'], icon: 'fa-key' }
        ]
    },
    'tesisat-malzemeleri': {
        title: 'Tesisat Malzemeleri',
        description: 'Su, ısıtma ve havalandırma çözümleri.',
        icon: 'fa-faucet-drip',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Su Tesisatı', items: ['Su Tesisatı Boru ve Ek Parçaları (PVC, PEX)'], icon: 'fa-water' },
            { name: 'Armatür & Vitrifiye', items: ['Musluk ve Bataryalar', 'Sifon ve Rezervuar Sistemleri'], icon: 'fa-sink' },
            { name: 'Isıtma & Havalandırma', items: ['Isıtma Tesisatı Malzemeleri (Radyatör, Kombi Bağlantı)', 'Hava ve Havalandırma Kanalları'], icon: 'fa-temperature-arrow-up' }
        ]
    },
    'hirdavat-el-aletleri': {
        title: 'Hırdavat ve El Aletleri',
        description: 'Her türlü tamirat işi için el aletleri.',
        icon: 'fa-screwdriver-wrench',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Ölçü Aletleri', items: ['Ölçü Aletleri (Metre, Su Terazisi, Gönye)'], icon: 'fa-ruler-combined' },
            { name: 'Kesici & Delici', items: ['Kesici ve Delici Aletler (Testere, Matkap Uçları)'], icon: 'fa-scissors' },
            { name: 'Sıkıştırma & Tutma', items: ['Sıkıştırma ve Tutma Aletleri (Pense, İngiliz Anahtarı, Mengene)'], icon: 'fa-wrench' },
            { name: 'Vurucu Aletler', items: ['Vurucu Aletler (Çekiç, Balta)'], icon: 'fa-hammer' }
        ]
    },
    'is-guvenligi-ve-calisma-ekipmanlari': {
        title: 'İş Güvenliği ve Çalışma Ekipmanları',
        description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
        icon: 'fa-helmet-safety',
        image: 'gorseller/mega_menu_fragrance_products.png',
        subcategories: [
            { name: 'Koruyucu Giyim', items: ['Koruyucu Giyim (İş Elbisesi, Eldiven)'], icon: 'fa-vest' },
            { name: 'Ayak & Baş Koruma', items: ['Ayak ve Baş Koruyucuları (Baret, Çelik Burunlu Ayakkabı)'], icon: 'fa-hard-hat' },
            { name: 'Göz & Kulak Koruma', items: ['Göz ve Kulak Koruyucuları'], icon: 'fa-glasses' },
            { name: 'Çalışma Ekipmanları', items: ['İş İskelesi ve Merdivenler'], icon: 'fa-stairs' }
        ]
    },
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
