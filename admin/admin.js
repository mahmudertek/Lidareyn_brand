document.addEventListener('DOMContentLoaded', function () {

    // Check if sales chart exists
    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        loadSalesChart();
    }

    // ============================================
    // DYNAMIC SALES CHART FROM API
    // ============================================
    async function loadSalesChart() {
        try {
            // Wait for ADMIN_API to be available
            if (typeof ADMIN_API === 'undefined') {
                setTimeout(loadSalesChart, 500);
                return;
            }

            // Get orders from API
            const response = await ADMIN_API.getOrders({ limit: 500 });
            const orders = response.success ? (response.data || []) : [];

            // Calculate last 7 days sales
            const dailySales = {};
            const today = new Date();
            const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

            // Initialize last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = date.toISOString().split('T')[0];
                dailySales[dateKey] = {
                    total: 0,
                    dayName: dayNames[date.getDay()]
                };
            }

            // Aggregate order totals by date
            orders.forEach(order => {
                if (order.status !== 'cancelled' && order.status !== 'refunded') {
                    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                    if (dailySales[orderDate]) {
                        dailySales[orderDate].total += (order.pricing?.total || order.totalAmount || 0);
                    }
                }
            });

            // Prepare chart data
            const labels = Object.values(dailySales).map(d => d.dayName);
            const data = Object.values(dailySales).map(d => d.total);

            // Create chart
            renderSalesChart(labels, data);

            console.log('📊 Satış grafiği güncellendi:', data);
        } catch (error) {
            console.error('Sales chart error:', error);
            // Fallback to empty chart
            renderSalesChart(
                ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                [0, 0, 0, 0, 0, 0, 0]
            );
        }
    }

    function renderSalesChart(labels, data) {
        const ctx = document.getElementById('salesChart').getContext('2d');

        // Gradient for chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(139, 123, 216, 0.5)');
        gradient.addColorStop(1, 'rgba(139, 123, 216, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Günlük Satış (₺)',
                    data: data,
                    borderColor: '#8b7bd8',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#8b7bd8',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                return '₺' + context.parsed.y.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: '#f3f4f6'
                        },
                        ticks: {
                            callback: function (value) {
                                return '₺' + value.toLocaleString('tr-TR');
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // ============================================
    // BAKIM MODU ARTIK maintenance-config.json İLE YÖNETİLİYOR
    // Bu sebeple eski backend kontrolü kaldırıldı
    // ============================================

    // ============================================
    // DASHBOARD VERİLERİNİ YÜKLE
    // ============================================

    // Sayfa yüklendiğinde gerçek verileri çek
    loadDashboardData();

});


// Dashboard verilerini backend'den çek
async function loadDashboardData() {
    try {
        // Check if ADMIN_API is available
        if (typeof ADMIN_API === 'undefined') {
            console.warn('ADMIN_API not loaded yet, retrying in 500ms...');
            setTimeout(loadDashboardData, 500);
            return;
        }

        // Fetch dashboard stats from API
        const stats = await ADMIN_API.getDashboardStats();

        if (stats.success) {
            updateDashboardUI(stats.data);
        } else {
            console.error('Failed to load dashboard stats:', stats.message);
            showErrorState();
        }
    } catch (error) {
        console.error('Dashboard data error:', error);
        showErrorState();
    }
}

// Update dashboard UI with real data
function updateDashboardUI(data) {
    // Format currency
    const formatCurrency = (num) => {
        if (num >= 1000000) {
            return '₺' + (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return '₺' + (num / 1000).toFixed(1) + 'K';
        }
        return '₺' + num.toLocaleString('tr-TR');
    };

    // Format number
    const formatNumber = (num) => {
        return num.toLocaleString('tr-TR');
    };

    // Update Total Sales
    const totalSalesEl = document.getElementById('totalSales');
    if (totalSalesEl) {
        totalSalesEl.textContent = formatCurrency(data.totalSales || 0);
    }

    // Update Total Orders
    const totalOrdersEl = document.getElementById('totalOrders');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = formatNumber(data.totalOrders || 0);
    }

    // Update Total Products
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        totalProductsEl.textContent = formatNumber(data.totalProducts || 0);
    }

    // Update Pending Orders
    const pendingOrdersEl = document.getElementById('pendingOrders');
    if (pendingOrdersEl) {
        pendingOrdersEl.textContent = formatNumber(data.pendingOrders || 0);
    }

    // Update trends if available
    if (data.salesTrend !== undefined) {
        const salesTrendEl = document.getElementById('salesTrend');
        if (salesTrendEl) {
            const trend = data.salesTrend > 0 ? '+' + data.salesTrend : data.salesTrend;
            salesTrendEl.textContent = trend + '%';
        }
    }

    if (data.ordersTrend !== undefined) {
        const ordersTrendEl = document.getElementById('ordersTrend');
        if (ordersTrendEl) {
            const trend = data.ordersTrend > 0 ? '+' + data.ordersTrend : data.ordersTrend;
            ordersTrendEl.textContent = trend + '%';
        }
    }

    // Products trend - show active products
    const productsTrendEl = document.getElementById('productsTrend');
    if (productsTrendEl && data.activeProducts !== undefined) {
        productsTrendEl.textContent = data.activeProducts + ' aktif';
    }

    // Render recent orders table
    if (data.recentOrders) {
        renderRecentOrders(data.recentOrders);
    }

    console.log('✅ Dashboard data loaded successfully:', data);
}

