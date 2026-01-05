// Search Page JavaScript - API Integrated - Robust Version (Auto-Fix Enabled)
// Gelişmiş Arama Sayfası - API Entegrasyonlu

document.addEventListener('DOMContentLoaded', () => {

    // API URL
    const API_URL = window.API_URL || 'https://galatacarsi-backend-api.onrender.com/api';

    // 1. Initial State & Data
    const state = {
        query: new URLSearchParams(window.location.search).get('q') || '',
        category: new URLSearchParams(window.location.search).get('category') || '',
        brand: new URLSearchParams(window.location.search).get('brand') || '',
        barcode: new URLSearchParams(window.location.search).get('barcode') || '',
        stockCode: new URLSearchParams(window.location.search).get('stockCode') || '',
        sort: new URLSearchParams(window.location.search).get('sort') || 'relevance',
        products: [],
        filteredProducts: [],
        filters: {
            categories: [],
            brands: [],
            minPrice: null,
            maxPrice: null
        },
        isLoading: true
    };

    const elements = {
        queryDisplay: document.getElementById('search-query-display'),
        headerSearchInput: document.getElementById('header-search-input') || document.getElementById('global-search-input'),
        headerSearchBtn: document.querySelector('.search-btn'),
        resultCount: document.getElementById('result-count'),
        grid: document.getElementById('search-results-grid'),
        categoryFilters: document.getElementById('category-filters'),
        brandFilters: document.getElementById('brand-filters'),
        sortSelect: document.getElementById('sort-select'),
        mobileFilterBtn: document.getElementById('open-filters-btn'),
        sidebar: document.querySelector('.search-sidebar'),
        closeFiltersBtn: document.getElementById('close-filters'),
        minPrice: document.getElementById('min-price'),
        maxPrice: document.getElementById('max-price'),
        priceFilterBtn: document.getElementById('price-filter-btn')
    };

    // 2. Initialize Page
    init();

    async function init() {
        if (elements.queryDisplay) setQueryDisplayText();

        if (elements.sortSelect && state.sort) {
            elements.sortSelect.value = state.sort.replace('_', '-');
        }

        // Initial Active Sort Button
        if (state.sort) {
            const btn = document.querySelector(`.sort-btn[data-sort="${state.sort.replace('_', '-')}"]`);
            if (btn) btn.classList.add('active');
        }

        showLoadingState();
        await loadProductsFromAPI();
        applyFilters();
        renderSidebarFilters();
        setupEventListeners();
    }

    function setQueryDisplayText() {
        if (!elements.queryDisplay) return;

        if (state.brand) {
            elements.queryDisplay.textContent = state.brand;
        } else if (state.barcode) {
            elements.queryDisplay.textContent = `Barkod: ${state.barcode}`;
        } else if (state.stockCode) {
            elements.queryDisplay.textContent = `Stok Kodu: ${state.stockCode}`;
        } else if (state.query) {
            elements.queryDisplay.textContent = state.query;
        } else if (state.category) {
            elements.queryDisplay.textContent = formatCategoryName(state.category);
        } else {
            elements.queryDisplay.textContent = 'Tüm Ürünler';
        }
    }

    function showLoadingState() {
        if (elements.grid) {
            elements.grid.innerHTML = `
                <div class="search-loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Ürünler yükleniyor...</p>
                </div>
            `;
        }
        if (elements.resultCount) {
            elements.resultCount.textContent = 'Yükleniyor...';
        }
    }

    // 3. Load Data from API or localStorage
    async function loadProductsFromAPI() {
        try {
            let apiUrl = `${API_URL}/products?limit=500`;

            if (state.brand) {
                apiUrl += `&brand=${encodeURIComponent(state.brand)}`;
            }

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('API yanıt vermedi');
            }

            const data = await response.json();

            if (data.success && data.data) {
                state.products = Array.isArray(data.data) ? data.data : [];
                console.log('✅ Search: Loaded', state.products.length, 'products from API');
            } else {
                throw new Error('Ürün verisi alınamadı');
            }

        } catch (error) {
            console.warn('Search: API Error, checking local storage fallback...', error);

            let localData = [];

            // STRATEGY 1: Check standard localStorage keys
            try {
                // Try keys in order of likelihood (galatacarsi_products is used by admin/products.html)
                const keysToCheck = ['galatacarsi_products', 'galata_products', 'galata_products_cache', 'products'];

                for (const key of keysToCheck) {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            localData = parsed;
                            console.log(`✅ Search: Found ${localData.length} products in '${key}'`);
                            break; // Stop if found
                        }
                    }
                }
            } catch (e) {
                console.error('Search: Error reading localStorage:', e);
            }

            // STRATEGY 2: Check window global from products-data.js (if loaded)
            if (localData.length === 0 && typeof window.getAllProductsSync === 'function') {
                try {
                    const syncData = window.getAllProductsSync();
                    if (Array.isArray(syncData) && syncData.length > 0) {
                        localData = syncData;
                        console.log('✅ Search: Found products via getAllProductsSync');
                    }
                } catch (e) { console.warn('Search: getAllProductsSync failed', e); }
            }

            // Apply found data
            if (localData.length > 0) {
                state.products = localData;
            } else {
                console.warn('Search: No products found in API or Local Storage.');
                state.products = [];
            }
        }

        state.isLoading = false;
    }

    // 4. Filtering Logic
    function applyFilters() {
        let results = [...state.products];

        if (state.query) {
            const q = state.query.toLowerCase();
            results = results.filter(p =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q)) ||
                (p.barcode && p.barcode.toLowerCase().includes(q)) ||
                (p.sku && p.sku.toLowerCase().includes(q))
            );
        }

        if (state.brand) {
            const brandLower = state.brand.toLowerCase();
            results = results.filter(p =>
                p.brand && p.brand.toLowerCase().includes(brandLower)
            );
        }

        // Additional filters...
        if (state.filters.categories.length > 0) {
            results = results.filter(p => state.filters.categories.includes(p.category));
        }

        // Sort
        const sortValue = state.sort;
        if (sortValue.includes('price')) {
            const isDesc = sortValue.includes('desc');
            results.sort((a, b) => {
                const getPrice = (p) => {
                    if (p.salePrice && parseFloat(p.salePrice) > 0) return parseFloat(p.salePrice);
                    return parseFloat(p.price || 0);
                };
                const pA = getPrice(a);
                const pB = getPrice(b);
                return isDesc ? pB - pA : pA - pB;
            });
        }

        state.filteredProducts = results;
        renderResults();
    }

    // 5. Rendering - Robust Version
    function renderResults() {
        if (!elements.grid) return;

        elements.grid.innerHTML = '';

        if (elements.resultCount) {
            elements.resultCount.textContent = `${state.filteredProducts.length} ürün bulundu`;
        }

        const emptyState = document.querySelector('.search-empty-state');
        const paginationEl = document.getElementById('pagination-container');

        if (state.filteredProducts.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (paginationEl) paginationEl.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (paginationEl) paginationEl.style.display = state.filteredProducts.length > 20 ? 'flex' : 'none';

        // Limit to 24 for "page 1" demo
        // Filter out products without valid images first
        const productsWithImages = state.filteredProducts.filter(product => {
            const img = product.mainImage || product.image || (product.images && product.images[0]);
            // Check if image exists and is not a placeholder URL
            if (!img) return false;
            if (img.includes('placehold.co') || img.includes('placeholder')) return false;
            return true;
        });

        const pageProducts = productsWithImages.slice(0, 24);

        // Update result count to reflect only products with images
        if (elements.resultCount) {
            elements.resultCount.textContent = `${productsWithImages.length} ürün bulundu`;
        }

        pageProducts.forEach(product => {
            try {
                const card = document.createElement('article');
                card.className = 'product-card';

                const productId = product._id || product.id;

                // Image Selection Logic
                let rawImage = product.mainImage || product.image || (product.images && product.images[0]);

                // Fix Image Source for Local File System (file://)
                // Converts '/gorseller/...' to './gorseller/...' etc.
                const fixImageSrc = (src) => {
                    if (!src) return null; // No placeholder - will be filtered
                    if (src.includes('placehold.co') || src.includes('placeholder')) return null;
                    if (src.startsWith('data:')) return src; // Base64 is fine
                    if (src.startsWith('http')) return src;  // External URL is fine

                    // Remove leading slash if present to make it relative
                    if (src.startsWith('/')) {
                        return '.' + src;
                    }
                    return src;
                };

                let productImage = fixImageSrc(rawImage);

                // Skip this product if no valid image
                if (!productImage) return;

                // Debug log (can be seen in browser console)
                // console.log('Product Image:', product.name, rawImage, '->', productImage);

                const productBrand = product.brand || '';
                const productName = product.name || 'İsimsiz Ürün';

                // İndirimli fiyat kontrolü
                const hasSalePrice = product.salePrice && parseFloat(product.salePrice) > 0;
                const displayPrice = hasSalePrice ? product.salePrice : product.price;
                const oldPrice = hasSalePrice ? product.price : (product.oldPrice || product.comparePrice);

                const productPrice = formatMoney(displayPrice);

                card.innerHTML = `
                    <div class="product-badges">
                        ${product.isNew ? '<span class="badge new">YENİ</span>' : ''}
                        ${hasSalePrice || product.discount ? '<span class="badge sale">İNDİRİM</span>' : ''}
                    </div>
                    <button class="fav-btn-card" type="button" onclick="window.toggleFavorite && window.toggleFavorite('${productId}')">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <a href="urun-detay.html?id=${productId}" class="product-img-wrapper">
                        <img src="${productImage}" loading="lazy" alt="${productName}" 
                             onerror="this.style.display='none';">
                    </a>
                    <div class="product-brand">${productBrand}</div>
                    <a href="urun-detay.html?id=${productId}" class="product-title">${productName}</a>
                    <div class="product-price-area">
                        <span class="current-price">${productPrice}</span>
                        ${oldPrice ? `<span class="old-price">${formatMoney(oldPrice)}</span>` : ''}
                    </div>
                    <button class="add-to-cart-sm" type="button" onclick="window.addToCartFromSearch && window.addToCartFromSearch('${productId}', this)">
                        <i class="fa-solid fa-cart-shopping"></i> Sepete Ekle
                    </button>
                `;
                elements.grid.appendChild(card);
            } catch (err) {
                console.error('Error rendering product card:', err, product);
            }
        });
    }

    // Expose render function for debugging/forcing
    window.renderSearchResults = renderResults;

    // AGGRESSIVE FIX: Check every 500ms if grid is empty or has issues, and force re-render if needed
    // This solves issues where other scripts (like script.js) might wipe the grid or load wrong data
    let checkCount = 0;
    const checker = setInterval(() => {
        const grid = document.getElementById('search-results-grid');
        const cards = grid ? grid.querySelectorAll('.product-card') : [];
        const hasImages = Array.from(cards).some(card => {
            const img = card.querySelector('img');
            return img && img.src && img.src.length > 50 && !img.src.includes('placehold.co') && !img.src.includes('undefined');
        });

        // If we have data but grid is empty OR images look broken/missing in local mode
        if (state.products.length > 0 && (cards.length === 0 || (window.location.protocol === 'file:' && !hasImages))) {
            console.warn('Search: Detected issue with grid (Empty or Broken Images). Forcing Re-render...', checkCount);
            renderResults();
        }

        checkCount++;
        if (checkCount > 10) clearInterval(checker); // Stop after 5 seconds
    }, 500);

    function renderSidebarFilters() {
        const categories = [...new Set(state.products.filter(p => p.category).map(p => p.category))].sort();
        if (elements.categoryFilters) {
            elements.categoryFilters.innerHTML = categories.map(cat => `
                <label class="filter-item">
                    <input type="checkbox" value="${cat}" onchange="toggleFilter('categories', '${escapeQuotes(cat)}')">
                    <span>${cat}</span>
                    <span class="filter-count">(${state.products.filter(p => p.category === cat).length})</span>
                </label>
            `).join('');
        }

        const brands = [...new Set(state.products.filter(p => p.brand).map(p => p.brand))].sort().slice(0, 15);
        if (elements.brandFilters) {
            elements.brandFilters.innerHTML = brands.map(brand => `
                <label class="filter-item">
                    <input type="checkbox" value="${brand}" onchange="toggleFilter('brands', '${escapeQuotes(brand)}')"
                        ${state.brand && brand.toLowerCase() === state.brand.toLowerCase() ? 'checked' : ''}>
                    <span>${brand}</span>
                </label>
            `).join('');
        }
    }

    window.toggleFilter = function (type, value) {
        // Simple toggle implementation
        const index = state.filters[type].indexOf(value);
        if (index > -1) state.filters[type].splice(index, 1);
        else state.filters[type].push(value);
        applyFilters();
    };

    function setupEventListeners() {
        if (elements.headerSearchBtn) {
            elements.headerSearchBtn.addEventListener('click', () => {
                const input = elements.headerSearchInput;
                if (input && input.value.trim()) {
                    window.location.href = `arama.html?q=${encodeURIComponent(input.value.trim())}`;
                }
            });
        }
        // ... (other events can be added here)
    }

    function escapeQuotes(str) { return str.replace(/'/g, "\\'"); }

    function formatMoney(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return 'Fiyat Yok';
        return num.toLocaleString('tr-TR') + ' TL';
    }

    function formatCategoryName(slug) {
        if (!slug) return '';
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Toolbar Search Input
    const toolbarSearchInput = document.getElementById('toolbar-search-input');
    if (toolbarSearchInput) {
        toolbarSearchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            if (!searchTerm) {
                renderResults(); // Tüm sonuçları göster
                return;
            }

            // Filtrele
            state.filteredProducts = state.products.filter(product => {
                const name = (product.name || '').toLowerCase();
                const brand = (product.brand || '').toLowerCase();
                const category = (product.category || '').toLowerCase();
                const subCategory = (product.subCategory || '').toLowerCase();

                return name.includes(searchTerm) ||
                    brand.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    subCategory.includes(searchTerm);
            });

            renderResults();
        });
    }

    // Sort Buttons
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const sortType = this.getAttribute('data-sort');

            // Active state
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Sort helper
            const getPrice = (p) => {
                if (p.salePrice && parseFloat(p.salePrice) > 0) return parseFloat(p.salePrice);
                return parseFloat(p.price || 0);
            };

            // Sort
            if (sortType === 'price-asc') {
                state.filteredProducts.sort((a, b) => getPrice(a) - getPrice(b));
            } else if (sortType === 'price-desc') {
                state.filteredProducts.sort((a, b) => getPrice(b) - getPrice(a));
            }

            renderResults();
        });
    });

    // Add CSS for loading state if missing
    if (!document.getElementById('search-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'search-loading-styles';
        style.textContent = `
            .search-loading { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #888; }
            .search-loading i { font-size: 32px; color: #8b7bd8; margin-bottom: 12px; }
        `;
        document.head.appendChild(style);
    }
});
