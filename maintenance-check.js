(function () {
    const path = window.location.pathname;
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');
    if (isMaintenancePage) return;

    const isAuthorized = localStorage.getItem('admin_session') ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

    const baseUrl = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api';

    fetch(`${baseUrl}/settings?t=${Date.now()}`)
        .then(res => {
            if (res.status === 503 && !isAuthorized) {
                window.location.href = '/maintenance.html';
            }
            return res.json();
        })
        .then(data => {
            if (data && data.data && data.data.isMaintenanceMode && !isAuthorized) {
                window.location.href = '/maintenance.html';
            }
        })
        .catch(err => console.log('Bakım kontrolü atlandı (Sunucu yanıt vermedi).'));
})();