// Render recent orders in table
function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #6b7280;">
                    <i class="fa-solid fa-inbox" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    Henüz sipariş bulunmuyor
                </td>
            </tr>
        `;
        return;
    }

    // Status mapping
    const statusMap = {
        'pending': { label: 'Bekliyor', class: 'status-pending' },
        'confirmed': { label: 'Onaylandı', class: 'status-pending' },
        'processing': { label: 'Hazırlanıyor', class: 'status-pending' },
        'shipped': { label: 'Kargoya Verildi', class: 'status-pending' },
        'in_transit': { label: 'Yolda', class: 'status-pending' },
        'delivered': { label: 'Teslim Edildi', class: 'status-completed' },
        'cancelled': { label: 'İptal', class: 'status-cancelled' },
        'returned': { label: 'İade', class: 'status-cancelled' },
        'refunded': { label: 'İade Edildi', class: 'status-cancelled' }
    };

    let html = '';
    orders.forEach(order => {
        const orderNo = order.orderNumber || order._id?.slice(-6).toUpperCase() || 'N/A';
        const customerName = order.shippingAddress?.fullName || order.user?.firstName || 'Misafir';
        const total = order.pricing?.total || order.totalAmount || 0;
        const status = statusMap[order.status] || { label: order.status, class: 'status-pending' };

        html += `
            <tr>
                <td>#${orderNo}</td>
                <td>${customerName}</td>
                <td>₺${total.toLocaleString('tr-TR')}</td>
                <td><span class="status-badge ${status.class}">${status.label}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Show error state
function showErrorState() {
    const elements = ['totalSales', 'totalOrders', 'totalProducts', 'pendingOrders'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = 'Hata';
            el.style.color = '#ef4444';
        }
    });
}


// ============================================
// ESKİ BAKIM MODU FONKSİYONLARI KALDIRILDI
// Bakım modu artık maintenance-config.json ile yönetiliyor
// ============================================


// Bildirim göster
function showNotification(message, type) {
    // Varsa eski bildirimi kaldır
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #d1fae5; color: #065f46; border: 1px solid #10b981;' : ''}
        ${type === 'warning' ? 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;' : ''}
        ${type === 'error' ? 'background: #fee2e2; color: #991b1b; border: 1px solid #ef4444;' : ''}
    `;

    document.body.appendChild(notification);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS animasyonları için stil ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
