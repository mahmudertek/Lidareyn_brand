/**
 * Sipay Payment Controller
 * Sipay Sanal POS Entegrasyonu
 * 
 * Sipay hesabı açmak için: https://www.sipay.com.tr
 * 
 * .env dosyasına eklenecek:
 * SIPAY_MERCHANT_KEY=your-merchant-key
 * SIPAY_APP_SECRET=your-app-secret
 * SIPAY_MERCHANT_ID=your-merchant-id
 * SIPAY_BASE_URL=https://api.sipay.com.tr (production)
 * SIPAY_BASE_URL=https://sandbox-api.sipay.com.tr (test)
 */

const crypto = require('crypto');
const Order = require('../models/Order');

// Sipay API Configuration
const SIPAY_CONFIG = {
    merchantKey: process.env.SIPAY_MERCHANT_KEY,
    appSecret: process.env.SIPAY_APP_SECRET,
    merchantId: process.env.SIPAY_MERCHANT_ID,
    baseUrl: process.env.SIPAY_BASE_URL || 'https://sandbox-api.sipay.com.tr'
};

// Generate Sipay Hash Token
function generateHashToken(data) {
    const hashString = `${data.merchant_key}${data.total}${data.currency_code}${data.merchant_order_id}${SIPAY_CONFIG.appSecret}`;
    return crypto.createHash('sha256').update(hashString).digest('base64');
}

// @desc    Get Sipay token for payment
// @route   POST /api/sipay/get-token
// @access  Private
exports.getToken = async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`${SIPAY_CONFIG.baseUrl}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                app_id: SIPAY_CONFIG.merchantId,
                app_secret: SIPAY_CONFIG.appSecret
            })
        });

        const data = await response.json();

        if (data.status_code === 100) {
            res.json({
                success: true,
                token: data.data.token,
                expiresAt: data.data.expires_at
            });
        } else {
            res.status(400).json({
                success: false,
                message: data.status_description || 'Token alınamadı'
            });
        }
    } catch (error) {
        console.error('Sipay get token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token alınırken bir hata oluştu'
        });
    }
};

// @desc    Initialize Sipay 3D Payment
// @route   POST /api/sipay/pay-3d
// @access  Private
exports.initiate3DPayment = async (req, res) => {
    try {
        const {
            card,
            amount,
            installment,
            orderItems,
            shippingAddress
        } = req.body;

        // Generate unique order ID
        const merchantOrderId = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Prepare payment data
        const paymentData = {
            merchant_key: SIPAY_CONFIG.merchantKey,
            total: amount.toFixed(2),
            currency_code: 'TRY',
            merchant_order_id: merchantOrderId,
            invoice_id: merchantOrderId,
            invoice_description: `Galata Çarşı Sipariş - ${merchantOrderId}`,
            name: card.cardHolderName.split(' ')[0] || 'Müşteri',
            surname: card.cardHolderName.split(' ').slice(1).join(' ') || 'Adı',
            cc_holder_name: card.cardHolderName,
            cc_no: card.cardNumber.replace(/\s/g, ''),
            expiry_month: card.expireMonth.padStart(2, '0'),
            expiry_year: card.expireYear.length === 2 ? `20${card.expireYear}` : card.expireYear,
            cvv: card.cvc,
            installments_number: installment || 1,
            bill_address1: shippingAddress.address,
            bill_city: shippingAddress.city,
            bill_postcode: shippingAddress.postalCode || '34000',
            bill_country: 'TR',
            bill_phone: shippingAddress.phone,
            bill_email: req.user.email,
            ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
            return_url: `${process.env.FRONTEND_URL}/odeme-sonuc.html`,
            cancel_url: `${process.env.FRONTEND_URL}/odeme-sonuc.html?status=cancelled`,
            hash_key: ''
        };

        // Generate hash
        paymentData.hash_key = generateHashToken(paymentData);

        // Store order data temporarily for callback
        const pendingOrder = {
            userId: req.user._id,
            merchantOrderId,
            items: orderItems,
            shippingAddress,
            amount,
            createdAt: new Date()
        };

        // Store in memory or redis (for production, use redis)
        global.pendingOrders = global.pendingOrders || {};
        global.pendingOrders[merchantOrderId] = pendingOrder;

        // Make request to Sipay
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`${SIPAY_CONFIG.baseUrl}/api/paySmart3D`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.status_code === 100) {
            res.json({
                success: true,
                data: {
                    redirectUrl: result.data.redirect_url,
                    htmlContent: result.data.html_content,
                    merchantOrderId
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.status_description || 'Ödeme başlatılamadı',
                errorCode: result.status_code
            });
        }

    } catch (error) {
        console.error('Sipay 3D payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme işlemi başlatılırken bir hata oluştu'
        });
    }
};

// @desc    Sipay Payment Callback
// @route   POST /api/sipay/callback
// @access  Public
exports.paymentCallback = async (req, res) => {
    try {
        const {
            status,
            merchant_order_id,
            invoice_id,
            order_id,
            status_description,
            total,
            hash_key
        } = req.body;

        console.log('Sipay callback received:', { status, merchant_order_id, order_id });

        // Verify hash (security check)
        // In production, verify the hash_key matches

        if (status === '1' || status === 1) {
            // Payment successful
            const pendingOrder = global.pendingOrders?.[merchant_order_id];

            if (pendingOrder) {
                // Create order in database
                const order = await Order.create({
                    user: pendingOrder.userId,
                    items: pendingOrder.items.map(item => ({
                        product: item.productId || item.id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: item.price * item.quantity
                    })),
                    shippingAddress: {
                        fullName: `${pendingOrder.shippingAddress.firstName} ${pendingOrder.shippingAddress.lastName}`,
                        phone: pendingOrder.shippingAddress.phone,
                        city: pendingOrder.shippingAddress.city,
                        district: pendingOrder.shippingAddress.district || pendingOrder.shippingAddress.city,
                        address: pendingOrder.shippingAddress.address
                    },
                    paymentMethod: 'credit_card',
                    paymentInfo: {
                        transactionId: order_id,
                        provider: 'sipay'
                    },
                    pricing: {
                        subtotal: pendingOrder.amount,
                        shipping: 0,
                        tax: 0,
                        discount: 0,
                        total: pendingOrder.amount
                    },
                    status: 'confirmed',
                    isPaid: true,
                    paidAt: new Date(),
                    statusHistory: [
                        { status: 'pending', note: 'Sipariş oluşturuldu', updatedAt: new Date() },
                        { status: 'confirmed', note: 'Ödeme alındı (Sipay)', updatedAt: new Date() }
                    ]
                });

                // Clean up pending order
                delete global.pendingOrders[merchant_order_id];

                // Redirect to success page
                return res.redirect(
                    `${process.env.FRONTEND_URL}/siparis-basarili.html?orderNumber=${order.orderNumber}&status=success`
                );
            }

            return res.redirect(
                `${process.env.FRONTEND_URL}/odeme-sonuc.html?status=success&orderId=${order_id}`
            );
        } else {
            // Payment failed
            const errorMessage = encodeURIComponent(status_description || 'Ödeme başarısız');
            return res.redirect(
                `${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=${errorMessage}`
            );
        }

    } catch (error) {
        console.error('Sipay callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=sistem-hatasi`);
    }
};

