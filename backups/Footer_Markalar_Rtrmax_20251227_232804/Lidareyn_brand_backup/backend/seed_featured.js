
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Brand = require('./models/Brand');
const Category = require('./models/Category');
require('dotenv').config();

const products = [
    { id: 1, name: 'Bosch GSB 18V-55 Akülü Darbeli Matkap', price: 7899.00, brand: 'Bosch', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/005691/ffffff?text=Bosch+GSB+18V-55', isFeatured: true, badge: 'Çok Satan' },
    { id: 2, name: 'Makita DTD172 18V Darbe Vidalama', price: 5999.00, brand: 'Makita', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/00A0B0/ffffff?text=Makita+DTD172', isFeatured: true, badge: 'Yeni' },
    { id: 3, name: 'Knipex Cobra 87 01 250 Su Pompa Pense', price: 1899.00, brand: 'Knipex', category: 'El Aletleri', image: 'https://placehold.co/600x600/E31E24/ffffff?text=Knipex+Cobra', isFeatured: true, badge: '' },
    { id: 4, name: 'Beta 666N/30 Tork Anahtarı 40-200Nm', price: 5499.00, brand: 'Beta', category: 'El Aletleri', image: 'https://placehold.co/600x600/E30613/ffffff?text=Beta+666N', isFeatured: true, badge: 'Premium' },
    { id: 5, name: 'Bosch GWS 18V-10 Akülü Avuç Taşlama', price: 6499.00, brand: 'Bosch', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/005691/ffffff?text=Bosch+GWS+18V-10', isFeatured: true, badge: '' },
    { id: 6, name: 'Makita DHS680 18V Daire Testere', price: 8499.00, brand: 'Makita', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/00A0B0/ffffff?text=Makita+DHS680', isFeatured: true, badge: 'Yeni' },
    { id: 7, name: 'Knipex 70 06 160 Yan Keski', price: 899.00, brand: 'Knipex', category: 'El Aletleri', image: 'https://placehold.co/600x600/E31E24/ffffff?text=Knipex+70+06+160', isFeatured: true, badge: '' },
    { id: 8, name: 'Beta 903E/C98 Profesyonel Lokma Seti', price: 4299.00, brand: 'Beta', category: 'El Aletleri', image: 'https://placehold.co/600x600/E30613/ffffff?text=Beta+903E', isFeatured: true, badge: 'Çok Satan' },
    { id: 9, name: 'Bosch GLL 3-80 Profesyonel Lazer', price: 9299.00, brand: 'Bosch', category: 'Ölçme & Kontrol Aletleri', image: 'https://placehold.co/600x600/005691/ffffff?text=Bosch+GLL+3-80', isFeatured: true, badge: 'Premium' },
    { id: 10, name: 'Makita DUB184 Akülü Yaprak Üfleyici', price: 4299.00, brand: 'Makita', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/00A0B0/ffffff?text=Makita+DUB184', isFeatured: true, badge: '' },
    { id: 11, name: 'Knipex 86 05 250 Pliers Wrench', price: 2499.00, brand: 'Knipex', category: 'El Aletleri', image: 'https://placehold.co/600x600/E31E24/ffffff?text=Knipex+86+05+250', isFeatured: true, badge: 'Premium' },
    { id: 12, name: 'Beta C24S/8 8 Çekmeceli Alet Dolabı', price: 28999.00, brand: 'Beta', category: 'Hırdavat ve El Aletleri', image: 'https://placehold.co/600x600/E30613/ffffff?text=Beta+C24S', isFeatured: true, badge: 'Özel' },
    { id: 13, name: 'Milwaukee M18 FPD2 Darbeli Matkap', price: 9999.00, brand: 'Milwaukee', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/000000/ffffff?text=Milwaukee+M18', isFeatured: true, badge: 'Yeni' },
    { id: 14, name: 'DeWalt DCD796 Akülü Matkap Set', price: 6799.00, brand: 'DeWalt', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/FEBD17/000000?text=DeWalt+DCD796', isFeatured: true, badge: '' },
    { id: 15, name: 'Stanley FATMAX Alet Çantası 200 Parça', price: 3499.00, brand: 'Stanley', category: 'Hırdavat ve El Aletleri', image: 'https://placehold.co/600x600/000000/FEBD17?text=Stanley+200+Parca', isFeatured: true, badge: 'Çok Satan' },
    { id: 16, name: 'Einhell TC-CD 18/35 Li Akülü Matkap', price: 2199.00, brand: 'Einhell', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/600x600/CC0000/ffffff?text=Einhell+TC-CD', isFeatured: true, badge: '' },
    { id: 17, name: 'Fisco 3m Profesyonel Şerit Metre', price: 299.00, brand: 'Fisco', category: 'Ölçme & Kontrol Aletleri', image: 'https://placehold.co/600x600/000000/ffffff?text=Fisco+3m', isFeatured: true, badge: '' },
    { id: 18, name: 'WD-40 Çok Amaçlı 400ml Sprey', price: 149.00, brand: 'WD-40', category: 'Yapıştırıcı, Dolgu ve Kimyasallar', image: 'https://placehold.co/600x600/004085/ffffff?text=WD-40+400ml', isFeatured: true, badge: '' },
    { id: 19, name: 'ASKA Pro 20V Akülü Matkap Set', price: 3299.00, brand: 'ASKA', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=ASKA+Matkap', isFeatured: true, badge: 'Özel Üretim' },
    { id: 20, name: 'Madeniyat Pro 18V Darbeli Matkap', price: 2799.00, brand: 'Madeniyat', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/300x200/D4AF37/1a1a1a?text=Madeniyat+Matkap', isFeatured: true, badge: 'Çok Satan' },
    { id: 21, name: 'Izeltaş 10mm Kombinasyon Anahtar', price: 189.00, brand: 'Izeltaş', category: 'El Aletleri', image: 'https://placehold.co/300x200/a29bfe/ffffff?text=Izeltas+Anahtar', isFeatured: true, badge: '' },
    { id: 22, name: 'Black+Decker BDCDD12 10.8V Matkap', price: 1599.00, brand: 'Black+Decker', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/300x200/74b9ff/ffffff?text=BlackDecker', isFeatured: true, badge: '' },
    { id: 23, name: 'Einhell TE-AG 125/750 Avuç Taşlama', price: 1299.00, brand: 'Einhell', category: 'Elektrikli El Aletleri', image: 'https://placehold.co/300x200/9b8fd8/ffffff?text=Einhell+Taslama', isFeatured: true, badge: '' },
    { id: 24, name: 'ASKA Premium Alet Çantası 150 Parça', price: 4499.00, brand: 'ASKA', category: 'Hırdavat ve El Aletleri', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=ASKA+Set', isFeatured: true, badge: 'Premium' }
];

async function seedFeaturedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const p of products) {
            const existing = await Product.findOne({ name: p.name });
            if (!existing) {
                await Product.create({
                    name: p.name,
                    description: p.name + ' - Profesyonel kullanım için ideal.',
                    price: p.price,
                    category: p.category,
                    brand: p.brand,
                    mainImage: p.image,
                    stock: 50,
                    isActive: true,
                    isFeatured: true,
                    isNew: p.badge === 'Yeni',
                    tags: p.badge ? [p.badge] : []
                });
                console.log(`Created: ${p.name}`);
            } else {
                existing.isFeatured = true;
                await existing.save();
                console.log(`Updated (Featured): ${p.name}`);
            }
        }

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
}

seedFeaturedProducts();
