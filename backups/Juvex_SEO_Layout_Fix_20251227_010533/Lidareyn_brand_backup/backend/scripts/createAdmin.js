// Admin kullanıcısı oluşturma script'i
// Kullanım: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@galatacarsi.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GalataAdmin2024!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function createAdmin() {
    try {
        // MongoDB bağlantısı
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB bağlandı');

        // Admin zaten var mı kontrol et
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('⚠️ Admin kullanıcısı zaten mevcut:', ADMIN_EMAIL);

            // Role'ü admin değilse güncelle
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Kullanıcı role\'ü admin olarak güncellendi');
            }

            // Şifre ile giriş yapılabilir mi test et
            const isMatch = await existingAdmin.matchPassword(ADMIN_PASSWORD);
            console.log('🔑 Şifre doğrulama:', isMatch ? 'Başarılı' : 'Başarısız');

            if (!isMatch) {
                console.log('📝 Şifreyi sıfırlıyorum...');
                existingAdmin.password = ADMIN_PASSWORD;
                await existingAdmin.save();
                console.log('✅ Şifre güncellendi');
            }
        } else {
            // Yeni admin oluştur
            const admin = await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
                isEmailVerified: true
            });

            console.log('✅ Admin kullanıcısı oluşturuldu!');
            console.log('📧 Email:', ADMIN_EMAIL);
            console.log('🔑 Şifre:', ADMIN_PASSWORD);
        }

        await mongoose.disconnect();
        console.log('✅ Bağlantı kapatıldı');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

createAdmin();
