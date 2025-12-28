const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            pricing,
            notes
        } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Sepetinizde ürün bulunmamaktadır'
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            pricing,
            notes: {
                customer: notes || ''
            },
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'Sipariş oluşturuldu',
                updatedAt: new Date()
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Siparişiniz başarıyla oluşturuldu',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.pricing.total
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş oluşturulurken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const query = { user: req.user._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('orderNumber status pricing createdAt items');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Siparişler getirilirken bir hata oluştu'
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product', 'name image price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş getirilirken bir hata oluştu'
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Check if order can be cancelled
        const cancelableStatuses = ['pending', 'confirmed', 'processing'];
        if (!cancelableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Bu sipariş iptal edilemez. Kargoya verilen siparişler için iade talebi oluşturabilirsiniz.'
            });
        }

        // Update order status
        order.updateStatus('cancelled', req.body.reason || 'Müşteri tarafından iptal edildi');
        order.cancellationReason = req.body.reason || 'Müşteri tarafından iptal edildi';
        await order.save();

        res.json({
            success: true,
            message: 'Siparişiniz başarıyla iptal edildi',
            data: {
                orderNumber: order.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş iptal edilirken bir hata oluştu'
        });
    }
};

// @desc    Request return
// @route   PUT /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Check if order can be returned (must be delivered)
        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Sadece teslim edilmiş siparişler için iade talebi oluşturabilirsiniz'
            });
        }

        // Check return period (14 days)
        const deliveryDate = order.deliveredAt || order.updatedAt;
        const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));

        if (daysSinceDelivery > 14) {
            return res.status(400).json({
                success: false,
                message: 'İade süresi (14 gün) dolmuştur'
            });
        }

        order.returnReason = req.body.reason || 'Belirtilmedi';
        order.updateStatus('returned', `İade talebi: ${req.body.reason || 'Belirtilmedi'}`);
        await order.save();

        res.json({
            success: true,
            message: 'İade talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.',
            data: {
                orderNumber: order.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Return request error:', error);
        res.status(500).json({
            success: false,
            message: 'İade talebi oluşturulurken bir hata oluştu'
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const search = req.query.search;

        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);

        // Get order statistics
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.total' }
                }
            }
        ]);

        res.json({
            success: true,
            data: orders,
            stats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Siparişler getirilirken bir hata oluştu'
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note, trackingNumber, trackingCompany } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Update status
        order.updateStatus(status, note || `Durum güncellendi: ${status}`);

        // Update tracking info if provided
        if (trackingNumber) {
            order.tracking = {
                company: trackingCompany || 'Belirtilmedi',
                trackingNumber: trackingNumber,
                url: getTrackingUrl(trackingCompany, trackingNumber)
            };
        }

        // Mark as paid if confirmed
        if (status === 'confirmed' && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
        }

        await order.save();

        res.json({
            success: true,
            message: 'Sipariş durumu güncellendi',
            data: {
                orderNumber: order.orderNumber,
                status: order.status,
                tracking: order.tracking
            }
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş durumu güncellenirken bir hata oluştu'
        });
    }
};

// Helper function to get tracking URL
function getTrackingUrl(company, trackingNumber) {
    const trackingUrls = {
        'yurtici': `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`,
        'mng': `https://service.mngkargo.com.tr/itrace/${trackingNumber}`,
        'aras': `https://www.araskargo.com.tr/taki.aspx?kession=${trackingNumber}`,
        'ptt': `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${trackingNumber}`,
        'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
        'dhl': `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${trackingNumber}`
    };

    return trackingUrls[company?.toLowerCase()] || '';
}

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        // Today's orders
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, status: { $nin: ['cancelled', 'refunded'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        // This month
        const monthOrders = await Order.countDocuments({
            createdAt: { $gte: thisMonth }
        });

        const monthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: thisMonth }, status: { $nin: ['cancelled', 'refunded'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        // Pending orders count
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['pending', 'confirmed', 'processing'] }
        });

        // Status distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                today: {
                    orders: todayOrders,
                    revenue: todayRevenue[0]?.total || 0
                },
                thisMonth: {
                    orders: monthOrders,
                    revenue: monthRevenue[0]?.total || 0
                },
                pendingOrders,
                statusDistribution
            }
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler getirilirken bir hata oluştu'
        });
    }
};
