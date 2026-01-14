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
        isLoading: true,
        pagination: {
            currentPage: 1,
            itemsPerPage: 24
        }
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
        priceFilterBtn: document.getElementById('price-filter-btn'),
        paginationContainer: document.getElementById('pagination-container')
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
        state.isLoading = true;
        elements.grid.innerHTML = '<div class="search-loader">Ürünler yükleniyor...</div>';

        // 1. API ve LocalStorage Verisini api-client.js üzerinden al
        // api-client.js zaten akıllı merge (görsel korumalı) işlemini yapıyor
        try {
            const response = await API.getProducts({ limit: 5000 }); // Tüm ürünleri getir
            if (response.success && response.data) {
                state.products = response.data;
                console.log('✅ Search: Loaded', state.products.length, 'products (Merged by API Client)');
            } else {
                // Fallback: Manuel LocalStorage kontrolü
                console.warn('Search: API returned unsuccessful, checking manual local storage fallback');
                const localRes = await API.getProductsFromLocalStorage();
                state.products = localRes.data || [];
            }
        } catch (e) {
            console.error('Search: Data load error', e);
        }

        // 2. Extra Fallback (Global sync function)
        if (state.products.length === 0 && typeof window.getAllProductsSync === 'function') {
            state.products = window.getAllProductsSync() || [];
            console.log('🚀 Search: Loaded via window.getAllProductsSync');
        }

        state.isLoading = false;
        console.log('🚀 Search ready with', state.products.length, 'total unique products.');
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

        // AKILLI ARAMA FONKSİYONU: Kelime sırası önemsiz + Sayısal ölçü desteği
        const smartSearch = (text, queryWords) => {
            if (!text || !queryWords.length) return { matched: false, score: 0 };
            const textLower = text.toLowerCase();
            let matchedCount = 0;
            let bonusScore = 0;

            for (const word of queryWords) {
                // Doğrudan eşleşme
                if (textLower.includes(word)) {
                    matchedCount++;

                    // Tam kelime eşleşmesi için bonus puan
                    const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
                    if (wordBoundaryRegex.test(text)) {
                        bonusScore += 0.5;
                    }
                }

                // Sayısal arama desteği: "400" araması - "400 lük", "400mm", "400 mm" eşleşmeli
                if (/^\d+$/.test(word)) {
                    // Sayı + birim/ek kombinasyonlarını ara
                    const numericPatterns = [
                        new RegExp(`${word}\\s*(mm|cm|m|lük|luk|lik|'li|li|lu|lü|adet|parça|parca)`, 'i'),
                        new RegExp(`${word}\\s*x\\s*\\d+`, 'i'), // 400x200 formatı
                        new RegExp(`${word}\\s*-`, 'i'), // 400-xxx formatı
                        new RegExp(`\\b${word}\\b`, 'i') // Tam sayı eşleşmesi
                    ];

                    for (const pattern of numericPatterns) {
                        if (pattern.test(text)) {
                            if (matchedCount === 0) matchedCount++; // İlk eşleşme için sayı
                            bonusScore += 0.3;
                            break;
                        }
                    }
                }
            }

            // Ürün isminde tüm kelimeler geçiyorsa ekstra bonus
            if (matchedCount === queryWords.length) {
                bonusScore += 1;
            }

            return {
                matched: matchedCount > 0,
                score: (matchedCount / queryWords.length) + bonusScore
            };
        };

        if (state.query) {
            // Query'yi kelimelere ayır
            const queryWords = state.query.toLowerCase().split(/\s+/).filter(w => w.length > 0);

            // Her ürün için arama skoru hesapla
            results = results.map(p => {
                // Aranabilir metni genişlet - sayısal değerleri de içersin
                const searchableText = [
                    p.name || '',
                    p.brand || '',
                    p.category || '',
                    p.subCategory || '',
                    p.description || '',
                    p.barcode || '',
                    p.sku || '',
                    // Fiyat bilgisini de aranabilir yap (isteğe bağlı)
                    String(p.price || ''),
                    // Ölçü/boyut bilgisi varsa
                    p.size || p.dimension || p.olcu || ''
                ].join(' ');

                const result = smartSearch(searchableText, queryWords);
                return { ...p, _searchScore: result.score, _matched: result.matched };
            })
                .filter(p => p._matched)
                .sort((a, b) => b._searchScore - a._searchScore); // En yüksek eşleşme üstte
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

        // Brand Filter (Checkboxes)
        if (state.filters.brands.length > 0) {
            const selectedBrands = state.filters.brands.map(b => b.toLowerCase());
            results = results.filter(p => p.brand && selectedBrands.includes(p.brand.toLowerCase()));
        }

        // Price Filter
        if (state.filters.minPrice !== null) {
            results = results.filter(p => {
                const getPrice = (item) => {
                    if (item.salePrice && parseFloat(item.salePrice) > 0) return parseFloat(item.salePrice);
                    return parseFloat(item.price || 0);
                };
                return getPrice(p) >= state.filters.minPrice;
            });
        }
        if (state.filters.maxPrice !== null) {
            results = results.filter(p => {
                const getPrice = (item) => {
                    if (item.salePrice && parseFloat(item.salePrice) > 0) return parseFloat(item.salePrice);
                    return parseFloat(item.price || 0);
                };
                return getPrice(p) <= state.filters.maxPrice;
            });
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
        const paginationEl = elements.paginationContainer;

        if (state.filteredProducts.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (paginationEl) paginationEl.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Calculate Pagination
        const totalItems = state.filteredProducts.length;
        const totalPages = Math.ceil(totalItems / state.pagination.itemsPerPage);

        // Ensure current page is valid after filtering
        if (state.pagination.currentPage > totalPages) {
            state.pagination.currentPage = 1;
        }

        if (paginationEl) {
            paginationEl.style.display = totalPages > 1 ? 'flex' : 'none';
            renderPagination(totalPages);
        }

        const startIndex = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
        const endIndex = startIndex + state.pagination.itemsPerPage;
        const pageProducts = state.filteredProducts.slice(startIndex, endIndex);

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
                    if (!src || src === '' || src === 'null' || src === 'undefined') return null;
                    if (src.startsWith('data:')) return src; // Base64 is fine
                    if (src.startsWith('http')) return src;  // External URL is fine

                    // Remove leading slash if present to make it relative
                    if (src.startsWith('/')) {
                        return '.' + src;
                    }
                    return src;
                };

                // Get image with fallback chain
                let productImage = fixImageSrc(rawImage);

                // If no valid image, show a branded placeholder instead of hiding
                if (!productImage) {
                    const brandInitial = (product.brand || 'G').charAt(0).toUpperCase();
                    productImage = `https://placehold.co/300x300/f8f9fa/667eea?text=${brandInitial}`;
                }

                // Debug log (GÖRSEL SORUNU TEŞHİS İÇİN AKTİF)
                console.log('🖼️ Image Debug:', product.name?.substring(0, 30), '| raw:', rawImage?.substring(0, 50), '| final:', productImage?.substring(0, 50));

                const productBrand = product.brand || '';
                const productName = product.name || 'İsimsiz Ürün';

                // İndirimli fiyat kontrolü - birden fazla alan için kontrol
                const hasSalePrice = product.salePrice && parseFloat(product.salePrice) > 0;
                // Fiyat alanları: price, fiyat, regularPrice
                const regularPrice = product.price || product.fiyat || product.regularPrice || 0;
                const displayPrice = hasSalePrice ? product.salePrice : regularPrice;
                const oldPrice = hasSalePrice ? regularPrice : (product.oldPrice || product.comparePrice);

                const productPrice = formatMoney(displayPrice);

                // Placeholder URL for onerror
                const placeholderUrl = `https://placehold.co/300x300/f8f9fa/667eea?text=${encodeURIComponent((productBrand || 'G').charAt(0))}`;

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
                             onerror="this.onerror=null; this.src='${placeholderUrl}';">
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

                // FIX: Ensure images are visible - add loaded class or force opacity
                const img = card.querySelector('img');
                if (img) {
                    // Force opacity to 1 immediately for base64 images
                    img.style.opacity = '1';
                    img.classList.add('loaded');

                    // Also handle load event for external URLs
                    img.addEventListener('load', function () {
                        this.style.opacity = '1';
                        this.classList.add('loaded');
                    });
                }
            } catch (err) {
                console.error('Error rendering product card:', err, product);
            }
        });
    }

    function renderPagination(totalPages) {
        const container = elements.paginationContainer;
        if (!container) return;

        container.innerHTML = '';

        // Previous Button
        if (state.pagination.currentPage > 1) {
            const prevBtn = document.createElement('a');
            prevBtn.href = '#';
            prevBtn.className = 'page-link';
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.onclick = (e) => {
                e.preventDefault();
                state.pagination.currentPage--;
                renderResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            container.appendChild(prevBtn);
        }

        // Page Numbers
        let startPage = Math.max(1, state.pagination.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.href = '#';
            pageBtn.className = `page-link ${i === state.pagination.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = (e) => {
                e.preventDefault();
                state.pagination.currentPage = i;
                renderResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            container.appendChild(pageBtn);
        }

        // Next Button
        if (state.pagination.currentPage < totalPages) {
            const nextBtn = document.createElement('a');
            nextBtn.href = '#';
            nextBtn.className = 'page-link';
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.onclick = (e) => {
                e.preventDefault();
                state.pagination.currentPage++;
                renderResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            container.appendChild(nextBtn);
        }
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

        // Price Filter Button
        if (elements.priceFilterBtn) {
            elements.priceFilterBtn.addEventListener('click', () => {
                const min = elements.minPrice ? parseFloat(elements.minPrice.value) : null;
                const max = elements.maxPrice ? parseFloat(elements.maxPrice.value) : null;
                state.filters.minPrice = isNaN(min) ? null : min;
                state.filters.maxPrice = isNaN(max) ? null : max;
                applyFilters();
            });
        }

        // Clear Filters Button
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // Reset State Filters
                state.filters.categories = [];
                state.filters.brands = [];
                state.filters.minPrice = null;
                state.filters.maxPrice = null;

                // Clear UI Inputs
                if (elements.minPrice) elements.minPrice.value = '';
                if (elements.maxPrice) elements.maxPrice.value = '';

                // Uncheck checkboxes
                document.querySelectorAll('.search-sidebar input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                });

                applyFilters();
                renderSidebarFilters(); // Re-render to clear counts/items if needed

                // Optional: Scroll to results
                const resultsArea = document.querySelector('.search-results-area');
                if (resultsArea) resultsArea.scrollIntoView({ behavior: 'smooth' });

                // Close sidebar on mobile
                if (window.innerWidth <= 768 && elements.sidebar) {
                    elements.sidebar.classList.remove('active');
                }
            });
        }
    }

    function escapeQuotes(str) { return str.replace(/'/g, "\\'"); }

    function formatMoney(amount) {
        // Null, undefined veya boş string kontrolü
        if (amount === null || amount === undefined || amount === '' || amount === 'null') {
            return 'Fiyat Yok';
        }

        // Zaten sayı ise direkt kullan
        if (typeof amount === 'number') {
            if (isNaN(amount) || amount <= 0) {
                return 'Fiyat Yok';
            }
            return amount.toLocaleString('tr-TR') + ' TL';
        }

        // String ise formattan sayıyı çıkar
        if (typeof amount === 'string') {
            // "₺5.775" veya "5.775 TL" veya "5775" formatlarını destekle
            let cleaned = amount
                .replace(/[₺TLtl\s]/g, '') // Para birimi ve boşluk kaldır
                .trim();

            // Eğer hem nokta hem virgül varsa
            const hasComma = cleaned.includes(',');
            const hasDot = cleaned.includes('.');

            if (hasComma && hasDot) {
                const lastDotIndex = cleaned.lastIndexOf('.');
                const lastCommaIndex = cleaned.lastIndexOf(',');

                if (lastCommaIndex > lastDotIndex) {
                    // Türk formatı: 5.775,50 -> nokta binlik, virgül ondalık
                    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                } else {
                    // Amerikan formatı: 5,775.50 -> virgül binlik, nokta ondalık
                    cleaned = cleaned.replace(/,/g, '');
                }
            } else if (hasComma && !hasDot) {
                // Sadece virgül var
                const parts = cleaned.split(',');
                if (parts.length === 2 && parts[1].length <= 2) {
                    // Ondalık: 5775,50
                    cleaned = cleaned.replace(',', '.');
                } else {
                    // Binlik: 5,775
                    cleaned = cleaned.replace(/,/g, '');
                }
            } else if (!hasComma && hasDot) {
                // Sadece nokta var: 5.775 veya 5775.50
                const parts = cleaned.split('.');
                if (parts.length === 2 && parts[1].length <= 2) {
                    // Ondalık ayırıcı olabilir - bırak
                } else if (parts.length >= 2) {
                    // Binlik ayırıcı: 5.775 veya 1.234.567 -> hepsini kaldır
                    cleaned = cleaned.replace(/\./g, '');
                }
            }

            const num = parseFloat(cleaned);

            if (isNaN(num) || num <= 0) {
                return 'Fiyat Yok';
            }

            return num.toLocaleString('tr-TR') + ' TL';
        }

        return 'Fiyat Yok';
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
