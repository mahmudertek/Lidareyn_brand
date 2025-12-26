require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

async function createTestUser() {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: 'test@test.com' });

        if (existingUser) {
            console.log('⚠️  Test kullanıcı zaten mevcut!');
            console.log('📧 Email: test@test.com');
            console.log('🔑 Şifre: Test123456');

            // Update to verified if not already
            if (!existingUser.isVerified) {
                existingUser.isVerified = true;
                existingUser.verificationCode = undefined;
                existingUser.verificationCodeExpire = undefined;
                await existingUser.save();
                console.log('✅ Kullanıcı doğrulandı!');
            }

            process.exit(0);
        }

        // Create new test user
        const testUser = await User.create({
            name: 'Test Kullanıcı',
            email: 'test@test.com',
            password: 'Test123456',
            gender: 'other',
            isVerified: true // Skip email verification for test user
        });

        console.log('✅ Test kullanıcı başarıyla oluşturuldu!');
        console.log('📧 Email: test@test.com');
        console.log('🔑 Şifre: Test123456');
        console.log('');
        console.log('Şimdi bu bilgilerle giriş yapabilirsiniz!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

createTestUser();
