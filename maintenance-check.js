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
    console.log('🔗 Bakım kontrolü yapılıyor: ' + baseUrl);

    fetch(`${baseUrl}/settings?t=${Date.now()}`)
        .then(res => {
            console.log('📡 Sunucu Yanıt Kodu:', res.status);
            // Eğer sunucu 503 (Bakım) veriyorsa ve admin değilsek
            if (res.status === 503) {
                if (!isAuthorized) {
                    console.log('🚫 Erişim Reddedildi: Bakım Modu Aktif.');
                    window.location.href = '/maintenance.html';
                    return;
                }
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;

            const isMaintenance = data.data?.isMaintenanceMode;
            console.log('📊 Bakım Modu Aktif mi?:', isMaintenance);
            console.log('👤 Yetkili Kullanıcı mı?:', !!isAuthorized);

            if (isMaintenance) {
                if (!isAuthorized) {
                    window.location.href = '/maintenance.html';
                } else {
                    console.warn('⚠️ DİKKAT: Site şu an bakımda ama Admin olduğunuz için görebiliyorsunuz.');
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
