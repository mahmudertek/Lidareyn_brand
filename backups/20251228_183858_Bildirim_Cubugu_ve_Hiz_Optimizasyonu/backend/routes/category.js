const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { active, parent, limit = 50 } = req.query;

        let query = {};
        if (active !== undefined) {
            query.isActive = active === 'true';
        }
        if (parent) {
            query.parent = parent;
        }

        const categories = await Category.find(query)
            .sort({ order: 1, name: 1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler alınırken hata oluştu',
            error: error.message
        });
    }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori alınırken hata oluştu',
            error: error.message
        });
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Admin
router.post('/', auth.protect, async (req, res) => {
    try {
        const { name, slug, description, icon, parent, order, isActive } = req.body;

        // Check if slug exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Bu slug zaten kullanılıyor'
            });
        }

        const category = new Category({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description,
            icon,
            parent,
            order: order || 0,
            isActive: isActive !== false
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Kategori başarıyla oluşturuldu',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori oluşturulurken hata oluştu',
            error: error.message
        });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Admin
router.put('/:id', auth.protect, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Kategori güncellendi',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Admin
router.delete('/:id', auth.protect, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Kategori silindi'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori silinirken hata oluştu',
            error: error.message
        });
    }
});

module.exports = router;
