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
        updateBreadcrumbs();
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

    // 3. Load Data - Hybrid Mode (Merge API + Local)
    async function loadProductsFromAPI() {
        let apiProducts = [];
        let localProducts = [];

        // Step 1: Fetch from API
        try {
            let apiUrl = `${API_URL}/products?limit=500`;
            if (state.brand) {
                apiUrl += `&brand=${encodeURIComponent(state.brand)}`;
            }

            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    apiProducts = Array.isArray(data.data) ? data.data : [];
                    console.log('✅ Search: Loaded', apiProducts.length, 'products from API');
                }
            }
        } catch (error) {
            console.warn('Search: API Fetch failed, will rely on local data', error);
        }

        // Step 2: Fetch from localStorage and Sync Sources
        try {
            const keysToCheck = ['galatacarsi_products', 'galata_products', 'galatat_products_cache', 'products'];
            for (const key of keysToCheck) {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        localProducts = parsed;
                        console.log(`✅ Search: Found ${localProducts.length} products in local '${key}'`);
                        break;
                    }
                }
            }

            // Fallback to global sync function if available
            if (localProducts.length === 0 && typeof window.getAllProductsSync === 'function') {
                localProducts = window.getAllProductsSync() || [];
            }
        } catch (e) {
            console.error('Search: Local storage read error', e);
        }

        // Step 3: Smart Merge & Deduplicate (Preferred API version if ID matches)
        const productMap = new Map();

        // Load local first as baseline
        localProducts.forEach(p => {
            const id = p._id || p.id;
            if (id) productMap.set(id.toString(), p);
        });

        // Overwrite/Merge with API data (API is source of truth for same ID)
        apiProducts.forEach(p => {
            const id = p._id || p.id;
            if (id) productMap.set(id.toString(), p);
        });

        state.products = Array.from(productMap.values());
        console.log('🚀 Search: Hybrid data ready.', state.products.length, 'unique products found.');

        state.isLoading = false;
    }

    // 4. Smart Filtering Logic
    function applyFilters() {
        let results = [...state.products];

        // Normalization helper for smart matching
        const normalize = (str) => {
            if (!str) return '';
            return str.toLowerCase()
                .trim()
                .replace(/lar$/, '')
                .replace(/ler$/, '')
                .replace(/ı$/, '')
                .replace(/i$/, '')
                .replace(/u$/, '')
                .replace(/ü$/, '');
        };

        if (state.query) {
            const q = normalize(state.query);
            results = results.filter(p =>
                normalize(p.name).includes(q) ||
                normalize(p.brand).includes(q) ||
                normalize(p.category).includes(q) ||
                normalize(p.subCategory).includes(q) ||
                (p.description && normalize(p.description).includes(q)) ||
                (p.barcode && p.barcode.includes(state.query)) ||
                (p.sku && p.sku.includes(state.query))
            );
        }

        if (state.brand) {
            const b = normalize(state.brand);
            results = results.filter(p => p.brand && normalize(p.brand).includes(b));
        }

        // Smart Category Filter (Handles plurals/singulars)
        if (state.filters.categories.length > 0) {
            const selectedNorms = state.filters.categories.map(normalize);
            results = results.filter(p => p.category && selectedNorms.includes(normalize(p.category)));
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
        updateBreadcrumbs(); // Update path when filters change
    }

    // New: Dynamic Breadcrumb Renderer
    function updateBreadcrumbs() {
        const breadcrumbCurrent = document.getElementById('breadcrumb-current');
        if (!breadcrumbCurrent) return;

        let path = 'Arama Sonuçları';
        if (state.query) {
            path = `"${state.query}"`;
        } else if (state.category) {
            path = formatCategoryName(state.category);
        } else if (state.brand) {
            path = state.brand;
        }

        breadcrumbCurrent.textContent = path;
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
        const pageProducts = state.filteredProducts.slice(0, 24);

        if (elements.resultCount) {
            elements.resultCount.textContent = `${state.filteredProducts.length} ürün bulundu`;
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

                let productImage = fixImageSrc(rawImage) || 'gorseller/no-image.png';

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
        // Find if we are in a dominant category (all results belong to one)
        const categoriesInResult = [...new Set(state.filteredProducts.filter(p => p.category).map(p => p.category))];
        const isSingleCategory = categoriesInResult.length === 1 || state.category !== '';
        const activeCategory = state.category || (categoriesInResult.length === 1 ? categoriesInResult[0] : null);

        const categoryTitle = document.querySelector('.filter-group:nth-child(2) .filter-title');

        if (isSingleCategory && activeCategory) {
            // WE ARE IN A SPECIFIC CATEGORY -> SHOW SUB-CATEGORIES
            if (categoryTitle) categoryTitle.innerHTML = `Alt Kategoriler <i class="fa-solid fa-chevron-down"></i>`;

            const subCategoryMap = {};
            state.filteredProducts.forEach(p => {
                if (!p.subCategory) return;
                subCategoryMap[p.subCategory] = (subCategoryMap[p.subCategory] || 0) + 1;
            });

            if (elements.categoryFilters) {
                const subCats = Object.keys(subCategoryMap).sort();
                if (subCats.length > 0) {
                    elements.categoryFilters.innerHTML = subCats.map(sub => `
                        <label class="filter-item">
                            <input type="checkbox" value="${sub}" onchange="toggleFilter('subCategories', '${escapeQuotes(sub)}')">
                            <span>${sub}</span>
                            <span class="filter-count">(${subCategoryMap[sub]})</span>
                        </label>
                    `).join('');
                } else {
                    elements.categoryFilters.innerHTML = '<p style="padding:10px; color:#888; font-size:12px;">Alt kategori bulunamadı.</p>';
                }
            }
        } else {
            // GLOBAL SEARCH -> SHOW MAIN CATEGORIES (Normal behavior)
            if (categoryTitle) categoryTitle.innerHTML = `Kategoriler <i class="fa-solid fa-chevron-down"></i>`;

            const normalize = (str) => {
                if (!str) return '';
                return str.toLowerCase().trim().replace(/lar$/, '').replace(/ler$/, '');
            };

            const categoryMap = {};
            state.products.forEach(p => {
                if (!p.category) return;
                const norm = normalize(p.category);
                if (!categoryMap[norm]) {
                    categoryMap[norm] = {
                        displayName: p.category,
                        count: 0,
                        originalNames: new Set()
                    };
                }
                categoryMap[norm].count++;
                categoryMap[norm].originalNames.add(p.category);
            });

            if (elements.categoryFilters) {
                elements.categoryFilters.innerHTML = Object.keys(categoryMap).sort().map(key => {
                    const cat = categoryMap[key];
                    return `
                    <label class="filter-item">
                        <input type="checkbox" value="${cat.displayName}" onchange="toggleFilter('categories', '${escapeQuotes(Array.from(cat.originalNames)[0])}')">
                        <span>${cat.displayName}</span>
                        <span class="filter-count">(${cat.count})</span>
                    </label>
                `}).join('');
            }
        }

        // BRANDS remain the same
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
            const isAlreadyActive = this.classList.contains('active');

            // Reset all buttons
            sortButtons.forEach(b => b.classList.remove('active'));

            if (isAlreadyActive) {
                // Untoggle: Back to relevance/default
                state.sort = 'relevance';
                // RE-LOAD or RE-APPLY original filters to get default order
                applyFilters();
            } else {
                // Toggle ON
                this.classList.add('active');
                state.sort = sortType;

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
            }
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
