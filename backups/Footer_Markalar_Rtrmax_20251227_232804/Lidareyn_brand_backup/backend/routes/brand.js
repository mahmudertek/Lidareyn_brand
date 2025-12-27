const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { featured, distributor, homepage, active = 'true' } = req.query;

        let query = {};

        if (active === 'true') query.isActive = true;
        if (featured === 'true') query.isFeatured = true;
        if (distributor === 'true') query.isDistributor = true;
        if (homepage === 'true') query.showOnHomepage = true;

        const brands = await Brand.find(query).sort({ sortOrder: 1, name: 1 });

        res.json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Markalar getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }

        // Get products for this brand
        const products = await Product.find({
            brand: brand.name,
            isActive: true
        }).limit(20);

        res.json({
            success: true,
            data: {
                ...brand.toObject(),
                products
            }
        });
    } catch (error) {
        console.error('Get brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Marka getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Get brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
    try {
        const brand = await Brand.findOne({ slug: req.params.slug });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }

        // Get products for this brand
        const products = await Product.find({
            brand: brand.name,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                ...brand.toObject(),
                products,
                productCount: products.length
            }
        });
    } catch (error) {
        console.error('Get brand by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Marka getirilirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Create new brand
// @route   POST /api/brands
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const brand = await Brand.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Marka başarıyla oluşturuldu',
            data: brand
        });
    } catch (error) {
        console.error('Create brand error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Bu marka zaten mevcut'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Marka oluşturulurken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }

        brand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Marka başarıyla güncellendi',
            data: brand
        });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Marka güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }

        // Check if brand has products
        const productCount = await Product.countDocuments({ brand: brand.name });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Bu markaya ait ${productCount} ürün var. Önce ürünleri silin veya başka markaya taşıyın.`
            });
        }

        await brand.deleteOne();

        res.json({
            success: true,
            message: 'Marka başarıyla silindi'
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Marka silinirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Update product count for brand
// @route   PATCH /api/brands/:id/sync-count
// @access  Private/Admin
router.patch('/:id/sync-count', protect, authorize('admin'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }

        const count = await Product.countDocuments({ brand: brand.name, isActive: true });
        brand.productCount = count;
        await brand.save();

        res.json({
            success: true,
            message: 'Ürün sayısı güncellendi',
            data: { id: brand._id, productCount: count }
        });
    } catch (error) {
        console.error('Sync count error:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün sayısı güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// @desc    Seed initial brands
// @route   POST /api/brands/seed
// @access  Private/Admin
router.post('/seed', protect, authorize('admin'), async (req, res) => {
    try {
        const initialBrands = [
            { name: 'Beta', country: 'İtalya', themeColor: '#E30613', isFeatured: true },
            { name: 'Bosch', country: 'Almanya', themeColor: '#005691', isFeatured: true },
            { name: 'Makita', country: 'Japonya', themeColor: '#00A0B0', isFeatured: true },
            { name: 'Knipex', country: 'Almanya', themeColor: '#E31E24', isFeatured: true },
            { name: 'DEWALT', country: 'ABD', themeColor: '#FEBD17', isDistributor: true },
            { name: 'BLACK+DECKER', country: 'ABD', themeColor: '#FF6600', isDistributor: true },
            { name: 'WD-40', country: 'ABD', themeColor: '#003087' },
            { name: 'Fisco', country: 'İngiltere', themeColor: '#CC0000' },
            { name: 'Einhell', country: 'Almanya', themeColor: '#E30613' },
            { name: 'İzeltaş', country: 'Türkiye', themeColor: '#1E3A5F' },
            { name: 'Stanley', country: 'ABD', themeColor: '#FFD100' },
            { name: 'Gedore', country: 'Almanya', themeColor: '#0066B3' },
            { name: 'Metabo', country: 'Almanya', themeColor: '#00843D' },
            { name: 'Milwaukee', country: 'ABD', themeColor: '#DB0032' },
            { name: 'Kama', country: 'Türkiye', themeColor: '#2E4A62' },
            { name: 'Proxxon', country: 'Almanya', themeColor: '#005CA9' },
            { name: 'Karbosan', country: 'Türkiye', themeColor: '#E31937' },
            { name: 'Kristal', country: 'Türkiye', themeColor: '#0072BC' },
            { name: 'Osaka', country: 'Japonya', themeColor: '#C8102E' },
            { name: 'Gison', country: 'Tayvan', themeColor: '#ED1C24' }
        ];

        let created = 0;
        let skipped = 0;

        for (const brandData of initialBrands) {
            const exists = await Brand.findOne({ name: brandData.name });
            if (!exists) {
                await Brand.create(brandData);
                created++;
            } else {
                skipped++;
            }
        }

        res.json({
            success: true,
            message: `${created} marka oluşturuldu, ${skipped} marka zaten mevcuttu`,
            data: { created, skipped }
        });
    } catch (error) {
        console.error('Seed brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Markalar oluşturulurken hata oluştu',
            error: error.message
        });
    }
});

module.exports = router;
