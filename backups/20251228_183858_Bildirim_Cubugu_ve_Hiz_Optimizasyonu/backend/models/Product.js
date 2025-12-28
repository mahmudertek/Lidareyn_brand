const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı gereklidir'],
        trim: true,
        maxlength: [200, 'Ürün adı 200 karakterden uzun olamaz']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Ürün açıklaması gereklidir']
    },
    price: {
        type: Number,
        required: [true, 'Fiyat gereklidir'],
        min: [0, 'Fiyat negatif olamaz']
    },
    discountPrice: {
        type: Number,
        min: [0, 'İndirimli fiyat negatif olamaz']
    },
    category: {
        type: String,
        required: [true, 'Kategori gereklidir'],
        enum: [
            'Elektrikli El Aletleri',
            'Ölçme & Kontrol Aletleri',
            'El Aletleri',
            'Yapı ve İnşaat Malzemeleri',
            'Aşındırıcı ve Kesici Uçlar',
            'Yapıştırıcı, Dolgu ve Kimyasallar',
            'Kaynak Malzemeleri',
            'Hırdavat ve El Aletleri',
            'İş Güvenliği ve Çalışma Ekipmanları'
        ]
    },
    brand: {
        type: String,
        trim: true
    },
    images: [{
        url: String,
        alt: String
    }],
    mainImage: {
        type: String,
        required: [true, 'Ana görsel gereklidir']
    },
    stock: {
        type: Number,
        required: [true, 'Stok bilgisi gereklidir'],
        min: [0, 'Stok negatif olamaz'],
        default: 0
    },
    sku: {
        type: String,
        unique: true
    },
    specifications: {
        type: Map,
        of: String
    },
    tags: [String],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Update rating average
productSchema.methods.updateRating = function () {
    if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating.average = sum / this.reviews.length;
        this.rating.count = this.reviews.length;
    } else {
        this.rating.average = 0;
        this.rating.count = 0;
    }
};

module.exports = mongoose.model('Product', productSchema);
