// ============================================
// KATEGORI VERİLERİ - KARAKÖY TÜCCARI E-TİCARET
// ============================================

const categoriesData = {

    'akulu-aletler': {
        title: 'Akülü Aletler',
        description: 'Profesyonel akülü matkap, vidalama ve kesme aletleri.',
        icon: 'fa-battery-full',
        image: 'gorseller/category_akulu_aletler.png',
        subcategories: [
            { name: 'Akülü Matkap & Vidalama', items: ['Akülü Matkap', 'Akülü Vidalama', 'Akülü Darbeli Matkap'], icon: 'fa-screwdriver' },
            { name: 'Akülü Kesme & Taşlama', items: ['Akülü Avuç Taşlama', 'Akülü Testere', 'Akülü Dekupaj'], icon: 'fa-compact-disc' },
            { name: 'Batarya & Şarj Cihazları', items: ['Lityum Batarya', 'Hızlı Şarj Cihazı', 'Çoklu Şarj İstasyonu'], icon: 'fa-charging-station' }
        ]
    },

    'jeneratorler': {
        title: 'Jeneratörler',
        description: 'Benzinli, dizel ve inverter jeneratörler.',
        icon: 'fa-bolt',
        image: 'gorseller/category_jeneratorler.png',
        subcategories: [
            { name: 'Benzinli Jeneratörler', items: ['Taşınabilir Jeneratör', 'Ev Tipi Jeneratör'], icon: 'fa-gas-pump' },
            { name: 'İnverter Jeneratörler', items: ['Sessiz İnverter', 'Çift Yakıtlı İnverter'], icon: 'fa-microchip' },
            { name: 'Endüstriyel Jeneratörler', items: ['Dizel Jeneratör', 'Yüksek Güç Jeneratör'], icon: 'fa-industry' }
        ]
    },

    'hobi-aletleri': {
        title: 'Hobi Aletleri',
        description: 'Elektrikli ve akülü hobi aletleri, mini matkap ve gravür makineleri.',
        icon: 'fa-wand-magic-sparkles',
        image: 'gorseller/category_hobi_aletleri.png',
        subcategories: [
            { name: 'Elektrikli Hobi Aletleri', items: ['Mini Taşlama (Dremel)', 'Elektrikli Gravür', 'Mini Zımpara'], icon: 'fa-bolt' },
            { name: 'Akülü Hobi Aletleri', items: ['Akülü Mini Matkap', 'Şarjlı Tornavida', 'Mini Testere'], icon: 'fa-battery-half' },
            { name: 'Hobi Aksesuarları', items: ['Gravür Uçları', 'Kesme Diskleri', 'Parlatma Uçları'], icon: 'fa-gears' }
        ]
    },

    'aksesuarlar': {
        title: 'Aksesuarlar',
        description: 'Elmas testereler, delik delme testerleri, matkap uçları ve vidalama uçları.',
        icon: 'fa-gears',
        image: 'gorseller/category_aksesuarlar.png',
        subcategories: [
            { name: 'Testere Uçları', items: ['Elmas Testereler', 'Dairesel Testere Uçları', 'Dekupaj Testere Uçları'], icon: 'fa-compact-disc' },
            { name: 'Delik Delme', items: ['Delik Testerleri', 'Karot Uçları', 'Panç Uçları'], icon: 'fa-circle-dot' },
            { name: 'Matkap & Vidalama Uçları', items: ['Metal Matkap Uçları', 'Beton Matkap Uçları', 'Vidalama Uçları Seti'], icon: 'fa-screwdriver' }
        ]
    },

    'elektrikli-el-aletleri': {
        title: 'Elektrikli El Aletleri ve Aksesuarları',
        description: 'Profesyonel elektrikli el aletleri ve makineler.',
        icon: 'fa-plug',
        image: 'gorseller/category_elektrikli.png',
        subcategories: [
            { name: 'Delme & Vidalama', items: ['Matkap', 'Vidalama Makinesi', 'Darbeli Matkap'], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: ['Avuç Taşlama', 'Spiral', 'Testere'], icon: 'fa-compact-disc' },
            { name: 'Yüzey İşleme', items: ['Zımpara Makinesi', 'Planya', 'Freze'], icon: 'fa-brush' },
            { name: 'Diğer Makineler', items: ['Dekupaj', 'Sıcak Hava Tabancası', 'Şarjlı Aletler'], icon: 'fa-toolbox' }
        ]
    },

    'olcme-ve-kontrol-aletleri': {
        title: 'Ölçme ve Kontrol Aletleri',
        description: 'Hassas ölçüm ve kontrol işlemleri için profesyonel cihazlar.',
        icon: 'fa-ruler-combined',
        image: 'gorseller/category_olcme_kontrol.png',
        subcategories: [
            { name: 'Lazerli Ölçüm', items: ['Lazerli Ölçüm Cihazları (Mesafe Ölçer)', 'Lazer Hizalamalar (Çizgi, Nokta)'], icon: 'fa-crosshairs' },
            { name: 'Mekanik Ölçüm', items: ['Şerit Metreler', 'Çelik Metreler', 'Kumpaslar (Dijital, Analog)', 'Mikrometreler'], icon: 'fa-ruler' },
            { name: 'Terazi & Açı', items: ['Su Terazileri (Dijital, Klasik)', 'Açı Ölçerler', 'Dijital Tartılar'], icon: 'fa-scale-balanced' },
            { name: 'Görüntüleme', items: ['Endoskoplar'], icon: 'fa-eye' }
        ]
    },

    'asindirici-kesici': {
        title: 'Aşındırıcı ve Kesici Uçlar',
        description: 'Her türlü yüzey işlemi için profesyonel kesme, taşlama ve zımparalama ürünleri.',
        icon: 'fa-compact-disc',
        image: 'gorseller/category_asindirici_kesici.png',
        subcategories: [
            { name: 'Delici & Vidalama', items: ['Matkap Uçları (Metal, Ahşap, Beton)', 'Freze Uçları', 'Karot Uçları'], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: ['Taşlama Diskleri', 'Kesme Diskleri'], icon: 'fa-compact-disc' },
            { name: 'Aşındırma ve Zımpara', items: ['Zımpara Kağıtları ve Bantları'], icon: 'fa-note-sticky' }
        ]
    },

    'yapi-kimyasallari': {
        title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
        description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
        icon: 'fa-flask',
        image: 'gorseller/category_yapi_kimyasallari.png',
        subcategories: [
            { name: 'Yapıştırıcılar', items: ['Silikon, Mastik ve Akrilikler', 'Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)', 'Poliüretan Köpükler'], icon: 'fa-glue' },
            { name: 'Dolgu ve Harçlar', items: ['Çimento Esaslı Harçlar', 'Alçı ve Alçı Ürünleri', 'Derz Dolgular'], icon: 'fa-trowel' },
            { name: 'Kimyasallar', items: ['Tiner ve Çözücüler'], icon: 'fa-bottle-droplet' }
        ]
    },

    'kaynak-malzemeleri': {
        title: 'Kaynak Malzemeleri ve Aksesuarları',
        description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
        icon: 'fa-fire-burner',
        image: 'gorseller/category_kaynak.png',
        subcategories: [
            { name: 'Sarf Malzemeleri', items: ['Elektrotlar (Rutil, Bazik)', 'Kaynak Telleri (Gazaltı, Tig)'], icon: 'fa-bolt' },
            { name: 'Koruyucu Ekipman', items: ['Kaynak Maskeleri ve Eldivenleri'], icon: 'fa-helmet-safety' },
            { name: 'Makine ve Aksesuar', items: ['Kaynak Makineleri ve Aksesuarları'], icon: 'fa-plug' }
        ]
    },

    'hirdavat-el-aletleri': {
        title: 'Hırdavat ve El Aletleri',
        description: 'Her türlü tamirat işi için profesyonel el aletleri.',
        icon: 'fa-screwdriver-wrench',
        image: 'gorseller/category_hirdavat.png',
        subcategories: [
            { name: 'Anahtarlar & Vidalama', items: ['Anahtar Takımları (Lokma, Kombine)', 'İngiliz Anahtarı', 'Tornavidalar (Düz, Yıldız, Tork)'], icon: 'fa-wrench' },
            { name: 'Kesme & Şekillendirme', items: ['Pense ve Yan Keski Çeşitleri', 'Maket Bıçakları', 'Eğeler ve Raspalar'], icon: 'fa-scissors' },
            { name: 'Vurma & Sabitleme', items: ['Çekiçler (Demirci, Lastik)', 'Balta', 'Keski ve Zımbalar', 'Mengene ve Kelepçeler'], icon: 'fa-hammer' },
            { name: 'Kavrama ve İnce İşçilik Penseleri', items: ['Düz Uçlu Kargaburunlar', 'Eğri Uçlu Kargaburunlar', 'Uzun Uçlu Kargaburunlar', 'Yuvarlak Uçlu Kargaburunlar'], icon: 'fa-hand' }
        ]
    },

    'is-guvenligi-ve-calisma-ekipmanlari': {
        title: 'İş Güvenliği ve Çalışma Ekipmanları',
        description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
        icon: 'fa-helmet-safety',
        image: 'gorseller/category_is_guvenligi.png',
        subcategories: [
            { name: 'Koruyucu Giyim', items: ['Koruyucu Giyim (İş Elbisesi, Eldiven)'], icon: 'fa-vest' },
            { name: 'Ayak & Baş Koruma', items: ['Ayak ve Baş Koruyucuları (Baret, Çelik Burunlu Ayakkabı)'], icon: 'fa-hard-hat' },
            { name: 'Göz & Kulak Koruma', items: ['Göz ve Kulak Koruyucuları'], icon: 'fa-glasses' },
            { name: 'Çalışma Ekipmanları', items: ['İş İskelesi ve Merdivenler'], icon: 'fa-stairs' }
        ]
    },

    'bahce-aletleri': {
        title: 'Bahçe Aletleri',
        description: 'Profesyonel bahçe bakımı için elektrikli, akülü ve manuel bahçe aletleri.',
        icon: 'fa-leaf',
        image: 'gorseller/category_bahce_aletleri.png',
        subcategories: [
            { name: 'Kesme & Budama', items: ['Çit Kesme Makinesi', 'Budama Makası', 'Ağaç Kesme Testeresi', 'Dal Budama Aleti'], icon: 'fa-scissors' },
            { name: 'Çim Bakımı', items: ['Çim Biçme Makinesi', 'Tırpan', 'Çim Havalandırıcı', 'Çim Süpürgesi'], icon: 'fa-seedling' },
            { name: 'Sulama Sistemleri', items: ['Bahçe Hortumu', 'Sulama Tabancası', 'Damla Sulama Sistemi', 'Fıskiye ve Yağmurlama'], icon: 'fa-droplet' },
            { name: 'Toprak İşleme', items: ['Çapa Makinesi', 'Kürek', 'Tırmık', 'Bel', 'Kazma'], icon: 'fa-mountain' }
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
