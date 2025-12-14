
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
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e5e5;
                border-top: none;
                border-radius: 0 0 16px 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                z-index: 9999;
                display: none;
                overflow: hidden;
                margin-top: 5px;
                max-height: 400px;
                overflow-y: auto;
                text-align: left;
                width: 320px; /* Force distinct width if container is small */
            }
            /* If search container is wide enough (>250px), match width */
            .search-container.active .search-results-dropdown {
                width: 100%;
            }
            .search-results-dropdown.active { display: block; }
            .search-section-title {
                padding: 10px 15px;
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
                padding: 10px 15px;
                border-bottom: 1px solid #f9f9f9;
                cursor: pointer;
                text-decoration: none;
                color: #333;
                gap: 12px;
                transition: background 0.1s;
            }
            .search-result-item:hover, .search-result-item:focus { background: #f4f4fa; outline: none; }
            .search-result-item:focus { border-left: 3px solid #8b7bd8; padding-left: 12px; }
            .search-result-product img {
                width: 40px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #eee;
            }
            .search-result-info { display: flex; flex-direction: column; line-height: 1.3; }
            .search-result-name { font-size: 0.9rem; font-weight: 500; }
            .search-result-price { font-size: 0.85rem; font-weight: 700; color: #8b7bd8; margin-top: 2px; }
            .search-icon-circle {
                width: 32px; height: 32px; border-radius: 50%; background: #eee;
                display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px;
            }
            .no-results { padding: 15px; text-align: center; color: #888; font-size: 0.9rem; }
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

    // 3. Search Handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 1) {
            dropdown.classList.remove('active');
            return;
        }

        // Get Data with Fallback
        const products = window.productsData || [];
        const categories = window.categoriesData || [];

        // Debug data availability
        if (products.length === 0) console.warn('Live Search: No products data found!');

        // --- FILTERING LOGIC ---

        // 1. Products (Search by name or description)
        const matchedProducts = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        ).slice(0, 4);

        // 2. Categories (Search in flat list derived from products or direct category list)
        // Extract unique categories from products as a fallback
        const productCategories = [...new Set(products.map(p => p.category.split(' > ')[0]))];
        const matchedCategories = productCategories
            .filter(c => c.toLowerCase().includes(query))
            .slice(0, 3);

        // 3. Brands (Mock brands or extract from 'brand' field if exists)
        // Since we don't have a structured brand object, we manually define or extract
        const knownBrands = ['Adidas', 'Nike', 'Puma', 'Zara', 'Mavi', 'Defacto', 'Samsung', 'Apple', 'Bosch', 'Makita'];
        const matchedBrands = knownBrands
            .filter(b => b.toLowerCase().includes(query))
            .slice(0, 3);

        let html = '';

        // Render Categories
        if (matchedCategories.length > 0) {
            html += `<div class="search-section-title">Kategoriler</div>`;
            matchedCategories.forEach(cat => {
                html += `
                <a href="arama.html?category=${encodeURIComponent(cat)}" class="search-result-item" tabindex="0">
                    <div class="search-icon-circle"><i class="fa-solid fa-layer-group"></i></div>
                    <span class="search-result-name">${cat}</span>
                </a>`;
            });
        }

        // Render Brands
        if (matchedBrands.length > 0) {
            html += `<div class="search-section-title">Markalar</div>`;
            matchedBrands.forEach(brand => {
                html += `
                <a href="arama.html?q=${encodeURIComponent(brand)}" class="search-result-item" tabindex="0">
                    <div class="search-icon-circle"><i class="fa-solid fa-tag"></i></div>
                    <span class="search-result-name">${brand}</span>
                </a>`;
            });
        }

        // Render Products
        if (matchedProducts.length > 0) {
            html += `<div class="search-section-title">Ürünler</div>`;
            matchedProducts.forEach(prod => {
                html += `
                <a href="urun-detay.html?id=${prod.id}" class="search-result-item search-result-product" tabindex="0">
                    <img src="${prod.image}" alt="${prod.name}">
                    <div class="search-result-info">
                        <span class="search-result-name">${prod.name}</span>
                        <span class="search-result-price">${prod.price}</span>
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

    // A. Input Listener: Jump to Results
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            const results = dropdown.querySelectorAll('.search-result-item');
            if (results.length > 0) {
                e.preventDefault();
                results[0].focus();
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
