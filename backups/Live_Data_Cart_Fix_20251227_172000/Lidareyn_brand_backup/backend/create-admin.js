// Admin kullanıcısı oluşturma scripti
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'customer' },
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlandı');

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Kask12121O', salt);

        // Admin kullanıcısını oluştur veya güncelle
        const admin = await User.findOneAndUpdate(
            { email: 'mahmudertek@gmail.com' },
            {
                name: 'Admin',
                email: 'mahmudertek@gmail.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            },
            { upsert: true, new: true }
        );

        console.log('✅ Admin kullanıcısı oluşturuldu/güncellendi:', admin.email);
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

createAdmin();
