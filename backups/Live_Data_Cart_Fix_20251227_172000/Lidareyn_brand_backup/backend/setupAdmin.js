// Reset Admin Password Script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get the User collection directly
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Find and update admin user
        const result = await usersCollection.findOneAndUpdate(
            { email: 'admin@galatacarsi.com' },
            {
                $set: {
                    password: hashedPassword,
                    role: 'admin',
                    isVerified: true,
                    isActive: true
                }
            },
            { upsert: true, returnDocument: 'after' }
        );

        if (result) {
            console.log('✅ Admin password reset successfully!');
            console.log('   Email: admin@galatacarsi.com');
            console.log('   Password: admin123');
            console.log('   Role:', result.role);
            console.log('   isVerified:', result.isVerified);
        } else {
            // Create new admin if not exists
            const newAdmin = {
                name: 'Admin',
                email: 'admin@galatacarsi.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                isActive: true,
                createdAt: new Date()
            };
            await usersCollection.insertOne(newAdmin);
            console.log('✅ New admin user created!');
            console.log('   Email: admin@galatacarsi.com');
            console.log('   Password: admin123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetAdminPassword();
