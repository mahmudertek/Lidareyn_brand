const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const ProductSchema = new mongoose.Schema({
    name: String,
    isActive: Boolean,
    isNew: Boolean,
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function checkRecentProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully.');

        console.log('\nFetching last 5 products added to the database:');
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        if (products.length === 0) {
            console.log('No products found in the database.');
        } else {
            products.forEach((p, idx) => {
                console.log(`${idx + 1}. Name: ${p.name}`);
                console.log(`   ID: ${p._id}`);
                console.log(`   isActive: ${p.isActive}`);
                console.log(`   isNew: ${p.isNew}`);
                console.log(`   createdAt: ${p.createdAt}`);
                console.log('-------------------');
            });
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRecentProducts();
