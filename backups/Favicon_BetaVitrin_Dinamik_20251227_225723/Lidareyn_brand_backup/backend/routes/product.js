const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 20,
            featured,
            isNew
        } = req.query;

        // Build query
        let query = { isActive: true };

        // Category filter
        if (category) {
            query.category = category;
        }

        // Brand filter
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }

        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // New products filter
        if (isNew === 'true') {
            query.isNew = true;
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price-asc') sortOption = { price: 1 };
        if (sort === 'price-desc') sortOption = { price: -1 };
        if (sort === 'popular') sortOption = { soldCount: -1 };
        if (sort === 'rating') sortOption = { 'rating.average': -1 };

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Ürünler getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        // Increment view count
        product.viewCount += 1;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Get products by brand
// @route   GET /api/products/brand/:brandName
// @access  Public
router.get('/brand/:brandName', async (req, res) => {
    try {
        const products = await Product.find({
            brand: { $regex: req.params.brandName, $options: 'i' },
            isActive: true
        }).sort({ soldCount: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get brand products error:', error);
        res.status(500).json({
            success: false,
            message: 'Marka ürünleri getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Add creator
        req.body.createdBy = req.user.id;

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla oluşturuldu',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Bu SKU veya slug zaten kullanılıyor'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Ürün oluşturulurken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Ürün başarıyla güncellendi',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        // Soft delete - just mark as inactive
        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: 'Ürün başarıyla silindi'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün silinirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Update stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
router.patch('/:id/stock', protect, authorize('admin'), async (req, res) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli stok değeri giriniz'
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Stok güncellendi',
            data: { id: product._id, stock: product.stock }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Stok güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Get product stats (for admin dashboard)
// @route   GET /api/products/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const outOfStock = await Product.countDocuments({ stock: 0, isActive: true });
        const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 10 }, isActive: true });
        const featured = await Product.countDocuments({ isFeatured: true, isActive: true });

        // Products by category
        const byCategory = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Products by brand
        const byBrand = await Product.aggregate([
            { $match: { isActive: true, brand: { $exists: true, $ne: '' } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                outOfStock,
                lowStock,
                featured,
                byCategory,
                byBrand
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler getirilirken hata oluştu',
            error: error.message
        });
    }
});

module.exports = router;
