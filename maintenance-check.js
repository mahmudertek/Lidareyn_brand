(function () {
    // Bakım modunu kontrol etmeden önce istisnaları belirle
    const path = window.location.pathname;
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');
    const isMaintenancePage = path.includes('maintenance.html');

    // Eğer admin sayfası veya zaten bakım sayfasındaysak kontrol etme
    if (isAdminPage || isMaintenancePage) return;

    // Yetki kontrolü (Adminler bakım modundan etkilenmez)
    const isAuthorized = localStorage.getItem('admin_session') ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

    // URL üzerinden bypass kontrolü (Geliştirici için)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('maintenance_bypass')) {
        localStorage.setItem('admin_session', 'active_' + Date.now());
        return;
    }

    // API Base URL (admin-api.js ile senkronize olmalı)
    const baseUrl = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    // Backend'den bakım durumu kontrolü
    // Not: Bu işlem asenkron olduğu için sayfa yüklenirken kısa bir süre içerik görünebilir
    // Bu yüzden index.html'de blocking style kullanıyoruz.
    fetch(`${baseUrl}/settings`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.isMaintenanceMode) {
                if (!isAuthorized) {
                    window.location.href = '/maintenance.html';
                }
            } else {
                // Bakım modu kapalıysa veya hata varsa blocking style'ı kaldır (index.html için)
                const blockingStyle = document.getElementById('bakim-blocking-style');
                if (blockingStyle) blockingStyle.remove();
            }
        })
        .catch(err => {
            console.error('Maintenance check failed:', err);
            // Hata durumunda siteyi açık bırakıyoruz (safe-fail)
            const blockingStyle = document.getElementById('bakim-blocking-style');
            if (blockingStyle) blockingStyle.remove();
        });
})();
