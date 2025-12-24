(function () {
    console.log('🚀 [BAKIM SİSTEMİ V5.0] Yükleniyor...');

    const path = window.location.pathname;
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');

    if (isMaintenancePage || isAdminPage) {
        console.log('✅ İstisna sayfa, kontrol atlandı.');
        return;
    }

    // const isAuthorized = localStorage.getItem('adminToken');
    // if (isAuthorized) {
    //     console.log('🛡️ Admin yetkisi algılandı, siteye erişim serbest.');
    //     return;
    // }

    const baseUrl = (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    async function checkMaintenance() {
        console.log('📡 Sunucuya bakım durumu soruluyor... (URL: ' + baseUrl + ')');
        try {
            const response = await fetch(`${baseUrl}/settings?t=${Date.now()}`);

            // 503 HTTP Kodu (Middleware'den gelen)
            if (response.status === 503) {
                console.log('🔥 Sunucu 503 döndü! Bakım aktif.');
                redirectToMaintenance();
                return;
            }

            const data = await response.json();
            console.log('📥 Sunucu Yanıtı:', data);

            if (data && data.data && data.data.isMaintenanceMode) {
                console.log('🚩 Bakım modu veritabanında AÇIK. Yönlendiriliyor...');
                redirectToMaintenance();
            } else {
                console.log('🟢 Bakım modu kapalı. İyi alışverişler!');
            }
        } catch (error) {
            console.error('❌ Bağlantı hatası veya 500 hatası:', error);
        }
    }

    function redirectToMaintenance() {
        if (window.location.protocol === 'file:') {
            // Local file system redirect
            // Check if we are in a subdirectory (e.g. admin or categories)
            const pathParts = window.location.pathname.split('/');
            const isInSubDir = pathParts.length > 2 && !window.location.pathname.endsWith('/'); // Rough check

            // If we are deep, we might need ../maintenance.html. 
            // But usually this script runs on main pages. 
            // For now, assume root or simple relative.
            window.location.href = 'maintenance.html';
            return;
        }

        const siteUrl = window.location.hostname === 'localhost' ? '' : 'https://www.galatacarsi.com';
        const finalTarget = siteUrl + '/maintenance.html';
        console.log('✈️ Hedef: ' + finalTarget);
        window.location.href = finalTarget;
    }

    checkMaintenance();
})();
