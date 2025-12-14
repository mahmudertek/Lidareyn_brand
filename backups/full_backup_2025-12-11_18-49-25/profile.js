document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const links = document.querySelectorAll('.profile-link[data-tab]');
    const contents = document.querySelectorAll('.profile-tab-content');

    function switchTab(tabId) {
        // Remove active class from all links and contents
        links.forEach(l => l.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        // Add active class to target
        const activeLink = document.querySelector(`.profile-link[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}-tab`);

        if (activeLink && activeContent) {
            activeLink.classList.add('active');
            activeContent.classList.add('active');

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
            switchTab(tabId);
            // Update URL hash without jumping
            history.pushState(null, null, `#${tabId}`);
        });
    });

    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    const paramTab = new URLSearchParams(window.location.search).get('tab');

    if (hash && document.getElementById(`${hash}-tab`)) {
        switchTab(hash);
    } else if (paramTab && document.getElementById(`${paramTab}-tab`)) {
        switchTab(paramTab);
    } else {
        // Default to orders
        switchTab('orders');
    }

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
                        <a href="#" class="btn-text">Sipariş Detayı <i class="fa-solid fa-chevron-right"></i></a>
                    </div>
                </div>`;

                ordersContainer.innerHTML += orderHTML;
            });
        }
    }

    loadOrders(); // Call immediately


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
});
