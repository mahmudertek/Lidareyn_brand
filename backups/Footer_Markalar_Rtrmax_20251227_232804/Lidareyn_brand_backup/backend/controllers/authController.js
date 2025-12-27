const User = require('../models/User');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, gender } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kayıtlı'
            });
        }

        // Create user (NOT verified yet)
        user = await User.create({
            name,
            email,
            password,
            gender: gender || 'other',
            isVerified: false  // E-posta doğrulanana kadar false
        });

        // Generate verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Galata Çarşı - E-posta Doğrulama Kodu',
                template: 'verification',
                context: {
                    name: user.name,
                    code: verificationCode
                }
            });

            res.status(201).json({
                success: true,
                message: 'Kayıt başarılı! Lütfen e-postanızı kontrol edin.',
                needsVerification: true,
                data: {
                    email: user.email
                }
            });
        } catch (emailError) {
            console.error('Email Error:', emailError);
            // E-posta gönderilemese bile kullanıcı kaydedildi
            // Kullanıcı daha sonra kod isteğinde bulunabilir
            res.status(201).json({
                success: true,
                message: 'Kayıt başarılı! Doğrulama kodu gönderilemedi, tekrar kod isteyebilirsiniz.',
                needsVerification: true,
                data: {
                    email: user.email
                }
            });
        }

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Verify email
// @route   POST /api/auth/verify
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, code } = req.body;

        const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'E-posta zaten doğrulanmış'
            });
        }

        if (!user.verificationCode || user.verificationCodeExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Doğrulama kodu süresi dolmuş'
            });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: 'Hatalı doğrulama kodu'
            });
        }

        // Verify user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        // Generate token and login
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            message: 'E-posta doğrulandı!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'E-posta zaten doğrulanmış'
            });
        }

        // Generate new code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send email
        await sendEmail({
            to: user.email,
            subject: 'Galata Çarşı - Yeni Doğrulama Kodu',
            template: 'verification',
            context: {
                name: user.name,
                code: verificationCode
            }
        });

        res.status(200).json({
            success: true,
            message: 'Yeni doğrulama kodu gönderildi'
        });

    } catch (error) {
        console.error('Resend Code Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
            });
        }

        // Check if verified (skip for admin users)
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Lütfen önce e-postanızı doğrulayın',
                needsVerification: true
            });
        }

        // Check if user is deactivated (silme koruması)
        if (user.isActive === false) {
            return res.status(401).json({
                success: false,
                message: 'Bu hesap devre dışı bırakılmıştır. Destek ile iletişime geçin.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Çıkış başarılı'
    });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı'
            });
        }

        // Generate reset token (simple version)
        const resetToken = Math.random().toString(36).substring(2, 15);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Galata Çarşı - Şifre Sıfırlama',
            template: 'reset-password',
            context: {
                name: user.name,
                resetUrl
            }
        });

        res.status(200).json({
            success: true,
            message: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi'
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Şifreniz başarıyla değiştirildi'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre hatalı'
            });
        }

        // Set new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};
