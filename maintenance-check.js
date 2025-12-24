(function () {
    // 1. AYARLAR VE İSTİSNALAR
    const path = window.location.pathname;
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');

    const removeLock = () => {
        const blockingStyle = document.getElementById('bakim-blocking-style');
        if (blockingStyle) blockingStyle.remove();
    };

    // Eğer admin sayfası veya zaten bakım sayfasındaysak KİLİDİ HEMEN AÇ
    if (isAdminPage || isMaintenancePage) {
        removeLock();
        return;
    }

    // 2. YETKİ KONTROLÜ
    const isAuthorized = localStorage.getItem('admin_session') ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

    // 3. API ADRESİ
    const baseUrl = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    // 4. EMNİYET ZAMANLAYICISI (2 Saniye)
    const safetyTimeout = setTimeout(() => {
        console.warn('⚠️ Bakım kontrolü zaman aşımına uğradı, kilit açılıyor.');
        removeLock();
    }, 2000);

    // 5. KONTROL SORGUSU
    fetch(`${baseUrl}/settings?t=${Date.now()}`)
        .then(res => {
            clearTimeout(safetyTimeout);

            // Sunucu bakım modunda 503 verir
            if (res.status === 503) {
                if (!isAuthorized) {
                    window.location.href = '/maintenance.html';
                    return null;
                }
            }

            if (!res.ok) throw new Error('Sunucu hatası');
            return res.json();
        })
        .then(data => {
            if (!data) return;

            const isMaintenance = data.data?.isMaintenanceMode;
            if (isMaintenance && !isAuthorized) {
                window.location.href = '/maintenance.html';
            } else {
                removeLock();
            }
        })
        .catch(err => {
            clearTimeout(safetyTimeout);
            console.error('Bakım kontrol hatası:', err);
            removeLock(); // Hata varsa siteyi aç, kullanıcıyı mağdur etme
        });
})();
