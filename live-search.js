
/* Live Search Feature - Robust Implementation */

// Ensure the code runs after DOM is fully ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveSearch);
} else {
    initLiveSearch();
}

function initLiveSearch() {
    console.log('Live Search: Initializing...');

    const searchInput = document.querySelector('.search-input');
    // Search container is often the parent of the input, but let's be flexible
    const searchContainer = document.querySelector('.search-container') || searchInput?.parentElement;

    if (!searchInput || !searchContainer) {
        console.warn('Live Search: Input or Container not found!');
        return;
    }

    console.log('Live Search: Elements found.');

    // Disable browser autocomplete
    searchInput.setAttribute('autocomplete', 'off');

    // 1. Inject CSS (Idempotent: check if exists first)
    if (!document.getElementById('live-search-style')) {
        const style = document.createElement('style');
        style.id = 'live-search-style';
        style.innerHTML = `
            .search-results-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                z-index: 9999;
                display: none;
                overflow: hidden;
                max-height: 450px;
                overflow-y: auto;
                text-align: left;
                width: 380px;
                min-width: 320px;
            }
            .search-results-dropdown.active { 
                display: block; 
            }
            .search-section-title {
                padding: 12px 16px;
                font-size: 0.75rem;
                font-weight: 700;
                color: #999;
                text-transform: uppercase;
                background: #fdfdfd;
                border-bottom: 1px solid #eee;
                letter-spacing: 0.5px;
            }
            .search-result-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #f9f9f9;
                cursor: pointer;
                text-decoration: none;
                color: #333;
                gap: 12px;
                transition: background 0.1s;
            }
            .search-result-item:hover, .search-result-item:focus { 
                background: #f4f4fa; 
                outline: none; 
            }
            .search-result-item:focus { 
                border-left: 3px solid #8b7bd8; 
                padding-left: 13px; 
            }
            .search-result-product img {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 6px;
                border: 1px solid #eee;
            }
            .search-result-info { 
                display: flex; 
                flex-direction: column; 
                line-height: 1.4; 
                flex: 1;
            }
            .search-result-name { 
                font-size: 0.9rem; 
                font-weight: 500; 
            }
            .search-result-price { 
                font-size: 0.85rem; 
                font-weight: 700; 
                color: #8b7bd8; 
                margin-top: 4px; 
            }
            .search-icon-circle {
                width: 36px; 
                height: 36px; 
                border-radius: 50%; 
                background: #f0f0f0;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: #666; 
                font-size: 14px;
                flex-shrink: 0;
            }
            .no-results { 
                padding: 20px; 
                text-align: center; 
                color: #888; 
                font-size: 0.9rem; 
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Create Dropdown Element
    let dropdown = searchContainer.querySelector('.search-results-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        searchContainer.appendChild(dropdown);
    }

    // ============= DYNAMIC DATA LOADING ===================
    let dynamicBrands = [];
    let dynamicCategories = [];
    let dynamicProducts = [];

    // Load brands dynamically
    async function loadLiveSearchBrands() {
        try {
            // Try API first
            if (window.API && window.API.getBrands) {
                const response = await window.API.getBrands();
                if (response && response.success && response.data) {
                    dynamicBrands = response.data.map(b => b.name);
                    console.log('Live Search: Loaded', dynamicBrands.length, 'brands from API');
                    return;
                }
            }
        } catch (e) { console.warn('Live Search: API brand load failed', e); }

        // Fallback to localStorage
        try {
            const local = localStorage.getItem('galata_brands');
            if (local) {
                dynamicBrands = JSON.parse(local).map(b => b.name);
                console.log('Live Search: Loaded', dynamicBrands.length, 'brands from localStorage');
            }
        } catch (e) { console.error('Live Search: localStorage brand error', e); }
    }

    // Load categories from categoriesData
    function loadLiveSearchCategories() {
        if (typeof categoriesData !== 'undefined') {
            dynamicCategories = [];
            Object.keys(categoriesData).forEach(slug => {
                const cat = categoriesData[slug];
                // Ana kategori
                dynamicCategories.push({
                    name: cat.title,
                    slug: slug,
                    type: 'main'
                });
                // Alt kategoriler
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach(sub => {
                        dynamicCategories.push({
                            name: sub.name,
                            parent: cat.title,
                            slug: slug,
                            type: 'sub'
                        });
                        // Items
                        if (sub.items && Array.isArray(sub.items)) {
                            sub.items.forEach(item => {
                                dynamicCategories.push({
                                    name: item,
                                    parent: sub.name,
                                    slug: slug,
                                    type: 'item'
                                });
                            });
                        }
                    });
                }
            });
            console.log('Live Search: Loaded', dynamicCategories.length, 'categories');
        }
    }

    // Load products
    async function loadLiveSearchProducts() {
        try {
            // Try API
            const response = await fetch('https://galatacarsi-backend-api.onrender.com/api/products?limit=500');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    dynamicProducts = data.data;
                    console.log('Live Search: Loaded', dynamicProducts.length, 'products from API');
                    return;
                }
            }
        } catch (e) { console.warn('Live Search: API product load failed', e); }

        // Fallback
        try {
            const local = localStorage.getItem('galatacarsi_products') || localStorage.getItem('galata_products');
            if (local) {
                dynamicProducts = JSON.parse(local);
                console.log('Live Search: Loaded', dynamicProducts.length, 'products from localStorage');
            }
        } catch (e) { console.error('Live Search: localStorage product error', e); }
    }

    // Initialize dynamic data
    loadLiveSearchBrands();
    loadLiveSearchCategories();
    loadLiveSearchProducts();

    // 3. Input Event Listener for Live Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 1) {
            dropdown.classList.remove('active');
            return;
        }

        // --- AKILLI ARAMA FONKSİYONU: Kelime sırası önemsiz ---
        function smartMatch(text, queryWords) {
            if (!text || !queryWords.length) return { matched: false, score: 0 };
            const textLower = text.toLowerCase();
            let matchedCount = 0;

            for (const word of queryWords) {
                if (textLower.includes(word)) {
                    matchedCount++;
                }
            }

            // Eşleşme oranını hesapla
            const score = matchedCount / queryWords.length;
            return { matched: matchedCount > 0, score };
        }

        // Query'yi kelimelere ayır
        const queryWords = query.split(/\s+/).filter(w => w.length > 0);

        // 1. Products (Akıllı arama - kelime sırası önemsiz)
        const matchedProducts = dynamicProducts
            .map(p => {
                // Aranabilir metin oluştur
                const searchableText = [
                    p.name || '',
                    p.brand || '',
                    p.category || '',
                    p.sku || '',
                    p.description || ''
                ].join(' ');

                const result = smartMatch(searchableText, queryWords);
                return { product: p, ...result };
            })
            .filter(item => item.matched)
            .sort((a, b) => b.score - a.score) // En yüksek eşleşme üstte
            .slice(0, 5)
            .map(item => item.product);

        // 2. Categories (Akıllı arama)
        const matchedCategories = dynamicCategories
            .filter(c => {
                return queryWords.some(word => c.name.toLowerCase().includes(word));
            })
            .slice(0, 5);

        // 3. Brands (Akıllı arama)
        const matchedBrands = dynamicBrands
            .filter(b => {
                if (!b) return false;
                return queryWords.some(word => b.toLowerCase().includes(word));
            })
            .slice(0, 5);

        let html = '';

        // Render Categories
        if (matchedCategories.length > 0) {
            html += `<div class="search-section-title">Kategoriler</div>`;
            matchedCategories.forEach(cat => {
                const parentLabel = cat.parent ? ` <small style="color:#888;">(${cat.parent})</small>` : '';
                const link = cat.type === 'item'
                    ? `arama.html?q=${encodeURIComponent(cat.name)}`
                    : `kategori.html?cat=${cat.slug}`;
                html += `
                <a href="${link}" class="search-result-item" tabindex="0">
                    <div class="search-icon-circle"><i class="fa-solid fa-layer-group"></i></div>
                    <span class="search-result-name">${highlightMatch(cat.name, query)}${parentLabel}</span>
                </a>`;
            });
        }

        // Render Brands
        if (matchedBrands.length > 0) {
            html += `<div class="search-section-title">Markalar</div>`;
            matchedBrands.forEach(brand => {
                html += `
                <a href="arama.html?brand=${encodeURIComponent(brand)}" class="search-result-item" tabindex="0">
                    <div class="search-icon-circle"><i class="fa-solid fa-tag"></i></div>
                    <span class="search-result-name">${highlightMatch(brand, query)}</span>
                </a>`;
            });
        }

        // Render Products
        if (matchedProducts.length > 0) {
            html += `<div class="search-section-title">Ürünler</div>`;
            matchedProducts.forEach(prod => {
                const img = prod.mainImage || prod.image || (prod.images && prod.images[0]) || 'https://placehold.co/50x50/f0f0f0/999?text=Ürün';
                const price = prod.salePrice && parseFloat(prod.salePrice) > 0
                    ? parseFloat(prod.salePrice).toLocaleString('tr-TR') + ' TL'
                    : (prod.price ? parseFloat(prod.price).toLocaleString('tr-TR') + ' TL' : '');
                html += `
                <a href="urun-detay.html?id=${prod._id || prod.id}" class="search-result-item search-result-product" tabindex="0">
                    <img src="${img}" alt="${prod.name || 'Ürün'}" onerror="this.style.display='none';">
                    <div class="search-result-info">
                        <span class="search-result-name">${highlightMatch(prod.name || 'İsimsiz', query)}</span>
                        <span class="search-result-price">${price}</span>
                    </div>
                </a>`;
            });
        }

        // No Results
        if (matchedCategories.length === 0 && matchedBrands.length === 0 && matchedProducts.length === 0) {
            html = `<div class="no-results">"${query}" için sonuç bulunamadı.</div>`;
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');
    });

    // Helper: Highlight matching text
    function highlightMatch(text, query) {
        if (!text || !query) return text || '';
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<strong style="color:#8b7bd8;">$1</strong>');
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Force container active style on focus
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('active');
        // If there's text, show dropdown again
        if (searchInput.value.trim().length > 0) {
            const event = new Event('input');
            searchInput.dispatchEvent(event);
        }
    });

    // 4. Keyboard Navigation (Arrow Keys) - Improved Logic

    // A. Input Listener: Jump to Results or Search on Enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            const results = dropdown.querySelectorAll('.search-result-item');
            if (results.length > 0) {
                e.preventDefault();
                results[0].focus();
            }
        } else if (e.key === 'Enter') {
            // Enter tuşu ile arama sayfasına git
            const query = searchInput.value.trim();
            if (query.length > 0) {
                e.preventDefault();

                // Sayfa konumuna göre doğru yolu belirle
                const isInSubfolder = window.location.pathname.includes('/kategoriler/') ||
                    window.location.pathname.includes('/admin/');
                const basePath = isInSubfolder ? '../' : '';

                window.location.href = basePath + 'arama.html?q=' + encodeURIComponent(query);
            }
        }
    });

    // B. Dropdown Listener: Navigate Results
    dropdown.addEventListener('keydown', (e) => {
        // Find current focused item index
        const results = Array.from(dropdown.querySelectorAll('.search-result-item'));
        const active = document.activeElement;
        const index = results.indexOf(active);

        // Allow Tab and Enter to work normally
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (index < results.length - 1) {
                results[index + 1].focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index > 0) {
                results[index - 1].focus();
            } else {
                // Return to input
                searchInput.focus();
                // Optional: Move cursor to end? Browsers usually handle it.
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('active');
            searchInput.focus();
        }
    });
}
