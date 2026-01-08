// Browsing History Tracker
// This script automatically tracks product views and stores them in localStorage

(function () {
    'use strict';

    // Function to add product to browsing history
    function addToBrowsingHistory(product) {
        // Get existing history
        let browsingHistory = JSON.parse(localStorage.getItem('browsingHistory')) || [];

        // Check if product already exists in history
        const existingIndex = browsingHistory.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            // Update existing entry with new view time
            browsingHistory[existingIndex].viewedAt = new Date().toISOString();
        } else {
            // Add new entry
            browsingHistory.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                viewedAt: new Date().toISOString()
            });
        }

        // Keep only last 50 products
        if (browsingHistory.length > 50) {
            browsingHistory = browsingHistory.slice(-50);
        }

        // Save to localStorage
        localStorage.setItem('browsingHistory', JSON.stringify(browsingHistory));
    }

    // Auto-track on product detail pages
    function trackProductView() {
        // Check if we're on a product detail page
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) return;

        // Ürün adının yüklenmesini bekle (API verisi yüklenene kadar)
        let attempts = 0;
        const maxAttempts = 30; // 15 saniye max

        const checkAndTrack = () => {
            const productNameEl = document.querySelector('.product-name, .product-title, h1, #product-title');
            const productPriceEl = document.querySelector('.product-price, .price, #product-price');
            const productImageEl = document.querySelector('.product-image, .main-image img, .product-img, #mainImage');

            // Ürün adı yüklendi mi kontrol et
            const hasData = productNameEl &&
                productNameEl.textContent.trim() &&
                !productNameEl.textContent.includes('Yükleniyor');

            if (hasData) {
                const productData = {
                    id: productId,
                    name: productNameEl.textContent.trim(),
                    price: productPriceEl ? productPriceEl.textContent.trim() : 'Fiyat Yok',
                    image: productImageEl ? (productImageEl.src || productImageEl.getAttribute('data-src') || 'https://placehold.co/200') : 'https://placehold.co/200'
                };

                addToBrowsingHistory(productData);
                console.log('📝 Browsing History: Product tracked -', productData.name);
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkAndTrack, 500);
                } else {
                    console.warn('📝 Browsing History: Could not track product - data not loaded');
                }
            }
        };

        // İlk kontrolü 1 saniye sonra yap (API verisi yüklensin)
        setTimeout(checkAndTrack, 1000);
    }

    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackProductView);
    } else {
        trackProductView();
    }

    // Export for manual use
    window.BrowsingHistory = {
        add: addToBrowsingHistory,
        get: function () {
            return JSON.parse(localStorage.getItem('browsingHistory')) || [];
        },
        clear: function () {
            localStorage.removeItem('browsingHistory');
        }
    };
})();
