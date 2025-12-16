document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial State & Data
    const state = {
        query: new URLSearchParams(window.location.search).get('q') || '',
        category: new URLSearchParams(window.location.search).get('category') || '',
        products: [], // Will be gathered from categories-data or dummy
        filteredProducts: [],
        filters: {
            categories: [], // Selected categories
            brands: [],
            minPrice: null,
            maxPrice: null
        },
        sort: 'relevance'
    };

    const elements = {
        queryDisplay: document.getElementById('search-query-display'),
        headerSearchInput: document.getElementById('global-search-input'),
        headerSearchBtn: document.getElementById('global-search-btn'),
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

    function init() {
        // Set initial query text
        if (state.query) {
            elements.queryDisplay.textContent = state.query;
            elements.headerSearchInput.value = state.query;
        } else if (state.category) {
            // Convert slug to readable
            elements.queryDisplay.textContent = formatCategoryName(state.category);
        } else {
            elements.queryDisplay.textContent = 'Tüm Ürünler';
        }

        // Load Products
        loadProducts();

        // Initial Filter
        applyFilters();

        // Render Filters Sidebar (dynamic based on available data)
        renderSidebarFilters();

        // Event Listeners
        setupEventListeners();
    }

    // 3. Load Data
    function loadProducts() {
        // Collect all potential items from CategoriesData (global variable from categories-data.js)
        // We will transform them into flat product structures for search demo
        let allProducts = [];
        let idCounter = 100;

        // Ensure CategoriesData exists (it should if loaded correctly)
        const categories = window.getAllCategories ? window.getAllCategories() : [];
        // Or if 'categories' variable is directly exposed:
        // Checking categories-data.js from previous steps, it seemed to expose `categories` or `getAllCategories`.
        // Let's assume `getAllCategories` exists or fallback to dummy.

        // If data loading fails, use dummy
        if (categories.length === 0) {
            allProducts = generateDummyProducts(50);
        } else {
            // Generate mock products based on categories for a richer demo
            categories.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.items.forEach(item => {
                        // Generate 3-5 variants per item topic
                        for (let i = 1; i <= 3; i++) {
                            allProducts.push({
                                id: idCounter++,
                                title: `${item} ${i > 1 ? '- Model ' + i : ''}`,
                                category: cat.title,
                                subcategory: sub.title,
                                brand: getRandomBrand(),
                                price: Math.floor(Math.random() * 2000) + 100,
                                oldPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 2100 : null,
                                image: `https://picsum.photos/seed/${idCounter}/300/400`,
                                badge: Math.random() > 0.8 ? 'new' : (Math.random() > 0.8 ? 'sale' : null)
                            });
                        }
                    });
                });
            });
        }

        state.products = allProducts;
    }

    // 4. Filtering Logic
    function applyFilters() {
        let results = state.products;

        // Search Query
        if (state.query) {
            const q = state.query.toLowerCase();
            results = results.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q)
            );
        }

        // Category Filter (URL or Sidebar)
        if (state.category) { // URL param
            // Partial match to handle slugs vs titles loosely for demo
            results = results.filter(p => p.category.toLowerCase().includes(state.category.replace(/-/g, ' ').toLowerCase()));
        }

        if (state.filters.categories.length > 0) {
            results = results.filter(p => state.filters.categories.includes(p.category));
        }

        // Brand Filter
        if (state.filters.brands.length > 0) {
            results = results.filter(p => state.filters.brands.includes(p.brand));
        }

        // Price Filter
        if (state.filters.minPrice) {
            results = results.filter(p => p.price >= state.filters.minPrice);
        }
        if (state.filters.maxPrice) {
            results = results.filter(p => p.price <= state.filters.maxPrice);
        }

        // Sorting
        if (state.sort === 'price-asc') {
            results.sort((a, b) => a.price - b.price);
        } else if (state.sort === 'price-desc') {
            results.sort((a, b) => b.price - a.price);
        } else if (state.sort === 'newest') {
            // Mock newest by ID descending
            results.sort((a, b) => b.id - a.id);
        }
        // relevance is default (no sort or original order)

        state.filteredProducts = results;
        renderResults();
    }

    // 5. Rendering
    function renderResults() {
        elements.grid.innerHTML = '';
        elements.resultCount.textContent = `${state.filteredProducts.length} ürün bulundu`;

        if (state.filteredProducts.length === 0) {
            document.querySelector('.search-empty-state').style.display = 'block';
            document.getElementById('pagination-container').style.display = 'none';
            return;
        }

        document.querySelector('.search-empty-state').style.display = 'none';
        document.getElementById('pagination-container').style.display = 'flex';

        // Limit to 20 for "page 1" demo
        const pageProducts = state.filteredProducts.slice(0, 20);

        pageProducts.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badges">
                    ${product.badge ? `<span class="badge ${product.badge}">${product.badge === 'new' ? 'YENİ' : 'İNDİRİM'}</span>` : ''}
                </div>
                <button class="fav-btn-card" onclick="toggleFavorite(${product.id})">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <a href="urun-detay.html?id=${product.id}" class="product-img-wrapper">
                    <img src="${product.image}" loading="lazy" alt="${product.title}">
                </a>
                <div class="product-brand">${product.brand}</div>
                <a href="urun-detay.html?id=${product.id}" class="product-title">${product.title}</a>
                <div class="product-price-area">
                    <span class="current-price">${formatMoney(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatMoney(product.oldPrice)}</span>` : ''}
                </div>
                <button class="add-to-cart-sm" onclick="addToCartMock(this, ${product.id})">
                    <i class="fa-solid fa-cart-shopping"></i> Sepete Ekle
                </button>
            `;
            elements.grid.appendChild(card);
        });
    }

    function renderSidebarFilters() {
        // Dynamic Category List based on current items
        const categories = [...new Set(state.products.map(p => p.category))].sort();
        elements.categoryFilters.innerHTML = categories.map(cat => `
            <label class="filter-item">
                <input type="checkbox" value="${cat}" onchange="toggleFilter('categories', '${cat}')">
                <span>${cat}</span>
                <span class="filter-count">(${state.products.filter(p => p.category === cat).length})</span>
            </label>
        `).join('');

        // Dynamic Brand List
        const brands = [...new Set(state.products.map(p => p.brand))].sort().slice(0, 10); // Limit to 10
        elements.brandFilters.innerHTML = brands.map(brand => `
            <label class="filter-item">
                <input type="checkbox" value="${brand}" onchange="toggleFilter('brands', '${brand}')">
                <span>${brand}</span>
            </label>
        `).join('');
    }

    // 6. Helpers & Event Handlers
    window.toggleFilter = function (type, value) {
        const index = state.filters[type].indexOf(value);
        if (index > -1) {
            state.filters[type].splice(index, 1);
        } else {
            state.filters[type].push(value);
        }
        applyFilters();
    };

    function setupEventListeners() {
        // Search Input
        elements.headerSearchBtn.addEventListener('click', () => {
            const val = elements.headerSearchInput.value.trim();
            if (val) {
                state.query = val;
                elements.queryDisplay.textContent = val;
                // Update URL for history
                const url = new URL(window.location);
                url.searchParams.set('q', val);
                window.history.pushState({}, '', url);
                applyFilters();
            }
        });

        elements.headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') elements.headerSearchBtn.click();
        });

        // Price Filter
        elements.priceFilterBtn.addEventListener('click', () => {
            const min = parseFloat(elements.minPrice.value);
            const max = parseFloat(elements.maxPrice.value);
            state.filters.minPrice = isNaN(min) ? null : min;
            state.filters.maxPrice = isNaN(max) ? null : max;
            applyFilters();
        });

        // Sort
        elements.sortSelect.addEventListener('change', (e) => {
            state.sort = e.target.value;
            applyFilters();
        });

        // Mobile Sidebar
        elements.mobileFilterBtn.addEventListener('click', () => {
            elements.sidebar.classList.add('active');
        });

        elements.closeFiltersBtn.addEventListener('click', () => {
            elements.sidebar.classList.remove('active');
        });
    }

    function generateDummyProducts(count) {
        const dummies = [];
        for (let i = 0; i < count; i++) {
            dummies.push({
                id: i,
                title: `Ürün ${i + 1}`,
                category: 'Genel',
                brand: getRandomBrand(),
                price: Math.floor(Math.random() * 1000) + 100,
                image: `https://via.placeholder.com/300x400?text=Urun+${i + 1}`
            });
        }
        return dummies;
    }

    function getRandomBrand() {
        const brands = ['Nike', 'Adidas', 'Samsung', 'Apple', 'Bosch', 'Makita', 'Zara', 'Mavi', 'Defacto'];
        return brands[Math.floor(Math.random() * brands.length)];
    }

    function formatMoney(amount) {
        return amount.toLocaleString('tr-TR') + ' TL';
    }

    function formatCategoryName(slug) {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Add to Cart Mock Wrapper to prevent redirection if global func is different
    window.addToCartMock = function (btn, id) {
        // Check if global addToCart exists
        if (window.addToCart) {
            // Find product object
            const product = state.filteredProducts.find(p => p.id === id);
            if (product) {
                window.addToCart(product);
            }
        } else {
            console.log('Global addToCart not found');
        }
    };
});
