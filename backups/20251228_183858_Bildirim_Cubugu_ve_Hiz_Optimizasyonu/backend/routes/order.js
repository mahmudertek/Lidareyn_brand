const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// ============================================
// USER ROUTES
// ============================================

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, orderController.getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, orderController.getOrderById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/',
    protect,
    [
        body('items').isArray({ min: 1 }).withMessage('Sepetinizde en az 1 ürün olmalıdır'),
        body('shippingAddress.fullName').notEmpty().withMessage('Ad soyad gereklidir'),
        body('shippingAddress.phone').notEmpty().withMessage('Telefon numarası gereklidir'),
        body('shippingAddress.city').notEmpty().withMessage('Şehir seçiniz'),
        body('shippingAddress.address').notEmpty().withMessage('Adres gereklidir'),
        body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery'])
            .withMessage('Geçerli bir ödeme yöntemi seçiniz'),
        body('pricing.total').isNumeric().withMessage('Toplam tutar gereklidir')
    ],
    orderController.createOrder
);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel',
    protect,
    [
        body('reason').optional().isString()
    ],
    orderController.cancelOrder
);

// @route   PUT /api/orders/:id/return
// @desc    Request return
// @access  Private
router.put('/:id/return',
    protect,
    [
        body('reason').notEmpty().withMessage('İade sebebi belirtiniz')
    ],
    orderController.requestReturn
);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), orderController.getAllOrders);

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (Admin)
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('admin'), orderController.getOrderStats);

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put('/admin/:id/status',
    protect,
    authorize('admin'),
    [
        body('status').isIn([
            'pending', 'confirmed', 'processing', 'shipped',
            'in_transit', 'delivered', 'cancelled', 'returned', 'refunded'
        ]).withMessage('Geçersiz durum'),
        body('note').optional().isString(),
        body('trackingNumber').optional().isString(),
        body('trackingCompany').optional().isString()
    ],
    orderController.updateOrderStatus
);

module.exports = router;
