/**
 * Kargo Entegrasyonu Controller
 * Türkiye'deki popüler kargo firmaları ile entegrasyon
 * 
 * Desteklenen Firmalar:
 * - Yurtiçi Kargo
 * - MNG Kargo
 * - Aras Kargo
 * - PTT Kargo
 * - Sürat Kargo
 * 
 * Anlaşma için:
 * - Yurtiçi: https://www.yurticikargo.com/tr/kurumsal-cozumler
 * - MNG: https://www.mngkargo.com.tr/kurumsal
 * - Aras: https://www.araskargo.com.tr/kurumsal
 */

const Order = require('../models/Order');
const crypto = require('crypto');

// Kargo Firma Konfigürasyonları
const CARGO_PROVIDERS = {
    yurtici: {
        name: 'Yurtiçi Kargo',
        apiUrl: process.env.YURTICI_API_URL || 'https://ws.yurticikargo.com/KOPSWebServices',
        username: process.env.YURTICI_USERNAME,
        password: process.env.YURTICI_PASSWORD,
        customerCode: process.env.YURTICI_CUSTOMER_CODE,
        trackingUrl: 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code='
    },
    mng: {
        name: 'MNG Kargo',
        apiUrl: process.env.MNG_API_URL || 'https://service.mngkargo.com.tr/maboraweb',
        username: process.env.MNG_USERNAME,
        password: process.env.MNG_PASSWORD,
        customerCode: process.env.MNG_CUSTOMER_CODE,
        trackingUrl: 'https://service.mngkargo.com.tr/itracing/kargo_takip.asp?p='
    },
    aras: {
        name: 'Aras Kargo',
        apiUrl: process.env.ARAS_API_URL || 'https://customerservices.araskargo.com.tr',
        username: process.env.ARAS_USERNAME,
        password: process.env.ARAS_PASSWORD,
        customerCode: process.env.ARAS_CUSTOMER_CODE,
        trackingUrl: 'https://www.araskargo.com.tr/taki.aspx?kession='
    },
    ptt: {
        name: 'PTT Kargo',
        apiUrl: process.env.PTT_API_URL || 'https://gonderitakip.ptt.gov.tr',
        username: process.env.PTT_USERNAME,
        password: process.env.PTT_PASSWORD,
        trackingUrl: 'https://gonderitakip.ptt.gov.tr/Track/Verify?q='
    },
    surat: {
        name: 'Sürat Kargo',
        apiUrl: process.env.SURAT_API_URL || 'https://kargo.suratkargo.com.tr',
        username: process.env.SURAT_USERNAME,
        password: process.env.SURAT_PASSWORD,
        trackingUrl: 'https://kargo.suratkargo.com.tr/takip?no='
    }
};

// Varsayılan kargo sağlayıcısı
const DEFAULT_PROVIDER = process.env.DEFAULT_CARGO_PROVIDER || 'yurtici';

// ============================================
// KARGO FİYAT HESAPLAMA
// ============================================

// E-ticaret anlaşmalı fiyatlar (örnek - gerçek anlaşmaya göre güncellenmeli)
const CARGO_PRICES = {
    yurtici: {
        baseDesi: 1,
        basePrice: 32.00,  // 1 desi fiyatı
        additionalDesiPrice: 5.00,  // Her ek desi için
        kapidaOdeme: 3.50,  // Kapıda ödeme ücreti
        minPrice: 32.00,
        freeShippingThreshold: 500  // 500 TL üzeri ücretsiz kargo
    },
    mng: {
        baseDesi: 1,
        basePrice: 30.00,
        additionalDesiPrice: 4.50,
        kapidaOdeme: 3.00,
        minPrice: 30.00,
        freeShippingThreshold: 500
    },
    aras: {
        baseDesi: 1,
        basePrice: 31.00,
        additionalDesiPrice: 4.80,
        kapidaOdeme: 3.50,
        minPrice: 31.00,
        freeShippingThreshold: 500
    },
    ptt: {
        baseDesi: 1,
        basePrice: 28.00,
        additionalDesiPrice: 4.00,
        kapidaOdeme: 2.50,
        minPrice: 28.00,
        freeShippingThreshold: 500
    },
    surat: {
        baseDesi: 1,
        basePrice: 29.00,
        additionalDesiPrice: 4.20,
        kapidaOdeme: 3.00,
        minPrice: 29.00,
        freeShippingThreshold: 500
    }
};

