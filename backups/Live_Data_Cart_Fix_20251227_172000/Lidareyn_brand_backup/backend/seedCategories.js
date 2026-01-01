// Seed Categories to MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

// Category Schema (inline)
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    icon: { type: String, default: 'fas fa-folder' },
    image: { type: String, default: '' },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String }
}, { timestamps: true });

// Slug generation with Turkish character support
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

// 9 Main Categories Data (matching the website)
const categoriesData = [
    {
        name: 'Elektrikli El Aletleri',
        icon: 'fas fa-bolt',
        description: 'Profesyonel elektrikli el aletleri, matkap, şarjlı cihazlar',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 1
    },
    {
        name: 'Ölçme Ve Kontrol Aletleri',
        icon: 'fas fa-ruler-combined',
        description: 'Metre, kumpas, su terazisi ve ölçüm cihazları',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 2
    },
    {
        name: 'El Aletleri',
        icon: 'fas fa-tools',
        description: 'Tornavida, pense, anahtar takımları ve el aletleri',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 3
    },
    {
        name: 'Yapı ve İnşaat Malzemeleri',
        icon: 'fas fa-hard-hat',
        description: 'İnşaat ve yapı için gerekli malzemeler',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 4
    },
    {
        name: 'Aşındırıcı ve Kesici Uçlar',
        icon: 'fas fa-compact-disc',
        description: 'Taşlama diskleri, kesici uçlar ve aşındırıcılar',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 5
    },
    {
        name: 'Yapıştırıcı, Dolgu ve Kimyasallar',
        icon: 'fas fa-fill-drip',
        description: 'Silikon, yapıştırıcı, dolgu ve kimyasal ürünler',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 6
    },
    {
        name: 'Kaynak Malzemeleri',
        icon: 'fas fa-fire',
        description: 'Kaynak makineleri ve sarf malzemeleri',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 7
    },
    {
        name: 'Hırdavat ve El Aletleri',
        icon: 'fas fa-screwdriver',
        description: 'Genel hırdavat ürünleri ve el aletleri',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 8
    },
    {
        name: 'İş Güvenliği ve Çalışma Ekipmanları',
        icon: 'fas fa-hard-hat',
        description: 'İş güvenliği ekipmanları, koruyucu giysiler',
        isFeatured: true,
        showOnHomepage: true,
        sortOrder: 9
    }
];

async function seedCategories() {
    try {
        console.log('🔄 MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı!');

        let created = 0;
        let skipped = 0;

        for (const categoryData of categoriesData) {
            try {
                const exists = await Category.findOne({ name: categoryData.name });
                if (!exists) {
                    await Category.create(categoryData);
                    console.log(`✅ ${categoryData.name} eklendi`);
                    created++;
                } else {
                    console.log(`⏭️ ${categoryData.name} zaten mevcut`);
                    skipped++;
                }
            } catch (err) {
                console.log(`❌ ${categoryData.name} eklenemedi: ${err.message}`);
            }
        }

        console.log('\n=============================');
        console.log(`📊 Sonuç: ${created} kategori eklendi, ${skipped} kategori zaten mevcuttu`);
        console.log('=============================\n');

        await mongoose.disconnect();
        console.log('🔌 MongoDB bağlantısı kapatıldı');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

seedCategories();

