const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config({ path: '.env' });

async function ensureSettings() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        let settings = await Settings.findOne();
        if (settings) {
            console.log('ℹ️ Settings document already exists.');
            console.log('   Current Mode:', settings.isMaintenanceMode ? 'MAINTENANCE (ON)' : 'ACTIVE (OFF)');
        } else {
            console.log('⚠️ No settings found. Creating default...');
            settings = await Settings.create({
                isMaintenanceMode: false,
                siteName: 'Galata Çarşı'
            });
            console.log('✅ Settings created successfully.');
        }

        // Force update to ensure it's writable
        // settings.updatedAt = new Date();
        // await settings.save();
        // console.log('✅ Settings document verified and writable.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

ensureSettings();
