const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// ============================================
// PAYMENT ROUTES
// ============================================

// @route   POST /api/payment/initialize
// @desc    Initialize 3D Secure payment
// @access  Private
router.post('/initialize',
    protect,
    [
        body('card.cardHolderName').notEmpty().withMessage('Kart üzerindeki isim gereklidir'),
        body('card.cardNumber').notEmpty().withMessage('Kart numarası gereklidir'),
        body('card.expireMonth').notEmpty().withMessage('Son kullanma ayı gereklidir'),
        body('card.expireYear').notEmpty().withMessage('Son kullanma yılı gereklidir'),
        body('card.cvc').notEmpty().withMessage('CVV gereklidir'),
        body('price').isNumeric().withMessage('Tutar gereklidir'),
        body('paidPrice').isNumeric().withMessage('Ödenecek tutar gereklidir'),
        body('basketItems').isArray({ min: 1 }).withMessage('Sepet boş olamaz')
    ],
    paymentController.initializePayment
);

// @route   POST /api/payment/callback
// @desc    iyzico 3D Secure callback
// @access  Public (iyzico callback)
router.post('/callback', paymentController.paymentCallback);

// @route   GET /api/payment/status/:paymentId
// @desc    Check payment status
// @access  Private
router.get('/status/:paymentId', protect, paymentController.checkPaymentStatus);

// @route   POST /api/payment/installments
// @desc    Get installment options for card
// @access  Private
router.post('/installments',
    protect,
    [
        body('binNumber').isLength({ min: 6 }).withMessage('Kart numarasının ilk 6 hanesi gereklidir'),
        body('price').isNumeric().withMessage('Tutar gereklidir')
    ],
    paymentController.getInstallments
);

// @route   POST /api/payment/refund
// @desc    Process refund
// @access  Private/Admin
router.post('/refund',
    protect,
    authorize('admin'),
    [
        body('paymentTransactionId').notEmpty().withMessage('İşlem ID gereklidir'),
        body('price').isNumeric().withMessage('İade tutarı gereklidir')
    ],
    paymentController.processRefund
);

// ============================================
// DEMO PAYMENT (for testing without iyzico)
// ============================================

// @route   POST /api/payment/demo
// @desc    Process demo payment (testing only)
// @access  Private
router.post('/demo',
    protect,
    [
        body('items').isArray({ min: 1 }).withMessage('Sepet boş olamaz'),
        body('shippingAddress.firstName').notEmpty().withMessage('Ad gereklidir'),
        body('shippingAddress.lastName').notEmpty().withMessage('Soyad gereklidir'),
        body('shippingAddress.phone').notEmpty().withMessage('Telefon gereklidir'),
        body('shippingAddress.city').notEmpty().withMessage('Şehir gereklidir'),
        body('shippingAddress.address').notEmpty().withMessage('Adres gereklidir'),
        body('card.cardNumber').notEmpty().withMessage('Kart numarası gereklidir'),
        body('card.cvc').notEmpty().withMessage('CVV gereklidir'),
        body('pricing.total').isNumeric().withMessage('Toplam tutar gereklidir')
    ],
    paymentController.demoPayment
);

module.exports = router;
