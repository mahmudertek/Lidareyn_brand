/**
 * Payment Controller - iyzico Integration
 * 
 * NOT: iyzico kullanmak için:
 * 1. https://www.iyzico.com adresinden hesap aç
 * 2. Sandbox (test) API keyleri al
 * 3. .env dosyasına ekle:
 *    IYZICO_API_KEY=sandbox-xxxxxxxx
 *    IYZICO_SECRET_KEY=sandbox-xxxxxxxx
 *    IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
 */

const Order = require('../models/Order');

// iyzico configuration
let Iyzipay;
let iyzipay;

try {
    Iyzipay = require('iyzipay');
    iyzipay = new Iyzipay({
        apiKey: process.env.IYZICO_API_KEY,
        secretKey: process.env.IYZICO_SECRET_KEY,
        uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });
} catch (error) {
    console.warn('⚠️ iyzipay package not installed. Run: npm install iyzipay');
}

// @desc    Initialize payment (3D Secure)
// @route   POST /api/payment/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
    try {
        if (!iyzipay) {
            return res.status(500).json({
                success: false,
                message: 'Ödeme sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.'
            });
        }

        const {
            card,
            buyer,
            shippingAddress,
            billingAddress,
            basketItems,
            price,
            paidPrice
        } = req.body;

        // Create unique conversation ID
        const conversationId = `GC-${Date.now()}-${req.user._id.toString().slice(-6)}`;

        // Format basket items for iyzico
        const formattedBasketItems = basketItems.map((item, index) => ({
            id: item.id || `ITEM-${index}`,
            name: item.name.substring(0, 50), // iyzico max 50 chars
            category1: item.category || 'El Aletleri',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: item.price.toFixed(2)
        }));

        // Create payment request
        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            price: price.toFixed(2),
            paidPrice: paidPrice.toFixed(2),
            currency: Iyzipay.CURRENCY.TRY,
            installment: req.body.installment || 1,
            basketId: `BASKET-${conversationId}`,
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.FRONTEND_URL}/odeme-sonuc.html`,
            paymentCard: {
                cardHolderName: card.cardHolderName,
                cardNumber: card.cardNumber.replace(/\s/g, ''),
                expireMonth: card.expireMonth,
                expireYear: card.expireYear,
                cvc: card.cvc,
                registerCard: 0
            },
            buyer: {
                id: req.user._id.toString(),
                name: buyer.name,
                surname: buyer.surname,
                gsmNumber: buyer.phone,
                email: req.user.email,
                identityNumber: buyer.identityNumber || '11111111111', // TC Kimlik No
                registrationAddress: buyer.address,
                ip: req.ip || req.connection.remoteAddress,
                city: buyer.city,
                country: 'Turkey',
                zipCode: buyer.zipCode || '34000'
            },
            shippingAddress: {
                contactName: shippingAddress.contactName,
                city: shippingAddress.city,
                country: 'Turkey',
                address: shippingAddress.address,
                zipCode: shippingAddress.zipCode || '34000'
            },
            billingAddress: {
                contactName: billingAddress?.contactName || shippingAddress.contactName,
                city: billingAddress?.city || shippingAddress.city,
                country: 'Turkey',
                address: billingAddress?.address || shippingAddress.address,
                zipCode: billingAddress?.zipCode || shippingAddress.zipCode || '34000'
            },
            basketItems: formattedBasketItems
        };

        // Initialize 3D Secure payment
        iyzipay.threedsInitialize.create(request, (err, result) => {
            if (err) {
                console.error('iyzico error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Ödeme başlatılırken bir hata oluştu'
                });
            }

            if (result.status === 'success') {
                // Store conversation ID in session/temp storage for callback
                res.json({
                    success: true,
                    data: {
                        threeDSHtmlContent: result.threeDSHtmlContent,
                        conversationId: conversationId
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.errorMessage || 'Ödeme başlatılamadı',
                    errorCode: result.errorCode
                });
            }
        });

    } catch (error) {
        console.error('Initialize payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme işlemi başlatılırken bir hata oluştu'
        });
    }
};

// @desc    Complete 3D Secure payment (Callback)
// @route   POST /api/payment/callback
// @access  Public (iyzico callback)
exports.paymentCallback = async (req, res) => {
    try {
        if (!iyzipay) {
            return res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=sistem-hatasi`);
        }

        const { paymentId } = req.body;

        if (!paymentId) {
            return res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=gecersiz-islem`);
        }

        // Complete 3D Secure payment
        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: req.body.conversationId,
            paymentId: paymentId
        };

        iyzipay.threedsPayment.create(request, async (err, result) => {
            if (err) {
                console.error('Payment completion error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=odeme-hatasi`);
            }

            if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                // Payment successful - create order
                try {
                    // Get pending order data from session/temp storage
                    // For now, we'll redirect to success page
                    const orderNumber = `GC${Date.now()}`;

                    return res.redirect(
                        `${process.env.FRONTEND_URL}/siparis-basarili.html?orderNumber=${orderNumber}&paymentId=${result.paymentId}`
                    );
                } catch (orderError) {
                    console.error('Order creation error:', orderError);
                    return res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=siparis-olusturulamadi`);
                }
            } else {
                // Payment failed
                const errorMessage = encodeURIComponent(result.errorMessage || 'Ödeme başarısız');
                return res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=${errorMessage}`);
            }
        });

    } catch (error) {
        console.error('Payment callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/odeme-sonuc.html?status=error&message=beklenmeyen-hata`);
    }
};

