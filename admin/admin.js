document.addEventListener('DOMContentLoaded', function () {

    // Check if sales chart exists
    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        const ctx = salesChartCanvas.getContext('2d');

        // Gradient for chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(139, 123, 216, 0.5)'); // Primary color with opacity
        gradient.addColorStop(1, 'rgba(139, 123, 216, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                datasets: [{
                    label: 'Haftalık Satış (₺)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#8b7bd8', // Primary Color
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: '#f3f4f6'
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
    // BAKIM MODU KONTROLÜ
    // ============================================

    // Sayfa yüklendiğinde bakım modunu kontrol et
    checkMaintenanceMode();

});

// Bakım modunu kontrol et ve UI güncelle
function checkMaintenanceMode() {
    const isMaintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
    const toggle = document.getElementById('maintenanceToggle');
    const card = document.getElementById('maintenanceCard');
    const status = document.getElementById('maintenanceStatus');

    if (toggle && card && status) {
        toggle.checked = isMaintenanceMode;

        if (isMaintenanceMode) {
            card.classList.add('maintenance-active');
            status.innerHTML = 'Site şu an <strong>bakımda</strong>. Ziyaretçiler bakım sayfasını görüyor.';
        } else {
            card.classList.remove('maintenance-active');
            status.innerHTML = 'Site şu an <strong>açık</strong> ve ziyaretçiler erişebilir.';
        }
    }
}

// Bakım modunu aç/kapat
function toggleMaintenanceMode() {
    const toggle = document.getElementById('maintenanceToggle');
    const card = document.getElementById('maintenanceCard');
    const status = document.getElementById('maintenanceStatus');

    const isMaintenanceMode = toggle.checked;

    // LocalStorage'a kaydet
    localStorage.setItem('maintenanceMode', isMaintenanceMode);

    // UI güncelle
    if (isMaintenanceMode) {
        card.classList.add('maintenance-active');
        status.innerHTML = 'Site şu an <strong>bakımda</strong>. Ziyaretçiler bakım sayfasını görüyor.';

        // Bildirim göster
        showNotification('🔧 Bakım modu aktif edildi!', 'warning');
    } else {
        card.classList.remove('maintenance-active');
        status.innerHTML = 'Site şu an <strong>açık</strong> ve ziyaretçiler erişebilir.';

        // Bildirim göster
        showNotification('✅ Site tekrar açıldı!', 'success');
    }
}

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
