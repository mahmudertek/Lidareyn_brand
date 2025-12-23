document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const links = document.querySelectorAll('.profile-link[data-tab]');
    const contents = document.querySelectorAll('.profile-tab-content');

    function switchTab(tabId) {
        // Remove active class from all contents
        contents.forEach(c => c.classList.remove('active'));

        // Add active class to target content
        const activeContent = document.getElementById(`${tabId}-tab`);

        if (activeContent) {
            activeContent.classList.add('active');

            // Load orders when orders tab is activated
            if (tabId === 'orders') {
                console.log('Orders tab activated, loading orders...');
                // Call after a short delay to ensure DOM is ready
                requestAnimationFrame(() => {
                    if (window.loadOrdersWithFilter) {
                        console.log('Calling loadOrdersWithFilter');
                        window.loadOrdersWithFilter('all');
                    } else {
                        console.error('loadOrdersWithFilter not found!');
                    }
                });
            }

            // Mobile: Scroll to content
            if (window.innerWidth < 992) {
                activeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // Handle clicks on sidebar links
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');

            // Remove active from all links first
            links.forEach(l => l.classList.remove('active'));
            // Add active to the clicked link specifically
            link.classList.add('active');

            switchTab(tabId);
            // Update URL hash without jumping
            history.pushState(null, null, `#${tabId}`);
        });
    });

    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    const paramTab = new URLSearchParams(window.location.search).get('tab');

    // Remove active from all links first
    links.forEach(l => l.classList.remove('active'));

    let initialTab = 'orders'; // Default tab

    if (hash && document.getElementById(`${hash}-tab`)) {
        initialTab = hash;
    } else if (paramTab && document.getElementById(`${paramTab}-tab`)) {
        initialTab = paramTab;
    }

    // Activate the correct link for the initial tab
    // For orders tab, activate the "Tüm Siparişlerim" link (last orders link)
    if (initialTab === 'orders') {
        const ordersLinks = document.querySelectorAll('.profile-link[data-tab="orders"]');
        if (ordersLinks.length > 0) {
            // Activate the last one (Tüm Siparişlerim)
            ordersLinks[ordersLinks.length - 1].classList.add('active');
        }
    } else {
        // For other tabs, activate the first matching link
        const activeLink = document.querySelector(`.profile-link[data-tab="${initialTab}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Switch to the initial tab
    switchTab(initialTab);

    // --- NEW: Load Real Orders from LocalStorage ---
    function loadOrders() {
        const savedOrders = JSON.parse(localStorage.getItem('savedOrders'));
        const ordersContainer = document.querySelector('.orders-list');

        if (savedOrders && savedOrders.length > 0 && ordersContainer) {
            ordersContainer.innerHTML = ''; // Clear mock data

            savedOrders.forEach(order => {
                // Create Image HTML (Show up to 3 images)
                let imagesHtml = '';
                if (order.items && order.items.length > 0) {
                    order.items.slice(0, 3).forEach(item => {
                        imagesHtml += `<img src="${item.image}" alt="Product" style="object-fit: contain; background: #fff; border: 1px solid #eee;">`;
                    });
                    if (order.items.length > 3) {
                        imagesHtml += `<div style="width: 60px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #666; border-radius: 6px;">+${order.items.length - 3}</div>`;
                    }
                }

                const orderHTML = `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-date">${order.date}</span>
                            <span class="order-number">Sipariş No: ${order.id}</span>
                        </div>
                        <div class="order-status ${order.statusClass}">${order.status}</div>
                    </div>
                    <div class="order-body">
                        <div class="order-images">
                            ${imagesHtml}
                        </div>
                        <div class="order-total">
                            <span>Toplam:</span>
                            <strong>${order.total}</strong>
                        </div>
                    </div>
                    <div class="order-footer">
                        <a href="siparis-detay.html?id=${order.id}" class="btn-text">Sipariş Detayı <i class="fa-solid fa-chevron-right"></i></a>
                    </div>
                </div>`;

                ordersContainer.innerHTML += orderHTML;
            });
        }
    }

    loadOrders(); // Call immediately

    // --- Order Filtering (Tüm Siparişlerim) ---
    window.loadOrdersWithFilter = function (filter = 'all') {
        console.log('loadOrdersWithFilter called with filter:', filter);
        const ordersContainer = document.getElementById('orders-list-container');
        console.log('ordersContainer:', ordersContainer);
        if (!ordersContainer) {
            console.error('orders-list-container not found!');
            return;
        }

        const savedOrders = JSON.parse(localStorage.getItem('savedOrders')) || [];

        // If no orders, create demo data
        let allOrders = savedOrders.length > 0 ? savedOrders : window.generateDemoOrders();

        // Filter orders based on selected filter
        let filteredOrders = allOrders;

        if (filter === 'ongoing') {
            // Devam Eden: processing, shipped
            filteredOrders = allOrders.filter(order =>
                order.status === 'processing' || order.status === 'shipped'
            );
        } else if (filter === 'returned') {
            // İade Edilen
            filteredOrders = allOrders.filter(order => order.status === 'returned');
        } else if (filter === 'cancelled') {
            // İptal Edilen
            filteredOrders = allOrders.filter(order => order.status === 'cancelled');
        }

        // Clear container
        ordersContainer.innerHTML = '';

        // Show empty state if no orders
        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state-sm">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>Bu kategoride sipariş bulunmamaktadır.</p>
                </div>
            `;
            return;
        }

        // Render orders
        filteredOrders.forEach(order => {
            const imagesHtml = order.items.slice(0, 3).map(item =>
                `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 80px; object-fit: contain; background: #fff; border: 1px solid #eee; border-radius: 4px;">`
            ).join('');

            const orderHTML = `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-date">${order.date}</span>
                            <span class="order-number">Sipariş No: ${order.id}</span>
                        </div>
                        <div class="order-status ${order.statusClass}">${order.statusLabel}</div>
                    </div>
                    <div class="order-body">
                        <div class="order-images">
                            ${imagesHtml}
                            ${order.items.length > 3 ? `<div style="width: 60px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #666; border-radius: 6px;">+${order.items.length - 3}</div>` : ''}
                        </div>
                        <div class="order-total">
                            <span>Toplam:</span>
                            <strong>${order.total}</strong>
                        </div>
                    </div>
                    <div class="order-footer">
                        <a href="siparis-detay.html?id=${order.id}" class="btn-text">Sipariş Detayı <i class="fa-solid fa-chevron-right"></i></a>
                        ${order.status === 'delivered' ? '<button class="btn-sm btn-outline">Kolay İade</button>' : ''}
                    </div>
                </div>
            `;

            ordersContainer.innerHTML += orderHTML;
        });
    };

    // Generate demo orders
    window.generateDemoOrders = function () {
        const statuses = [
            { key: 'processing', label: 'Hazırlanıyor', class: 'processing' },
            { key: 'shipped', label: 'Kargoda', class: 'shipped' },
            { key: 'delivered', label: 'Teslim Edildi', class: 'delivered' },
            { key: 'returned', label: 'İade Edildi', class: 'returned' },
            { key: 'cancelled', label: 'İptal Edildi', class: 'cancelled' }
        ];

        const orders = [];
        for (let i = 1; i <= 15; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));

            orders.push({
                id: `#TR-${100000 + i}`,
                date: date.toLocaleDateString('tr-TR'),
                dateObj: date,
                status: status.key,
                statusLabel: status.label,
                statusClass: status.class,
                total: `${(Math.random() * 2000 + 100).toFixed(2)} TL`,
                items: [
                    {
                        name: `Ürün ${i}`,
                        image: `https://placehold.co/200x200/e5e7eb/6b7280?text=Ürün+${i}`,
                        quantity: Math.floor(Math.random() * 3) + 1
                    }
                ]
            });
        }

        // Save to localStorage
        localStorage.setItem('savedOrders', JSON.stringify(orders));
        return orders;
    };

    // Order filter tabs event listeners
    const orderFilterTabs = document.querySelectorAll('.order-filter-tab');
    orderFilterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            orderFilterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            // Get filter value and load orders
            const filter = this.dataset.filter;
            window.loadOrdersWithFilter(filter);
        });
    });

    // Load all orders initially
    window.loadOrdersWithFilter('all');


    // 2. Mock Logout
    const logoutBtn = document.querySelector('.logout-link'); // sidebar
    const headerLogout = document.getElementById('logout-btn'); // header dropdown

    function handleLogout(e) {
        e.preventDefault();
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            // Clear any user session data (mock)
            localStorage.removeItem('user_token');
            // Redirect to home
            window.location.href = 'index.html';
        }
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (headerLogout) headerLogout.addEventListener('click', handleLogout);


    // 3. User Data Loading (Mock)
    // In a real app, we would fetch user data here.
    // For now we just use the static HTML values.

    // Simulate updating user info
    const updateBtn = document.querySelector('.update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const btn = e.target;
            const originalText = btn.textContent;

            btn.textContent = 'Güncelleniyor...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                alert('Bilgileriniz başarıyla güncellendi.');
            }, 1000);
        });
    }

    // --- History Tab (Önceden Gezdiklerim) ---
    function loadBrowsingHistory() {
        const historyContainer = document.getElementById('history-products-container');
        if (!historyContainer) return;

        // Get browsing history from localStorage
        const browsingHistory = JSON.parse(localStorage.getItem('browsingHistory')) || [];

        // Clear loading state
        historyContainer.innerHTML = '';

        if (browsingHistory.length === 0) {
            // Show empty state
            historyContainer.innerHTML = `
                <div class="history-empty-state">
                    <div class="history-empty-icon">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h3>Henüz Ürün Gezmediniz</h3>
                    <p>Baktığınız ürünler burada görünecek. Alışverişe başlayın ve ilginizi çeken ürünleri keşfedin!</p>
                    <a href="index.html" class="btn-browse-products">
                        <i class="fa-solid fa-shopping-bag"></i>
                        Alışverişe Başla
                    </a>
                </div>
            `;
            return;
        }

        // Sort by date (most recent first)
        browsingHistory.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

        // Create header with count and clear button
        const headerHTML = `
            <div class="history-header-row">
                <span class="history-count">${browsingHistory.length} ürün görüntülediniz</span>
                <button class="history-clear-btn" onclick="clearBrowsingHistory()">
                    <i class="fa-solid fa-trash-can"></i>
                    Geçmişi Temizle
                </button>
            </div>
        `;

        // Create product grid
        let productsHTML = '<div class="history-products-grid">';

        browsingHistory.forEach(product => {
            const viewDate = new Date(product.viewedAt);
            const timeAgo = getTimeAgo(viewDate);

            productsHTML += `
                <div class="history-product-card" onclick="window.location.href='urun-detay.html?id=${product.id}'">
                    <img src="${product.image}" alt="${product.name}" class="history-product-image">
                    <div class="history-product-info">
                        <div class="history-product-name">${product.name}</div>
                        <div class="history-product-price">${product.price}</div>
                        <div class="history-product-date">
                            <i class="fa-regular fa-clock"></i>
                            ${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        });

        productsHTML += '</div>';

        historyContainer.innerHTML = headerHTML + productsHTML;
    }

    // Helper function to calculate time ago
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
        return date.toLocaleDateString('tr-TR');
    }

    // Clear browsing history
    window.clearBrowsingHistory = function () {
        if (confirm('Tüm görüntüleme geçmişinizi silmek istediğinize emin misiniz?')) {
            localStorage.removeItem('browsingHistory');
            loadBrowsingHistory();
        }
    };

    // Load history when history tab is active
    const historyLink = document.querySelector('[data-tab="history"]');
    if (historyLink) {
        historyLink.addEventListener('click', () => {
            setTimeout(loadBrowsingHistory, 100);
        });
    }

    // Load history if on history tab initially
    const currentHash = window.location.hash.substring(1);
    if (currentHash === 'history') {
        setTimeout(loadBrowsingHistory, 100);
    }
});
