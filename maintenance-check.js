/**
 * BAKIM MODU SİSTEMİ v6.0 - TEK DOSYA KONTROL
 * 
 * Nasıl Kullanılır:
 * 1. Bakım modunu AÇMAK için: maintenance-config.json dosyasında "enabled": true yapın
 * 2. Bakım modunu KAPATMAK için: maintenance-config.json dosyasında "enabled": false yapın
 * 3. Değişikliği GitHub'a push edin, Vercel otomatik deploy edecek
 * 
 * Bu kadar basit! 🎉
 */
(function () {
    console.log('🚀 [BAKIM SİSTEMİ V6.0] Yükleniyor...');

    const path = window.location.pathname;
    const isMaintenancePage = path.includes('maintenance.html') || path.includes('bakimda.html');
    const isAdminPage = path.includes('/admin/') || path.includes('admin.html');

    // Bakım ve admin sayfalarını atla
    if (isMaintenancePage || isAdminPage) {
        console.log('✅ İstisna sayfa, kontrol atlandı.');
        return;
    }

    // Config dosyasının yolunu belirle
    function getConfigPath() {
        const hostname = window.location.hostname;

        // Canlı site
        if (hostname === 'www.galatacarsi.com' || hostname === 'galatacarsi.com') {
            return 'https://www.galatacarsi.com/maintenance-config.json';
        }

        // Vercel preview
        if (hostname.includes('vercel.app')) {
            return '/maintenance-config.json';
        }

        // Localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/maintenance-config.json';
        }

        // File protocol için
        if (window.location.protocol === 'file:') {
            return 'maintenance-config.json';
        }

        // Varsayılan
        return '/maintenance-config.json';
    }

    async function checkMaintenance() {
        const configPath = getConfigPath();
        console.log('📡 Bakım durumu kontrol ediliyor... (' + configPath + ')');

        try {
            // Cache'i bypass etmek için timestamp ekle
            const response = await fetch(configPath + '?t=' + Date.now(), {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.log('⚠️ Config dosyası bulunamadı, bakım kapalı varsayılıyor.');
                return;
            }

            const config = await response.json();
            console.log('📥 Bakım Ayarları:', config);

            if (config && config.enabled === true) {
                console.log('🚩 BAKIM MODU AÇIK! Yönlendiriliyor...');
                redirectToMaintenance();
            } else {
                console.log('🟢 Bakım modu kapalı. İyi alışverişler!');
            }
        } catch (error) {
            console.log('⚠️ Config okunamadı:', error.message);
            // Hata durumunda siteyi açık tut (fail-safe)
        }
    }

    function redirectToMaintenance() {
        const hostname = window.location.hostname;

        if (window.location.protocol === 'file:') {
            window.location.href = 'maintenance.html';
            return;
        }

        if (hostname === 'www.galatacarsi.com' || hostname === 'galatacarsi.com') {
            window.location.href = 'https://www.galatacarsi.com/maintenance.html';
        } else {
            window.location.href = '/maintenance.html';
        }
    }

    // Kontrol başlat
    checkMaintenance();
})();
