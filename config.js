// Environment Configuration
// Bu dosya production ve development ortamları için API URL'lerini yönetir

const ENV = {
    // Otomatik ortam tespiti
    isDevelopment: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:',

    // API URL'leri
    // API URL'leri - HER ZAMAN CANLI (PRODUCTION) KULLAN
    // Kullanıcı web panelinden veri girdiği için, localden bile açılsa veriyi oradan çekmelidir.
    API_URL: 'https://galatacarsi-backend-api.onrender.com/api',

    // Site URL'leri
    SITE_URL: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost'  // Development
        : 'https://galatacarsi.com',  // Production - BURAYA DOMAIN'İNİZİ YAZIN

    // Payment Provider Configuration
    // Options: 'sipay' (recommended - lowest fees), 'iyzico', 'demo'
    PAYMENT_PROVIDER: 'sipay',

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
    console.log('💳 Payment Provider:', ENV.PAYMENT_PROVIDER);
}

// Global olarak erişilebilir yap
window.ENV = ENV;

// CONFIG alias for checkout.js compatibility
window.CONFIG = {
    API_URL: ENV.API_URL,
    SITE_URL: ENV.SITE_URL,
    PAYMENT_PROVIDER: ENV.PAYMENT_PROVIDER
};
