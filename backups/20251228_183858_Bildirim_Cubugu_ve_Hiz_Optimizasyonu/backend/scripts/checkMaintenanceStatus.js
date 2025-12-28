const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config({ path: '.env' });

async function checkStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await Settings.findOne();
        console.log('STATUS_CHECK_RESULT:', settings ? settings.isMaintenanceMode : 'NO_SETTINGS');
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
}
checkStatus();
