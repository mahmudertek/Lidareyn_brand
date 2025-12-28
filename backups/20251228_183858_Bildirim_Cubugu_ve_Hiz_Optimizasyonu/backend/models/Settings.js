const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    isMaintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: 'Sitemiz şu anda bakımdadır. Lütfen daha sonra tekrar deneyiniz.'
    },
    siteName: {
        type: String,
        default: 'Galata Çarşı'
    },
    contactEmail: String,
    phoneNumber: String,
    address: String,
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        youtube: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
