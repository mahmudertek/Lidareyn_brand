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
            { name: 'Akülü Matkap & Vidalama', items: [], icon: 'fa-screwdriver' },
            { name: 'Akülü Kesme & Taşlama', items: [], icon: 'fa-compact-disc' },
            { name: 'Batarya & Şarj Cihazları', items: [], icon: 'fa-charging-station' }
        ]
    },

    'jeneratorler': {
        title: 'Jeneratörler',
        description: 'Benzinli, dizel ve inverter jeneratörler.',
        icon: 'fa-bolt',
        image: 'gorseller/category_jeneratorler.png',
        subcategories: [
            { name: 'Benzinli Jeneratörler', items: [], icon: 'fa-gas-pump' },
            { name: 'İnverter Jeneratörler', items: [], icon: 'fa-microchip' },
            { name: 'Endüstriyel Jeneratörler', items: [], icon: 'fa-industry' }
        ]
    },

    'hobi-aletleri': {
        title: 'Hobi Aletleri',
        description: 'Elektrikli ve akülü hobi aletleri, mini matkap ve gravür makineleri.',
        icon: 'fa-wand-magic-sparkles',
        image: 'gorseller/category_hobi_aletleri.png',
        subcategories: [
            { name: 'Elektrikli Hobi Aletleri', items: [], icon: 'fa-bolt' },
            { name: 'Akülü Hobi Aletleri', items: [], icon: 'fa-battery-half' },
            { name: 'Hobi Aksesuarları', items: [], icon: 'fa-gears' }
        ]
    },

    'aksesuarlar': {
        title: 'Aksesuarlar',
        description: 'Elmas testereler, delik delme testerleri, matkap uçları ve vidalama uçları.',
        icon: 'fa-gears',
        image: 'gorseller/category_aksesuarlar.png',
        subcategories: [
            { name: 'Testere Uçları', items: [], icon: 'fa-compact-disc' },
            { name: 'Delik Delme', items: [], icon: 'fa-circle-dot' },
            { name: 'Matkap & Vidalama Uçları', items: [], icon: 'fa-screwdriver' }
        ]
    },

    'elektrikli-el-aletleri': {
        title: 'Elektrikli El Aletleri ve Aksesuarları',
        description: 'Profesyonel elektrikli el aletleri ve makineler.',
        icon: 'fa-plug',
        image: 'gorseller/category_elektrikli.png',
        subcategories: [
            { name: 'Delme & Vidalama', items: [], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: [], icon: 'fa-compact-disc' },
            { name: 'Yüzey İşleme', items: [], icon: 'fa-brush' },
            { name: 'Diğer Makineler', items: [], icon: 'fa-toolbox' }
        ]
    },

    'olcme-ve-kontrol-aletleri': {
        title: 'Ölçme ve Kontrol Aletleri',
        description: 'Hassas ölçüm ve kontrol işlemleri için profesyonel cihazlar.',
        icon: 'fa-ruler-combined',
        image: 'gorseller/category_olcme_kontrol.png',
        subcategories: [
            { name: 'Lazerli Ölçüm', items: [], icon: 'fa-crosshairs' },
            { name: 'Mekanik Ölçüm', items: [], icon: 'fa-ruler' },
            { name: 'Terazi & Açı', items: [], icon: 'fa-scale-balanced' },
            { name: 'Görüntüleme', items: [], icon: 'fa-eye' }
        ]
    },

    'asindirici-kesici': {
        title: 'Aşındırıcı ve Kesici Uçlar',
        description: 'Her türlü yüzey işlemi için profesyonel kesme, taşlama ve zımparalama ürünleri.',
        icon: 'fa-compact-disc',
        image: 'gorseller/category_asindirici_kesici.png',
        subcategories: [
            { name: 'Delici & Vidalama', items: [], icon: 'fa-screwdriver' },
            { name: 'Kesme & Taşlama', items: [], icon: 'fa-compact-disc' },
            { name: 'Aşındırma ve Zımpara', items: [], icon: 'fa-note-sticky' }
        ]
    },

    'yapi-kimyasallari': {
        title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
        description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
        icon: 'fa-flask',
        image: 'gorseller/category_yapi_kimyasallari.png',
        subcategories: [
            { name: 'Yapıştırıcılar', items: [], icon: 'fa-glue' },
            { name: 'Dolgu ve Harçlar', items: [], icon: 'fa-trowel' },
            { name: 'Kimyasallar', items: [], icon: 'fa-bottle-droplet' }
        ]
    },

    'kaynak-malzemeleri': {
        title: 'Kaynak Malzemeleri ve Aksesuarları',
        description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
        icon: 'fa-fire-burner',
        image: 'gorseller/category_kaynak.png',
        subcategories: [
            { name: 'Sarf Malzemeleri', items: [], icon: 'fa-bolt' },
            { name: 'Koruyucu Ekipman', items: [], icon: 'fa-helmet-safety' },
            { name: 'Makine ve Aksesuar', items: [], icon: 'fa-plug' }
        ]
    },

    'hirdavat-el-aletleri': {
        title: 'Hırdavat ve El Aletleri',
        description: 'Her türlü tamirat işi için profesyonel el aletleri.',
        icon: 'fa-screwdriver-wrench',
        image: 'gorseller/category_hirdavat.png',
        subcategories: [
            { name: 'Anahtarlar & Vidalama', items: [], icon: 'fa-wrench' },
            { name: 'Kesme & Şekillendirme', items: [], icon: 'fa-scissors' },
            { name: 'Vurma & Sabitleme', items: [], icon: 'fa-hammer' },
            { name: 'Kavrama ve İnce İşçilik Penseleri', items: [], icon: 'fa-hand' }
        ]
    },

    'is-guvenligi-ve-calisma-ekipmanlari': {
        title: 'İş Güvenliği ve Çalışma Ekipmanları',
        description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
        icon: 'fa-helmet-safety',
        image: 'gorseller/category_is_guvenligi.png',
        subcategories: [
            { name: 'Koruyucu Giyim', items: [], icon: 'fa-vest' },
            { name: 'Ayak & Baş Koruma', items: [], icon: 'fa-hard-hat' },
            { name: 'Göz & Kulak Koruma', items: [], icon: 'fa-glasses' },
            { name: 'Çalışma Ekipmanları', items: [], icon: 'fa-stairs' }
        ]
    },

    'bahce-aletleri': {
        title: 'Bahçe Aletleri',
        description: 'Profesyonel bahçe bakımı için elektrikli, akülü ve manuel bahçe aletleri.',
        icon: 'fa-leaf',
        image: 'gorseller/category_bahce_aletleri.png',
        subcategories: [
            { name: 'Kesme & Budama', items: [], icon: 'fa-scissors' },
            { name: 'Çim Bakımı', items: [], icon: 'fa-seedling' },
            { name: 'Sulama Sistemleri', items: [], icon: 'fa-droplet' },
            { name: 'Toprak İşleme', items: [], icon: 'fa-mountain' }
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