// @desc    Calculate shipping cost
// @route   POST /api/cargo/calculate
// @access  Public
exports.calculateShipping = async (req, res) => {
    try {
        const {
            provider = DEFAULT_PROVIDER,
            weight,  // kg
            width,   // cm
            height,  // cm
            depth,   // cm
            orderTotal,
            paymentMethod  // 'prepaid' or 'cod' (cash on delivery)
        } = req.body;

        // Desi hesaplama (hacimsel ağırlık)
        let desi = 1;
        if (width && height && depth) {
            desi = Math.ceil((width * height * depth) / 3000);
        }

        // Gerçek ağırlık ile karşılaştır, büyük olanı kullan
        if (weight) {
            desi = Math.max(desi, Math.ceil(weight));
        }

        const prices = CARGO_PRICES[provider] || CARGO_PRICES.yurtici;

        // Ücretsiz kargo kontrolü
        if (orderTotal && orderTotal >= prices.freeShippingThreshold) {
            return res.json({
                success: true,
                data: {
                    provider: CARGO_PROVIDERS[provider]?.name || 'Yurtiçi Kargo',
                    desi,
                    shippingCost: 0,
                    isFreeShipping: true,
                    message: `${prices.freeShippingThreshold} TL üzeri siparişlerde ücretsiz kargo!`
                }
            });
        }

        // Kargo ücreti hesapla
        let shippingCost = prices.basePrice;
        if (desi > prices.baseDesi) {
            shippingCost += (desi - prices.baseDesi) * prices.additionalDesiPrice;
        }

        // Kapıda ödeme ücreti
        if (paymentMethod === 'cod') {
            shippingCost += prices.kapidaOdeme;
        }

        // Minimum fiyat kontrolü
        shippingCost = Math.max(shippingCost, prices.minPrice);

        // KDV ekle (%20)
        const shippingCostWithVat = shippingCost * 1.20;

        res.json({
            success: true,
            data: {
                provider: CARGO_PROVIDERS[provider]?.name || 'Yurtiçi Kargo',
                desi,
                shippingCost: Math.round(shippingCostWithVat * 100) / 100,
                shippingCostWithoutVat: shippingCost,
                isFreeShipping: false,
                freeShippingThreshold: prices.freeShippingThreshold,
                codFee: paymentMethod === 'cod' ? prices.kapidaOdeme : 0
            }
        });

    } catch (error) {
        console.error('Calculate shipping error:', error);
        res.status(500).json({
            success: false,
            message: 'Kargo ücreti hesaplanırken hata oluştu'
        });
    }
};

// @desc    Get all available cargo providers
// @route   GET /api/cargo/providers
// @access  Public
exports.getProviders = async (req, res) => {
    try {
        const providers = Object.keys(CARGO_PROVIDERS).map(key => ({
            id: key,
            name: CARGO_PROVIDERS[key].name,
            trackingUrl: CARGO_PROVIDERS[key].trackingUrl,
            prices: {
                basePrice: CARGO_PRICES[key]?.basePrice || 0,
                freeShippingThreshold: CARGO_PRICES[key]?.freeShippingThreshold || 500
            }
        }));

        res.json({
            success: true,
            data: providers,
            defaultProvider: DEFAULT_PROVIDER
        });

    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Kargo firmaları alınırken hata oluştu'
        });
    }
};

// @desc    Create shipment / Get tracking number
// @route   POST /api/cargo/create-shipment
// @access  Private/Admin
exports.createShipment = async (req, res) => {
    try {
        const {
            orderId,
            provider = DEFAULT_PROVIDER,
            packageInfo
        } = req.body;

        // Siparişi bul
        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Kargo bilgilerini hazırla
        const shipmentData = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            sender: {
                name: 'Galata Çarşı',
                address: process.env.COMPANY_ADDRESS || 'İstanbul, Türkiye',
                phone: process.env.COMPANY_PHONE || '0212 XXX XX XX',
                city: process.env.COMPANY_CITY || 'İstanbul',
                district: process.env.COMPANY_DISTRICT || 'Beyoğlu'
            },
            receiver: {
                name: order.shippingAddress.fullName,
                address: order.shippingAddress.address,
                phone: order.shippingAddress.phone,
                city: order.shippingAddress.city,
                district: order.shippingAddress.district || order.shippingAddress.city
            },
            package: {
                count: 1,
                desi: packageInfo?.desi || 1,
                weight: packageInfo?.weight || 1,
                description: `Sipariş No: ${order.orderNumber}`
            },
            payment: {
                type: order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'PREPAID',
                codAmount: order.paymentMethod === 'cash_on_delivery' ? order.pricing.total : 0
            }
        };

        // Kargo firmasına göre API çağrısı yap
        let trackingNumber;
        let trackingUrl;

        // DEMO MOD - Gerçek API entegrasyonu için provider'a göre farklı fonksiyon çağır
        if (process.env.CARGO_MODE === 'demo' || !CARGO_PROVIDERS[provider].username) {
            // Demo kargo numarası oluştur
            trackingNumber = generateDemoTrackingNumber(provider);
            trackingUrl = CARGO_PROVIDERS[provider].trackingUrl + trackingNumber;
        } else {
            // Gerçek API entegrasyonu
            const result = await callCargoAPI(provider, 'createShipment', shipmentData);
            trackingNumber = result.trackingNumber;
            trackingUrl = CARGO_PROVIDERS[provider].trackingUrl + trackingNumber;
        }

        // Siparişi güncelle
        order.tracking = {
            company: CARGO_PROVIDERS[provider].name,
            trackingNumber: trackingNumber,
            url: trackingUrl
        };
        order.updateStatus('shipped', `Kargo verildi: ${CARGO_PROVIDERS[provider].name} - ${trackingNumber}`);
        await order.save();

        res.json({
            success: true,
            message: 'Kargo başarıyla oluşturuldu',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                tracking: {
                    company: CARGO_PROVIDERS[provider].name,
                    trackingNumber,
                    trackingUrl
                }
            }
        });

    } catch (error) {
        console.error('Create shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Kargo oluşturulurken hata oluştu'
        });
    }
};