// @desc    Check payment status
// @route   GET /api/payment/status/:paymentId
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
    try {
        if (!iyzipay) {
            return res.status(500).json({
                success: false,
                message: 'Ödeme sistemi kullanılamıyor'
            });
        }

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: req.query.conversationId,
            paymentId: req.params.paymentId
        };

        iyzipay.payment.retrieve(request, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Ödeme durumu sorgulanamadı'
                });
            }

            res.json({
                success: true,
                data: {
                    status: result.status,
                    paymentStatus: result.paymentStatus,
                    price: result.price,
                    paidPrice: result.paidPrice,
                    cardFamily: result.cardFamily,
                    cardType: result.cardType
                }
            });
        });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme durumu kontrol edilirken hata oluştu'
        });
    }
};

// @desc    Get installment options
// @route   POST /api/payment/installments
// @access  Private
exports.getInstallments = async (req, res) => {
    try {
        if (!iyzipay) {
            // Return default installments if iyzico not configured
            return res.json({
                success: true,
                data: {
                    installments: [
                        { installment: 1, totalPrice: req.body.price, installmentPrice: req.body.price },
                        { installment: 2, totalPrice: req.body.price * 1.02, installmentPrice: (req.body.price * 1.02) / 2 },
                        { installment: 3, totalPrice: req.body.price * 1.03, installmentPrice: (req.body.price * 1.03) / 3 },
                        { installment: 6, totalPrice: req.body.price * 1.06, installmentPrice: (req.body.price * 1.06) / 6 },
                        { installment: 9, totalPrice: req.body.price * 1.09, installmentPrice: (req.body.price * 1.09) / 9 },
                        { installment: 12, totalPrice: req.body.price * 1.12, installmentPrice: (req.body.price * 1.12) / 12 }
                    ]
                }
            });
        }

        const binNumber = req.body.binNumber; // First 6 digits of card
        const price = req.body.price;

        if (!binNumber || binNumber.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir kart numarası giriniz'
            });
        }

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: `INST-${Date.now()}`,
            binNumber: binNumber.substring(0, 6),
            price: price.toFixed(2)
        };

        iyzipay.installmentInfo.retrieve(request, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Taksit bilgileri alınamadı'
                });
            }

            if (result.status === 'success') {
                const installmentDetails = result.installmentDetails?.[0]?.installmentPrices || [];

                res.json({
                    success: true,
                    data: {
                        cardFamily: result.installmentDetails?.[0]?.cardFamilyName,
                        cardType: result.installmentDetails?.[0]?.cardType,
                        bankName: result.installmentDetails?.[0]?.bankName,
                        installments: installmentDetails.map(inst => ({
                            installment: inst.installmentNumber,
                            totalPrice: parseFloat(inst.totalPrice),
                            installmentPrice: parseFloat(inst.installmentPrice)
                        }))
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.errorMessage || 'Taksit bilgileri alınamadı'
                });
            }
        });

    } catch (error) {
        console.error('Get installments error:', error);
        res.status(500).json({
            success: false,
            message: 'Taksit seçenekleri alınırken hata oluştu'
        });
    }
};

// @desc    Process refund
// @route   POST /api/payment/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
    try {
        if (!iyzipay) {
            return res.status(500).json({
                success: false,
                message: 'Ödeme sistemi kullanılamıyor'
            });
        }

        const { paymentTransactionId, price, ip } = req.body;

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: `REFUND-${Date.now()}`,
            paymentTransactionId: paymentTransactionId,
            price: price.toFixed(2),
            currency: Iyzipay.CURRENCY.TRY,
            ip: ip || req.ip
        };

        iyzipay.refund.create(request, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'İade işlemi gerçekleştirilemedi'
                });
            }

            if (result.status === 'success') {
                res.json({
                    success: true,
                    message: 'İade işlemi başarıyla gerçekleştirildi',
                    data: {
                        refundId: result.paymentId,
                        price: result.price
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.errorMessage || 'İade işlemi başarısız'
                });
            }
        });

    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({
            success: false,
            message: 'İade işlemi sırasında hata oluştu'
        });
    }
};

// ============================================
// DEMO/TEST PAYMENT (iyzico olmadan test için)
// ============================================

// @desc    Demo payment (for testing without iyzico)
// @route   POST /api/payment/demo
// @access  Private
exports.demoPayment = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            pricing,
            notes,
            card
        } = req.body;

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Validate card (demo validation)
        if (!card || !card.cardNumber || card.cardNumber.replace(/\s/g, '').length !== 16) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kart numarası'
            });
        }

        // Check CVV
        if (!card.cvc || card.cvc.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz CVV'
            });
        }

        // Create order in database
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
                address: shippingAddress.address,
                postalCode: shippingAddress.postalCode
            },
            billingAddress: billingAddress || undefined,
            paymentMethod: paymentMethod || 'credit_card',
            paymentInfo: {
                cardLastFour: card.cardNumber.slice(-4),
                cardBrand: getCardBrand(card.cardNumber),
                transactionId: `DEMO-${Date.now()}`
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
                {
                    status: 'pending',
                    note: 'Sipariş oluşturuldu',
                    updatedAt: new Date()
                },
                {
                    status: 'confirmed',
                    note: 'Ödeme alındı (Demo)',
                    updatedAt: new Date()
                }
            ],
            notes: {
                customer: notes || ''
            }
        });

        res.status(201).json({
            success: true,
            message: 'Ödeme başarılı! Siparişiniz oluşturuldu.',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.pricing.total,
                paymentInfo: {
                    cardLastFour: order.paymentInfo.cardLastFour,
                    cardBrand: order.paymentInfo.cardBrand
                }
            }
        });

    } catch (error) {
        console.error('Demo payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Ödeme işlemi sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to detect card brand
function getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    if (/^9792/.test(number)) return 'Troy';

    return 'Unknown';
}
