const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim gereklidir'],
        trim: true,
        maxlength: [50, 'İsim 50 karakterden uzun olamaz']
    },
    email: {
        type: String,
        required: [true, 'E-posta gereklidir'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
    },
    password: {
        type: String,
        required: [true, 'Şifre gereklidir'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
        select: false // Don't return password by default
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false
    },
    verificationCodeExpire: {
        type: Date,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    addresses: [{
        title: String,
        fullName: String,
        phone: String,
        city: String,
        district: String,
        address: String,
        postalCode: String,
        isDefault: Boolean
    }],
    savedCards: [{
        cardNumber: String, // Encrypted
        cardHolder: String,
        expiryMonth: String,
        expiryYear: String,
        isDefault: Boolean
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    browsingHistory: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        },
        campaigns: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    // Silme Koruması - Kullanıcı asla silinmez, sadece devre dışı bırakılır
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: {
        type: Date
    },
    deactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deactivationReason: {
        type: String
    }
}, {
    timestamps: true
});

// ============================================
// SİLME KORUMASI - Kullanıcılar asla silinemez!
// ============================================

// Tek kullanıcı silme engeli
userSchema.pre('deleteOne', { document: true, query: false }, function (next) {
    const error = new Error('❌ HATA: Kullanıcı kayıtları silinemez! Bunun yerine devre dışı bırakın.');
    error.code = 'DELETE_PROTECTED';
    next(error);
});

// Çoklu kullanıcı silme engeli
userSchema.pre('deleteMany', function (next) {
    const error = new Error('❌ HATA: Kullanıcı kayıtları toplu silinemez! Bunun yerine devre dışı bırakın.');
    error.code = 'DELETE_PROTECTED';
    next(error);
});

// findOneAndDelete engeli
userSchema.pre('findOneAndDelete', function (next) {
    const error = new Error('❌ HATA: Kullanıcı kayıtları silinemez! Bunun yerine devre dışı bırakın.');
    error.code = 'DELETE_PROTECTED';
    next(error);
});

// findByIdAndDelete engeli
userSchema.pre('findByIdAndDelete', function (next) {
    const error = new Error('❌ HATA: Kullanıcı kayıtları silinemez! Bunun yerine devre dışı bırakın.');
    error.code = 'DELETE_PROTECTED';
    next(error);
});

// Kullanıcıyı devre dışı bırakma metodu (silme yerine bu kullanılacak)
userSchema.methods.deactivate = async function (adminId, reason) {
    this.isActive = false;
    this.deactivatedAt = new Date();
    this.deactivatedBy = adminId;
    this.deactivationReason = reason || 'Admin tarafından devre dışı bırakıldı';
    await this.save();
    return this;
};

// Kullanıcıyı yeniden aktifleştirme metodu
userSchema.methods.reactivate = async function () {
    this.isActive = true;
    this.deactivatedAt = undefined;
    this.deactivatedBy = undefined;
    this.deactivationReason = undefined;
    await this.save();
    return this;
};

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate Verification Code
userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.verificationCode = code;
    this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return code;
};

module.exports = mongoose.model('User', userSchema);
