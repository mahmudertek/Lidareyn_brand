(function () {
    const path = window.location.pathname;
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');

    if (isMaintenancePage || isAdminPage) return;

    // SADECE adminToken kontrolü yapalım (Daha güvenli)
    const isAuthorized = localStorage.getItem('adminToken');

    const baseUrl = (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    async function checkMaintenance() {
        try {
            console.log('🔍 Bakım kontrolü başlatıldı...');
            const response = await fetch(`${baseUrl}/settings?t=${Date.now()}`);

            if (response.status === 503 && !isAuthorized) {
                redirectToMaintenance();
                return;
            }

            const data = await response.json();
            console.log('📡 Sunucu yanıtı:', data);

            if (data && data.data && data.data.isMaintenanceMode && !isAuthorized) {
                redirectToMaintenance();
            }
        } catch (error) {
            console.error('❌ Bağlantı hatası:', error);
        }
    }

    function redirectToMaintenance() {
        console.log('🚀 Bakım sayfasına uçuş başlatılıyor...');
        // Tam adres kullanarak hatayı engelliyoruz
        const siteUrl = window.location.hostname === 'localhost' ? '' : 'https://www.galatacarsi.com';
        window.location.href = siteUrl + '/maintenance.html';
    }

    checkMaintenance();
})();
