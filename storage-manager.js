// LocalStorage Temizleme ve Kota Yönetimi
// Bu script, localStorage kota aşımı sorunlarını çözer

(function () {
    'use strict';

    const MAX_LOCALSTORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit (güvenli sınır)

    // LocalStorage boyutunu hesapla
    function getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2; // UTF-16 karakterler 2 byte
            }
        }
        return total;
    }

    // Büyük ürün verilerini tespit et ve temizle
    function cleanLargeProductData() {
        const productKeys = ['galatacarsi_products', 'galata_products', 'products', 'admin_products', 'galata_products_cache'];
        let cleaned = false;

        productKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data && data.length > 500000) { // 500KB'dan büyük veriler
                    console.warn(`🧹 Temizleniyor: ${key} (${(data.length / 1024).toFixed(1)} KB)`);
                    localStorage.removeItem(key);
                    cleaned = true;
                }
            } catch (e) {
                console.error('Temizleme hatası:', e);
            }
        });

        return cleaned;
    }

    // Kota izleme
    function checkQuota() {
        const size = getLocalStorageSize();
        const sizeKB = (size / 1024).toFixed(1);
        const sizeMB = (size / (1024 * 1024)).toFixed(2);

        console.log(`📊 LocalStorage kullanımı: ${sizeKB} KB (${sizeMB} MB)`);

        if (size > MAX_LOCALSTORAGE_SIZE) {
            console.warn('⚠️ LocalStorage limiti aşılıyor, temizlik yapılıyor...');
            cleanLargeProductData();
        }
    }

    // Sayfa yüklendiğinde kontrol et
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkQuota);
    } else {
        checkQuota();
    }

    // Global erişim
    window.StorageManager = {
        getSize: getLocalStorageSize,
        clean: cleanLargeProductData,
        check: checkQuota
    };
})();
