// Environment Configuration
// Bu dosya production ve development ortamları için API URL'lerini yönetir

const ENV = {
    // Otomatik ortam tespiti
    isDevelopment: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:',

    // API URL'leri
    API_URL: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost:5000/api'  // Development
        : 'https://galatacarsi-backend-api.onrender.com/api',  // Production - Render Backend

    // Site URL'leri
    SITE_URL: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost'  // Development
        : 'https://yourdomain.com',  // Production - BURAYA DOMAIN'İNİZİ YAZIN

    // Debug modu
    DEBUG: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
};

// Console'da ortam bilgisini göster
if (ENV.DEBUG) {
    console.log('🔧 Environment:', ENV.isDevelopment ? 'Development' : 'Production');
    console.log('🌐 API URL:', ENV.API_URL);
    console.log('🏠 Site URL:', ENV.SITE_URL);
}

// Global olarak erişilebilir yap
window.ENV = ENV;
