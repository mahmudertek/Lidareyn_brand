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
