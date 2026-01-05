/**
 * CATEGORY PRODUCTS LOADER
 * Kategori sayfalarında ürünleri dinamik olarak yükler
 * API'den veya localStorage'dan veri çeker
 */

(function () {
    'use strict';

    // API URL
    const API_URL = (window.ENV && window.ENV.API_URL)
        ? `${window.ENV.API_URL}/products`
        : 'https://galatacarsi-backend-api.onrender.com/api/products?limit=500';

    // Kategori slug'ını sayfadan belirle
    function getCategorySlug() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename;
    }

    // URL'den alt kategori parametresini al
    function getSubCategoryFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('subcategory') || params.get('alt') || null;
    }

    // Ürünleri yükle
    async function loadProducts() {
        let allProducts = [];

        // 1. API'den dene
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const json = await response.json();
                allProducts = Array.isArray(json) ? json : (json.data || []);
                console.log('✅ Kategori ürünleri API\'den yüklendi:', allProducts.length);
            }
        } catch (err) {
            console.warn('⚠️ API bağlantısı başarısız, localStorage deneniyor...');
        }

        // 2. localStorage fallback
        if (allProducts.length === 0) {
            try {
                const localData = localStorage.getItem('galatacarsi_products');
                if (localData) {
                    allProducts = JSON.parse(localData);
                    console.log('✅ Kategori ürünleri localStorage\'dan yüklendi:', allProducts.length);
                }
            } catch (e) {
                console.error('localStorage parse hatası:', e);
            }
        }

        // 3. products-data.js global fonksiyon
        if (allProducts.length === 0 && typeof window.getAllProductsSync === 'function') {
            allProducts = window.getAllProductsSync() || [];
            console.log('✅ Kategori ürünleri products-data.js\'den yüklendi:', allProducts.length);
        }

        // 🚀 VERİ BİRLEŞTİRME (MERGE DATA FIX) - İndirimli fiyatları kurtar
        try {
            const localMergeData = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
            if (localMergeData.length > 0 && allProducts.length > 0) {
                let mergedCount = 0;
                allProducts.forEach(prod => {
                    const localMatch = localMergeData.find(lp => (lp._id || lp.id) === (prod._id || prod._id));
                    if (localMatch) {
                        // İndirimli fiyat eksikse tamamla
                        if ((prod.salePrice === undefined || prod.salePrice === null) && localMatch.salePrice) {
                            prod.salePrice = localMatch.salePrice;
                            mergedCount++;
                        }
                        // Barkod eksikse tamamla
                        if (!prod.barcode && localMatch.barcode) {
                            prod.barcode = localMatch.barcode;
                        }
                    }
                });
                if (mergedCount > 0) console.log(`🔄 Kategori Sayfası: ${mergedCount} ürünün indirim bilgisi yerel veriden kurtarıldı.`);
            }
        } catch (mergeErr) {
            console.error('Merge error:', mergeErr);
        }

        return allProducts;
    }

    // Kategori eşleştirme
    function matchesCategory(product, slug) {
        if (!product) return false;

        // allCategories dizisi varsa kontrol et
        if (product.allCategories && Array.isArray(product.allCategories)) {
            if (product.allCategories.includes(slug)) return true;
        }

        // categorySlug kontrolü
        if (product.categorySlug === slug) return true;

        // category string içinde kontrol
        if (product.category) {
            const cat = product.category.toLowerCase();
            const s = slug.toLowerCase().replace(/-/g, ' ');
            if (cat.includes(s)) return true;

            // Özel eşleştirmeler
            const mapping = {
                'hirdavat-el-aletleri': ['hırdavat', 'el aletleri', 'hirdavat'],
                'el-aletleri': ['el aletleri'],
                'elektrikli-el-aletleri': ['elektrikli', 'elektrikli el aletleri'],
                'asindirici-kesici': ['aşındırıcı', 'kesici'],
                'yapi-kimyasallari': ['yapıştırıcı', 'dolgu', 'kimyasal'],
                'kaynak-malzemeleri': ['kaynak'],
                'is-guvenligi-ve-calisma-ekipmanlari': ['iş güvenliği', 'güvenlik'],
                'olcme-ve-kontrol-aletleri': ['ölçme', 'kontrol', 'ölçü']
            };

            if (mapping[slug]) {
                return mapping[slug].some(term => cat.includes(term));
            }
        }

        return false;
    }

    // Alt kategori eşleştirme
    function matchesSubCategory(product, subCategory) {
        if (!subCategory || !product) return true; // Alt kategori yoksa tümünü göster

        const sub = subCategory.toLowerCase();

        // subCategory alanı varsa kontrol et
        if (product.subCategory) {
            if (product.subCategory.toLowerCase().includes(sub)) return true;
        }

        // Ürün adında alt kategori geçiyor mu
        if (product.name && product.name.toLowerCase().includes(sub)) return true;

        return false;
    }

    // Ürün kartı HTML'i oluştur
    function createProductCard(product) {
        const id = product._id || product.id;

        // 🖼️ Gelişmiş Görsel Çekme Mantığı (yeni-gelenler.html ile aynı)
        let rawImage = product.mainImage || product.image || (product.images && product.images[0]) || '';
        let finalImgPath = rawImage;

        if (!finalImgPath || finalImgPath.length < 5) {
            finalImgPath = 'https://placehold.co/400x400/f5f5f5/999?text=Resim+Yok';
        } else if (finalImgPath.startsWith('data:') || finalImgPath.startsWith('http')) {
            // Base64 veya Harici Link - Olduğu gibi bırak
        } else {
            // Yerel yol - Klasör derinliğini ayarla
            let cleanPath = finalImgPath.replace(/\\/g, '/').replace(/^\/+/, '');
            const isSubDir = window.location.pathname.includes('/kategoriler/');

            if (isSubDir) {
                // Kategori sayfası alt klasörde, bir üst dizine çıkmalı
                finalImgPath = cleanPath.startsWith('gorseller/') ? '../' + cleanPath : '../gorseller/' + cleanPath;
            } else {
                // Ana dizin (populer, yeni-gelenler vb)
                finalImgPath = cleanPath.startsWith('gorseller/') ? cleanPath : 'gorseller/' + cleanPath;
            }
        }

        const name = product.name || 'Ürün';
        const brand = product.brand || '';
        const price = parseFloat(product.price) || 0;
        const salePriceVal = parseFloat(product.salePrice);
        const hasSale = !isNaN(salePriceVal) && salePriceVal > 0 && salePriceVal < price;

        // Debug Log (Sadece 1 kez, sadece sorunlu yollar için)
        if (typeof window.debugLogged === 'undefined') {
            const testImg = document.createElement('img');
            testImg.onload = () => console.log('✅ Resim Testi Başarılı:', finalImgPath);
            testImg.onerror = () => console.error('❌ Resim Testi Hatalı (Yol Yanlış olabilir):', finalImgPath);
            testImg.src = finalImgPath;
            window.debugLogged = true;
        }

        let priceHtml = '';
        if (hasSale) {
            priceHtml = `
                <span class="old-price">${price.toLocaleString('tr-TR')} TL</span>
                <span class="price sale-price">${salePriceVal.toLocaleString('tr-TR')} TL</span>
            `;
        } else {
            priceHtml = `<span class="price">${price.toLocaleString('tr-TR')} TL</span>`;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.onclick = function () {
            window.location.href = `../urun-detay.html?id=${id}`;
        };

        card.innerHTML = `
            <div class="product-image">
                ${hasSale ? '<span class="badge sale">İNDİRİM</span>' : ''}
                <img src="${finalImgPath}" alt="${name}" loading="lazy" style="opacity: 1 !important; visibility: visible !important;" onerror="this.onerror=null; this.src='https://placehold.co/400x400/f5f5f5/999?text=Görsel+Yok'">
                <div class="card-actions">
                    <button class="action-btn favorite-btn" aria-label="Favori" onclick="event.stopPropagation(); window.toggleFavorite && window.toggleFavorite('${id}')">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <button class="action-btn cart-btn" aria-label="Sepet" onclick="event.stopPropagation(); window.addToCart && window.addToCart('${id}')">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="brand">${brand}</span>
                <h3 class="title">${name}</h3>
                <div class="price-wrapper">
                    ${priceHtml}
                </div>
            </div>
        `;

        return card;
    }

    // Ürünleri sırala
    function sortProducts(products, sortType) {
        const sorted = [...products];

        switch (sortType) {
            case 'En Düşük Fiyat':
            case 'price-asc':
                sorted.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0));
                break;
            case 'En Yüksek Fiyat':
            case 'price-desc':
                sorted.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0));
                break;
            case 'En Yeniler':
                sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            default:
                // Önerilen sıralama - önce vitrindekileri göster
                sorted.sort((a, b) => {
                    if (a.brandShowcase && !b.brandShowcase) return -1;
                    if (!a.brandShowcase && b.brandShowcase) return 1;
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return 0;
                });
        }

        return sorted;
    }

    // Ana render fonksiyonu
    async function renderCategoryProducts() {
        const container = document.querySelector('.products-grid');
        if (!container) {
            console.warn('products-grid container bulunamadı');
            return;
        }

        // Loading göster
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: #8b7bd8;"></i>
                <p style="margin-top: 16px; color: #666;">Ürünler yükleniyor...</p>
            </div>
        `;

        const categorySlug = getCategorySlug();
        const subCategory = getSubCategoryFromURL();

        console.log('📂 Kategori:', categorySlug, '| Alt Kategori:', subCategory);

        const allProducts = await loadProducts();

        // Resmi olmayan ürünleri filtrele
        const productsWithImages = allProducts.filter(p => {
            const img = p.mainImage || p.image;
            return img && !img.includes('placehold.co') && img.length > 10;
        });

        // Kategoriye göre filtrele
        let filtered = productsWithImages.filter(p => matchesCategory(p, categorySlug));

        // Alt kategoriye göre filtrele
        if (subCategory) {
            filtered = filtered.filter(p => matchesSubCategory(p, subCategory));
        }

        console.log('✅ Filtrelenen ürün sayısı:', filtered.length);

        // Ürün sayısını güncelle
        const countEl = document.querySelector('.product-count');
        if (countEl) {
            countEl.textContent = `${filtered.length} Ürün`;
        }

        // Sıralama
        const sortSelect = document.querySelector('.sort-select');
        let sortType = sortSelect ? sortSelect.value : 'Önerilen Sıralama';
        filtered = sortProducts(filtered, sortType);

        // Container'ı temizle ve ürünleri ekle
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fa-solid fa-box-open" style="font-size: 48px; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">Bu kategoride henüz ürün bulunmuyor</h3>
                    <p style="color: #999;">Yakında yeni ürünler eklenecektir.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(product => {
            const card = createProductCard(product);
            container.appendChild(card);
        });

        // Sıralama değişikliğini dinle
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const newSort = sortSelect.value;
                const resort = sortProducts(filtered, newSort);
                container.innerHTML = '';
                resort.forEach(product => {
                    const card = createProductCard(product);
                    container.appendChild(card);
                });
            });
        }
    }

    // Mega menü ve accordion alt kategori linklerini güncelle
    function updateSubcategoryLinks() {
        // Sub-menu linkleri (mega menu)
        const subMenuLinks = document.querySelectorAll('.sub-menu-column ul li a, .accordion-child-item');

        subMenuLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Sadece # linklerini güncelle
            if (href === '#' || href === '') {
                const text = link.textContent.trim();
                // Alt kategori adını URL parametresi olarak ekle
                const categorySlug = getCategorySlug();
                const encoded = encodeURIComponent(text);
                link.setAttribute('href', `${categorySlug}.html?subcategory=${encoded}`);

                // Tıklama olayını ekle (sayfa içi filtreleme için)
                link.addEventListener('click', function (e) {
                    // Aynı sayfadaysak reload etmeden filtrele
                    if (window.location.pathname.includes(categorySlug)) {
                        e.preventDefault();
                        const url = new URL(window.location);
                        url.searchParams.set('subcategory', text);
                        window.history.pushState({}, '', url);
                        renderCategoryProducts();
                        hideAccordionIfSubcategory(); // Accordion'u gizle
                    }
                });
            }
        });

        console.log('📂 Alt kategori linkleri güncellendi');
    }

    // Alt kategori seçiliyse accordion'u gizle
    function hideAccordionIfSubcategory() {
        const subCategory = getSubCategoryFromURL();

        if (subCategory) {
            // Alt kategori seçiliyse accordion'u gizle
            const accordion = document.querySelector('.category-accordion');
            if (accordion) {
                accordion.style.display = 'none';
            }

            // Breadcrumb'a alt kategori ekle
            const breadcrumb = document.querySelector('.breadcrumb .container');
            if (breadcrumb && !breadcrumb.querySelector('.subcategory-crumb')) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-chevron-right';
                const span = document.createElement('span');
                span.className = 'subcategory-crumb';
                span.textContent = decodeURIComponent(subCategory);
                breadcrumb.appendChild(icon);
                breadcrumb.appendChild(span);
            }

            console.log('📂 Alt kategori görünümü: Accordion gizlendi');
        }
    }

    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderCategoryProducts();
            updateSubcategoryLinks();
            hideAccordionIfSubcategory();
        });
    } else {
        renderCategoryProducts();
        updateSubcategoryLinks();
        hideAccordionIfSubcategory();
    }

})();
