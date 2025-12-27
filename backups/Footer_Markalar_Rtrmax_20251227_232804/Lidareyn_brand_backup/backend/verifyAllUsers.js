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

async function verifyAllUsers() {
    try {
        // Find all unverified users
        const unverifiedUsers = await User.find({ isVerified: false });

        if (unverifiedUsers.length === 0) {
            console.log('✅ Tüm kullanıcılar zaten doğrulanmış!');

            // Show all users
            const allUsers = await User.find({}).select('name email isVerified');
            console.log('\n📋 Kayıtlı Kullanıcılar:');
            allUsers.forEach(user => {
                console.log(`  - ${user.email} (${user.name}) - Doğrulanmış: ${user.isVerified ? '✅' : '❌'}`);
            });

            process.exit(0);
        }

        console.log(`⚠️  ${unverifiedUsers.length} doğrulanmamış kullanıcı bulundu.\n`);

        // Verify all users
        for (const user of unverifiedUsers) {
            user.isVerified = true;
            user.verificationCode = undefined;
            user.verificationCodeExpire = undefined;
            await user.save();
            console.log(`✅ ${user.email} doğrulandı!`);
        }

        console.log(`\n✅ Toplam ${unverifiedUsers.length} kullanıcı doğrulandı!`);
        console.log('\nŞimdi tüm hesaplarla giriş yapabilirsiniz.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

verifyAllUsers();
