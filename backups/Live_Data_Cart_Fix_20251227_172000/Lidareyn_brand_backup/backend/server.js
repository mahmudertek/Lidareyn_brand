const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Models
const Settings = require('./models/Settings');

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const brandRoutes = require('./routes/brand');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const sipayRoutes = require('./routes/sipay');
const cargoRoutes = require('./routes/cargo');
const emailRoutes = require('./routes/email');
const categoryRoutes = require('./routes/category');
const settingsRoutes = require('./routes/settings');

const app = express();

// CORS - Tüm isteklere izin ver
app.use(cors({
    origin: true,
    credentials: true
}));

// Body Parser - BÜYÜK GÖRSELLER İÇİN LİMİT ARTIRILDI
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sipay', sipayRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: err.message });
});

// MongoDB Connection - GELİŞTİRİLMİŞ BAĞLANTI SEÇENEKLERİ
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,  // 30 saniye timeout
    socketTimeoutMS: 45000,           // 45 saniye socket timeout
    maxPoolSize: 10,                  // Bağlantı havuzu
    retryWrites: true,
    w: 'majority'
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

