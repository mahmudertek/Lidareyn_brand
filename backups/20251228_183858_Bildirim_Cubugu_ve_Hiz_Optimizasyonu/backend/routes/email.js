const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const emailController = require('../controllers/emailController');

// ============================================
// EMAIL ROUTES
// ============================================

// @route   POST /api/email/send
// @desc    Send email notification
// @access  Private/Admin
router.post('/send',
    protect,
    authorize('admin'),
    [
        body('template').notEmpty().withMessage('E-posta şablonu gerekli'),
        body('recipient').optional().isEmail().withMessage('Geçerli e-posta adresi gerekli')
    ],
    emailController.sendEmail
);

// @route   POST /api/email/order-confirmation
// @desc    Send order confirmation email
// @access  Private
router.post('/order-confirmation',
    protect,
    [
        body('orderId').notEmpty().withMessage('Sipariş ID gerekli')
    ],
    emailController.sendOrderConfirmation
);

// @route   POST /api/email/shipping-notification
// @desc    Send shipping notification email
// @access  Private/Admin
router.post('/shipping-notification',
    protect,
    authorize('admin'),
    [
        body('orderId').notEmpty().withMessage('Sipariş ID gerekli')
    ],
    emailController.sendShippingNotification
);

// @route   GET /api/email/templates
// @desc    Get available email templates
// @access  Private/Admin
router.get('/templates',
    protect,
    authorize('admin'),
    emailController.getTemplates
);

// @route   POST /api/email/test
// @desc    Test email configuration
// @access  Private/Admin
router.post('/test',
    protect,
    authorize('admin'),
    emailController.testEmail
);

module.exports = router;