// @desc    Get installment options
// @route   POST /api/sipay/installments
// @access  Private
exports.getInstallments = async (req, res) => {
    try {
        const { creditCard, amount } = req.body;
        const binNumber = creditCard.substring(0, 6);

        const fetch = (await import('node-fetch')).default;

        // First get token
        const tokenResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_id: SIPAY_CONFIG.merchantId,
                app_secret: SIPAY_CONFIG.appSecret
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.status_code !== 100) {
            throw new Error('Token alınamadı');
        }

        // Get installment options
        const installmentResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/getpos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.data.token}`
            },
            body: JSON.stringify({
                merchant_key: SIPAY_CONFIG.merchantKey,
                credit_card: binNumber,
                amount: amount.toFixed(2),
                currency_code: 'TRY'
            })
        });

        const installmentData = await installmentResponse.json();

        if (installmentData.status_code === 100) {
            const installments = installmentData.data.map(pos => ({
                posId: pos.pos_id,
                bankName: pos.bank_name,
                cardProgram: pos.card_program,
                installments: pos.installments.map(inst => ({
                    count: inst.installments_number,
                    totalAmount: parseFloat(inst.amount_to_be_paid),
                    installmentAmount: parseFloat(inst.amount_to_be_paid) / inst.installments_number,
                    commissionRate: inst.commission_rate
                }))
            }));

            res.json({
                success: true,
                data: installments
            });
        } else {
            // Return default installments
            res.json({
                success: true,
                data: [{
                    bankName: 'Standart',
                    installments: [
                        { count: 1, totalAmount: amount, installmentAmount: amount },
                        { count: 2, totalAmount: amount * 1.02, installmentAmount: (amount * 1.02) / 2 },
                        { count: 3, totalAmount: amount * 1.03, installmentAmount: (amount * 1.03) / 3 },
                        { count: 6, totalAmount: amount * 1.06, installmentAmount: (amount * 1.06) / 6 },
                        { count: 9, totalAmount: amount * 1.09, installmentAmount: (amount * 1.09) / 9 },
                        { count: 12, totalAmount: amount * 1.12, installmentAmount: (amount * 1.12) / 12 }
                    ]
                }]
            });
        }

    } catch (error) {
        console.error('Sipay installments error:', error);
        // Return default installments on error
        const amount = req.body.amount || 0;
        res.json({
            success: true,
            data: [{
                bankName: 'Standart',
                installments: [
                    { count: 1, totalAmount: amount, installmentAmount: amount },
                    { count: 3, totalAmount: amount * 1.03, installmentAmount: (amount * 1.03) / 3 },
                    { count: 6, totalAmount: amount * 1.06, installmentAmount: (amount * 1.06) / 6 }
                ]
            }]
        });
    }
};

// @desc    Process refund
// @route   POST /api/sipay/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        const fetch = (await import('node-fetch')).default;

        // Get token
        const tokenResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_id: SIPAY_CONFIG.merchantId,
                app_secret: SIPAY_CONFIG.appSecret
            })
        });

        const tokenData = await tokenResponse.json();

        // Process refund
        const refundData = {
            merchant_key: SIPAY_CONFIG.merchantKey,
            invoice_id: order.paymentInfo?.transactionId,
            refund_amount: (amount || order.pricing.total).toFixed(2),
            refund_transaction_type: amount && amount < order.pricing.total ? 'PARTIAL_REFUND' : 'FULL_REFUND'
        };

        // Generate hash for refund
        const hashString = `${refundData.merchant_key}${refundData.invoice_id}${refundData.refund_amount}${SIPAY_CONFIG.appSecret}`;
        refundData.hash_key = crypto.createHash('sha256').update(hashString).digest('base64');

        const refundResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.data.token}`
            },
            body: JSON.stringify(refundData)
        });

        const refundResult = await refundResponse.json();

        if (refundResult.status_code === 100) {
            // Update order status
            order.updateStatus('refunded', reason || 'İade işlemi tamamlandı');
            order.refundedAt = new Date();
            order.refundAmount = amount || order.pricing.total;
            await order.save();

            res.json({
                success: true,
                message: 'İade işlemi başarıyla tamamlandı',
                data: {
                    refundId: refundResult.data?.refund_id,
                    amount: refundData.refund_amount
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: refundResult.status_description || 'İade işlemi başarısız'
            });
        }

    } catch (error) {
        console.error('Sipay refund error:', error);
        res.status(500).json({
            success: false,
            message: 'İade işlemi sırasında bir hata oluştu'
        });
    }
};