// @desc    Track shipment
// @route   GET /api/cargo/track/:trackingNumber
// @access  Public
exports.trackShipment = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const { provider = DEFAULT_PROVIDER } = req.query;

        // Demo mod için örnek takip bilgisi
        if (process.env.CARGO_MODE === 'demo' || !CARGO_PROVIDERS[provider]?.username) {
            const demoTracking = generateDemoTrackingInfo(trackingNumber);
            return res.json({
                success: true,
                data: demoTracking
            });
        }

        // Gerçek API çağrısı
        const trackingInfo = await callCargoAPI(provider, 'trackShipment', { trackingNumber });

        res.json({
            success: true,
            data: trackingInfo
        });

    } catch (error) {
        console.error('Track shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Kargo takibi yapılırken hata oluştu'
        });
    }
};

// @desc    Cancel shipment
// @route   DELETE /api/cargo/shipment/:trackingNumber
// @access  Private/Admin
exports.cancelShipment = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const { provider = DEFAULT_PROVIDER, reason } = req.body;

        // Demo mod
        if (process.env.CARGO_MODE === 'demo') {
            return res.json({
                success: true,
                message: 'Kargo iptali başarılı (Demo)',
                data: { trackingNumber, cancelled: true }
            });
        }

        // Gerçek API çağrısı
        const result = await callCargoAPI(provider, 'cancelShipment', { trackingNumber, reason });

        // İlgili siparişi bul ve güncelle
        const order = await Order.findOne({ 'tracking.trackingNumber': trackingNumber });
        if (order) {
            order.tracking = null;
            order.updateStatus('processing', `Kargo iptal edildi: ${reason || 'Belirtilmedi'}`);
            await order.save();
        }

        res.json({
            success: true,
            message: 'Kargo iptali başarılı',
            data: result
        });

    } catch (error) {
        console.error('Cancel shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Kargo iptali yapılırken hata oluştu'
        });
    }
};

// @desc    Get cargo label (barcode/etiket)
// @route   GET /api/cargo/label/:trackingNumber
// @access  Private/Admin
exports.getLabel = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const { provider = DEFAULT_PROVIDER, format = 'pdf' } = req.query;

        // Demo mod
        if (process.env.CARGO_MODE === 'demo') {
            // Demo etiket bilgisi
            return res.json({
                success: true,
                message: 'Demo modda etiket oluşturulamaz',
                data: {
                    trackingNumber,
                    labelUrl: `https://example.com/label/${trackingNumber}.${format}`,
                    barcodeData: trackingNumber
                }
            });
        }

        // Gerçek API çağrısı
        const labelData = await callCargoAPI(provider, 'getLabel', { trackingNumber, format });

        res.json({
            success: true,
            data: labelData
        });

    } catch (error) {
        console.error('Get label error:', error);
        res.status(500).json({
            success: false,
            message: 'Etiket alınırken hata oluştu'
        });
    }
};

