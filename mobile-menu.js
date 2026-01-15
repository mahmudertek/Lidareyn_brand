
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
        // Use the existing results area from HTML
        let resultsContainer = document.getElementById('mobile-search-results-area');
        if (!resultsContainer) {
            resultsContainer = document.querySelector('.mobile-search-results');
        }
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'mobile-search-results';
            document.getElementById('mobile-search-overlay').appendChild(resultsContainer);
        }

        // ╔══════════════════════════════════════════════════════════════════════════════╗
        // ║     🔍 ULTRA GELİŞMİŞ MOBİL AKILLI ARAMA SİSTEMİ v2.0 🔍                     ║
        // ║     Popüler aramalar, tarama geçmişi, trend ürünler, fuzzy matching          ║
        // ╚══════════════════════════════════════════════════════════════════════════════╝

        // Storage Keys
        const SEARCH_HISTORY_KEY = 'galatacarsi_search_history';
        const BROWSING_HISTORY_KEY = 'browsingHistory';
        const POPULAR_SEARCHES_KEY = 'galatacarsi_popular_searches';
        const MAX_HISTORY_ITEMS = 10;
        const MAX_BROWSING_ITEMS = 6;

        // Popüler/Trend Aramalar (varsayılan)
        const defaultPopularSearches = [
            'Bosch Matkap', 'Makita Avuç Taşlama', 'DeWalt Set',
            'Knipex Pense', 'Lokma Takımı', 'Akülü Vidalama',
            'Beta El Aletleri', 'Ölçüm Aleti'
        ];

        // Hızlı Kategori Erişimi
        const quickCategories = [
            { name: 'Akülü Aletler', icon: 'fa-battery-full', slug: 'akulu-aletler' },
            { name: 'El Aletleri', icon: 'fa-screwdriver-wrench', slug: 'hirdavat-el-aletleri' },
            { name: 'Elektrikli Aletler', icon: 'fa-plug', slug: 'elektrikli-el-aletleri' },
            { name: 'Ölçme Aletleri', icon: 'fa-ruler', slug: 'olcme-ve-kontrol-aletleri' }
        ];

        // Güncel marka listesi
        const knownBrands = [
            'Bosch', 'Makita', 'DeWalt', 'Black+Decker', 'Knipex',
            'Beta', 'Stanley', 'Gedore', 'Rtrmax', 'Catpower',
            'Ingco', 'Tolsen', 'Total', 'Einhell', 'Karcher',
            'Fein', 'Metabo', 'Milwaukee', 'Hikoki', 'Festool',
            'Wilke', 'Juwex', 'Ridgid', 'Irwin', 'Bahco'
        ];

        // ==================== GEÇMIŞ YÖNETİMİ ====================

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
            history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
            history.unshift(query);
            history = history.slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
        }

        function removeFromHistory(query) {
            let history = getSearchHistory();
            history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
            showSmartSearchHome();
        }

        function clearAllHistory() {
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            showSmartSearchHome();
        }

        // ==================== TARAMA GEÇMİŞİ ====================

        function getBrowsingHistory() {
            try {
                const data = JSON.parse(localStorage.getItem(BROWSING_HISTORY_KEY) || '[]');
                return data.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt)).slice(0, MAX_BROWSING_ITEMS);
            } catch {
                return [];
            }
        }

        // ==================== POPÜLER ARAMALAR ====================

        function getPopularSearches() {
            try {
                const stored = JSON.parse(localStorage.getItem(POPULAR_SEARCHES_KEY) || '[]');
                if (stored.length > 0) return stored.slice(0, 8);
            } catch { }
            return defaultPopularSearches;
        }

        function incrementPopularSearch(query) {
            if (!query || query.length < 2) return;
            try {
                let popular = JSON.parse(localStorage.getItem(POPULAR_SEARCHES_KEY) || '{}');
                if (typeof popular !== 'object' || Array.isArray(popular)) popular = {};
                popular[query.toLowerCase()] = (popular[query.toLowerCase()] || 0) + 1;

                // Sort by count and get top 20
                const sorted = Object.entries(popular)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20)
                    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

                localStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(sorted));
            } catch { }
        }

        // ==================== AKILLI ANA SAYFA GÖRÜNTÜLEMESİ ====================

        function showSmartSearchHome() {
            const history = getSearchHistory();
            const browsingHistory = getBrowsingHistory();
            const popularSearches = getPopularSearches();

            let html = '';

            // 1. Hızlı Kategoriler
            html += `
                <div class="smart-search-section">
                    <div class="smart-section-header">
                        <span><i class="fa-solid fa-grid-2"></i> Hızlı Erişim</span>
                    </div>
                    <div class="quick-categories-grid">
                        ${quickCategories.map(cat => `
                            <a href="kategoriler/${cat.slug}.html" class="quick-category-item">
                                <i class="fa-solid ${cat.icon}"></i>
                                <span>${cat.name}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;

            // 2. Son Aramalar (varsa)
            if (history.length > 0) {
                html += `
                    <div class="smart-search-section">
                        <div class="smart-section-header">
                            <span><i class="fa-solid fa-clock-rotate-left"></i> Son Aramalarınız</span>
                            <button class="smart-clear-btn" onclick="event.stopPropagation(); document.querySelector('.mobile-search-input').dispatchEvent(new CustomEvent('clearHistory'))">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                        <div class="search-history-chips">
                            ${history.slice(0, 6).map(term => {
                    const shortTerm = term.length > 12 ? term.substring(0, 12) + '...' : term;
                    return `
                                <div class="search-chip">
                                    <a href="arama.html?q=${encodeURIComponent(term)}" onclick="saveToHistory('${term.replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-magnifying-glass"></i>
                                        ${shortTerm}
                                    </a>
                                    <button class="chip-remove" onclick="event.preventDefault(); event.stopPropagation(); document.querySelector('.mobile-search-input').dispatchEvent(new CustomEvent('removeHistory', {detail: '${term.replace(/'/g, "\\'")}'}))">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                `;
            }

            // 3. Son Gezilen Ürünler (varsa)
            if (browsingHistory.length > 0) {
                html += `
                    <div class="smart-search-section">
                        <div class="smart-section-header">
                            <span><i class="fa-solid fa-eye"></i> Son Gezdiğiniz Ürünler</span>
                        </div>
                        <div class="browsing-history-scroll">
                            ${browsingHistory.map(item => `
                                <a href="urun-detay.html?id=${item.id}" class="browsing-history-item">
                                    <img src="${item.image || 'https://placehold.co/80x80/f0f0f0/999?text=Ürün'}" 
                                         alt="${item.name || 'Ürün'}" 
                                         onerror="this.src='https://placehold.co/80x80/f0f0f0/999?text=Ürün'">
                                    <span class="browsing-item-name">${(item.name || 'Ürün').substring(0, 30)}${(item.name || '').length > 30 ? '...' : ''}</span>
                                    <span class="browsing-item-price">${(function (p) { if (!p || p === 'Fiyat Yok' || p === '---') return '---'; if (typeof p === 'string' && (p.includes('₺') || p.includes('TL'))) return p; var n = parseFloat(String(p).replace(/[^\d.,]/g, '').replace(',', '.')); return isNaN(n) ? '---' : '₺' + n.toLocaleString('tr-TR'); })(item.price)}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // 4. Popüler Aramalar - KALDIRILDI
            // html += `...`;

            // 5. Eğer hiç geçmiş yoksa hoş mesaj
            if (history.length === 0 && browsingHistory.length === 0) {
                html += `
                    <div class="smart-search-welcome">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <p>Arama yapmaya başlayın</p>
                        <span>Ürün, marka veya kategori arayabilirsiniz</span>
                    </div>
                `;
            }

            resultsContainer.innerHTML = html;
            resultsContainer.style.display = 'block';
        }

        // ==================== AKILLI ARAMA (FUZZY MATCHING) ====================

        function fuzzyMatch(text, query) {
            if (!text || !query) return 0;
            text = text.toLowerCase();
            query = query.toLowerCase();

            // Tam eşleşme bonusu
            if (text === query) return 100;
            if (text.includes(query)) return 80;

            // Kelime bazlı eşleşme
            const queryWords = query.split(/\s+/).filter(w => w.length > 0);
            const textWords = text.split(/\s+/);

            let score = 0;
            let matchedWords = 0;

            queryWords.forEach(qw => {
                // Tam kelime eşleşmesi
                if (textWords.some(tw => tw === qw)) {
                    score += 30;
                    matchedWords++;
                }
                // Kelime başlangıcı eşleşmesi
                else if (textWords.some(tw => tw.startsWith(qw))) {
                    score += 20;
                    matchedWords++;
                }
                // İçerme eşleşmesi
                else if (text.includes(qw)) {
                    score += 10;
                    matchedWords++;
                }
                // Fuzzy: 1 karakter toleransı
                else {
                    const fuzzyFound = textWords.some(tw => {
                        if (Math.abs(tw.length - qw.length) > 2) return false;
                        let diff = 0;
                        for (let i = 0; i < Math.max(tw.length, qw.length); i++) {
                            if (tw[i] !== qw[i]) diff++;
                            if (diff > 1) return false;
                        }
                        return true;
                    });
                    if (fuzzyFound) {
                        score += 5;
                        matchedWords++;
                    }
                }
            });

            // Tüm kelimeler eşleştiyse bonus
            if (matchedWords === queryWords.length && queryWords.length > 0) {
                score += 25;
            }

            return score;
        }

        function performSmartSearch(query) {
            const products = window.galataProductsData || [];

            // Ürün arama
            const scoredProducts = products.map(p => {
                const nameScore = fuzzyMatch(p.name || '', query) * 2;
                const brandScore = fuzzyMatch(p.brand || p.marka || '', query) * 1.5;
                const categoryScore = fuzzyMatch(p.category || '', query);
                const skuScore = (p.sku || '').toLowerCase().includes(query.toLowerCase()) ? 50 : 0;

                return {
                    ...p,
                    score: nameScore + brandScore + categoryScore + skuScore
                };
            })
                .filter(p => p.score > 10)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8);

            // Kategori arama
            const productCategories = [...new Set(products.map(p => {
                if (!p.category) return '';
                return p.category.split(' > ')[0];
            }))].filter(Boolean);

            const matchedCategories = productCategories
                .map(c => ({ name: c, score: fuzzyMatch(c, query) }))
                .filter(c => c.score > 10)
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map(c => c.name);

            // Marka arama
            const matchedBrands = knownBrands
                .map(b => ({ name: b, score: fuzzyMatch(b, query) }))
                .filter(b => b.score > 10)
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map(b => b.name);

            // Öneri oluştur
            const suggestions = [];
            if (query.length >= 2) {
                // Geçmişten öneriler
                const historyMatches = getSearchHistory()
                    .filter(h => h.toLowerCase().includes(query.toLowerCase()) && h.toLowerCase() !== query.toLowerCase())
                    .slice(0, 3);
                suggestions.push(...historyMatches);
            }

            return {
                products: scoredProducts,
                categories: matchedCategories,
                brands: matchedBrands,
                suggestions: suggestions
            };
        }

        function renderSearchResults(query, results) {
            let html = '';
            const hasAnyResults = results.products.length > 0 || results.categories.length > 0 || results.brands.length > 0;

            // Öneriler
            if (results.suggestions.length > 0) {
                html += `<div class="smart-search-section compact">
                    <div class="suggestions-list">
                        ${results.suggestions.map(s => `
                            <a href="arama.html?q=${encodeURIComponent(s)}" class="suggestion-item" onclick="saveToHistory('${s.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <span>${highlightMatch(s, query)}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>`;
            }

            // Kategoriler
            if (results.categories.length > 0) {
                html += `
                    <div class="smart-search-section">
                        <div class="smart-section-header mini">
                            <span><i class="fa-solid fa-layer-group"></i> Kategoriler</span>
                        </div>
                        ${results.categories.map(cat => `
                            <a href="arama.html?category=${encodeURIComponent(cat)}" class="mobile-search-item mobile-search-text-only" onclick="saveToHistory('${cat.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-folder"></i>
                                <span>${highlightMatch(cat, query)}</span>
                            </a>
                        `).join('')}
                    </div>
                `;
            }

            // Markalar
            if (results.brands.length > 0) {
                html += `
                    <div class="smart-search-section">
                        <div class="smart-section-header mini">
                            <span><i class="fa-solid fa-tag"></i> Markalar</span>
                        </div>
                        <div class="brands-chips">
                            ${results.brands.map(brand => `
                                <a href="arama.html?q=${encodeURIComponent(brand)}" class="brand-chip" onclick="saveToHistory('${brand.replace(/'/g, "\\'")}')">
                                    ${highlightMatch(brand, query)}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Ürünler
            if (results.products.length > 0) {
                html += `
                    <div class="smart-search-section">
                        <div class="smart-section-header mini">
                            <span><i class="fa-solid fa-box-open"></i> Ürünler</span>
                            <span class="results-count">${results.products.length} sonuç</span>
                        </div>
                        ${results.products.map(prod => {
                    const productId = prod._id || prod.id;
                    const image = prod.mainImage || prod.image || 'https://placehold.co/60x60/6366f1/fff?text=' + (prod.brand || 'G').charAt(0);
                    const price = prod.salePrice || prod.price || 0;
                    const hasDiscount = prod.salePrice && prod.price && parseFloat(prod.salePrice) < parseFloat(prod.price);

                    return `
                                <a href="urun-detay.html?id=${productId}" class="mobile-search-item product-result" onclick="saveToHistory('${(prod.name || '').replace(/'/g, "")}')">
                                    <img src="${image}" alt="${prod.name}" onerror="this.src='https://placehold.co/60x60/6366f1/fff?text=?'">
                                    <div class="mobile-search-info">
                                        <span class="name">${highlightMatch(prod.name || 'Ürün', query)}</span>
                                        <span class="brand-label">${prod.brand || ''}</span>
                                        <div class="price-row">
                                            <span class="price ${prod.salePrice ? 'discounted' : ''}">${prod.price}</span>
                                            ${prod.oldPrice ? `<span class="old-price">${prod.oldPrice}</span>` : ''}
                                        </div>
                                    </div>
                                    <i class="fa-solid fa-chevron-right"></i>
                                </a>
                            `;
                }).join('')}
                    </div>
                `;
            }

            // Sonuç bulunamadı
            if (!hasAnyResults) {
                html = `
                    <div style="padding: 40px 20px; text-align: center;">
                        <i class="fa-solid fa-face-sad-tear" style="font-size: 40px; color: #ddd; margin-bottom: 12px; display: block;"></i>
                        <p style="font-size: 15px; font-weight: 600; color: #333; margin: 0 0 6px 0;">"${query}" için sonuç bulunamadı</p>
                        <span style="font-size: 12px; color: #888; display: block; margin-bottom: 20px;">Yazım hatası olabilir mi? Farklı kelimeler deneyin.</span>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="document.querySelector('.mobile-search-input').value=''; showSmartSearchHome()" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; border: 1px solid #e0e0e0; background: #fff; color: #555; font-size: 13px; font-weight: 500; cursor: pointer;">
                                <i class="fa-solid fa-arrow-left" style="font-size: 11px;"></i> Geri
                            </button>
                            <a href="arama.html?q=${encodeURIComponent(query)}" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; background: linear-gradient(135deg, #8b7bd8, #6b5bb8); color: #fff; font-size: 13px; font-weight: 500; text-decoration: none;">
                                <i class="fa-solid fa-search" style="font-size: 11px;"></i> Tam Arama
                            </a>
                        </div>
                    </div>
                `;
            }

            // Tüm sonuçları gör butonu
            if (hasAnyResults) {
                html += `
                    <div class="see-all-results">
                        <a href="arama.html?q=${encodeURIComponent(query)}" class="see-all-btn" onclick="saveToHistory('${query.replace(/'/g, "\\'")}'); incrementPopularSearch('${query.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            Tüm Sonuçları Gör
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                `;
            }

            resultsContainer.innerHTML = html;
            resultsContainer.style.display = 'block';
        }

        function highlightMatch(text, query) {
            if (!text || !query) return text || '';
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        // ==================== EVENT LISTENERS ====================

        let searchTimeout = null;

        // Custom events for history management
        mobileSearchInput.addEventListener('clearHistory', clearAllHistory);
        mobileSearchInput.addEventListener('removeHistory', (e) => removeFromHistory(e.detail));

        // Focus: Ana sayfa göster
        mobileSearchInput.addEventListener('focus', function () {
            if (this.value.trim() === '') {
                showSmartSearchHome();
            }
        });

        // Input: Akıllı arama
        mobileSearchInput.addEventListener('input', function (e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 1) {
                showSmartSearchHome();
                return;
            }

            searchTimeout = setTimeout(() => {
                const results = performSmartSearch(query);
                renderSearchResults(query, results);
            }, 200);
        });

        // Form submit: Geçmişe kaydet
        const searchForm = document.querySelector('.mobile-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function () {
                const query = mobileSearchInput.value.trim();
                if (query) {
                    saveToHistory(query);
                    incrementPopularSearch(query);
                }
            });
        }

        // Global fonksiyonlar
        window.saveToHistory = saveToHistory;
        window.showSmartSearchHome = showSmartSearchHome;
        window.incrementPopularSearch = incrementPopularSearch;

        console.log('🔍 Ultra Gelişmiş Mobil Akıllı Arama Sistemi v2.0 yüklendi!');
    }
});

