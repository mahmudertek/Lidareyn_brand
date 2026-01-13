/**
 * Search History & Recently Viewed Products Manager
 * - Arama geçmişi: Tüm search bar'lar için
 * - Önceden gezilen ürünler: Ürün detay sayfaları için
 * - Benzer ürünler: Ürün detay sayfaları için
 */

(function () {
    'use strict';

    const SEARCH_HISTORY_KEY = 'galata_search_history';
    const MAX_SEARCH_HISTORY = 10;
    const BROWSING_HISTORY_KEY = 'browsingHistory';

    // ==================== SEARCH HISTORY ====================

    /**
     * Arama geçmişini localStorage'dan al
     */
    function getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Arama geçmişine yeni arama ekle
     */
    function addToSearchHistory(query) {
        if (!query || query.trim().length < 2) return;

        const trimmedQuery = query.trim();
        let history = getSearchHistory();

        // Aynı arama varsa sil (en üste taşınacak)
        history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());

        // Başa ekle
        history.unshift(trimmedQuery);

        // Maksimum sayıyı aşmasın
        if (history.length > MAX_SEARCH_HISTORY) {
            history = history.slice(0, MAX_SEARCH_HISTORY);
        }

        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }

    /**
     * Tek bir arama geçmişini sil
     */
    function removeFromSearchHistory(query) {
        let history = getSearchHistory();
        history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }

    /**
     * Tüm arama geçmişini temizle
     */
    function clearSearchHistory() {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    }

    // ==================== BROWSING HISTORY ====================

    /**
     * Gezilen ürün geçmişini al
     */
    function getBrowsingHistory() {
        try {
            const history = JSON.parse(localStorage.getItem(BROWSING_HISTORY_KEY)) || [];
            // En son görüntülenenden en eskiye sırala
            return history.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
        } catch (e) {
            return [];
        }
    }

    /**
     * Belirli bir ürünü hariç tutarak gezilen ürün geçmişini al
     */
    function getBrowsingHistoryExcluding(productId) {
        return getBrowsingHistory().filter(item => item.id !== productId);
    }

    // ==================== UI COMPONENTS ====================

    /**
     * Arama geçmişi dropdown HTML'i oluştur
     */
    function createSearchHistoryDropdown(history, onSelect, onRemove, onClear) {
        if (!history || history.length === 0) return '';

        let html = `
            <div class="search-history-dropdown">
                <div class="search-history-header">
                    <span class="search-history-title">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        Son Aramalar
                    </span>
                    <button class="search-history-clear-btn" title="Tümünü Temizle">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="search-history-list">
        `;

        history.forEach(query => {
            html += `
                <div class="search-history-item" data-query="${encodeURIComponent(query)}">
                    <i class="fa-solid fa-magnifying-glass search-history-icon"></i>
                    <span class="search-history-text">${escapeHtml(query)}</span>
                    <button class="search-history-remove-btn" data-query="${encodeURIComponent(query)}" title="Kaldır">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * HTML'i escape et
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Search bar'a arama geçmişi özelliği ekle
     */
    function attachSearchHistory(searchInput, searchContainer) {
        if (!searchInput || !searchContainer) return;

        // Mevcut dropdown varsa tekrar ekleme
        if (searchContainer.querySelector('.search-history-dropdown-wrapper')) return;

        // Wrapper oluştur
        const wrapper = document.createElement('div');
        wrapper.className = 'search-history-dropdown-wrapper';
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(wrapper);

        // Focus olduğunda ve input boşsa geçmişi göster
        searchInput.addEventListener('focus', function () {
            const query = this.value.trim();
            if (query.length === 0) {
                showSearchHistory(wrapper, searchInput);
            }
        });

        // Input değiştiğinde
        searchInput.addEventListener('input', function () {
            const query = this.value.trim();
            if (query.length === 0) {
                showSearchHistory(wrapper, searchInput);
            } else {
                wrapper.innerHTML = '';
            }
        });

        // Dışarı tıklandığında kapat
        document.addEventListener('click', function (e) {
            if (!searchContainer.contains(e.target)) {
                wrapper.innerHTML = '';
            }
        });

        // Enter tuşunda geçmişe ekle
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query.length >= 2) {
                    addToSearchHistory(query);
                }
            }
        });
    }

    /**
     * Arama geçmişini göster
     */
    function showSearchHistory(wrapper, searchInput) {
        const history = getSearchHistory();
        if (history.length === 0) {
            wrapper.innerHTML = '';
            return;
        }

        wrapper.innerHTML = createSearchHistoryDropdown(history);

        // Event listener'ları ekle
        const items = wrapper.querySelectorAll('.search-history-item');
        items.forEach(item => {
            item.addEventListener('click', function (e) {
                if (e.target.closest('.search-history-remove-btn')) return;

                const query = decodeURIComponent(this.dataset.query);
                searchInput.value = query;
                wrapper.innerHTML = '';

                // Input event tetikle (live search için)
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));

                // Form submit veya arama yap
                const isInSubfolder = window.location.pathname.includes('/kategoriler/') ||
                    window.location.pathname.includes('/admin/');
                const basePath = isInSubfolder ? '../' : '';
                window.location.href = basePath + 'arama.html?q=' + encodeURIComponent(query);
            });
        });

        // Silme butonları
        const removeBtns = wrapper.querySelectorAll('.search-history-remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const query = decodeURIComponent(this.dataset.query);
                removeFromSearchHistory(query);
                showSearchHistory(wrapper, searchInput);
            });
        });

        // Tümünü temizle
        const clearBtn = wrapper.querySelector('.search-history-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                clearSearchHistory();
                wrapper.innerHTML = '';
            });
        }
    }

    // ==================== PRODUCT DETAIL PAGE SECTIONS ====================

    /**
     * Slider ID counter
     */
    let sliderIdCounter = 0;

    /**
     * "Önceden Gezdikleriniz" bölümünü oluştur (Slider formatında)
     */
    function createRecentlyViewedSection(currentProductId) {
        // Debug: Tüm browsing history'yi kontrol et
        const allHistory = getBrowsingHistory();
        console.log('📦 Browsing History - Total items:', allHistory.length);
        console.log('📦 Browsing History - Current Product ID:', currentProductId);

        const history = getBrowsingHistoryExcluding(currentProductId);
        console.log('📦 Browsing History - After excluding current:', history.length);

        if (history.length === 0) {
            console.log('📦 Önceden Gezdikleriniz: No items to show (browsing history empty or only current product)');
            return null;
        }

        const sliderId = 'recently-viewed-slider-' + (++sliderIdCounter);

        const section = document.createElement('section');
        section.className = 'product-slider-section recently-viewed-section';
        section.innerHTML = `
            <div class="product-slider-container">
                <div class="product-slider-header">
                    <h2 class="product-slider-title">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        ÖNCEDEN GEZDİKLERİNİZ
                    </h2>
                    <div class="product-slider-nav">
                        <button class="slider-nav-btn slider-prev" data-slider="${sliderId}" aria-label="Önceki">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button class="slider-nav-btn slider-next" data-slider="${sliderId}" aria-label="Sonraki">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="product-slider-wrapper" id="${sliderId}">
                    <div class="product-slider-track">
                        ${history.slice(0, 12).map(product => createProductCard(product)).join('')}
                    </div>
                </div>
            </div>
        `;

        // Slider navigasyonunu aktifleştir
        setTimeout(() => initSliderNav(sliderId), 100);

        console.log('📦 Önceden Gezdikleriniz: Section created with', history.length, 'items');
        return section;
    }

    /**
     * "İncelediğin Ürünlere Benzer" bölümünü oluştur (Slider formatında)
     */
    async function createSimilarProductsSection(currentProduct) {
        if (!currentProduct) return null;

        let similarProducts = [];

        try {
            // API'den benzer ürünleri çek
            const category = currentProduct.category;
            const brand = currentProduct.brand;
            const currentId = currentProduct._id || currentProduct.id;

            // Önce aynı kategoriden ürünler
            const response = await fetch(`https://galatacarsi-backend-api.onrender.com/api/products?limit=50`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Aynı kategori veya marka olan ürünleri filtrele
                    similarProducts = data.data.filter(p => {
                        const pId = p._id || p.id;
                        if (pId === currentId) return false;

                        const sameCategory = category && p.category &&
                            p.category.toLowerCase() === category.toLowerCase();
                        const sameBrand = brand && p.brand &&
                            p.brand.toLowerCase() === brand.toLowerCase();

                        return sameCategory || sameBrand;
                    });

                    // Rastgele karıştır
                    similarProducts = similarProducts.sort(() => Math.random() - 0.5);
                }
            }
        } catch (e) {
            console.warn('Benzer ürünler yüklenemedi:', e);
        }

        // Gezilen ürünlerden de ekle (fallback)
        if (similarProducts.length < 6) {
            const browsingHistory = getBrowsingHistoryExcluding(currentProduct._id || currentProduct.id);
            browsingHistory.forEach(item => {
                if (!similarProducts.find(p => (p._id || p.id) === item.id)) {
                    similarProducts.push({
                        _id: item.id,
                        name: item.name,
                        price: parseFloat(item.price) || 0,
                        mainImage: item.image
                    });
                }
            });
        }

        if (similarProducts.length === 0) return null;

        const sliderId = 'similar-products-slider-' + (++sliderIdCounter);

        const section = document.createElement('section');
        section.className = 'product-slider-section similar-products-section';
        section.innerHTML = `
            <div class="product-slider-container">
                <div class="product-slider-header">
                    <h2 class="product-slider-title">
                        <i class="fa-solid fa-sparkles"></i>
                        İNCELEDİĞİN ÜRÜNLERE BENZER
                    </h2>
                    <div class="product-slider-nav">
                        <button class="slider-nav-btn slider-prev" data-slider="${sliderId}" aria-label="Önceki">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button class="slider-nav-btn slider-next" data-slider="${sliderId}" aria-label="Sonraki">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="product-slider-wrapper" id="${sliderId}">
                    <div class="product-slider-track">
                        ${similarProducts.slice(0, 12).map(product => createProductCard({
            id: product._id || product.id,
            name: product.name,
            price: product.salePrice || product.price,
            image: product.mainImage || product.image
        })).join('')}
                    </div>
                </div>
            </div>
        `;

        // Slider navigasyonunu aktifleştir
        setTimeout(() => initSliderNav(sliderId), 100);

        return section;
    }

    /**
     * Slider navigasyonunu başlat
     */
    function initSliderNav(sliderId) {
        const wrapper = document.getElementById(sliderId);
        if (!wrapper) return;

        const track = wrapper.querySelector('.product-slider-track');
        if (!track) return;

        const prevBtn = document.querySelector(`.slider-prev[data-slider="${sliderId}"]`);
        const nextBtn = document.querySelector(`.slider-next[data-slider="${sliderId}"]`);

        if (!prevBtn || !nextBtn) return;

        const scrollAmount = 300; // Her tıklamada kaydırılacak piksel

        prevBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Scroll durumuna göre butonları güncelle
        function updateButtonStates() {
            const isAtStart = wrapper.scrollLeft <= 10;
            const isAtEnd = wrapper.scrollLeft >= (wrapper.scrollWidth - wrapper.clientWidth - 10);

            prevBtn.style.opacity = isAtStart ? '0.3' : '1';
            prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';

            nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
            nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
        }

        wrapper.addEventListener('scroll', updateButtonStates);
        updateButtonStates();
    }

    /**
     * Ürün kartı HTML'i oluştur
     */
    function createProductCard(product) {
        const price = parseFloat(product.price) || 0;
        const formattedPrice = price > 0 ? `₺${price.toLocaleString('tr-TR')}` : 'Fiyat Yok';
        const image = product.image || 'https://placehold.co/200x200/f5f5f5/999?text=Ürün';

        return `
            <a href="urun-detay.html?id=${product.id}" class="browsing-product-card">
                <div class="browsing-product-image-wrapper">
                    <img src="${image}" alt="${escapeHtml(product.name || 'Ürün')}" 
                         onerror="this.src='https://placehold.co/200x200/f5f5f5/999?text=Ürün'">
                </div>
                <div class="browsing-product-info">
                    <h3 class="browsing-product-name">${escapeHtml(product.name || 'İsimsiz Ürün')}</h3>
                    <span class="browsing-product-price">${formattedPrice}</span>
                </div>
            </a>
        `;
    }

    // ==================== INITIALIZATION ====================

    /**
     * Tüm search bar'lara arama geçmişi özelliği ekle
     */
    function initSearchHistory() {
        // Header search bar - DİKKAT: live-search.js artık bunu yönetiyor
        // Ayrı bir dropdown oluşturma, çakışma olur
        // const headerSearchInput = document.querySelector('.search-container .search-input');
        // const headerSearchContainer = document.querySelector('.search-container');
        // if (headerSearchInput && headerSearchContainer) {
        //     attachSearchHistory(headerSearchInput, headerSearchContainer);
        // }

        // Mobile search overlay
        const mobileSearchInput = document.querySelector('.mobile-search-input');
        const mobileSearchForm = document.querySelector('.mobile-search-form');
        if (mobileSearchInput && mobileSearchForm) {
            attachSearchHistory(mobileSearchInput, mobileSearchForm);
        }

        // Gelişmiş arama sayfasındaki search bar'lar
        const advancedSearchInputs = document.querySelectorAll('.advanced-search-input, #general-search-input, #brand-search-input');
        advancedSearchInputs.forEach(input => {
            const container = input.closest('.search-field-wrapper') || input.parentElement;
            if (container) {
                attachSearchHistory(input, container);
            }
        });

        // Kategori sayfalarındaki search bar'lar
        const categorySearchInputs = document.querySelectorAll('.category-search-input, .filter-search-input');
        categorySearchInputs.forEach(input => {
            const container = input.closest('.search-wrapper') || input.parentElement;
            if (container) {
                attachSearchHistory(input, container);
            }
        });

        console.log('🔍 Search History: Initialized');
    }

    /**
     * Ürün detay sayfasında bölümleri ekle
     */
    async function initProductDetailSections() {
        // Sadece ürün detay sayfasında çalış
        if (!window.location.pathname.includes('urun-detay.html') &&
            !window.location.pathname.includes('urun_detay.html')) return;

        console.log('📦 Product Detail Sections: Starting...');

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (!productId) {
            console.log('📦 Product Detail Sections: No product ID found');
            return;
        }

        // Ürün bilgilerini bekle
        await waitForProductData();

        // product-tabs div'ini bul (Description Tab'ın parent'ı)
        const productTabs = document.querySelector('.product-tabs');
        const tabsContainer = productTabs ? productTabs.closest('div[style*="max-width"]') : null;

        // Alternatif: main elementi bul
        const main = document.querySelector('main');
        const footer = document.querySelector('footer.main-footer');

        // Ekleme noktasını belirle
        let insertPoint = null;
        let insertMethod = 'after'; // 'after' veya 'before'

        if (tabsContainer) {
            insertPoint = tabsContainer;
        } else if (main && footer) {
            insertPoint = footer;
            insertMethod = 'before';
        } else if (main) {
            insertPoint = main;
            insertMethod = 'append';
        }

        if (!insertPoint) {
            console.warn('📦 Product Detail Sections: No suitable insertion point found');
            return;
        }

        // Ürün bilgilerini al
        let currentProduct = null;
        try {
            if (window.API && window.API.getProductById) {
                const res = await window.API.getProductById(productId);
                if (res && res.success && res.data) {
                    currentProduct = res.data;
                }
            }
        } catch (e) {
            console.warn('Ürün bilgileri alınamadı:', e);
        }

        // Container oluştur
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'product-detail-extra-sections';
        sectionsContainer.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 0 20px 60px;';

        // 1. İncelediğin Ürünlere Benzer (ÜSTte)
        const similarSection = await createSimilarProductsSection(currentProduct);
        if (similarSection) {
            sectionsContainer.appendChild(similarSection);
            console.log('📦 Added: İncelediğin Ürünlere Benzer section');
        }

        // 2. Önceden Gezdikleriniz (ALTta)
        const recentlyViewedSection = createRecentlyViewedSection(productId);
        if (recentlyViewedSection) {
            sectionsContainer.appendChild(recentlyViewedSection);
            console.log('📦 Added: Önceden Gezdikleriniz section');
        }

        // Eğer hiç bölüm eklenmeyecekse return
        if (sectionsContainer.children.length === 0) {
            console.log('📦 Product Detail Sections: No sections to add (no browsing history or similar products)');
            return;
        }

        // Konuma göre ekle
        if (insertMethod === 'after') {
            insertPoint.after(sectionsContainer);
        } else if (insertMethod === 'before') {
            insertPoint.before(sectionsContainer);
        } else {
            insertPoint.appendChild(sectionsContainer);
        }

        console.log('📦 Product Detail Sections: Initialized successfully!');
    }

    /**
     * Ürün verilerinin yüklenmesini bekle
     */
    function waitForProductData() {
        return new Promise(resolve => {
            let attempts = 0;
            const maxAttempts = 20;

            const checkData = () => {
                const titleEl = document.getElementById('product-title');
                if (titleEl && !titleEl.textContent.includes('Yükleniyor')) {
                    resolve();
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkData, 250);
                } else {
                    resolve();
                }
            };

            setTimeout(checkData, 500);
        });
    }

    // ==================== CSS INJECTION ====================

    function injectStyles() {
        if (document.getElementById('search-history-styles')) return;

        const style = document.createElement('style');
        style.id = 'search-history-styles';
        style.textContent = `
            /* Search History Dropdown */
            .search-history-dropdown-wrapper {
                position: absolute;
                top: 100%;
                right: 0;
                width: 600px;
                z-index: 10000;
            }
            
            /* Ensure parent container allows dropdown to be seen */
            .search-container {
                overflow: visible !important;
                position: relative;
            }

            .search-history-dropdown {
                background: white;
                border: 1px solid rgba(0,0,0,0.05);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                margin-top: 10px;
                overflow: hidden;
            }

            .search-history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f9f9f9;
                border-bottom: 1px solid #eee;
            }

            .search-history-title {
                font-size: 0.75rem;
                font-weight: 700;
                color: #666;
                text-transform: uppercase;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .search-history-title i {
                color: #8b7bd8;
            }

            .search-history-clear-btn {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .search-history-clear-btn:hover {
                background: #fee;
                color: #e74c3c;
            }

            .search-history-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .search-history-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.15s;
                gap: 12px;
                border-bottom: 1px solid #f5f5f5;
            }

            .search-history-item:hover {
                background: #f4f4fa;
            }

            .search-history-item:last-child {
                border-bottom: none;
            }

            .search-history-icon {
                color: #bbb;
                font-size: 14px;
                flex-shrink: 0;
            }

            .search-history-text {
                flex: 1;
                font-size: 14px;
                color: #333;
            }

            .search-history-remove-btn {
                background: none;
                border: none;
                color: #ccc;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                opacity: 0;
                transition: all 0.2s;
            }

            .search-history-item:hover .search-history-remove-btn {
                opacity: 1;
            }

            .search-history-remove-btn:hover {
                color: #e74c3c;
                background: #fee;
            }

            /* Product Slider Section */
            .product-slider-section {
                margin-top: 40px;
                padding: 30px 0;
                border-top: 1px solid #eee;
            }

            .product-slider-container {
                max-width: 100%;
            }

            .product-slider-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .product-slider-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #333;
                display: flex;
                align-items: center;
                gap: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0;
            }

            .product-slider-title i {
                color: #8b7bd8;
            }

            .product-slider-nav {
                display: flex;
                gap: 8px;
            }

            .slider-nav-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #eee;
                background: white;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .slider-nav-btn:hover {
                border-color: #8b7bd8;
                color: #8b7bd8;
                background: #f8f7ff;
            }

            .product-slider-wrapper {
                overflow-x: auto;
                overflow-y: hidden;
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .product-slider-wrapper::-webkit-scrollbar {
                display: none;
            }

            .product-slider-track {
                display: flex;
                gap: 16px;
                padding: 4px;
            }

            /* Product Card - Slider için */
            .browsing-product-card {
                flex: 0 0 180px;
                min-width: 180px;
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                text-decoration: none;
                color: inherit;
                border: 1px solid #f0f0f0;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }

            .browsing-product-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                border-color: #8b7bd8;
            }

            .browsing-product-image-wrapper {
                position: relative;
                aspect-ratio: 1;
                background: #f9f9f9;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .browsing-product-image-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                transform: scale(0.85);
                transition: transform 0.3s;
            }

            .browsing-product-card:hover .browsing-product-image-wrapper img {
                transform: scale(0.95);
            }

            .browsing-product-info {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .browsing-product-name {
                font-size: 0.85rem;
                font-weight: 500;
                color: #333;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                margin: 0;
            }

            .browsing-product-price {
                font-size: 0.95rem;
                font-weight: 700;
                color: #8b7bd8;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .product-slider-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .product-slider-title {
                    font-size: 1rem;
                }

                .slider-nav-btn {
                    width: 36px;
                    height: 36px;
                }

                .browsing-product-card {
                    flex: 0 0 150px;
                    min-width: 150px;
                }

                .browsing-product-name {
                    font-size: 0.75rem;
                }

                .browsing-product-price {
                    font-size: 0.85rem;
                }
            }

            /* Eski grid stilleri (geriye uyumluluk) */
            .recently-viewed-grid,
            .similar-products-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 20px;
            }

            @media (max-width: 1200px) {
                .recently-viewed-grid,
                .similar-products-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            @media (max-width: 900px) {
                .recently-viewed-grid,
                .similar-products-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 600px) {
                .recently-viewed-grid,
                .similar-products-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== MAIN ====================

    function init() {
        injectStyles();
        initSearchHistory();
        initProductDetailSections();
    }

    // DOM hazır olduğunda çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global erişim için export
    window.SearchHistory = {
        get: getSearchHistory,
        add: addToSearchHistory,
        remove: removeFromSearchHistory,
        clear: clearSearchHistory
    };

})();