// @desc    Get pickup request (kapıdan alım)
// @route   POST /api/cargo/pickup
// @access  Private/Admin
exports.requestPickup = async (req, res) => {
    try {
        const {
            provider = DEFAULT_PROVIDER,
            date,
            timeSlot,
            packageCount,
            notes
        } = req.body;

        // Demo mod
        if (process.env.CARGO_MODE === 'demo') {
            return res.json({
                success: true,
                message: 'Kapıdan alım talebi oluşturuldu (Demo)',
                data: {
                    pickupId: `PICKUP-${Date.now()}`,
                    date,
                    timeSlot: timeSlot || '09:00-18:00',
                    packageCount: packageCount || 1,
                    provider: CARGO_PROVIDERS[provider].name
                }
            });
        }

        // Gerçek API çağrısı
        const pickupData = await callCargoAPI(provider, 'requestPickup', {
            date,
            timeSlot,
            packageCount,
            notes
        });

        res.json({
            success: true,
            message: 'Kapıdan alım talebi oluşturuldu',
            data: pickupData
        });

    } catch (error) {
        console.error('Request pickup error:', error);
        res.status(500).json({
            success: false,
            message: 'Kapıdan alım talebi oluşturulurken hata oluştu'
        });
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Demo kargo numarası oluştur
function generateDemoTrackingNumber(provider) {
    const prefixes = {
        yurtici: 'YK',
        mng: 'MNG',
        aras: 'AR',
        ptt: 'PTT',
        surat: 'SK'
    };
    const prefix = prefixes[provider] || 'KG';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Demo takip bilgisi oluştur
function generateDemoTrackingInfo(trackingNumber) {
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);

    return {
        trackingNumber,
        status: 'in_transit',
        statusText: 'Taşıma Aşamasında',
        estimatedDelivery: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        history: [
            {
                date: twoDaysAgo.toISOString(),
                status: 'created',
                description: 'Kargo bilgisi alındı',
                location: 'İstanbul - Merkez'
            },
            {
                date: yesterday.toISOString(),
                status: 'picked_up',
                description: 'Kargo teslim alındı',
                location: 'İstanbul - Beyoğlu Şube'
            },
            {
                date: yesterday.toISOString(),
                status: 'in_transit',
                description: 'Aktarma merkezine gönderildi',
                location: 'İstanbul - Transfer Merkezi'
            },
            {
                date: now.toISOString(),
                status: 'in_transit',
                description: 'Dağıtım şubesine ulaştı',
                location: 'Hedef Şehir - Dağıtım Merkezi'
            }
        ]
    };
}

// Kargo API çağrısı (gerçek entegrasyon için)
async function callCargoAPI(provider, action, data) {
    const config = CARGO_PROVIDERS[provider];

    if (!config || !config.username) {
        throw new Error(`${provider} kargo firması yapılandırılmamış`);
    }

    // Her firma için farklı API yapısı gerekir
    // Bu fonksiyon gerçek entegrasyon için genişletilmeli

    switch (provider) {
        case 'yurtici':
            return await callYurticiAPI(action, data, config);
        case 'mng':
            return await callMngAPI(action, data, config);
        case 'aras':
            return await callArasAPI(action, data, config);
        case 'ptt':
            return await callPttAPI(action, data, config);
        case 'surat':
            return await callSuratAPI(action, data, config);
        default:
            throw new Error('Desteklenmeyen kargo firması');
    }
}

// Yurtiçi Kargo API (SOAP-based)
async function callYurticiAPI(action, data, config) {
    // Yurtiçi Kargo SOAP web servisi kullanır
    // Gerçek entegrasyon için SOAP client gerekir
    // Örnek: soap veya strong-soap npm paketi

    console.log('Yurtiçi Kargo API çağrısı:', action, data);

    // Demo yanıt
    return {
        success: true,
        trackingNumber: generateDemoTrackingNumber('yurtici'),
        message: 'Demo yanıt'
    };
}

// MNG Kargo API
async function callMngAPI(action, data, config) {
    console.log('MNG Kargo API çağrısı:', action, data);
    return {
        success: true,
        trackingNumber: generateDemoTrackingNumber('mng'),
        message: 'Demo yanıt'
    };
}

// Aras Kargo API
async function callArasAPI(action, data, config) {
    console.log('Aras Kargo API çağrısı:', action, data);
    return {
        success: true,
        trackingNumber: generateDemoTrackingNumber('aras'),
        message: 'Demo yanıt'
    };
}

// PTT Kargo API
async function callPttAPI(action, data, config) {
    console.log('PTT Kargo API çağrısı:', action, data);
    return {
        success: true,
        trackingNumber: generateDemoTrackingNumber('ptt'),
        message: 'Demo yanıt'
    };
}

// Sürat Kargo API
async function callSuratAPI(action, data, config) {
    console.log('Sürat Kargo API çağrısı:', action, data);
    return {
        success: true,
        trackingNumber: generateDemoTrackingNumber('surat'),
        message: 'Demo yanıt'
    };
}
