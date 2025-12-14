// ============================================
// KARAKÖY TÜCCARI - MODERN E-COMMERCE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        isSearchOpen: false,
        isUserMenuOpen: false,
        activeSidebar: null // 'cart' or 'favorites' or null
    };

    // --- SEARCH AUTOCOMPLETE LOGIC ---
    // --- SEARCH AUTOCOMPLETE LOGIC ---
    // Moved to live-search.js for better modularity and keyboard support
    // initLiveSearch() is removed from here to prevent duplicate execution.

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
    if (elements.searchBtn) {
        const performSearch = () => {
            if (elements.searchInput) {
                const query = elements.searchInput.value.trim();
                if (query) {
                    window.location.href = `arama.html?q=${encodeURIComponent(query)}`;
                }
            }
        };

        elements.searchBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent accidental form submits
            e.stopPropagation(); // Stop clicking through to document

            // toggle mantığı: state değişkenine güvenmek yerine direkt sınıfa bak
            const isActive = elements.searchContainer.classList.contains('active');

            if (isActive) {
                // Eğer zaten açıksa ve kullanıcı butona bastıysa kapatalım (veya arama yapalım)
                // Şimdilik kapatalım
                closeSearch();
            } else {
                // Kapalıysa açalım
                elements.searchContainer.classList.add('active');
                state.isSearchOpen = true;

                // Inputa odaklan
                if (elements.searchInput) {
                    setTimeout(() => elements.searchInput.focus(), 100); // Kısa gecikme transition için iyi olur
                }

                // Diğer menüleri kapat
                closeUserMenu();
                closeSidebar();
            }
        });

        if (elements.searchInput) {
            elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Close search on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isSearchOpen) {
                closeSearch();
            }
        });
    }

    function closeSearch() {
        state.isSearchOpen = false;
        if (elements.searchContainer) {
            elements.searchContainer.classList.remove('active');
        }
    }

    // ============================================
    // USER DROPDOWN
    // ============================================
    if (elements.userBtn) {
        elements.userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.isUserMenuOpen = !state.isUserMenuOpen;

            if (elements.userDropdown) {
                elements.userDropdown.classList.toggle('active', state.isUserMenuOpen);

                if (state.isUserMenuOpen) {
                    closeSearch();
                    closeSidebar();
                }
            }
        });
    }

    function closeUserMenu() {
        state.isUserMenuOpen = false;
        if (elements.userDropdown) {
            elements.userDropdown.classList.remove('active');
        }
    }

    // ============================================
    // SIDEBARS (CART & FAVORITES)
    // ============================================

    // Open Favorites
    if (elements.favoritesBtn) {
        elements.favoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = window.Auth && window.Auth.getCurrentUser ? window.Auth.getCurrentUser() : null;
            if (!user) {
                window.location.href = 'giris-yap.html';
                return;
            }
            openSidebar('favorites');
        });
    }


    // ============================================
    // TOGGLE FAVORITE (Global for React/HTML)
    // ============================================
    window.toggleFavorite = function (product) {
        const user = window.Auth && window.Auth.getCurrentUser ? window.Auth.getCurrentUser() : null;

        if (!user) {
            window.location.href = 'giris-yap.html';
            return;
        }

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingIndex = favorites.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            // Remove
            favorites.splice(existingIndex, 1);
            showNotification('Ürün favorilerden kaldırıldı.');
        } else {
            // Add
            favorites.push(product);
            showNotification('Ürün favorilere eklendi!');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Update UI if sidebar is open
        if (state.activeSidebar === 'favorites') {
            renderFavorites();
        }
    };

    // Navigate to Cart Page directly
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = 'sepet.html';
        });
    }

    // Close Sidebars
    elements.closeSidebarBtns.forEach(btn => {
        btn.addEventListener('click', closeSidebar);
    });

    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', closeSidebar);
    }

    function openSidebar(type) {
        state.activeSidebar = type;
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        if (type === 'favorites' && elements.favoritesSidebar) {
            elements.favoritesSidebar.classList.add('active');
            renderFavorites();
        } else if (type === 'cart' && elements.cartSidebar) {
            elements.cartSidebar.classList.add('active');
            renderCart();
        }

        // Close other UI elements
        closeSearch();
        closeUserMenu();
    }

    function closeSidebar() {
        state.activeSidebar = null;
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
        if (elements.favoritesSidebar) elements.favoritesSidebar.classList.remove('active');
        if (elements.cartSidebar) elements.cartSidebar.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // ============================================
    // CLICK OUTSIDE HANDLER
    // ============================================
    document.addEventListener('click', (e) => {
        // Close Search
        if (state.isSearchOpen &&
            elements.searchContainer &&
            !elements.searchContainer.contains(e.target)) {
            closeSearch();
        }

        // Close User Menu
        if (state.isUserMenuOpen &&
            elements.userDropdown &&
            !elements.userBtn.contains(e.target) &&
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
        }, 500);
    };

    // --- Tab Switching Logic ---
    window.switchCartTab = function (btn) {
        // Remove active class from all buttons
        document.querySelectorAll('.cart-tab-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        // Hide all panes
        document.querySelectorAll('.cart-tab-pane').forEach(p => p.classList.remove('active'));

        // Show target pane
        const targetId = btn.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    };

    // --- Render Favorites on Cart Page (Grid Layout) ---
    window.renderCartPageFavorites = function () {
        const gridContainer = document.getElementById('favorites-grid-container');
        if (!gridContainer) return;

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (favorites.length === 0) {
            gridContainer.innerHTML = '<div class="empty-tab-msg">Favorilerinizde ürün bulunmamaktadır.</div>';
            return;
        }

        let html = '';

        favorites.forEach(item => {
            html += `
            <div class="cart-product-card-horizontal">
                <div class="cpch-image">
                    <a href="urun-detay.html?id=${item.id}">
                        <img src="${item.image}" alt="${item.title || item.name}">
                    </a>
                </div>
                <div class="cpch-details">
                    <div class="cpch-header">
                        <a href="urun-detay.html?id=${item.id}" class="cpch-title" style="text-decoration:none; color:inherit;">${item.title || item.name}</a>
                        <div class="cpch-actions">
                            <button class="cpch-icon-btn" onclick="removeFromFavorites(${item.id}); renderCartPageFavorites();"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                    <div class="cpch-meta">
                        <span class="meta-tag red"><i class="fa-solid fa-heart"></i> Favorilerinizde</span>
                    </div>
                    <div class="cpch-tags">
                         <span class="delivery-tag">Hızlı Teslimat</span>
                    </div>
                    <div class="cpch-footer">
                        <div class="cpch-price">${parseFloat(item.price).toFixed(2)} TL</div>
                        <button class="cpch-add-btn" onclick="addToCart({id:${item.id}, name:'${(item.title || item.name).replace(/'/g, "\\'")}', price:${item.price}, image:'${item.image}'})">Sepete Ekle</button>
                    </div>
                </div>
            </div>`;
        });

        gridContainer.innerHTML = html;
    };

    // Auto-run on page load if grid exists
    if (document.getElementById('favorites-grid-container')) {
        renderCartPageFavorites();
    }

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
            this.src = 'https://picsum.photos/seed/karakoytuccari-placeholder/300x200.jpg';
            this.alt = 'Görsel yüklenemedi - Karaköy Tüccarı e-ticaret';
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


});
