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
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:' // Bilgisayardan açıldığında yerel sunucuyu dene
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    // Backend'den bakım durumu kontrolü
    // Cache bozucu ekleyerek her seferinde güncel durumu almasını sağlıyoruz
    fetch(`${baseUrl}/settings?t=${Date.now()}`)
        .then(res => {
            // Eğer sunucu 503 (Bakım) veriyorsa direkt bakım sayfasına git
            if (res.status === 503 && !isAuthorized) {
                window.location.href = '/maintenance.html';
                return;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return; // Zaten yönlendirildik

            if (data.success && data.data && data.data.isMaintenanceMode) {
                // Sadece admin DEĞİLSEN yönlendir
                if (!isAuthorized) {
                    window.location.href = '/maintenance.html';
                } else {
                    console.log('👷 Admin yetkisiyle siteyi görüyorsunuz.');
                    const blockingStyle = document.getElementById('bakim-blocking-style');
                    if (blockingStyle) blockingStyle.remove();
                }
            } else {
                const blockingStyle = document.getElementById('bakim-blocking-style');
                if (blockingStyle) blockingStyle.remove();
            }
        })
        .catch(err => {
            console.error('Maintenance check error:', err);
            const blockingStyle = document.getElementById('bakim-blocking-style');
            if (blockingStyle) blockingStyle.remove();
        });
})();
