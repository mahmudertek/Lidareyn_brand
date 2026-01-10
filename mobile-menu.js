
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
            // Bildirim çubuğunu gizle
            const devNotice = document.querySelector('.development-notice');
            if (devNotice) devNotice.style.display = 'none';
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
            // Bildirim çubuğunu geri göster
            const devNotice = document.querySelector('.development-notice');
            if (devNotice) devNotice.style.display = '';
        });

        // Close when clicking on the overlay background (not on content)
        mobileSearchOverlay.addEventListener('click', function (e) {
            if (e.target === mobileSearchOverlay) {
                mobileSearchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                // Bildirim çubuğunu geri göster
                const devNotice = document.querySelector('.development-notice');
                if (devNotice) devNotice.style.display = '';
            }
        });
    }

    // --- Mobile Live Search Integration with Smart Search & Search History ---
    if (mobileSearchInput) {
        // Create results container
        let resultsContainer = document.querySelector('.mobile-search-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'mobile-search-results';
            document.querySelector('.mobile-search-content').appendChild(resultsContainer);
        }

        // Arama geçmişi yönetimi
        const SEARCH_HISTORY_KEY = 'galatacarsi_search_history';
        const MAX_HISTORY_ITEMS = 8;

        function getSearchHistory() {
            try {
                return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
            } catch {
                return [];
            }
        }

        function saveToHistory(query) {
            if (!query || query.length < 2) return;
            let history = getSearchHistory();
            // Aynı arama varsa kaldır
            history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
            // Başa ekle
            history.unshift(query);
            // Limit uygula
            history = history.slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
        }

        function removeFromHistory(query) {
            let history = getSearchHistory();
            history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
            showSearchHistory(); // Refresh
        }

        function clearAllHistory() {
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            showSearchHistory();
        }

        function showSearchHistory() {
            const history = getSearchHistory();
            if (history.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="mobile-search-empty">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <p>Arama yapmaya başlayın</p>
                        <span>Ürün, marka veya kategori arayabilirsiniz</span>
                    </div>
                `;
            } else {
                let html = `
                    <div class="mobile-search-history-header">
                        <span><i class="fa-solid fa-clock-rotate-left"></i> Son Aramalar</span>
                        <button onclick="event.stopPropagation(); document.querySelector('.mobile-search-input').dispatchEvent(new CustomEvent('clearHistory'))">Temizle</button>
                    </div>
                `;
                history.forEach(term => {
                    html += `
                    <div class="mobile-search-item mobile-search-history-item">
                        <a href="arama.html?q=${encodeURIComponent(term)}" onclick="event.stopPropagation();">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                            <span>${term}</span>
                        </a>
                        <button class="remove-history-btn" onclick="event.preventDefault(); event.stopPropagation(); document.querySelector('.mobile-search-input').dispatchEvent(new CustomEvent('removeHistory', {detail: '${term}'}))">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>`;
                });
                resultsContainer.innerHTML = html;
            }
            resultsContainer.style.display = 'block';
        }

        // Custom events for history management
        mobileSearchInput.addEventListener('clearHistory', clearAllHistory);
        mobileSearchInput.addEventListener('removeHistory', (e) => removeFromHistory(e.detail));

        // Focus olunca geçmişi göster
        mobileSearchInput.addEventListener('focus', function () {
            if (this.value.trim() === '') {
                showSearchHistory();
            }
        });

        // Form submit olunca geçmişe kaydet
        const searchForm = document.querySelector('.mobile-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function () {
                const query = mobileSearchInput.value.trim();
                if (query) saveToHistory(query);
            });
        }

        // Debounce helper
        let timeout = null;

        // Güncel marka listesi (Hırdavat/El Aletleri odaklı)
        const knownBrands = [
            'Bosch', 'Makita', 'DeWalt', 'Black+Decker', 'Knipex',
            'Beta', 'Stanley', 'Gedore', 'Rtrmax', 'Catpower',
            'Ingco', 'Tolsen', 'Total', 'Einhell', 'Karcher',
            'Fein', 'Metabo', 'Milwaukee', 'Hikoki', 'Festool'
        ];

        mobileSearchInput.addEventListener('input', function (e) {
            clearTimeout(timeout);
            const query = e.target.value.trim().toLowerCase();

            timeout = setTimeout(() => {
                if (query.length < 1) {
                    showSearchHistory();
                    return;
                }

                // Use global products data
                const products = window.productsData || JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');

                // Akıllı Arama - Kelime bazlı sıralama
                const queryWords = query.split(/\s+/).filter(w => w.length > 0);

                const scoredProducts = products.map(p => {
                    let score = 0;
                    const name = (p.name || '').toLowerCase();
                    const brand = (p.brand || p.marka || '').toLowerCase();
                    const category = (p.category || '').toLowerCase();

                    queryWords.forEach(word => {
                        if (name.includes(word)) score += 3;
                        if (brand.includes(word)) score += 2;
                        if (category.includes(word)) score += 1;
                    });

                    // Tam eşleşme bonusu
                    if (name.includes(query)) score += 5;

                    return { ...p, score };
                }).filter(p => p.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                // Kategoriler
                const productCategories = [...new Set(products.map(p => p.category ? p.category.split(' > ')[0] : ''))].filter(Boolean);
                const matchedCategories = productCategories
                    .filter(c => c.toLowerCase().includes(query))
                    .slice(0, 3);

                // Markalar
                const matchedBrands = knownBrands
                    .filter(b => b.toLowerCase().includes(query))
                    .slice(0, 4);

                // Render Results
                let html = '';
                let hasResults = false;

                // Kategoriler
                if (matchedCategories.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Kategoriler</div>`;
                    matchedCategories.forEach(cat => {
                        html += `
                        <a href="arama.html?category=${encodeURIComponent(cat)}" class="mobile-search-item mobile-search-text-only" onclick="saveToHistory('${cat}')">
                            <i class="fa-solid fa-layer-group"></i>
                            <span>${cat}</span>
                        </a>`;
                    });
                }

                // Markalar
                if (matchedBrands.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Markalar</div>`;
                    matchedBrands.forEach(brand => {
                        html += `
                        <a href="arama.html?q=${encodeURIComponent(brand)}" class="mobile-search-item mobile-search-text-only" onclick="saveToHistory('${brand}')">
                            <i class="fa-solid fa-tag"></i>
                            <span>${brand}</span>
                        </a>`;
                    });
                }

                // Ürünler
                if (scoredProducts.length > 0) {
                    hasResults = true;
                    html += `<div class="mobile-search-section-title">Ürünler</div>`;
                    scoredProducts.forEach(prod => {
                        const productId = prod._id || prod.id;
                        const image = prod.mainImage || prod.image || 'https://placehold.co/60x60/6366f1/fff?text=' + (prod.brand || 'G').charAt(0);
                        const price = prod.salePrice || prod.price || 0;
                        html += `
                        <a href="urun-detay.html?id=${productId}" class="mobile-search-item" onclick="saveToHistory('${(prod.name || '').replace(/'/g, '')}')">
                            <img src="${image}" alt="${prod.name}" onerror="this.src='https://placehold.co/60x60/6366f1/fff?text=?'">
                            <div class="mobile-search-info">
                                <span class="name">${prod.name}</span>
                                <span class="price">₺${Number(price).toLocaleString('tr-TR')}</span>
                            </div>
                        </a>`;
                    });
                }

                if (hasResults) {
                    resultsContainer.innerHTML = html;
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = `
                        <div class="mobile-no-results">
                            <i class="fa-solid fa-face-frown"></i>
                            <p>"${query}" için sonuç bulunamadı</p>
                            <span>Farklı kelimeler deneyin</span>
                        </div>`;
                    resultsContainer.style.display = 'block';
                }
            }, 250);
        });

        // Global saveToHistory fonksiyonu (onclick için)
        window.saveToHistory = saveToHistory;
    }
});
