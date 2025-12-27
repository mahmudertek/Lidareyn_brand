// Seed 20 Brands to MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

// Brand Schema (inline)
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    logo: { type: String, default: '' },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    themeColor: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isDistributor: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

brandSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

// 20 Brands Data
const brandsData = [
    { name: 'Beta', country: 'İtalya', themeColor: '#E30613', isFeatured: true, description: 'İtalyan profesyonel el aletleri markası' },
    { name: 'Bosch', country: 'Almanya', themeColor: '#005691', isFeatured: true, description: 'Alman mühendislik kalitesi' },
    { name: 'Makita', country: 'Japonya', themeColor: '#00A0B0', isFeatured: true, description: 'Japon güç aletleri üreticisi' },
    { name: 'Knipex', country: 'Almanya', themeColor: '#E31E24', isFeatured: true, description: 'Profesyonel pense ve kesici aletler' },
    { name: 'DEWALT', country: 'ABD', themeColor: '#FEBD17', isDistributor: true, description: 'Profesyonel güç aletleri' },
    { name: 'BLACK+DECKER', country: 'ABD', themeColor: '#FF6600', isDistributor: true, description: 'Ev tipi ve profesyonel aletler' },
    { name: 'WD-40', country: 'ABD', themeColor: '#003087', description: 'Çok amaçlı yağlayıcı ve koruyucu' },
    { name: 'Fisco', country: 'İngiltere', themeColor: '#CC0000', description: 'Profesyonel ölçüm aletleri' },
    { name: 'Einhell', country: 'Almanya', themeColor: '#E30613', description: 'Uygun fiyatlı güç aletleri' },
    { name: 'İzeltaş', country: 'Türkiye', themeColor: '#1E3A5F', description: 'Yerli el aletleri üreticisi' },
    { name: 'Stanley', country: 'ABD', themeColor: '#FFD100', description: 'El aletleri ve ölçüm cihazları' },
    { name: 'Gedore', country: 'Almanya', themeColor: '#0066B3', description: 'Endüstriyel el aletleri' },
    { name: 'Metabo', country: 'Almanya', themeColor: '#00843D', description: 'Profesyonel elektrikli aletler' },
    { name: 'Milwaukee', country: 'ABD', themeColor: '#DB0032', description: 'Ağır hizmet güç aletleri' },
    { name: 'Kama', country: 'Türkiye', themeColor: '#2E4A62', description: 'Yerli üretim el aletleri' },
    { name: 'Proxxon', country: 'Almanya', themeColor: '#005CA9', description: 'Hassas işleme aletleri' },
    { name: 'Karbosan', country: 'Türkiye', themeColor: '#E31937', description: 'Kesici ve aşındırıcı diskler' },
    { name: 'Kristal', country: 'Türkiye', themeColor: '#0072BC', description: 'Türk aşındırıcı üreticisi' },
    { name: 'Osaka', country: 'Japonya', themeColor: '#C8102E', description: 'Japon kalitesi aletler' },
    { name: 'Gison', country: 'Tayvan', themeColor: '#ED1C24', description: 'Pnömatik el aletleri' }
];

async function seedBrands() {
    try {
        console.log('🔄 MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı!');

        let created = 0;
        let skipped = 0;

        for (const brandData of brandsData) {
            try {
                const exists = await Brand.findOne({ name: brandData.name });
                if (!exists) {
                    await Brand.create(brandData);
                    console.log(`✅ ${brandData.name} eklendi`);
                    created++;
                } else {
                    console.log(`⏭️ ${brandData.name} zaten mevcut`);
                    skipped++;
                }
            } catch (err) {
                console.log(`❌ ${brandData.name} eklenemedi: ${err.message}`);
            }
        }

        console.log('\n=============================');
        console.log(`📊 Sonuç: ${created} marka eklendi, ${skipped} marka zaten mevcuttu`);
        console.log('=============================\n');

        await mongoose.disconnect();
        console.log('🔌 MongoDB bağlantısı kapatıldı');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

seedBrands();
