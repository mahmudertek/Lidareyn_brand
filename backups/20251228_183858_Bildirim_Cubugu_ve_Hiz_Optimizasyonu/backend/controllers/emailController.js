/**
 * Email Controller
 * E-posta bildirim sistemi
 * 
 * Nodemailer kullanarak sipariş bildirimleri gönderir
 */

const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Email transporter configuration
let transporter = null;

// Initialize email transporter
function initializeTransporter() {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    return transporter;
}

// Email templates
const emailTemplates = {
    // Sipariş onayı
    order_confirmed: (order) => ({
        subject: `Siparişiniz Onaylandı! - ${order.orderNumber}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                    .order-number { font-size: 18px; font-weight: bold; color: #667eea; }
                    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .total { font-size: 20px; font-weight: bold; color: #333; margin-top: 15px; text-align: right; }
                    .address { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Siparişiniz Onaylandı!</h1>
                    </div>
                    <div class="content">
                        <p>Merhaba <strong>${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}</strong>,</p>
                        <p>Siparişiniz başarıyla alındı ve onaylandı. En kısa sürede hazırlanarak kargoya verilecektir.</p>
                        
                        <div class="order-box">
                            <div class="order-number">Sipariş No: ${order.orderNumber}</div>
                            <p style="color: #666; margin: 5px 0;">Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                            
                            <div style="margin-top: 20px;">
                                ${order.items?.map(item => `
                                    <div class="item">
                                        <span>${item.name} x${item.quantity}</span>
                                        <span>₺${(item.price * item.quantity).toLocaleString('tr-TR')}</span>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="total">Toplam: ₺${order.pricing?.total?.toLocaleString('tr-TR')}</div>
                        </div>
                        
                        <div class="address">
                            <strong>📍 Teslimat Adresi:</strong><br>
                            ${order.shippingAddress?.fullName}<br>
                            ${order.shippingAddress?.address}<br>
                            ${order.shippingAddress?.district || ''} ${order.shippingAddress?.city}<br>
                            Tel: ${order.shippingAddress?.phone}
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL}/siparis-takip.html?order=${order.orderNumber}" class="btn">
                                Siparişimi Takip Et
                            </a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>Galata Çarşı - Kaliteli Ürünler, Güvenli Alışveriş</p>
                        <p>Sorularınız için: mail@galatacarsi.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Kargo bildirimi
    order_shipped: (order, tracking) => ({
        subject: `Siparişiniz Kargoya Verildi! 📦 - ${order.orderNumber}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .tracking-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; }
                    .tracking-number { font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px; margin: 15px 0; }
                    .cargo-company { font-size: 18px; color: #666; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; margin-top: 20px; }
                    .timeline { margin: 20px 0; }
                    .timeline-item { display: flex; align-items: center; gap: 15px; padding: 10px 0; }
                    .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: #10b981; }
                    .timeline-dot.inactive { background: #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📦 Siparişiniz Yola Çıktı!</h1>
                    </div>
                    <div class="content">
                        <p>Merhaba <strong>${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}</strong>,</p>
                        <p>Harika haberler! <strong>${order.orderNumber}</strong> numaralı siparişiniz kargoya verildi.</p>
                        
                        <div class="tracking-box">
                            <div class="cargo-company">${tracking?.company || order.tracking?.company || 'Kargo Firması'}</div>
                            <div class="tracking-number">${tracking?.trackingNumber || order.tracking?.trackingNumber || '-'}</div>
                            <p style="color: #999;">Takip numaranız</p>
                            
                            <a href="${tracking?.url || order.tracking?.url || '#'}" class="btn" target="_blank">
                                🔍 Kargo Takip
                            </a>
                        </div>
                        
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <span>✅ Sipariş alındı</span>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <span>✅ Hazırlandı</span>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <span>✅ Kargoya verildi</span>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot inactive"></div>
                                <span>⏳ Yolda</span>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot inactive"></div>
                                <span>⏳ Teslim edilecek</span>
                            </div>
                        </div>
                        
                        <p style="color: #666;">Tahmini teslimat süresi: 1-3 iş günü</p>
                    </div>
                    <div class="footer">
                        <p>Galata Çarşı - Kaliteli Ürünler, Güvenli Alışveriş</p>
                        <p>Sorularınız için: mail@galatacarsi.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Teslimat bildirimi
    order_delivered: (order) => ({
        subject: `Siparişiniz Teslim Edildi! ✅ - ${order.orderNumber}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; margin: 10px 5px; }
                    .rating { text-align: center; margin: 20px 0; }
                    .stars { font-size: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Teslim Edildi!</h1>
                    </div>
                    <div class="content">
                        <div class="success-icon">🎁</div>
                        
                        <p>Merhaba <strong>${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}</strong>,</p>
                        <p><strong>${order.orderNumber}</strong> numaralı siparişiniz başarıyla teslim edildi!</p>
                        
                        <p>Umarız ürünlerimizden memnun kalırsınız. Deneyiminizi bizimle paylaşır mısınız?</p>
                        
                        <div class="rating">
                            <p>Alışverişinizi nasıl değerlendirirsiniz?</p>
                            <div class="stars">⭐⭐⭐⭐⭐</div>
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL}/profil.html?tab=orders" class="btn">
                                Değerlendir
                            </a>
                            <a href="${process.env.FRONTEND_URL}" class="btn" style="background: #667eea;">
                                Alışverişe Devam
                            </a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>Bizi tercih ettiğiniz için teşekkür ederiz! 💜</p>
                        <p>Galata Çarşı - Kaliteli Ürünler, Güvenli Alışveriş</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // İptal bildirimi
    order_cancelled: (order, reason) => ({
        subject: `Siparişiniz İptal Edildi - ${order.orderNumber}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reason-box { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Sipariş İptal Edildi</h1>
                    </div>
                    <div class="content">
                        <p>Merhaba <strong>${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}</strong>,</p>
                        <p><strong>${order.orderNumber}</strong> numaralı siparişiniz iptal edilmiştir.</p>
                        
                        ${reason ? `
                            <div class="reason-box">
                                <strong>İptal Nedeni:</strong> ${reason}
                            </div>
                        ` : ''}
                        
                        <p>Ödeme yaptıysanız, iade işlemi 3-5 iş günü içinde hesabınıza yansıyacaktır.</p>
                        
                        <p>Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL}" class="btn">
                                Alışverişe Devam Et
                            </a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>Galata Çarşı - Kaliteli Ürünler, Güvenli Alışveriş</p>
                        <p>Sorularınız için: mail@galatacarsi.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // İade onay bildirimi
    order_refunded: (order, amount) => ({
        subject: `İade İşleminiz Tamamlandı - ${order.orderNumber}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .refund-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                    .amount { font-size: 28px; font-weight: bold; color: #059669; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 İade Tamamlandı!</h1>
                    </div>
                    <div class="content">
                        <p>Merhaba <strong>${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}</strong>,</p>
                        <p><strong>${order.orderNumber}</strong> numaralı siparişiniz için iade işlemi tamamlanmıştır.</p>
                        
                        <div class="refund-box">
                            <p style="margin: 0; color: #666;">İade Tutarı</p>
                            <div class="amount">₺${(amount || order.pricing?.total || 0).toLocaleString('tr-TR')}</div>
                        </div>
                        
                        <p>İade tutarı, ödeme yönteminize bağlı olarak 3-10 iş günü içinde hesabınıza yansıyacaktır.</p>
                        
                        <p>Bizi tercih ettiğiniz için teşekkür ederiz. Tekrar görüşmek üzere!</p>
                    </div>
                    <div class="footer">
                        <p>Galata Çarşı - Kaliteli Ürünler, Güvenli Alışveriş</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

// @desc    Send email notification
// @route   POST /api/email/send
// @access  Private/Admin
exports.sendEmail = async (req, res) => {
    try {
        const {
            orderId,
            template,
            recipient,
            subject,
            message,
            tracking
        } = req.body;

        // Get order
        let order = null;
        if (orderId) {
            order = await Order.findById(orderId).populate('user', 'name email');
        }

        // Get recipient email
        const toEmail = recipient || order?.user?.email;
        if (!toEmail) {
            return res.status(400).json({
                success: false,
                message: 'Alıcı e-posta adresi gerekli'
            });
        }

        // Get email content
        let emailContent;
        if (template === 'custom') {
            emailContent = {
                subject: subject || 'Galata Çarşı',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #667eea;">Galata Çarşı</h2>
                        <p>${message}</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px;">Bu e-posta Galata Çarşı tarafından gönderilmiştir.</p>
                    </div>
                `
            };
        } else if (emailTemplates[template]) {
            emailContent = emailTemplates[template](order, tracking);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz e-posta şablonu'
            });
        }

        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('Email not configured, skipping send');
            return res.json({
                success: true,
                message: 'E-posta simülasyonu (yapılandırılmamış)',
                demo: true
            });
        }

        // Initialize transporter
        const mailer = initializeTransporter();

        // Send email
        const info = await mailer.sendMail({
            from: `"Galata Çarşı" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });

        console.log('Email sent:', info.messageId);

        res.json({
            success: true,
            message: 'E-posta başarıyla gönderildi',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: 'E-posta gönderilirken hata oluştu',
            error: error.message
        });
    }
};

// @desc    Send order confirmation email
// @route   POST /api/email/order-confirmation
// @access  Private
exports.sendOrderConfirmation = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        const recipient = order.user?.email;
        if (!recipient) {
            return res.json({
                success: true,
                message: 'Kullanıcı e-postası yok, bildirim gönderilmedi'
            });
        }

        // Check if email is configured
        if (!process.env.EMAIL_USER) {
            return res.json({
                success: true,
                message: 'E-posta yapılandırılmamış (demo mod)'
            });
        }

        const mailer = initializeTransporter();
        const emailContent = emailTemplates.order_confirmed(order);

        await mailer.sendMail({
            from: `"Galata Çarşı" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html
        });

        res.json({
            success: true,
            message: 'Sipariş onay e-postası gönderildi'
        });

    } catch (error) {
        console.error('Order confirmation email error:', error);
        res.status(500).json({
            success: false,
            message: 'E-posta gönderilemedi'
        });
    }
};

// @desc    Send shipping notification email
// @route   POST /api/email/shipping-notification
// @access  Private/Admin
exports.sendShippingNotification = async (req, res) => {
    try {
        const { orderId, tracking } = req.body;

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        const recipient = order.user?.email;
        if (!recipient) {
            return res.json({
                success: true,
                message: 'Kullanıcı e-postası yok, bildirim gönderilmedi'
            });
        }

        if (!process.env.EMAIL_USER) {
            return res.json({
                success: true,
                message: 'E-posta yapılandırılmamış (demo mod)'
            });
        }

        const mailer = initializeTransporter();
        const emailContent = emailTemplates.order_shipped(order, tracking || order.tracking);

        await mailer.sendMail({
            from: `"Galata Çarşı" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html
        });

        res.json({
            success: true,
            message: 'Kargo bildirim e-postası gönderildi'
        });

    } catch (error) {
        console.error('Shipping notification error:', error);
        res.status(500).json({
            success: false,
            message: 'E-posta gönderilemedi'
        });
    }
};

// @desc    Get email templates list
// @route   GET /api/email/templates
// @access  Private/Admin
exports.getTemplates = async (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'order_confirmed', name: 'Sipariş Onayı', description: 'Sipariş alındığında gönderilir' },
            { id: 'order_shipped', name: 'Kargo Bildirimi', description: 'Kargo verildiğinde gönderilir' },
            { id: 'order_delivered', name: 'Teslimat Bildirimi', description: 'Teslim edildiğinde gönderilir' },
            { id: 'order_cancelled', name: 'İptal Bildirimi', description: 'Sipariş iptal edildiğinde gönderilir' },
            { id: 'order_refunded', name: 'İade Bildirimi', description: 'İade tamamlandığında gönderilir' },
            { id: 'custom', name: 'Özel Mesaj', description: 'Kendi mesajınızı yazın' }
        ]
    });
};

// @desc    Test email configuration
// @route   POST /api/email/test
// @access  Private/Admin
exports.testEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return res.status(400).json({
                success: false,
                message: 'E-posta yapılandırması eksik. .env dosyasını kontrol edin.'
            });
        }

        const mailer = initializeTransporter();

        // Verify connection
        await mailer.verify();

        // Send test email
        await mailer.sendMail({
            from: `"Galata Çarşı" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email || process.env.EMAIL_USER,
            subject: 'Test E-postası - Galata Çarşı',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #667eea;">✅ E-posta Testi Başarılı!</h2>
                    <p>E-posta yapılandırmanız doğru çalışıyor.</p>
                    <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Test e-postası başarıyla gönderildi'
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'E-posta testi başarısız',
            error: error.message
        });
    }
};
