(function () {
    // 1. EMNİYET LİSTESİ VE KİLİT KALDIRICI
    const path = window.location.pathname;
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');

    const removeLock = () => {
        // Eski versiyonlardan kalma kilitleri temizle (Cache sorununu çözer)
        const blockingStyle = document.getElementById('bakim-blocking-style');
        if (blockingStyle) blockingStyle.remove();

        // Eğer bir şekilde html hala gizliyse zorla aç
        document.documentElement.style.display = 'block';
        document.documentElement.style.visibility = 'visible';
    };

    // Eğer admin veya bakım sayfasındaysak kilidi hemen aç
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

    // 4. EMNİYET ZAMANLAYICISI (Hızlı açılması için 1.5 saniye)
    const safetyTimeout = setTimeout(() => {
        removeLock();
    }, 1500);

    // 5. KONTROL SORGUSU
    fetch(`${baseUrl}/settings?t=${Date.now()}`)
        .then(res => {
            clearTimeout(safetyTimeout);

            if (res.status === 503) {
                if (!isAuthorized) {
                    window.location.href = '/maintenance.html';
                    return null;
                }
            }
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
            removeLock();
        });
})();
