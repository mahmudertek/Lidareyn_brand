const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Eğer veritabanında ayar yoksa varsayılan modda oluştur
            settings = await Settings.create({
                isMaintenanceMode: false,
                siteName: 'Galata Çarşı'
            });
        }
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        // Hata olsa bile 500 dönmesin, varsayılan kapalı ayar dönsün (Fail-safe)
        res.json({
            success: true,
            data: { isMaintenanceMode: false }
        });
    }
});

// @desc    Toggle maintenance mode (Requires Admin)
// @route   POST /api/settings/maintenance
router.post('/maintenance', protect, authorize('admin'), async (req, res) => {
    try {
        const { isMaintenanceMode } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isMaintenanceMode });
        } else {
            settings.isMaintenanceMode = isMaintenanceMode;
            await settings.save();
        }
        res.json({
            success: true,
            message: `Bakım modu ${isMaintenanceMode ? 'aktif edildi' : 'devre dışı bırakıldı'}`,
            data: settings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Toggle maintenance mode (Public - for emergency use when auth is broken)
// @route   POST /api/settings/maintenance-toggle
// @access  Secret key required
router.post('/maintenance-toggle', async (req, res) => {
    try {
        const { isMaintenanceMode, secretKey } = req.body;

        // Basit güvenlik - secret key kontrolü
        const MAINTENANCE_SECRET = process.env.MAINTENANCE_SECRET || 'galatacarsi2024-bakim-secret';
        if (secretKey !== MAINTENANCE_SECRET) {
            return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isMaintenanceMode });
        } else {
            settings.isMaintenanceMode = isMaintenanceMode;
            await settings.save();
        }
        res.json({
            success: true,
            message: `Bakım modu ${isMaintenanceMode ? 'aktif edildi' : 'devre dışı bırakıldı'}`,
            data: settings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

