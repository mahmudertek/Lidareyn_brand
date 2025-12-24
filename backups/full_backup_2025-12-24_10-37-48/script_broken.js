// ============================================
// KARAKÖY TÜCCARI - MODERN E-COMMERCE JAVASCRIPT
// ============================================

const Storage = {
    getCart: () => JSON.parse(localStorage.getItem('galatacarsi_cart')) || [],
    saveCart: (cart) => localStorage.setItem('galatacarsi_cart', JSON.stringify(cart)),
    getFavorites: () => JSON.parse(localStorage.getItem('galatacarsi_favorites')) || [],
    saveFavorites: (favs) => localStorage.setItem('galatacarsi_favorites', JSON.stringify(favs))
};

document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        isSearchOpen: false,
        isUserMenuOpen: false,
        activeSidebar: null // 'cart' or 'favorites' or null
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        searchBtn: document.querySelector('.search-btn'),
        searchContainer: document.querySelector('.search-container'),
        searchInput: document.querySelector('.search-input'),
        userBtn: document.querySelector('.user-btn'),
        userDropdown: document.querySelector('.user-dropdown'),
        favoritesBtn: document.querySelector('.favorites-btn'),
        cartBtn: document.querySelector('.cart-btn'),
        cartCount: document.querySelector('.cart-count'),
        mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
        mainNav: document.querySelector('.main-nav'),
        sidebarOverlay: document.querySelector('.sidebar-overlay'),
        favoritesSidebar: document.querySelector('.favorites-sidebar'),
        cartSidebar: document.querySelector('.cart-sidebar'),
        closeSidebarBtns: document.querySelectorAll('.close-sidebar'),
        favoritesContent: document.getElementById('favorites-content'),
        cartContent: document.getElementById('cart-content'),
        cartTotalAmount: document.querySelector('.total-amount')
    };

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================

    // Close search on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isSearchOpen) {
            closeSearch();
        }
    });

    // Close Search Function
    function closeSearch() {
        state.isSearchOpen = false;
        if (elements.searchContainer) {
            elements.searchContainer.classList.remove('active');
        }
        // Also close results
        const results = document.querySelector('.search-results');
        if (results) results.classList.remove('active');
    }
    window.closeSearch = closeSearch;

    // Search Click Listeners (All instances)
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.isSearchOpen = !state.isSearchOpen;

            if (elements.searchContainer) {
                elements.searchContainer.classList.toggle('active', state.isSearchOpen);

                if (state.isSearchOpen) {
                    if (elements.searchInput) elements.searchInput.focus();
                    closeUserMenu();
                    closeSidebar(); // Close sidebars if open
                }
            }
        });
    }

    // ============================================
    // ADVANCED SEARCH FUNCTIONALITY
    // ============================================
    const searchableBrands = [
        'Adidas', 'Nike', 'Puma', 'Zara', 'H&M', 'Mango', 'Bershka',
        'Pull & Bear', 'Stradivarius', 'Koton', 'LC Waikiki', 'Defacto',
        'Mavi', 'Pierre Cardin', 'US Polo Assn', 'Hummel', 'Skechers',
        'New Balance', 'Reebok', 'Under Armour', 'Samsung', 'Apple',
        'Huawei', 'Xiaomi', 'Sony', 'LG', 'Philips', 'Bosch', 'Arçelik', 'Vestel'
    ];

    function initializeSearch() {
        if (!elements.searchInput || !elements.searchContainer) return;

        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        elements.searchContainer.appendChild(resultsContainer);

        let selectedIndex = -1;

        function updateSelection() {
            const items = resultsContainer.querySelectorAll('.search-result-item');
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    item.classList.add('selected');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        elements.searchInput.addEventListener('keydown', (e) => {
            const items = resultsContainer.querySelectorAll('.search-result-item');
            if (!resultsContainer.classList.contains('active') || items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex++;
                if (selectedIndex >= items.length) selectedIndex = 0;
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex--;
                if (selectedIndex < 0) selectedIndex = items.length - 1;
                updateSelection();
            } else if (e.key === 'Enter') {
                if (selectedIndex > -1 && items[selectedIndex]) {
                    e.preventDefault();
                    items[selectedIndex].click();
                }
            }
        });

        elements.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            selectedIndex = -1; // Reset selection on new input

            if (query.length < 1) {
                resultsContainer.classList.remove('active');
                return;
            }

            const results = performSearch(query);
            renderSearchResults(results, resultsContainer);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.searchContainer.contains(e.target)) {
                resultsContainer.classList.remove('active');
                selectedIndex = -1;
            }
        });
    }

    function performSearch(query) {
        const results = {
            categories: [],
            brands: [],
            products: []
        };

        // Search Categories & Products from categoriesData
        if (typeof categoriesData !== 'undefined') {
            Object.values(categoriesData).forEach(cat => {
                // Check Category Title
                if (cat.title.toLowerCase().includes(query)) {
                    results.categories.push({
                        name: cat.title,
                        url: `kategoriler/${cat.title.toLowerCase()
                            .replace(/&/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/[ışğüçö]/g, c => ({ 'ı': 'i', 'ş': 's', 'ğ': 'g', 'ü': 'u', 'ç': 'c', 'ö': 'o' })[c])
                            .replace(/-+/g, '-')}.html`,
                        icon: cat.icon
                    });
                }

                if (cat.subcategories) {
                    cat.subcategories.forEach(sub => {
                        // Check Subcategory Name (treat as Category result)
                        if (sub.name.toLowerCase().includes(query)) {
                            results.categories.push({
                                name: `${cat.title} > ${sub.name}`,
                                url: '#',
                                icon: sub.icon
                            });
                        }

                        // Check Items (treat as Products)
                        sub.items.forEach(item => {
                            if (item.toLowerCase().includes(query)) {
                                results.products.push({
                                    name: item,
                                    category: sub.name,
                                    icon: 'fa-box'
                                });
                            }
                        });
                    });
                }
            });
        }

        // Search Brands
        searchableBrands.forEach(brand => {
            if (brand.toLowerCase().includes(query)) {
                results.brands.push({
                    name: brand,
                    icon: 'fa-tag'
                });
            }
        });

        return results;
    }

    function renderSearchResults(results, container) {
        container.innerHTML = '';
        let hasResults = false;

        // Render Categories
        if (results.categories.length > 0) {
            hasResults = true;
            const title = document.createElement('div');
            title.className = 'search-section-title';
            title.textContent = 'Kategoriler';
            container.appendChild(title);

            results.categories.slice(0, 5).forEach(item => {
                const el = document.createElement('a');
                el.href = item.url || '#';
                el.className = 'search-result-item';
                el.innerHTML = `
                <i class="fa-solid ${item.icon}"></i>
                <div class="search-result-info">
                    <span class="search-result-name">${item.name}</span>
                </div>
            `;
                container.appendChild(el);
            });
        }

        // Render Brands
        if (results.brands.length > 0) {
            hasResults = true;
            const title = document.createElement('div');
            title.className = 'search-section-title';
            title.textContent = 'Markalar';
            container.appendChild(title);

            results.brands.slice(0, 5).forEach(item => {
                const el = document.createElement('a');
                el.href = '#';
                el.className = 'search-result-item';
                el.innerHTML = `
                <i class="fa-solid ${item.icon}"></i>
                <div class="search-result-info">
                    <span class="search-result-name">${item.name}</span>
                </div>
            `;
                container.appendChild(el);
            });
        }

        // Render Products
        if (results.products.length > 0) {
            hasResults = true;
            const title = document.createElement('div');
            title.className = 'search-section-title';
            title.textContent = 'Ürünler';
            container.appendChild(title);

            results.products.slice(0, 5).forEach(item => {
                const el = document.createElement('a');
                el.href = 'urun-detay.html';
                el.className = 'search-result-item';

                // Create content container
                const content = document.createElement('div');
                content.innerHTML = `
                <i class="fa-solid ${item.icon}"></i>
                <div class="search-result-info">
                    <span class="search-result-name">${item.name}</span>
                    <span class="search-result-sub">${item.category}</span>
                </div>
            `;

                // Create actions container
                const actions = document.createElement('div');
                actions.className = 'card-actions';

                // Favorite Button
                const favBtn = document.createElement('button');
                favBtn.className = 'action-btn';
                favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
                favBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.toggleFavorite === 'function') window.toggleFavorite(item);
                };

                // Cart Button
                const cartBtn = document.createElement('button');
                cartBtn.className = 'action-btn';
                cartBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i>';
                cartBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.addToCart === 'function') window.addToCart(item);
                };

                actions.appendChild(favBtn);
                actions.appendChild(cartBtn);

                el.appendChild(content);
                el.appendChild(actions);

                container.appendChild(el);
            });
        }

        if (!hasResults) {
            const noRes = document.createElement('div');
            noRes.className = 'no-results';
            noRes.textContent = 'Sonuç bulunamadı';
            container.appendChild(noRes);
        }

        container.classList.add('active');
    }

    // Initialize Search
    initializeSearch();

    // ============================================
    // USER DROPDOWN
    // ============================================
    function closeUserMenu() {
        state.isUserMenuOpen = false;
        if (elements.userDropdown) {
            elements.userDropdown.classList.remove('active');
        }
        if (elements.userBtn) {
            elements.userBtn.classList.remove('active');
        }
    }

    if (elements.userBtn) {
        elements.userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.isUserMenuOpen = !state.isUserMenuOpen;

            if (elements.userDropdown) {
                elements.userDropdown.classList.toggle('active', state.isUserMenuOpen);
                elements.userBtn.classList.toggle('active', state.isUserMenuOpen);

                if (state.isUserMenuOpen) {
                    closeSearch();
                    closeSidebar();
                }
            }
        });
    }

    // ============================================
    // SIDEBARS (CART & FAVORITES)
    // ============================================

    // Helper Functions
    function openSidebar(type) {
        state.activeSidebar = type;
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (type === 'favorites' && elements.favoritesSidebar) {
            elements.favoritesSidebar.classList.add('active');
            renderFavorites();
        } else if (type === 'cart' && elements.cartSidebar) {
            elements.cartSidebar.classList.add('active');
            renderCart();
        }

        // Close others
        closeSearch();
        closeUserMenu();
    }
    window.openSidebar = openSidebar;

    function closeSidebar() {
        state.activeSidebar = null;
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';

        if (elements.favoritesSidebar) elements.favoritesSidebar.classList.remove('active');
        if (elements.cartSidebar) elements.cartSidebar.classList.remove('active');
    }
    window.closeSidebar = closeSidebar;

    // Open Favorites
    if (elements.favoritesBtn) {
        elements.favoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // AUTH CHECK
            if (typeof window.Auth === 'undefined' || !window.Auth.getCurrentUser()) {
                window.location.href = 'giris-yap.html';
                return;
            }
            openSidebar('favorites');
        });
    }

    // Open Cart
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openSidebar('cart');
        });
    }

    // Close Sidebar
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', closeSidebar);
    }

    if (elements.closeSidebarBtns) {
        elements.closeSidebarBtns.forEach(btn => {
            btn.addEventListener('click', closeSidebar);
        });
    }

    // Global Click Listener for Closing Menus
    document.addEventListener('click', (e) => {
        // Close Search
        if (state.isSearchOpen &&
            elements.searchContainer &&
            !elements.searchContainer.contains(e.target) &&
            !elements.searchBtn?.contains(e.target)) {
            closeSearch();
        }

        // Close User Menu
        if (state.isUserMenuOpen &&
            elements.userDropdown &&
            !elements.userBtn?.contains(e.target) &&
            !elements.userDropdown.contains(e.target)) {
            closeUserMenu();
        }
    });

    // ============================================
    // DATA RENDERING
    // ============================================

    // Dummy Data for Demo
    const dummyProducts = [
        { id: 1, title: 'Akülü Vidalama Seti', price: 1250.00, image: 'https://placehold.co/80x80/eee/333?text=Vidalama' },
        { id: 2, title: 'Profesyonel Takım Çantası', price: 450.00, image: 'https://placehold.co/80x80/eee/333?text=Canta' },
        { id: 3, title: 'LED Masa Lambası', price: 320.00, image: 'https://placehold.co/80x80/eee/333?text=Lamba' }
    ];

    // Initialize LocalStorage with dummy data if empty
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([
            { ...dummyProducts[0], quantity: 1 },
            { ...dummyProducts[2], quantity: 2 }
        ]));
    }

    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([dummyProducts[1]]));
    }

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const container = elements.cartContent;

        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Sepetinizde ürün bulunmuyor.</p>
                </div>
            `;
            if (elements.cartTotalAmount) elements.cartTotalAmount.textContent = '0.00 TL';
            return;
        }

        let total = 0;
        let html = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            html += `
                <div class="sidebar-item">
                    <img src="${item.image}" alt="${item.title}" class="item-img">
                    <div class="item-details">
                        <h4 class="item-title">${item.title}</h4>
                        <div class="item-price">${item.price.toFixed(2)} TL</div>
                        <div class="item-controls">
                            <div class="quantity-controls">
                                <button class="qty-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class="fa-regular fa-trash-can"></i> Sil
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (elements.cartTotalAmount) {
            elements.cartTotalAmount.textContent = total.toFixed(2) + ' TL';
        }
    }

    function renderFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const container = elements.favoritesContent;

        if (!container) return;

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-heart"></i>
                    <p>Henüz favori ürün eklemediniz.</p>
                </div>
            `;
            return;
        }

        let html = '';
        favorites.forEach(item => {
            html += `
                <div class="sidebar-item">
                    <img src="${item.image}" alt="${item.title}" class="item-img">
                    <div class="item-details">
                        <h4 class="item-title">${item.title}</h4>
                        <div class="item-price">${item.price.toFixed(2)} TL</div>
                        <div class="item-controls">
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; width: auto;" onclick="addToCartFromFav(${item.id})">Sepete Ekle</button>
                            <button class="remove-btn" onclick="removeFromFavorites(${item.id})">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // ============================================
    // GLOBAL FUNCTIONS (Exposed to Window)
    // ============================================

    window.updateQuantity = function (id, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(i => i.id === id);

        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    };

    window.removeFromCart = function (id) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(i => i.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    };

    window.removeFromFavorites = function (id) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(i => i.id !== id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    };

    window.addToCartFromFav = function (id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const item = favorites.find(i => i.id === id);
        if (item) {
            window.addToCart(item);
            showNotification('Ürün sepete eklendi!');
        }
    };

    window.addToCart = function (product) {
        // Show loading state
        const button = event.target;
        const originalText = button.textContent;
        button.classList.add('loading');
        button.disabled = true;

        // Simulate API call delay
        setTimeout(() => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification('Ürün sepete eklendi!');

            // If cart sidebar is open, update it
            if (state.activeSidebar === 'cart') {
                renderCart();
            }

            // Reset button state
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = originalText;
        }, 300);
    };

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (elements.cartCount) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

            // Add bounce animation when count changes
            elements.cartCount.classList.add('updated');
            setTimeout(() => {
                elements.cartCount.classList.remove('updated');
            }, 600);
        }
    }

    // Initialize cart count on page load
    updateCartCount();

    // ============================================
    // MOBILE MENU
    // ============================================
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener('click', function () {
            elements.mainNav.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #8b7bd8, #6b9bd8);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(139, 123, 216, 0.3);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // DOCK FUNCTIONALITY
    // ============================================
    const dock = document.querySelector('.dock');
    const dockItems = document.querySelectorAll('.dock-item');
    const defaultScale = 1;
    const hoverScale = 1.5; // Max scale (reduced slightly for better fit)
    const range = 100; // Distance range for effect

    if (dock && dockItems.length > 0) {
        dock.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;

            dockItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - itemCenterX);

                let scale = defaultScale;

                if (distance < range) {
                    // Cosine interpolation for smoother curve
                    const normalizedDistance = distance / range;
                    const curve = Math.cos(normalizedDistance * Math.PI / 2);
                    scale = 1 + (hoverScale - 1) * curve;
                }

                item.style.transform = `scale(${scale})`;
                // Adjust margin to keep baseline aligned or float up
                item.style.marginBottom = `${(scale - 1) * 10}px`;
            });
        });

        dock.addEventListener('mouseleave', () => {
            dockItems.forEach(item => {
                item.style.transform = `scale(${defaultScale})`;
                item.style.marginBottom = '0';
            });
        });

        // Connect Dock Buttons to Existing Functions
        const dockSearchBtn = document.querySelector('.dock-search-btn');
        const dockCartBtn = document.querySelector('.dock-cart-btn');
        const dockUserBtn = document.querySelector('.dock-user-btn');

        if (dockSearchBtn && elements.searchBtn) {
            dockSearchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle search directly or simulate click
                // Simulate click is safer to reuse logic
                elements.searchBtn.click();
            });
        }

        if (dockCartBtn && elements.cartBtn) {
            dockCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.cartBtn.click();
            });
        }

        if (dockUserBtn && elements.userBtn) {
            dockUserBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.userBtn.click();
            });
        }
    }

    // ============================================
    // IMAGE OPTIMIZATION & LAZY LOADING
    // ============================================

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Add fade-in effect
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease';

                    img.onload = () => {
                        img.style.opacity = '1';
                    };

                    // Start loading the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }

    // Image error handling and accessibility
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            // Replace broken images with placeholder
            this.src = 'https://picsum.photos/seed/galatacarsi-placeholder/300x200.jpg';
            this.alt = 'Görsel yüklenemedi - Galata Çarşı e-ticaret';
            this.title = 'Görsel yüklenemedi';

            // Add error class for styling
            this.classList.add('image-error');
        });

        // Add loaded class for accessibility
        img.addEventListener('load', function () {
            this.classList.add('loaded');
            this.setAttribute('role', 'img');

            // Check if alt text is descriptive enough
            if (!this.alt || this.alt.length < 10) {
                console.warn('Image missing descriptive alt text:', this.src);
            }
        });

        // Add ARIA attributes for better accessibility
        if (!img.getAttribute('aria-label') && img.alt) {
            img.setAttribute('aria-label', img.alt);
        }
    });

    // Progressive image loading simulation
    function addProgressiveLoading() {
        const images = document.querySelectorAll('.category-image img');
        images.forEach(img => {
            // Add loading placeholder
            img.parentElement.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
            img.parentElement.style.backgroundSize = '200% 100%';
            img.parentElement.style.animation = 'loading 1.5s infinite';

            img.addEventListener('load', () => {
                img.parentElement.style.background = 'none';
                img.parentElement.style.animation = 'none';
            });
        });
    }

    addProgressiveLoading();

    // ============================================
    // BRANDS SLIDER FUNCTIONALITY
    // ============================================

    let currentBrandSlideIndex = 1;
    const totalBrandSlides = 2;

    window.changeBrandSlide = function (direction) {
        currentBrandSlideIndex += direction;

        if (currentBrandSlideIndex > totalBrandSlides) {
            currentBrandSlideIndex = 1;
        } else if (currentBrandSlideIndex < 1) {
            currentBrandSlideIndex = totalBrandSlides;
        }

        showBrandSlide(currentBrandSlideIndex);
    };

    window.currentBrandSlide = function (n) {
        currentBrandSlideIndex = n;
        showBrandSlide(currentBrandSlideIndex);
    };

    function showBrandSlide(n) {
        const slides = document.querySelectorAll('.brands-slide');
        const dots = document.querySelectorAll('.brand-dot');

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[n - 1].classList.add('active');
        dots[n - 1].classList.add('active');
    }

    // Auto-slide for brands (optional)
    let brandSlideInterval = setInterval(() => {
        changeBrandSlide(1);
    }, 3000); // Change slide every 3 seconds

    // Pause auto-slide on hover
    const brandsSliderContainer = document.querySelector('.brands-slider-container');
    if (brandsSliderContainer) {
        brandsSliderContainer.addEventListener('mouseenter', () => {
            clearInterval(brandSlideInterval);
        });

        brandsSliderContainer.addEventListener('mouseleave', () => {
            brandSlideInterval = setInterval(() => {
                changeBrandSlide(1);
            }, 3000);
        });
    }

    // Initialize
    updateCartCount();

    // ============================================
    // CATEGORIES CAROUSEL - INFINITE LOOP
    // ============================================

    const track = document.getElementById('categoriesTrack');
    if (track) {
        const cards = Array.from(track.children);
        const cardWidth = cards[0]?.offsetWidth || 0;
        const gap = 20;
        const itemWidth = cardWidth + gap;

        let currentIndex = 0;
        const visibleCards = 5; // 5 cards visible at a time

        // Clone first 5 cards and append to end for infinite loop
        for (let i = 0; i < visibleCards; i++) {
            const clone = cards[i].cloneNode(true);
            clone.classList.add('cloned');
            track.appendChild(clone);
        }

        // Clone last 5 cards and prepend to start
        for (let i = cards.length - 1; i >= cards.length - visibleCards; i--) {
            const clone = cards[i].cloneNode(true);
            clone.classList.add('cloned');
            track.insertBefore(clone, track.firstChild);
        }

        // Start at the first real card (after prepended clones)
        currentIndex = visibleCards;
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

        window.moveCarousel = function (direction) {
            currentIndex += direction;
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

            // Handle infinite loop
            setTimeout(() => {
                if (currentIndex >= cards.length + visibleCards) {
                    // Jumped past the end, reset to start
                    track.style.transition = 'none';
                    currentIndex = visibleCards;
                    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                } else if (currentIndex < visibleCards) {
                    // Jumped before the start, reset to end
                    track.style.transition = 'none';
                    currentIndex = cards.length + visibleCards - 1;
                    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                }
            }, 500);
        };

        // Auto-slide every 3 seconds
        setInterval(() => {
            moveCarousel(1);
        }, 3000);
    }



    // ============================================
    // GLOBAL HELPERS (INSIDE SCOPE)
    // ============================================

    window.toggleFavorite = function (product) {
        // Auth Check
        if (typeof window.Auth === 'undefined' || !window.Auth.getCurrentUser()) {
            window.location.href = 'giris-yap.html';
            return;
        }

        const favs = Storage.getFavorites();
        // Ensure ID
        if (!product.id) product.id = product.name?.replace(/\s+/g, '-').toLowerCase() || Date.now();

        const index = favs.findIndex(item => item.id == product.id); // loose equality for string/number match

        if (index > -1) {
            favs.splice(index, 1);
            showNotification('Favorilerden çıkarıldı.');
        } else {
            favs.push(product);
            showNotification('Favorilere eklendi!');
        }

        Storage.saveFavorites(favs);

        // Update Sidebar if open
        if (state.activeSidebar === 'favorites') {
            renderFavorites();
        }
    };

    // Page Specific Renderers (Exposed as Window functions for specific pages)
    window.renderCartPage = function () {
        const container = document.getElementById('cart-items-list');
        const summaryPanel = document.getElementById('cart-summary-panel');
        const totalCountEl = document.getElementById('cart-total-count');

        if (!container) return;

        const cart = Storage.getCart();
        if (totalCountEl) totalCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-cart-shopping empty-icon"></i>
                    <p class="empty-text">Sepetinizde henüz ürün bulunmamaktadır.</p>
                    <a href="index.html" class="continue-shopping-btn">Alışverişe Başla</a>
                </div>
            `;
            if (summaryPanel) summaryPanel.style.display = 'none';
            return;
        }

        if (summaryPanel) summaryPanel.style.display = 'block';

        let html = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            let price = parseFloat(item.price) || 0; // Simplified price parsing
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            html += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <a href="urun-detay.html" class="cart-item-title">${item.name}</a>
                        <div class="cart-item-variant">${item.variant || 'Standart'}</div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <input type="text" class="qty-input" value="${item.quantity}" readonly>
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class="fa-solid fa-trash"></i> Sil
                            </button>
                            <div class="cart-item-price">${item.price} TL</div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (typeof updateCartSummary === 'function') updateCartSummary(subtotal);
    };


    window.changeBrandSlide = function (direction) {
        currentBrandSlideIndex += direction;

        if (currentBrandSlideIndex > totalBrandSlides) {
            currentBrandSlideIndex = 1;
        } else if (currentBrandSlideIndex < 1) {
            currentBrandSlideIndex = totalBrandSlides;
        }

        showBrandSlide(currentBrandSlideIndex);
    };

    window.currentBrandSlide = function (n) {
        currentBrandSlideIndex = n;
        showBrandSlide(currentBrandSlideIndex);
    };

    function showBrandSlide(n) {
        const slides = document.querySelectorAll('.brands-slide');
        const dots = document.querySelectorAll('.brand-dot');

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[n - 1].classList.add('active');
        dots[n - 1].classList.add('active');
    }

    // Auto-slide for brands (optional)
    let brandSlideInterval = setInterval(() => {
        changeBrandSlide(1);
    }, 3000); // Change slide every 3 seconds

    // Pause auto-slide on hover
    const brandsSliderContainer = document.querySelector('.brands-slider-container');
    if (brandsSliderContainer) {
        brandsSliderContainer.addEventListener('mouseenter', () => {
            clearInterval(brandSlideInterval);
        });

        brandsSliderContainer.addEventListener('mouseleave', () => {
            brandSlideInterval = setInterval(() => {
                changeBrandSlide(1);
            }, 3000);
        });
    }

    // Initialize
    // updateCartCount(); // This call will be moved to the end of DOMContentLoaded

    // ============================================
    // CATEGORIES CAROUSEL - INFINITE LOOP
    // ============================================

    const track = document.getElementById('categoriesTrack');
    if (track) {
        const cards = Array.from(track.children);
        const cardWidth = cards[0]?.offsetWidth || 0;
        const gap = 20;
        const itemWidth = cardWidth + gap;

        let currentIndex = 0;
        const visibleCards = 5; // 5 cards visible at a time

        // Clone first 5 cards and append to end for infinite loop
        for (let i = 0; i < visibleCards; i++) {
            const clone = cards[i].cloneNode(true);
            clone.classList.add('cloned');
            track.appendChild(clone);
        }

        // Clone last 5 cards and prepend to start
        for (let i = cards.length - 1; i >= cards.length - visibleCards; i--) {
            const clone = cards[i].cloneNode(true);
            clone.classList.add('cloned');
            track.insertBefore(clone, track.firstChild);
        }

        // Start at the first real card (after prepended clones)
        currentIndex = visibleCards;
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

        window.moveCarousel = function (direction) {
            currentIndex += direction;
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

            // Handle infinite loop
            setTimeout(() => {
                if (currentIndex >= cards.length + visibleCards) {
                    // Jumped past the end, reset to start
                    track.style.transition = 'none';
                    currentIndex = visibleCards;
                    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                } else if (currentIndex < visibleCards) {
                    // Jumped before the start, reset to end
                    track.style.transition = 'none';
                    currentIndex = cards.length + visibleCards - 1;
                    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                }
            }, 500);
        };

        // Auto-slide every 3 seconds
        setInterval(() => {
            moveCarousel(1);
        }, 3000);
    }


    // }); // This closing brace is part of the DOMContentLoaded listener, which will be closed later.
    // ============================================
    // GLOBAL HELPERS (INSIDE SCOPE)
    // ============================================

    window.toggleFavorite = function (product) {
        // Auth Check
        if (typeof window.Auth === 'undefined' || !window.Auth.getCurrentUser()) {
            window.location.href = 'giris-yap.html';
            return;
        }

        const favs = Storage.getFavorites();
        // Ensure ID
        if (!product.id) product.id = product.name?.replace(/\s+/g, '-').toLowerCase() || Date.now();

        const index = favs.findIndex(item => item.id == product.id); // loose equality for string/number match

        if (index > -1) {
            favs.splice(index, 1);
            showNotification('Favorilerden çıkarıldı.');
        } else {
            favs.push(product);
            showNotification('Favorilere eklendi!');
        }

        Storage.saveFavorites(favs);

        // Update Sidebar if open
        if (state.activeSidebar === 'favorites') {
            renderFavorites();
        }
    };

    // Page Specific Renderers (Exposed as Window functions for specific pages)
    window.renderCartPage = function () {
        const container = document.getElementById('cart-items-list');
        const summaryPanel = document.getElementById('cart-summary-panel');
        const totalCountEl = document.getElementById('cart-total-count');

        if (!container) return;

        const cart = Storage.getCart();
        if (totalCountEl) totalCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (cart.length === 0) {
            container.innerHTML = `
                < div class="empty-state" >
                    <i class="fa-solid fa-cart-shopping empty-icon"></i>
                    <p class="empty-text">Sepetinizde henüz ürün bulunmamaktadır.</p>
                    <a href="index.html" class="continue-shopping-btn">Alışverişe Başla</a>
                </div >
                `;
            if (summaryPanel) summaryPanel.style.display = 'none';
            return;
        }

        if (summaryPanel) summaryPanel.style.display = 'block';

        let html = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            let price = parseFloat(item.price) || 0; // Simplified price parsing
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            html += `
                < div class="cart-item" >
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <a href="urun-detay.html" class="cart-item-title">${item.name}</a>
                            <div class="cart-item-variant">${item.variant || 'Standart'}</div>
                            <div class="cart-item-actions">
                                <div class="quantity-control">
                                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                                </div>
                                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                    <i class="fa-solid fa-trash"></i> Sil
                                </button>
                                <div class="cart-item-price">${item.price} TL</div>
                            </div>
                        </div>
                    </div>
            `;
        });

        container.innerHTML = html;
        // Summary logic omitted for brevity, use sidebar logic or extend
    };

    window.renderFavoritesPage = function () {
        const container = document.getElementById('favorites-list');
        const countEl = document.getElementById('fav-count');

        if (!container) return;

        const favs = Storage.getFavorites();
        if (countEl) countEl.textContent = favs.length;

        if (favs.length === 0) {
            container.innerHTML = `
                < div class="empty-state" style = "grid-column: 1/-1;" >
                <i class="fa-regular fa-heart empty-icon"></i>
                <p class="empty-text">Favori listeniz şu an boş.</p>
                <a href="index.html" class="continue-shopping-btn">Keşfetmeye Başla</a>
            </div >
                `;
            return;
        }

        let html = '';
        favs.forEach((item) => {
            // Escape quotes for JSON stringify in onclick
            const itemStr = JSON.stringify(item).replace(/"/g, '&quot;');

            html += `
                < div class="fav-card" >
                <button class="fav-remove-btn" onclick="toggleFavorite(${itemStr})">
                    <i class="fa-solid fa-times"></i>
                </button>
                <a href="urun-detay.html" class="fav-img-container">
                    <img src="${item.image}" alt="${item.name}">
                </a>
                <div class="fav-info">
                    <a href="urun-detay.html" class="fav-name">${item.name}</a>
                    <span class="fav-price">${item.price}</span>
                    <button class="fav-add-btn" onclick="addToCart(${itemStr})">
                        <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                    </button>
                </div>
            </div >
                `;
        });

        container.innerHTML = html;
    };

    function updateCartCount() {
        const cart = Storage.getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        if (elements.cartCount) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            elements.cartCount.classList.add('updated');
            setTimeout(() => {
                elements.cartCount.classList.remove('updated');
            }, 600);
        }
    }

    // Initial calls
    updateCartCount();

});
// End of DOMContentLoaded
