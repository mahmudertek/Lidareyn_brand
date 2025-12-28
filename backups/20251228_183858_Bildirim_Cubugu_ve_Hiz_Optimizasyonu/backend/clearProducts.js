const mongoose = require('mongoose');
require('dotenv').config();

async function clearProducts() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ HATA: MONGODB_URI .env dosyasında bulunamadı!');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Bağlantısı Başarılı');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        const result = await productsCollection.deleteMany({});
        console.log(`🗑️  ${result.deletedCount} adet ürün veri tabanından kalıcı olarak silindi.`);

        console.log('✨ Artık admin paneliniz tertemiz! Kendi ürünlerinizi eklemeye başlayabilirsiniz.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata oluştu:', error);
        process.exit(1);
    }
}

clearProducts();
