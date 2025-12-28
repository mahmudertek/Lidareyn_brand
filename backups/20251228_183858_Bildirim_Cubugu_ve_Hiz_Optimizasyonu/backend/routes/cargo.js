const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const cargoController = require('../controllers/cargoController');

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/cargo/providers
// @desc    Get available cargo providers
// @access  Public
router.get('/providers', cargoController.getProviders);

// @route   POST /api/cargo/calculate
// @desc    Calculate shipping cost
// @access  Public
router.post('/calculate',
    [
        body('provider').optional().isString(),
        body('weight').optional().isNumeric(),
        body('width').optional().isNumeric(),
        body('height').optional().isNumeric(),
        body('depth').optional().isNumeric(),
        body('orderTotal').optional().isNumeric()
    ],
    cargoController.calculateShipping
);

// @route   GET /api/cargo/track/:trackingNumber
// @desc    Track shipment
// @access  Public
router.get('/track/:trackingNumber', cargoController.trackShipment);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   POST /api/cargo/create-shipment
// @desc    Create shipment and get tracking number
// @access  Private/Admin
router.post('/create-shipment',
    protect,
    authorize('admin'),
    [
        body('orderId').notEmpty().withMessage('Sipariş ID gerekli'),
        body('provider').optional().isString()
    ],
    cargoController.createShipment
);

// @route   DELETE /api/cargo/shipment/:trackingNumber
// @desc    Cancel shipment
// @access  Private/Admin
router.delete('/shipment/:trackingNumber',
    protect,
    authorize('admin'),
    cargoController.cancelShipment
);

// @route   GET /api/cargo/label/:trackingNumber
// @desc    Get shipping label/barcode
// @access  Private/Admin
router.get('/label/:trackingNumber',
    protect,
    authorize('admin'),
    cargoController.getLabel
);

// @route   POST /api/cargo/pickup
// @desc    Request pickup from cargo company
// @access  Private/Admin
router.post('/pickup',
    protect,
    authorize('admin'),
    [
        body('provider').optional().isString(),
        body('date').notEmpty().withMessage('Tarih gerekli'),
        body('packageCount').optional().isNumeric()
    ],
    cargoController.requestPickup
);

module.exports = router;
