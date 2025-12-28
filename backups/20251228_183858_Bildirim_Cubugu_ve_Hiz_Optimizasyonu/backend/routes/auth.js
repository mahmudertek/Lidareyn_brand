const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ============================================
// 🛡️ RATE LIMITERS - Saldırı Koruması
// ============================================

// Login Rate Limiter - Brute Force Koruması (15 dakikada 5 deneme)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Register Rate Limiter - Spam Koruması (1 saatte 3 kayıt)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Çok fazla kayıt denemesi yapıldı. Lütfen 1 saat sonra tekrar deneyin.'
    }
});

// Password Reset Rate Limiter (1 saatte 5 deneme)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Çok fazla şifre sıfırlama isteği gönderildi. Lütfen 1 saat sonra tekrar deneyin.'
    }
});

// ============================================
// AUTH ROUTES
// ============================================

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (Rate Limited: 3/hour)
router.post('/register',
    registerLimiter,
    [
        body('name').trim().notEmpty().withMessage('İsim gereklidir'),
        body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
        body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
        body('gender').optional().isIn(['male', 'female', 'other'])
    ],
    authController.register
);

// @route   POST /api/auth/verify
// @desc    Verify email with code
// @access  Public
router.post('/verify',
    [
        body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
        body('code').isLength({ min: 4, max: 4 }).withMessage('Geçerli bir kod giriniz')
    ],
    authController.verifyEmail
);

// @route   POST /api/auth/resend-code
// @desc    Resend verification code
// @access  Public
router.post('/resend-code',
    [
        body('email').isEmail().withMessage('Geçerli bir e-posta giriniz')
    ],
    authController.resendCode
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public (Rate Limited: 5/15min)
router.post('/login',
    loginLimiter,
    [
        body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
        body('password').notEmpty().withMessage('Şifre gereklidir')
    ],
    authController.login
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public (Rate Limited: 5/hour)
router.post('/forgot-password',
    passwordResetLimiter,
    [
        body('email').isEmail().withMessage('Geçerli bir e-posta giriniz')
    ],
    authController.forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password',
    [
        body('token').notEmpty().withMessage('Token gereklidir'),
        body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    ],
    authController.resetPassword
);

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password',
    protect,
    [
        body('currentPassword').notEmpty().withMessage('Mevcut şifre gereklidir'),
        body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır')
    ],
    authController.updatePassword
);

module.exports = router;