// @desc    Check payment status
// @route   GET /api/sipay/status/:orderId
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const fetch = (await import('node-fetch')).default;

        // Get token
        const tokenResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_id: SIPAY_CONFIG.merchantId,
                app_secret: SIPAY_CONFIG.appSecret
            })
        });

        const tokenData = await tokenResponse.json();

        // Check status
        const statusResponse = await fetch(`${SIPAY_CONFIG.baseUrl}/api/checkstatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.data.token}`
            },
            body: JSON.stringify({
                merchant_key: SIPAY_CONFIG.merchantKey,
                invoice_id: orderId
            })
        });

        const statusData = await statusResponse.json();

        if (statusData.status_code === 100) {
            res.json({
                success: true,
                data: {
                    status: statusData.data.order_status,
                    transactionId: statusData.data.order_id,
                    amount: statusData.data.total,
                    paidAt: statusData.data.created_at
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: statusData.status_description || 'Durum sorgulanamadı'
            });
        }

    } catch (error) {
        console.error('Sipay status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme durumu kontrol edilirken hata oluştu'
        });
    }
};

// ============================================
// DEMO PAYMENT (Sipay olmadan test için)
// ============================================

// @desc    Demo Sipay payment (for testing)
// @route   POST /api/sipay/demo
// @access  Private
exports.demoPayment = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            pricing,
            card
        } = req.body;

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Validate card
        if (!card || !card.cardNumber || card.cardNumber.replace(/\s/g, '').length !== 16) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kart numarası'
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: items.map(item => ({
                product: item.productId || item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            shippingAddress: {
                fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                phone: shippingAddress.phone,
                city: shippingAddress.city,
                district: shippingAddress.district || shippingAddress.city,
                address: shippingAddress.address
            },
            paymentMethod: 'credit_card',
            paymentInfo: {
                cardLastFour: card.cardNumber.slice(-4),
                cardBrand: detectCardBrand(card.cardNumber),
                transactionId: `SIPAY-DEMO-${Date.now()}`,
                provider: 'sipay_demo'
            },
            pricing: {
                subtotal: pricing.subtotal,
                shipping: pricing.shipping || 0,
                tax: pricing.tax || 0,
                discount: pricing.discount || 0,
                total: pricing.total
            },
            status: 'confirmed',
            isPaid: true,
            paidAt: new Date(),
            statusHistory: [
                { status: 'pending', note: 'Sipariş oluşturuldu', updatedAt: new Date() },
                { status: 'confirmed', note: 'Ödeme alındı (Sipay Demo)', updatedAt: new Date() }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Ödeme başarılı! Siparişiniz oluşturuldu.',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.pricing.total
            }
        });

    } catch (error) {
        console.error('Sipay demo payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
};

// Helper function
function detectCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^9792/.test(number)) return 'Troy';
    return 'Unknown';
}
