const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Marka adı gereklidir'],
        unique: true,
        trim: true,
        maxlength: [100, 'Marka adı 100 karakterden uzun olamaz']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Açıklama 1000 karakterden uzun olamaz']
    },
    logo: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    themeColor: {
        type: String,
        default: '#6366f1'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isDistributor: {
        type: Boolean,
        default: false
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },
    productCount: {
        type: Number,
        default: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from name
brandSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9ğüşıöç]+/g, '-')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for products
brandSchema.virtual('products', {
    ref: 'Product',
    localField: 'name',
    foreignField: 'brand',
    justOne: false
});

module.exports = mongoose.model('Brand', brandSchema);
