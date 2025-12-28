// Seed Products Script - Hırdavat Ürünleri
// Bu scripti çalıştırarak veritabanına örnek ürünler ekleyebilirsiniz
// node seedProducts.js

const mongoose = require('mongoose');
require('dotenv').config();

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Drop problematic index if exists
        try {
            await productsCollection.dropIndex('sku_1');
            console.log('🔧 SKU index dropped');
        } catch (e) {
            // Index might not exist, that's OK
        }

        // Örnek hırdavat ürünleri
        const products = [
            // BOSCH Ürünleri
            {
                name: 'Bosch GSB 18V-55 Akülü Darbeli Matkap',
                slug: 'bosch-gsb-18v-55-akulu-darbeli-matkap',
                brand: 'Bosch',
                category: 'Elektrikli El Aletleri',
                price: 7899,
                stock: 45,
                description: 'Profesyonel kullanım için yüksek performanslı akülü darbeli matkap. 55 Nm tork gücü.',
                mainImage: 'https://placehold.co/400x400/005691/fff?text=Bosch+Matkap',
                isActive: true,
                isFeatured: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                name: 'Bosch GWS 750-125 Avuç Taşlama',
                slug: 'bosch-gws-750-125-avuc-taslama',
                brand: 'Bosch',
                category: 'Elektrikli El Aletleri',
                price: 2499,
                stock: 30,
                description: '750W güç, 125mm disk çapı. Profesyonel taşlama ve kesme işlemleri için.',
                mainImage: 'https://placehold.co/400x400/005691/fff?text=Bosch+Taslama',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },

            // MAKITA Ürünleri
            {
                name: 'Makita DTD172 18V Darbe Vidalama',
                slug: 'makita-dtd172-18v-darbe-vidalama',
                brand: 'Makita',
                category: 'Elektrikli El Aletleri',
                price: 5999,
                stock: 28,
                description: 'Fırçasız motor teknolojisi ile uzun ömür. 180 Nm tork gücü.',
                mainImage: 'https://placehold.co/400x400/00A0B0/fff?text=Makita+Vidalama',
                isActive: true,
                isFeatured: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                name: 'Makita DHS680 18V Daire Testere',
                slug: 'makita-dhs680-18v-daire-testere',
                brand: 'Makita',
                category: 'Elektrikli El Aletleri',
                price: 8499,
                stock: 15,
                description: '165mm bıçak çapı, 57mm kesme derinliği. Ahşap kesim için ideal.',
                mainImage: 'https://placehold.co/400x400/00A0B0/fff?text=Makita+Testere',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },

            // BETA Ürünleri
            {
                name: 'Beta 666N/30 Tork Anahtarı',
                slug: 'beta-666n-30-tork-anahtari',
                brand: 'Beta',
                category: 'El Aletleri',
                price: 5499,
                stock: 12,
                description: 'Profesyonel tork anahtarı, 6-30 Nm aralığı. İtalyan kalitesi.',
                mainImage: 'https://placehold.co/400x400/E30613/fff?text=Beta+Tork',
                isActive: true,
                isFeatured: true,
                isNew: false,
                createdAt: new Date()
            },
            {
                name: 'Beta 42AS 12 Parça Kombine Anahtar Seti',
                slug: 'beta-42as-12-parca-kombine-anahtar-seti',
                brand: 'Beta',
                category: 'El Aletleri',
                price: 4299,
                stock: 20,
                description: '8-22mm arası 12 parça kombine anahtar seti. Krom-vanadyum çelik.',
                mainImage: 'https://placehold.co/400x400/E30613/fff?text=Beta+Anahtar',
                isActive: true,
                isFeatured: false,
                isNew: true,
                createdAt: new Date()
            },

            // KNIPEX Ürünleri
            {
                name: 'Knipex Cobra 87 01 250 Su Pompa Pense',
                slug: 'knipex-cobra-87-01-250-su-pompa-pense',
                brand: 'Knipex',
                category: 'El Aletleri',
                price: 1899,
                stock: 35,
                description: 'Aşırı kavrama kapasiteli su pompa pensesi. 250mm uzunluk.',
                mainImage: 'https://placehold.co/400x400/E31E24/fff?text=Knipex+Cobra',
                isActive: true,
                isFeatured: true,
                isNew: false,
                createdAt: new Date()
            },
            {
                name: 'Knipex 70 06 160 Yan Keski',
                slug: 'knipex-70-06-160-yan-keski',
                brand: 'Knipex',
                category: 'El Aletleri',
                price: 899,
                stock: 50,
                description: 'Yüksek kaldıraçlı yan keski. 160mm. Sert tel kesimi için ideal.',
                mainImage: 'https://placehold.co/400x400/E31E24/fff?text=Knipex+Keski',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },

            // DEWALT Ürünleri
            {
                name: 'DEWALT DCD791 20V MAX Matkap',
                slug: 'dewalt-dcd791-20v-max-matkap',
                brand: 'DEWALT',
                category: 'Elektrikli El Aletleri',
                price: 4599,
                stock: 33,
                description: 'Kompakt ve hafif tasarım. Brushless motor teknolojisi.',
                mainImage: 'https://placehold.co/400x400/FEBD17/000?text=DEWALT+Matkap',
                isActive: true,
                isFeatured: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                name: 'DEWALT DCF899 20V MAX Somun Sıkma',
                slug: 'dewalt-dcf899-20v-max-somun-sikma',
                brand: 'DEWALT',
                category: 'Elektrikli El Aletleri',
                price: 6499,
                stock: 18,
                description: '1900 Nm çevirme torku. Lastik değişimi için ideal.',
                mainImage: 'https://placehold.co/400x400/FEBD17/000?text=DEWALT+Somun',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },

            // Stanley Ürünleri
            {
                name: 'Stanley FatMax 5m Şerit Metre',
                slug: 'stanley-fatmax-5m-serit-metre',
                brand: 'Stanley',
                category: 'Ölçme & Kontrol Aletleri',
                price: 299,
                stock: 100,
                description: 'BladeArmor kaplama, manyetik uç. 5 metre uzunluk.',
                mainImage: 'https://placehold.co/400x400/FFD100/000?text=Stanley+Metre',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },
            {
                name: 'Stanley 65 Parça Tornavida Seti',
                slug: 'stanley-65-parca-tornavida-seti',
                brand: 'Stanley',
                category: 'El Aletleri',
                price: 599,
                stock: 60,
                description: 'Profesyonel tornavida ve uç seti. Çantalı.',
                mainImage: 'https://placehold.co/400x400/FFD100/000?text=Stanley+Set',
                isActive: true,
                isFeatured: true,
                isNew: true,
                createdAt: new Date()
            },

            // WD-40 Ürünleri
            {
                name: 'WD-40 Çok Amaçlı Pas Sökücü 400ml',
                slug: 'wd-40-cok-amacli-pas-sokucu-400ml',
                brand: 'WD-40',
                category: 'Yapıştırıcı, Dolgu ve Kimyasallar',
                price: 189,
                stock: 200,
                description: 'Pas söker, yağlar, nem giderir, temizler ve korur.',
                mainImage: 'https://placehold.co/400x400/0054A4/fff?text=WD-40',
                isActive: true,
                isFeatured: true,
                isNew: false,
                createdAt: new Date()
            },

            // Karbosan Ürünleri
            {
                name: 'Karbosan 115mm Kesme Diski (10lu Paket)',
                slug: 'karbosan-115mm-kesme-diski-10lu',
                brand: 'Karbosan',
                category: 'Aşındırıcı ve Kesici Uçlar',
                price: 149,
                stock: 500,
                description: 'Metal kesme diski. 115x1x22mm. A60 Extra kalite.',
                mainImage: 'https://placehold.co/400x400/CC0000/fff?text=Karbosan+Disk',
                isActive: true,
                isFeatured: false,
                isNew: false,
                createdAt: new Date()
            },

            // Einhell Ürünleri
            {
                name: 'Einhell TE-CD 18/50 Li BL Akülü Matkap',
                slug: 'einhell-te-cd-18-50-li-bl-akulu-matkap',
                brand: 'Einhell',
                category: 'Elektrikli El Aletleri',
                price: 3299,
                stock: 25,
                description: 'Power X-Change serisi. Brushless motor, 50 Nm tork.',
                mainImage: 'https://placehold.co/400x400/CC0000/fff?text=Einhell+Matkap',
                isActive: true,
                isFeatured: false,
                isNew: true,
                createdAt: new Date()
            },

            // Milwaukee Ürünleri
            {
                name: 'Milwaukee M18 FUEL Darbeli Matkap',
                slug: 'milwaukee-m18-fuel-darbeli-matkap',
                brand: 'Milwaukee',
                category: 'Elektrikli El Aletleri',
                price: 9999,
                stock: 10,
                description: 'POWERSTATE brushless motor. REDLINK PLUS akıllı sistem.',
                mainImage: 'https://placehold.co/400x400/DB0032/fff?text=Milwaukee+M18',
                isActive: true,
                isFeatured: true,
                isNew: true,
                createdAt: new Date()
            }
        ];

        // Clear existing products (optional)
        await productsCollection.deleteMany({});
        console.log('🗑️  Existing products cleared');

        // Insert new products
        const result = await productsCollection.insertMany(products);
        console.log(`✅ ${result.insertedCount} products added to database!`);

        // List added products
        console.log('\n📦 Added Products:');
        products.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.brand} - ${p.name} (₺${p.price})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedProducts();
