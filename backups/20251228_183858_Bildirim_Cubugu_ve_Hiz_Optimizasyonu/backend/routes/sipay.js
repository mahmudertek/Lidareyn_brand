const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const sipayController = require('../controllers/sipayController');

// ============================================
// SIPAY PAYMENT ROUTES
// ============================================

// @route   POST /api/sipay/get-token
// @desc    Get Sipay API token
// @access  Private
router.post('/get-token', protect, sipayController.getToken);

// @route   POST /api/sipay/pay-3d
// @desc    Initialize 3D Secure payment
// @access  Private
router.post('/pay-3d',
    protect,
    [
        body('card.cardHolderName').notEmpty().withMessage('Kart üzerindeki isim gerekli'),
        body('card.cardNumber').notEmpty().withMessage('Kart numarası gerekli'),
        body('card.expireMonth').notEmpty().withMessage('Son kullanma ayı gerekli'),
        body('card.expireYear').notEmpty().withMessage('Son kullanma yılı gerekli'),
        body('card.cvc').notEmpty().withMessage('CVV gerekli'),
        body('amount').isNumeric().withMessage('Tutar gerekli'),
        body('orderItems').isArray({ min: 1 }).withMessage('Sepet boş olamaz')
    ],
    sipayController.initiate3DPayment
);

// @route   POST /api/sipay/callback
// @desc    Sipay payment callback
// @access  Public
router.post('/callback', sipayController.paymentCallback);

// @route   POST /api/sipay/installments
// @desc    Get installment options
// @access  Private
router.post('/installments',
    protect,
    [
        body('creditCard').isLength({ min: 6 }).withMessage('Kart numarasının ilk 6 hanesi gerekli'),
        body('amount').isNumeric().withMessage('Tutar gerekli')
    ],
    sipayController.getInstallments
);

// @route   GET /api/sipay/status/:orderId
// @desc    Check payment status
// @access  Private
router.get('/status/:orderId', protect, sipayController.checkPaymentStatus);

// @route   POST /api/sipay/refund
// @desc    Process refund
// @access  Private/Admin
router.post('/refund',
    protect,
    authorize('admin'),
    [
        body('orderId').notEmpty().withMessage('Sipariş ID gerekli'),
        body('amount').optional().isNumeric()
    ],
    sipayController.processRefund
);

// ============================================
// DEMO PAYMENT (for testing without Sipay)
// ============================================

// @route   POST /api/sipay/demo
// @desc    Demo payment (testing only)
// @access  Private
router.post('/demo',
    protect,
    [
        body('items').isArray({ min: 1 }).withMessage('Sepet boş olamaz'),
        body('shippingAddress.firstName').notEmpty().withMessage('Ad gerekli'),
        body('shippingAddress.lastName').notEmpty().withMessage('Soyad gerekli'),
        body('shippingAddress.phone').notEmpty().withMessage('Telefon gerekli'),
        body('shippingAddress.city').notEmpty().withMessage('Şehir gerekli'),
        body('shippingAddress.address').notEmpty().withMessage('Adres gerekli'),
        body('card.cardNumber').notEmpty().withMessage('Kart numarası gerekli'),
        body('card.cvc').notEmpty().withMessage('CVV gerekli'),
        body('pricing.total').isNumeric().withMessage('Toplam tutar gerekli')
    ],
    sipayController.demoPayment
);

module.exports = router;
