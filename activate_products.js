const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Product = require('./backend/models/Product');

async function activateAllProducts() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        console.log('🔄 Activating all products...');
        const result = await Product.updateMany(
            { isActive: { $ne: true } },
            { $set: { isActive: true } }
        );

        console.log(`✅ Success! Updated ${result.modifiedCount} products.`);
        console.log(`Total products in DB: ${await Product.countDocuments()}`);

        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB.');
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
}

activateAllProducts();
