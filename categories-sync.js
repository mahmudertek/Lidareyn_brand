/**
 * CATEGORIES SYNC & DYNAMIC RENDERER
 * Bu script kategorileri merkezi olarak yönetir ve Mega Menüyü dinamik olarak oluşturur.
 */

(function () {
    'use strict';

    // Merkezi Kategori Deposu (Unified Categories)
    window.UnifiedCategories = {
        data: null,

        // Verileri yükle ve birleştir
        async init() {
            // 1. Statik veriyi al
            let baseData = {};
            if (typeof categoriesData !== 'undefined') {
                baseData = JSON.parse(JSON.stringify(categoriesData));
            }

            // 2. LocalStorage'daki özel değişiklikleri al (Admin panelinden gelenler)
            const customData = JSON.parse(localStorage.getItem('galatacarsi_custom_categories') || '{}');

            // 3. Verileri birleştir (Custom data her zaman önceliklidir)
            this.data = this.mergeData(baseData, customData);

            console.log('📂 Unified Categories Initialized:', Object.keys(this.data).length, 'base categories');

            // 4. Mega Menüyü Güncelle
            this.renderMegaMenu();

            // 5. Kategori Kartlarını Güncelle (Eğer ana sayfadaysak)
            this.renderCategoryCards();

            // 6. Kategori Sayfasındaysak Akordiyonu Güncelle
            this.renderAccordion();

            return this.data;
        },

        mergeData(base, custom) {
            const merged = { ...base };

            // Custom verileri işle
            Object.keys(custom).forEach(slug => {
                if (!merged[slug]) {
                    merged[slug] = custom[slug];
                } else {
                    // Mevcut kategorinin alt kategorilerini güncelle
                    if (custom[slug].subcategories) {
                        merged[slug].subcategories = custom[slug].subcategories;
                    }
                }
            });

            return merged;
        },

        // Mega Menüyü Dinamik Olarak Oluştur
        renderMegaMenu() {
            const megaMenuContainer = document.querySelector('.mega-menu');
            if (!megaMenuContainer) return;

            const categories = this.data;
            let html = '<ul class="mega-menu-list">';

            const isInKategoriler = window.location.pathname.includes('/kategoriler/');
            const pathPrefix = isInKategoriler ? '' : 'kategoriler/';

            Object.keys(categories).forEach(slug => {
                const cat = categories[slug];
                const icon = cat.icon || 'fa-folder';
                const title = cat.title || cat.name || slug;

                // Kategori linki (Daha önce HTML içinde olan href'e sadık kalmaya çalışıyoruz)
                const href = `${pathPrefix}${slug}.html`;

                html += `
                    <li>
                        <a href="${href}">
                            <div class="menu-item-left">
                                <i class="fa-solid ${icon}"></i>
                                <span>${title}</span>
                            </div>
                            <i class="fa-solid fa-chevron-right"></i>
                        </a>
                        <div class="sub-menu">
                `;

                // Alt Kategoriler (Sütunlar)
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach(group => {
                        html += `
                            <div class="sub-menu-column">
                                <h4>${group.name}</h4>
                                <ul>
                        `;

                        if (group.items && Array.isArray(group.items)) {
                            group.items.forEach(item => {
                                const encodedSub = encodeURIComponent(item);
                                html += `<li><a href="${href}?subcategory=${encodedSub}">${item}</a></li>`;
                            });
                        }

                        html += `
                                </ul>
                            </div>
                        `;
                    });
                }

                html += `
                        </div>
                    </li>
                `;
            });

            html += '</ul>';
            megaMenuContainer.innerHTML = html;
            console.log('✅ Mega Menu dynamically rendered from UnifiedCategories');
        },

        // Kategori Sayfasındaki Akordiyonu Güncelle
        renderAccordion() {
            const accordionContent = document.querySelector('.accordion-content');
            if (!accordionContent) return;

            // Şu anki kategoriyi URL'den bul
            const path = window.location.pathname;
            const slug = path.split('/').pop().replace('.html', '');

            const cat = this.data[slug];
            if (!cat || !cat.subcategories) return;

            let html = '';

            // 1. Alt Kategoriler Akordiyonu
            html += `
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger active">
                        Alt Kategoriler
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children open">
            `;

            cat.subcategories.forEach(group => {
                if (group.items && Array.isArray(group.items)) {
                    group.items.forEach(item => {
                        const encodedSub = encodeURIComponent(item);
                        html += `<a href="${slug}.html?subcategory=${encodedSub}" class="accordion-child-item">${item}</a>`;
                    });
                }
            });

            html += `
                    </div>
                </div>
            `;

            // 2. Markalar Akordiyonu
            html += `
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Bu Kategorideki Tüm Markalar
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <div class="brand-filter-search" style="padding: 10px;">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" class="brand-search-input" placeholder="Marka ara..." style="width: 100%; border: none; padding: 5px; outline: none; border-bottom: 1px solid #eee;">
                        </div>
                        <div class="brand-list" style="max-height: 200px; overflow-y: auto; padding: 0 10px;">
                            <!-- Markalar dynamic-loader.js tarafından doldurulacak -->
                             <div class="loading-spinner" style="font-size: 12px; color: #999; padding: 10px; text-align: center;">Yükleniyor...</div>
                        </div>
                    </div>
                </div>
            `;

            // 3. Ürün Grupları Akordiyonu
            html += `
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Ürün Grupları
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <div class="group-list" style="padding: 10px; font-size: 13px; color: #666;">
                            Bu kategoriye ait ürün grupları listeleniyor...
                        </div>
                    </div>
                </div>
            `;

            accordionContent.innerHTML = html;

            // Accordion click eventlerini tekrar bağla (dynamic content sonrası)
            this.rebindAccordionEvents();
            console.log('✅ Accordion dynamically rendered from UnifiedCategories');
        },

        rebindAccordionEvents() {
            const parentTriggers = document.querySelectorAll('.accordion-parent-trigger');
            parentTriggers.forEach(trigger => {
                trigger.addEventListener('click', function () {
                    const parent = this.closest('.accordion-parent');
                    const children = parent.querySelector('.accordion-children');
                    this.classList.toggle('active');
                    if (children) children.classList.toggle('open');
                });
            });
        },

        // Ana sayfadaki kategori kartlarını güncelle
        renderCategoryCards() {
            const track = document.getElementById('categoriesTrack');
            if (!track) return;

            const categories = this.data;
            let html = '';

            Object.keys(categories).forEach(slug => {
                const cat = categories[slug];
                const icon = cat.icon || 'fa-folder';
                const title = cat.title || cat.name || slug;
                const image = cat.image || `https://placehold.co/200x200?text=${encodeURIComponent(title)}`;

                html += `
                    <div class="category-card" onclick="window.location.href='kategoriler/${slug}.html'">
                        <div class="category-icon-wrapper">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <img src="${image}" alt="${title}" class="category-img" onerror="this.src='https://placehold.co/200x200?text=${encodeURIComponent(title)}'">
                        <div class="category-info">
                            <h3>${title}</h3>
                            <p>${cat.subcategories?.length || 0} Alt Kategori</p>
                        </div>
                    </div>
                `;
            });

            track.innerHTML = html;

            // Carousel script'ini (script.js içindeki) tekrar tetiklemek gerekebilir veya o script'in çalışmasını beklemek gerekir.
            // script.js içindeki carousel init'i children'ları saydığı için bu render'dan SONRA çalışmalı.
            // window.dispatchEvent(new Event('categoriesRendered'));
            console.log('✅ Category Cards dynamically rendered');
        }
    };

    // Otomatik başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.UnifiedCategories.init());
    } else {
        window.UnifiedCategories.init();
    }

})();
