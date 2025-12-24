(function () {
    // 1. AYARLAR VE YOL BELİRLEME
    const path = window.location.pathname;
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');

    // Bakım sayfasındaysak veya admin sayfasındaysak hiçbir şey yapma
    if (isMaintenancePage || isAdminPage) return;

    // 2. YETKİ KONTROLÜ (Adminler muaf)
    const isAuthorized = localStorage.getItem('admin_session') ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

    // 3. API URL (Gelişmiş Tespit)
    const baseUrl = (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    // 4. KONTROL FONKSİYONU
    async function checkMaintenance() {
        try {
            const response = await fetch(`${baseUrl}/settings?t=${Date.now()}`);

            // Eğer sunucu 503 (Bakım) veriyorsa
            if (response.status === 503 && !isAuthorized) {
                redirectToMaintenance();
                return;
            }

            const data = await response.json();
            if (data && data.data && data.data.isMaintenanceMode && !isAuthorized) {
                redirectToMaintenance();
            }
        } catch (error) {
            console.log('Maintenance check skipped or server unreachable.');
        }
    }

    function redirectToMaintenance() {
        // Alt klasör kontrolü
        const isInSubfolder = window.location.pathname.includes('/kategoriler/');
        const target = isInSubfolder ? '../maintenance.html' : 'maintenance.html';

        // Eğer zaten o sayfada değilsek yönlendir
        if (!window.location.pathname.includes(target)) {
            window.location.href = target;
        }
    }

    // Sorguyu arka planda başlat (Sayfa açılışını engellemez, beyaz ekranı çözer)
    checkMaintenance();
})();
