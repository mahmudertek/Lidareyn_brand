// Advanced Search Panel JavaScript
// Gelişmiş Arama Fonksiyonları - Live Search & API Entegrasyonu

(function () {
    'use strict';

    // API URL
    const API_URL = window.API_URL || 'https://galatacarsi-backend-api.onrender.com/api';

    // Cached products for live search
    let cachedProducts = [];
    let isLoadingProducts = false;

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initAdvancedSearch();
        loadAllProducts(); // Preload products for live search
    });

    // Load all products for live search suggestions
    async function loadAllProducts() {
        if (isLoadingProducts || cachedProducts.length > 0) return;
        isLoadingProducts = true;

        try {
            const response = await fetch(`${API_URL}/products?limit=1000`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    cachedProducts = Array.isArray(data.data) ? data.data : [];
                    console.log('✅ Advanced Search: Loaded', cachedProducts.length, 'products from API');

                    // Also save to localStorage for offline use
                    try {
                        localStorage.setItem('galata_products', JSON.stringify(cachedProducts));
                    } catch (e) {
                        console.warn('Could not save products to localStorage:', e);
                    }
                }
            } else {
                throw new Error('API response not ok');
            }
        } catch (error) {
            console.warn('Advanced Search: Could not load from API, trying localStorage', error);

            // Fallback to localStorage
            try {
                const localProducts = localStorage.getItem('galata_products');
                if (localProducts) {
                    cachedProducts = JSON.parse(localProducts);
                    console.log('✅ Advanced Search: Loaded', cachedProducts.length, 'products from localStorage');
                }
            } catch (e) {
                console.error('Advanced Search: localStorage error:', e);
            }
        }
        isLoadingProducts = false;
    }

    function initAdvancedSearch() {
        // General Search (Sayfa, marka, ürün, kategori)
        initGeneralSearch();

        // Brand Search
        initBrandSearch();

        // Barcode Search
        initBarcodeSearch();

        // Stock Code Search
        initStockSearch();

        // Price Sort Options
        initPriceSortOptions();

        // Clear Filters Button
        initClearFilters();

        console.log('✅ Advanced Search Panel initialized with live search');
    }

    // ==================== GENERAL SEARCH (Dynamic) ====================
    let cachedBrands = [];
    let cachedCategories = [];

    // Load dynamic brands from API/localStorage
    async function loadDynamicBrands() {
        try {
            // Try API first
            if (window.API && window.API.getBrands) {
                const response = await window.API.getBrands();
                if (response && response.success && response.data) {
                    cachedBrands = response.data;
                    console.log('✅ Brands loaded from API:', cachedBrands.length);
                    return;
                }
            }
        } catch (e) { console.warn('Brand API failed', e); }

        // Fallback to localStorage
        try {
            const local = localStorage.getItem('galata_brands');
            if (local) {
                cachedBrands = JSON.parse(local);
                console.log('✅ Brands loaded from localStorage:', cachedBrands.length);
            }
        } catch (e) { console.error('Brand localStorage error', e); }
    }

    // Load categories from categoriesData (global)
    function loadCategoriesFromData() {
        if (typeof categoriesData !== 'undefined') {
            cachedCategories = [];
            Object.keys(categoriesData).forEach(slug => {
                const cat = categoriesData[slug];
                // Ana kategori
                cachedCategories.push({
                    type: 'category',
                    name: cat.title,
                    slug: slug,
                    icon: cat.icon || 'fa-folder',
                    link: `kategori.html?cat=${slug}`
                });
                // Alt kategoriler
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach(sub => {
                        // Group name
                        cachedCategories.push({
                            type: 'subcategory',
                            name: sub.name,
                            parent: cat.title,
                            slug: slug,
                            icon: sub.icon || 'fa-tag',
                            link: `kategori.html?cat=${slug}&sub=${encodeURIComponent(sub.name)}`
                        });
                        // Items within group
                        if (sub.items && Array.isArray(sub.items)) {
                            sub.items.forEach(item => {
                                cachedCategories.push({
                                    type: 'item',
                                    name: item,
                                    parent: sub.name,
                                    grandparent: cat.title,
                                    slug: slug,
                                    icon: 'fa-circle-dot',
                                    link: `arama.html?q=${encodeURIComponent(item)}`
                                });
                            });
                        }
                    });
                }
            });
            console.log('✅ Categories loaded:', cachedCategories.length);
        }
    }

    // Static pages
    const staticPages = [
        { name: 'Ana Sayfa', link: 'index.html', icon: 'fa-home' },
        { name: 'Yeni Gelenler', link: 'yeni-gelenler.html', icon: 'fa-sparkles' },
        { name: 'Popüler Ürünler', link: 'populer.html', icon: 'fa-fire' },
        { name: 'Tüm Kategoriler', link: 'kategoriler.html', icon: 'fa-th-large' },
        { name: 'Hakkımızda', link: 'hakkimizda.html', icon: 'fa-info-circle' },
        { name: 'İletişim', link: 'iletisim.html', icon: 'fa-envelope' },
        { name: 'Sepetim', link: 'sepet.html', icon: 'fa-shopping-cart' },
        { name: 'Favorilerim', link: 'favoriler.html', icon: 'fa-heart' },
        { name: 'Giriş Yap', link: 'giris-yap.html', icon: 'fa-sign-in-alt' }
    ];

    function initGeneralSearch() {
        const searchInput = document.getElementById('general-search-input');
        const searchBtn = document.getElementById('general-search-btn');
        const resultsContainer = document.getElementById('live-search-results');

        if (!searchInput || !resultsContainer) return;

        // Load dynamic data
        loadDynamicBrands();
        loadCategoriesFromData();

        // Live search on input
        let debounceTimer;
        searchInput.addEventListener('input', function (e) {
            const query = e.target.value.trim().toLowerCase();

            clearTimeout(debounceTimer);

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(() => {
                showGeneralSearchResults(query, resultsContainer, searchInput);
            }, 200);
        });

        // Search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', function () {
                performGeneralSearch(searchInput.value);
            });
        }

        // Enter key
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                resultsContainer.style.display = 'none';
                performGeneralSearch(searchInput.value);
            }
        });

        // Hide on outside click
        document.addEventListener('click', function (e) {
            if (!searchInput.closest('.responsive-search-input-container').contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    function showGeneralSearchResults(query, container, input) {
        let html = '';

        // 1. Sayfalar
        const matchingPages = staticPages.filter(p => p.name.toLowerCase().includes(query));
        if (matchingPages.length > 0) {
            html += '<div class="live-search-section-title"><i class="fa-solid fa-file"></i> Sayfalar</div>';
            matchingPages.forEach(page => {
                html += `
                    <a href="${page.link}" class="live-search-item">
                        <i class="fa-solid ${page.icon}"></i>
                        <span class="live-search-name">${highlightMatch(page.name, query)}</span>
                    </a>
                `;
            });
        }

        // 2. Kategoriler (Ana + Alt + Item)
        const matchingCategories = cachedCategories.filter(c => c.name.toLowerCase().includes(query)).slice(0, 8);
        if (matchingCategories.length > 0) {
            html += '<div class="live-search-section-title"><i class="fa-solid fa-folder"></i> Kategoriler</div>';
            matchingCategories.forEach(cat => {
                const subLabel = cat.parent ? `<small style="color:#888; margin-left:5px;">(${cat.parent})</small>` : '';
                html += `
                    <a href="${cat.link}" class="live-search-item">
                        <i class="fa-solid ${cat.icon}"></i>
                        <span class="live-search-name">${highlightMatch(cat.name, query)}${subLabel}</span>
                    </a>
                `;
            });
        }

        // 3. Markalar (Dinamik)
        const matchingBrands = cachedBrands.filter(b => b.name && b.name.toLowerCase().includes(query)).slice(0, 6);
        if (matchingBrands.length > 0) {
            html += '<div class="live-search-section-title"><i class="fa-solid fa-tag"></i> Markalar</div>';
            matchingBrands.forEach(brand => {
                const productCount = cachedProducts.filter(p => p.brand && p.brand.toLowerCase() === brand.name.toLowerCase()).length;
                html += `
                    <div class="live-search-item" data-brand="${brand.name}" style="cursor:pointer;">
                        <i class="fa-solid fa-tag"></i>
                        <span class="live-search-name">${highlightMatch(brand.name, query)}</span>
                        ${productCount > 0 ? `<span class="live-search-count">${productCount} ürün</span>` : ''}
                    </div>
                `;
            });
        }

        // 4. Ürünler
        const matchingProducts = cachedProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        ).slice(0, 6);
        if (matchingProducts.length > 0) {
            html += '<div class="live-search-section-title"><i class="fa-solid fa-box"></i> Ürünler</div>';
            matchingProducts.forEach(product => {
                html += `
                    <a href="urun-detay.html?id=${product._id || product.id}" class="live-search-item live-search-product">
                        <img src="${product.mainImage || product.image || 'https://placehold.co/50x50/f0f0f0/999?text=Ürün'}" alt="${product.name}">
                        <div class="live-search-product-info">
                            <span class="live-search-name">${highlightMatch(product.name, query)}</span>
                            <span class="live-search-brand">${product.brand || ''}</span>
                        </div>
                        <span class="live-search-price">${formatPrice(product.price)}</span>
                    </a>
                `;
            });
        }

        // Sonuç yok
        if (html === '') {
            html = '<div class="live-search-no-result">"' + query + '" için sonuç bulunamadı</div>';
        }

        container.innerHTML = html;
        container.style.display = 'block';

        // Add click handlers to brand items
        container.querySelectorAll('.live-search-item[data-brand]').forEach(item => {
            item.addEventListener('click', function () {
                const brand = this.dataset.brand;
                input.value = brand;
                container.style.display = 'none';
                performBrandSearch(brand);
            });
        });
    }

    function performGeneralSearch(query) {
        if (!query || !query.trim()) {
            showNotification('Lütfen bir arama terimi girin.', 'warning');
            return;
        }
        window.location.href = `arama.html?q=${encodeURIComponent(query.trim())}`;
    }

    // ==================== CLEAR FILTERS ====================
    function initClearFilters() {
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                // Clear all inputs
                const inputs = document.querySelectorAll('.advanced-search-panel input[type="text"]');
                inputs.forEach(input => input.value = '');
                // Redirect to clean home or refresh
                window.location.href = 'index.html';
            });
        }
    }


    // ==================== BRAND SEARCH ====================
    function initBrandSearch() {
        const brandSearchInput = document.getElementById('brand-search-input');
        const brandSearchBtn = document.getElementById('brand-search-btn');

        if (!brandSearchInput) return;

        // Create live search dropdown
        const dropdown = createLiveSearchDropdown(brandSearchInput, 'brand-search-dropdown');

        // Live search on input
        let debounceTimer;
        brandSearchInput.addEventListener('input', function (e) {
            const query = e.target.value.trim().toLowerCase();

            clearTimeout(debounceTimer);

            if (query.length < 2) {
                hideDropdown(dropdown);
                return;
            }

            debounceTimer = setTimeout(() => {
                showBrandSuggestions(query, dropdown, brandSearchInput);
            }, 200);
        });

        // Search button click
        if (brandSearchBtn) {
            brandSearchBtn.addEventListener('click', function () {
                performBrandSearch(brandSearchInput.value);
            });
        }

        // Enter key
        brandSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                hideDropdown(dropdown);
                performBrandSearch(brandSearchInput.value);
            }
        });

        // Hide on outside click
        document.addEventListener('click', function (e) {
            if (!brandSearchInput.parentElement.contains(e.target)) {
                hideDropdown(dropdown);
            }
        });
    }

    function showBrandSuggestions(query, dropdown, input) {
        // Get unique brands from cached products
        const brands = [...new Set(cachedProducts
            .filter(p => p.brand && p.brand.toLowerCase().includes(query))
            .map(p => p.brand)
        )].slice(0, 8);

        // Also search products by brand name
        const matchingProducts = cachedProducts
            .filter(p => p.brand && p.brand.toLowerCase().includes(query))
            .slice(0, 5);

        let html = '';

        // Brand suggestions
        if (brands.length > 0) {
            html += '<div class="live-search-section-title">Markalar</div>';
            brands.forEach(brand => {
                const productCount = cachedProducts.filter(p => p.brand === brand).length;
                html += `
                    <div class="live-search-item" data-brand="${brand}">
                        <i class="fa-solid fa-tag"></i>
                        <span class="live-search-name">${highlightMatch(brand, query)}</span>
                        <span class="live-search-count">${productCount} ürün</span>
                    </div>
                `;
            });
        }

        // Matching products
        if (matchingProducts.length > 0) {
            html += '<div class="live-search-section-title">Ürünler</div>';
            matchingProducts.forEach(product => {
                html += `
                    <a href="urun-detay.html?id=${product._id || product.id}" class="live-search-item live-search-product">
                        <img src="${product.mainImage || product.image || 'https://placehold.co/50x50/f0f0f0/999?text=Ürün'}" alt="${product.name}">
                        <div class="live-search-product-info">
                            <span class="live-search-name">${highlightMatch(product.name, query)}</span>
                            <span class="live-search-brand">${product.brand || ''}</span>
                        </div>
                        <span class="live-search-price">${formatPrice(product.price)}</span>
                    </a>
                `;
            });
        }

        if (html === '') {
            html = '<div class="live-search-no-result">"' + query + '" için marka bulunamadı</div>';
        }

        dropdown.innerHTML = html;
        showDropdown(dropdown);

        // Add click handlers to brand items
        dropdown.querySelectorAll('.live-search-item[data-brand]').forEach(item => {
            item.addEventListener('click', function () {
                const brand = this.dataset.brand;
                input.value = brand;
                hideDropdown(dropdown);
                performBrandSearch(brand);
            });
        });
    }

    function performBrandSearch(brandName) {
        if (!brandName || !brandName.trim()) {
            showNotification('Lütfen bir marka adı girin.', 'warning');
            return;
        }

        // Redirect to search page with brand filter
        window.location.href = `arama.html?brand=${encodeURIComponent(brandName.trim())}`;
    }

    // ==================== BARCODE SEARCH ====================
    function initBarcodeSearch() {
        const barcodeInput = document.getElementById('barcode-search-input');
        const barcodeBtn = document.getElementById('barcode-search-btn');

        if (!barcodeInput) return;

        // Create live search dropdown
        const dropdown = createLiveSearchDropdown(barcodeInput, 'barcode-search-dropdown');

        // Live search on input
        let debounceTimer;
        barcodeInput.addEventListener('input', function (e) {
            const query = e.target.value.trim();

            clearTimeout(debounceTimer);

            if (query.length < 3) {
                hideDropdown(dropdown);
                return;
            }

            debounceTimer = setTimeout(() => {
                showBarcodeSuggestions(query, dropdown);
            }, 200);
        });

        // Search button click
        if (barcodeBtn) {
            barcodeBtn.addEventListener('click', function () {
                performBarcodeSearch(barcodeInput.value);
            });
        }

        // Enter key
        barcodeInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                hideDropdown(dropdown);
                performBarcodeSearch(barcodeInput.value);
            }
        });

        // Hide on outside click
        document.addEventListener('click', function (e) {
            if (!barcodeInput.parentElement.contains(e.target)) {
                hideDropdown(dropdown);
            }
        });
    }

    function showBarcodeSuggestions(query, dropdown) {
        const matchingProducts = cachedProducts
            .filter(p => p.barcode && p.barcode.toString().includes(query))
            .slice(0, 5);

        let html = '';

        if (matchingProducts.length > 0) {
            html += '<div class="live-search-section-title">Bulunan Ürünler</div>';
            matchingProducts.forEach(product => {
                html += `
                    <a href="urun-detay.html?id=${product._id || product.id}" class="live-search-item live-search-product">
                        <img src="${product.mainImage || product.image || 'https://placehold.co/50x50/f0f0f0/999?text=Ürün'}" alt="${product.name}">
                        <div class="live-search-product-info">
                            <span class="live-search-name">${product.name}</span>
                            <span class="live-search-brand">Barkod: ${highlightMatch(product.barcode || '', query)}</span>
                        </div>
                        <span class="live-search-price">${formatPrice(product.price)}</span>
                    </a>
                `;
            });
        } else {
            html = '<div class="live-search-no-result">"' + query + '" barkod numarası bulunamadı</div>';
        }

        dropdown.innerHTML = html;
        showDropdown(dropdown);
    }

    function performBarcodeSearch(barcode) {
        if (!barcode || !barcode.trim()) {
            showNotification('Lütfen bir barkod numarası girin.', 'warning');
            return;
        }

        // Redirect to search page with barcode filter
        window.location.href = `arama.html?barcode=${encodeURIComponent(barcode.trim())}`;
    }

    // ==================== STOCK CODE SEARCH ====================
    function initStockSearch() {
        const stockInput = document.getElementById('stock-search-input');
        const stockBtn = document.getElementById('stock-search-btn');

        if (!stockInput) return;

        // Create live search dropdown
        const dropdown = createLiveSearchDropdown(stockInput, 'stock-search-dropdown');

        // Live search on input
        let debounceTimer;
        stockInput.addEventListener('input', function (e) {
            const query = e.target.value.trim().toLowerCase();

            clearTimeout(debounceTimer);

            if (query.length < 2) {
                hideDropdown(dropdown);
                return;
            }

            debounceTimer = setTimeout(() => {
                showStockSuggestions(query, dropdown);
            }, 200);
        });

        // Search button click
        if (stockBtn) {
            stockBtn.addEventListener('click', function () {
                performStockSearch(stockInput.value);
            });
        }

        // Enter key
        stockInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                hideDropdown(dropdown);
                performStockSearch(stockInput.value);
            }
        });

        // Hide on outside click
        document.addEventListener('click', function (e) {
            if (!stockInput.parentElement.contains(e.target)) {
                hideDropdown(dropdown);
            }
        });
    }

    function showStockSuggestions(query, dropdown) {
        const matchingProducts = cachedProducts
            .filter(p => {
                const stockCode = (p.stockCode || p.sku || p.stock_code || '').toString().toLowerCase();
                return stockCode.includes(query);
            })
            .slice(0, 5);

        let html = '';

        if (matchingProducts.length > 0) {
            html += '<div class="live-search-section-title">Bulunan Ürünler</div>';
            matchingProducts.forEach(product => {
                const stockCode = product.stockCode || product.sku || product.stock_code || '-';
                html += `
                    <a href="urun-detay.html?id=${product._id || product.id}" class="live-search-item live-search-product">
                        <img src="${product.mainImage || product.image || 'https://placehold.co/50x50/f0f0f0/999?text=Ürün'}" alt="${product.name}">
                        <div class="live-search-product-info">
                            <span class="live-search-name">${product.name}</span>
                            <span class="live-search-brand">Stok Kodu: ${highlightMatch(stockCode, query)}</span>
                        </div>
                        <span class="live-search-price">${formatPrice(product.price)}</span>
                    </a>
                `;
            });
        } else {
            html = '<div class="live-search-no-result">"' + query + '" stok kodu bulunamadı</div>';
        }

        dropdown.innerHTML = html;
        showDropdown(dropdown);
    }

    function performStockSearch(stockCode) {
        if (!stockCode || !stockCode.trim()) {
            showNotification('Lütfen bir stok kodu girin.', 'warning');
            return;
        }

        // Redirect to search page with stock code filter
        window.location.href = `arama.html?stockCode=${encodeURIComponent(stockCode.trim())}`;
    }

    // ==================== PRICE SORT OPTIONS ====================
    function initPriceSortOptions() {
        const sortOptions = document.querySelectorAll('input[name="price-sort"]');

        sortOptions.forEach(function (option) {
            option.addEventListener('change', function () {
                // Update visual state
                document.querySelectorAll('.sort-option-item').forEach(function (item) {
                    item.classList.remove('checked');
                });
                this.closest('.sort-option-item').classList.add('checked');

                // Redirect to search with sort
                const sortOrder = this.value;
                if (sortOrder === 'high-to-low') {
                    window.location.href = 'arama.html?sort=price_desc';
                } else if (sortOrder === 'low-to-high') {
                    window.location.href = 'arama.html?sort=price_asc';
                }
            });
        });
    }

    // ==================== UTILITY FUNCTIONS ====================

    function createLiveSearchDropdown(input, id) {
        // Check if dropdown already exists
        let dropdown = document.getElementById(id);
        if (dropdown) return dropdown;

        // Create new dropdown
        dropdown = document.createElement('div');
        dropdown.id = id;
        dropdown.className = 'live-search-dropdown';

        // Insert after input wrapper
        const wrapper = input.closest('.search-input-wrapper');
        if (wrapper) {
            wrapper.style.position = 'relative';
            wrapper.appendChild(dropdown);
        }

        return dropdown;
    }

    function showDropdown(dropdown) {
        dropdown.classList.add('active');
    }

    function hideDropdown(dropdown) {
        dropdown.classList.remove('active');
    }

    function highlightMatch(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function formatPrice(price) {
        if (!price) return '';
        return parseFloat(price).toLocaleString('tr-TR') + ' TL';
    }

    function showNotification(message, type) {
        // Remove existing notification
        const existing = document.querySelector('.adv-search-notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'adv-search-notification ' + type;
        notification.innerHTML = '<i class="fa-solid fa-circle-info"></i> ' + message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'warning' ? '#fff3cd' : '#d4edda'};
            color: ${type === 'warning' ? '#856404' : '#155724'};
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(function () {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(function () {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Add CSS for live search dropdowns
    if (!document.getElementById('adv-search-live-styles')) {
        const style = document.createElement('style');
        style.id = 'adv-search-live-styles';
        style.textContent = `
            .live-search-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                z-index: 1000;
                display: none;
                overflow: hidden;
                max-height: 400px;
                overflow-y: auto;
            }
            .live-search-dropdown.active {
                display: block;
            }
            .live-search-section-title {
                padding: 10px 16px;
                font-size: 11px;
                font-weight: 700;
                color: #888;
                text-transform: uppercase;
                background: #fafafa;
                border-bottom: 1px solid #eee;
                letter-spacing: 0.5px;
            }
            .live-search-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 12px;
                cursor: pointer;
                transition: background 0.15s;
                border-bottom: 1px solid #f5f5f5;
                text-decoration: none;
                color: #333;
            }
            .live-search-item:hover {
                background: #f8f6ff;
            }
            .live-search-item i {
                color: #8b7bd8;
                font-size: 14px;
                width: 20px;
                text-align: center;
            }
            .live-search-name {
                flex: 1;
                font-size: 14px;
            }
            .live-search-name strong {
                color: #8b7bd8;
                font-weight: 600;
            }
            .live-search-count {
                font-size: 12px;
                color: #999;
                background: #f0f0f0;
                padding: 2px 8px;
                border-radius: 10px;
            }
            .live-search-product img {
                width: 50px;
                height: 50px;
                object-fit: contain;
                border-radius: 8px;
                border: 1px solid #eee;
                background: #fff;
            }
            .live-search-product-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .live-search-product-info .live-search-name {
                font-weight: 500;
                font-size: 13px;
            }
            .live-search-brand {
                font-size: 11px;
                color: #888;
            }
            .live-search-price {
                font-weight: 700;
                color: #8b7bd8;
                font-size: 13px;
            }
            .live-search-no-result {
                padding: 20px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes slideUp {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }

})();
