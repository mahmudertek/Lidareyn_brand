// Admin Sidebar Component
// Bu script her admin sayfasında tutarlı sidebar oluşturur

(function () {
    'use strict';

    // Mevcut sayfa yolunu al
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Menü öğeleri
    const menuItems = [
        { href: 'dashboard.html', icon: 'fa-chart-line', label: 'Genel Bakış' },
        { href: 'products.html', icon: 'fa-box-open', label: 'Ürünler' },
        { href: 'brands.html', icon: 'fa-tags', label: 'Markalar' },
        { href: 'categories.html', icon: 'fa-layer-group', label: 'Kategoriler' },
        { href: 'orders.html', icon: 'fa-cart-shopping', label: 'Siparişler' },
        { href: 'cargo.html', icon: 'fa-truck', label: 'Kargo' },
        { href: 'customers.html', icon: 'fa-users', label: 'Müşteriler' },
        { href: 'settings.html', icon: 'fa-gear', label: 'Ayarlar' }
    ];

    // Sidebar HTML oluştur
    function createSidebar() {
        const menuHtml = menuItems.map(item => {
            const isActive = item.href === currentPage ? ' active' : '';
            const isDisabled = item.disabled ? ' disabled' : '';
            return `
                <div class="menu-item">
                    <a href="${item.href}" class="menu-link${isActive}${isDisabled}">
                        <i class="fa-solid ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                </div>
            `;
        }).join('');

        return `
            <div class="sidebar-header">
                <span class="sidebar-logo">Galata Çarşı</span>
            </div>

            <nav class="sidebar-menu">
                ${menuHtml}
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" onclick="handleLogout()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Çıkış Yap</span>
                </button>
            </div>
        `;
    }

    // Logout handler
    window.handleLogout = function () {
        if (typeof ADMIN_API !== 'undefined') {
            ADMIN_API.logout();
        }
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };

    // Sidebar'ı DOM'a ekle
    function initSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.innerHTML = createSidebar();
        }
    }

    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
    }
})();
