
document.addEventListener('DOMContentLoaded', function () {
    const mobileCatBtn = document.querySelector('.mobile-categories-btn');
    const body = document.body;

    if (mobileCatBtn) {
        mobileCatBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            body.classList.toggle('mobile-menu-active');

            // Toggle icon state if needed (optional)
            const icon = this.querySelector('i');
            if (body.classList.contains('mobile-menu-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Accordion Logic: Direct attachment for reliability
    const megaMenuLinks = document.querySelectorAll('.mega-menu-list > li > a');

    // Helper to toggle
    function toggleCategory(e) {
        if (window.innerWidth > 768) return;

        // "this" refers to the anchor tag
        const parentLi = this.parentElement;
        const hasSubMenu = parentLi.querySelector('.sub-menu');

        if (hasSubMenu) {
            e.preventDefault();
            e.stopPropagation();

            // Check status BEFORE any changes
            const isCurrentlyActive = parentLi.classList.contains('active');

            // 1. Close ALL items first
            const allItems = document.querySelectorAll('.mega-menu-list > li');
            allItems.forEach(item => {
                item.classList.remove('active');
            });

            // 2. If it wasn't active, open it (If it WAS active, we did nothing after step 1, so it stays closed)
            if (!isCurrentlyActive) {
                parentLi.classList.add('active');
            }
        }
    }

    megaMenuLinks.forEach(link => {
        // Remove old if any (good practice but reload handles it)
        link.removeEventListener('click', toggleCategory);
        link.addEventListener('click', toggleCategory);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (body.classList.contains('mobile-menu-active')) {
            const megaMenu = document.querySelector('.mega-menu');
            const clickedInsideMenu = megaMenu && megaMenu.contains(e.target);
            const clickedBtn = mobileCatBtn && mobileCatBtn.contains(e.target);

            if (!clickedInsideMenu && !clickedBtn) {
                body.classList.remove('mobile-menu-active');
                const icon = mobileCatBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
    // Footer Accordion Logic
    const footerTitles = document.querySelectorAll('.footer-title');
    if (footerTitles.length > 0) {
        footerTitles.forEach(title => {
            title.addEventListener('click', function (e) {
                // Only activate on mobile
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const column = this.closest('.footer-column');

                    // Optional: Close others? 
                    // User said "açılcak" (will open), didn't explicitly say "only one at a time". 
                    // Standard according behavior usually allows multiple or one. 
                    // I will toggle ONLY the clicked one to allow multiple open, which is friendlier if not specified.
                    // Wait, usually accordions close others (accordion vs collapse). 
                    // I'll keep it simple: Toggle the clicked one.

                    if (column) {
                        column.classList.toggle('active');
                    }
                }
            });
        });
    }
    // Mobile Search Overlay Logic
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
    const closeSearchBtn = document.querySelector('.close-search-btn');
    const mobileSearchInput = document.querySelector('.mobile-search-input');

    if (mobileSearchBtn && mobileSearchOverlay) {
        mobileSearchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            mobileSearchOverlay.classList.add('active');
            if (mobileSearchInput) {
                setTimeout(() => mobileSearchInput.focus(), 100);
            }
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    if (closeSearchBtn && mobileSearchOverlay) {
        closeSearchBtn.addEventListener('click', function () {
            mobileSearchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // --- Mobile Live Search Integration ---
    if (mobileSearchInput) {
        // Create results container
        let resultsContainer = document.querySelector('.mobile-search-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'mobile-search-results';
            // Insert after the form
            document.querySelector('.mobile-search-content').appendChild(resultsContainer);
        }

        // Debounce helper
        let timeout = null;

        mobileSearchInput.addEventListener('input', function (e) {
            clearTimeout(timeout);
            const query = e.target.value.trim().toLowerCase();

            timeout = setTimeout(() => {
                if (query.length < 1) {
                    resultsContainer.innerHTML = '';
                    resultsContainer.style.display = 'none';
                    return;
                }

                // Use global products data
                const products = window.productsData || [];

                // 1. Matched Products
                const matchedProducts = products.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    (p.category && p.category.toLowerCase().includes(query))
                ).slice(0, 4);

                // 2. Matched Categories (Derived from product categories for now)
                const productCategories = [...new Set(products.map(p => p.category ? p.category.split(' > ')[0] : ''))].filter(Boolean);
                const matchedCategories = productCategories
                    .filter(c => c.toLowerCase().includes(query))
                    .slice(0, 3);

                // 3. Matched Brands (Mock list, similar to desktop)
                const knownBrands = ['Adidas', 'Nike', 'Puma', 'Zara', 'Mavi', 'Defacto', 'Samsung', 'Apple', 'Bosch', 'Makita'];
                const matchedBrands = knownBrands
                    .filter(b => b.toLowerCase().includes(query))
                    .slice(0, 3);

                // Render Results
                let html = '';
                let hasResults = false;

                // Categories Section
                if (matchedCategories.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Kategoriler</div>`;
                    matchedCategories.forEach(cat => {
                        html += `
                        <a href="arama.html?category=${encodeURIComponent(cat)}" class="mobile-search-item mobile-search-text-only">
                            <i class="fa-solid fa-layer-group"></i>
                            <span>${cat}</span>
                        </a>`;
                    });
                }

                // Brands Section
                if (matchedBrands.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Markalar</div>`;
                    matchedBrands.forEach(brand => {
                        html += `
                        <a href="arama.html?q=${encodeURIComponent(brand)}" class="mobile-search-item mobile-search-text-only">
                            <i class="fa-solid fa-tag"></i>
                            <span>${brand}</span>
                        </a>`;
                    });
                }

                // Products Section
                if (matchedProducts.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Ürünler</div>`;
                    matchedProducts.forEach(prod => {
                        html += `
                        <a href="urun-detay.html?id=${prod.id}" class="mobile-search-item">
                            <img src="${prod.image}" alt="${prod.name}">
                            <div class="mobile-search-info">
                                <span class="name">${prod.name}</span>
                                <span class="price">${prod.price}</span>
                            </div>
                        </a>`;
                    });
                }

                if (hasResults) {
                    resultsContainer.innerHTML = html;
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = `<div class="mobile-no-results">"${query}" için sonuç bulunamadı</div>`;
                    resultsContainer.style.display = 'block';
                }
            }, 300);
        });
    }
});
