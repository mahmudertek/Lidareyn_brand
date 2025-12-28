const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        image: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: Number
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        postalCode: String
    },
    billingAddress: {
        fullName: String,
        phone: String,
        city: String,
        district: String,
        address: String,
        postalCode: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery']
    },
    paymentInfo: {
        cardLastFour: String,
        cardBrand: String,
        transactionId: String
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        shipping: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: [
            'pending',           // Beklemede
            'confirmed',         // Onaylandı
            'processing',        // Hazırlanıyor
            'shipped',           // Kargoya Verildi
            'in_transit',        // Yolda
            'delivered',         // Teslim Edildi
            'cancelled',         // İptal Edildi
            'returned',          // İade Edildi
            'refunded'           // Para İadesi Yapıldı
        ],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tracking: {
        company: String,
        trackingNumber: String,
        url: String
    },
    notes: {
        customer: String,
        admin: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    returnedAt: Date,
    returnReason: String,
    refundedAt: Date,
    refundAmount: Number
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `KT${year}${month}${day}${random}`;
    }
    next();
});

// Update status history
orderSchema.methods.updateStatus = function (newStatus, note = '') {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        note: note,
        updatedAt: new Date()
    });

    // Update delivery/payment status
    if (newStatus === 'delivered') {
        this.isDelivered = true;
        this.deliveredAt = new Date();
    }
    if (newStatus === 'cancelled') {
        this.cancelledAt = new Date();
    }
    if (newStatus === 'returned') {
        this.returnedAt = new Date();
    }
};

module.exports = mongoose.model('Order', orderSchema);
