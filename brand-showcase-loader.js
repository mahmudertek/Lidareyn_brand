
/**
 * Brand Showcase Loader v4.1 - Ultra Robust "Katı" Version
 * Bu script ana sayfadaki marka bölümlerini (Beta, Bosch vb.) doldurur.
 */

const startShowcaseLoader = async () => {
    // Zaten çalıştıysa tekrar çalışma
    if (window._showcaseLoaderStarted) return;
    window._showcaseLoaderStarted = true;

    const TIMESTAMP = new Date().getTime();

    // API URL ve Fallbackler
    const API_URL = (window.ENV && window.ENV.API_URL)
        ? `${window.ENV.API_URL}/products?limit=3000&t=${TIMESTAMP}`
        : `https://galatacarsi-backend-api.onrender.com/api/products?limit=3000&t=${TIMESTAMP}`;

    const brandMap = {
        'theme-beta': 'Beta',
        'theme-bosch': 'Bosch',
        'theme-makita': 'Makita',
        'theme-knipex': 'Knipex',
        'theme-dewalt': 'DeWalt',
        'theme-blackdecker': 'Black+Decker'
    };

    console.log('🚀 Brand Showcase Loader v4.1 Başlatıldı...');

    async function loadAllPossibleProducts() {
        let allPotentialProducts = [];
        const idMap = new Map();

        // 1. API'den çek
        try {
            console.log('📡 API isteği gönderiliyor:', API_URL);
            const response = await fetch(API_URL);
            if (response.ok) {
                const res = await response.json();
                const data = Array.isArray(res) ? res : (res.data || []);
                data.forEach(p => {
                    const id = String(p._id || p.id || '');
                    if (id) idMap.set(id, p);
                });
                console.log(`✅ API'den ${data.length} ürün alındı.`);
            }
        } catch (e) {
            console.warn('⚠️ API bağlantısı başarısız, fallbacklara bakılıyor.');
        }

        // 2. LocalStorage Fallbackleri (Tüm olası anahtarlar)
        const storageKeys = ['galatacarsi_products', 'galata_products_cache', 'products', 'admin_products', 'galata_products'];
        storageKeys.forEach(key => {
            try {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        let count = 0;
                        parsed.forEach(p => {
                            const id = String(p._id || p.id || '');
                            if (id) {
                                if (idMap.has(id)) {
                                    // GÖRSEL KORUMALI MERGE
                                    const existingFromApi = idMap.get(id);
                                    const merged = { ...existingFromApi, ...p };

                                    // LocalStorage'da görsel yoksa API'den gelen görseli koru
                                    const localImage = p.mainImage || p.image;
                                    const apiImage = existingFromApi.mainImage || existingFromApi.image;

                                    const isLocalImageEmpty = !localImage ||
                                        localImage.includes('placehold') ||
                                        localImage === 'null' ||
                                        localImage === '';

                                    if (isLocalImageEmpty && apiImage) {
                                        merged.mainImage = apiImage;
                                        merged.image = apiImage;
                                    }

                                    idMap.set(id, merged);
                                } else {
                                    idMap.set(id, p);
                                }
                                count++;
                            }
                        });
                        if (count > 0) console.log(`📂 LocalStorage (${key}) üzerinden ${count} ürün havuzu güncellendi.`);
                    }
                }
            } catch (e) { }
        });

        // 3. window.galataProductsData Kontrolü (products-data.js'den gelebilir)
        if (window.galataProductsData && Array.isArray(window.galataProductsData)) {
            window.galataProductsData.forEach(p => {
                const id = String(p._id || p.id || '');
                if (id && !idMap.has(id)) idMap.set(id, p);
            });
            console.log(`🧩 global galataProductsData üzerinden havuz kontrol edildi.`);
        }

        return Array.from(idMap.values());
    }

    try {
        const allProducts = await loadAllPossibleProducts();
        console.log(`✅ Toplam Birleştirilmiş Ürün Havuzu: ${allProducts.length}`);

        const heroSections = document.querySelectorAll('.madeniyat-hero');

        heroSections.forEach(section => {
            let targetBrand = null;
            for (const [cls, brandName] of Object.entries(brandMap)) {
                if (section.classList.contains(cls)) {
                    targetBrand = brandName;
                    break;
                }
            }

            if (!targetBrand) return;

            const normalizedTarget = targetBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
            const showcaseKey = normalizedTarget;

            // AKILLI FİLTRELEME VE PUANLAMA
            let brandProducts = allProducts.map(p => {
                let score = 0;

                // Tip Güvenliği Kontrolleri (Object case handling)
                const getVal = (val) => {
                    if (!val) return '';
                    if (typeof val === 'string') return val;
                    if (typeof val === 'object') return val.name || val.title || val.slug || '';
                    return String(val);
                };

                const pBrandRaw = getVal(p.brand || p.marka).toLowerCase().trim();
                const pBrandNorm = pBrandRaw.replace(/[^a-z0-9]/g, '');
                const pName = getVal(p.name).toLowerCase();
                const pShowcase = getVal(p.brandShowcase).toLowerCase().trim();

                // Ürün aktif değilse puanı kır
                const isActive = p.active !== false && p.isActive !== false;

                // 1. KRİTİK: Admin Panelinden Vitrin Seçilmişse (EN YÜKSEK ÖNCELİK)
                if (pShowcase === showcaseKey) {
                    score += 5000;
                }

                // 2. ETİKET EŞLEŞME (showcase-beta vb.)
                if (p.tags && Array.isArray(p.tags)) {
                    if (p.tags.some(t => getVal(t).toLowerCase() === `showcase-${showcaseKey}`)) {
                        score += 3000;
                    }
                }

                // 3. MARKA EŞLEŞME
                if (pBrandNorm === normalizedTarget || pBrandRaw === normalizedTarget) {
                    score += 1000;
                }

                // 4. İSİM İÇİNDE GEÇMESİ
                if (pName.includes(normalizedTarget)) {
                    score += 500;
                }

                // GÜVENLİK FİLTRESİ: Yanlış marka bulaşmasını önle
                if (score < 3000) {
                    const otherBrands = ['bosch', 'makita', 'dewalt', 'knipex', 'blackdecker', 'einhell', 'stanley', 'izeltas', 'fisco', 'proxxon', 'gedore', 'milwaukee', 'metabo', 'beta', 'wilke'];
                    const forbidden = otherBrands.filter(b => b !== normalizedTarget);

                    const isContaminated = forbidden.some(bad => {
                        const regex = new RegExp(`\\b${bad}\\b`, 'i');
                        return regex.test(pName) || pBrandNorm === bad;
                    });

                    if (isContaminated) {
                        score = 0;
                    }
                }

                // Aktiflik kontrolü (En son uygula)
                if (!isActive && score > 0) {
                    score = 1;
                }

                return { ...p, _showcaseScore: score };
            })
                .filter(p => p._showcaseScore > 1)
                .sort((a, b) => b._showcaseScore - a._showcaseScore || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            const productsContainer = section.querySelector('.madeniyat-products-section');
            if (!productsContainer) return;

            if (brandProducts.length === 0) {
                console.warn(`⚠️ [Vitrin] ${targetBrand} için ürün bulunamadı!`);
                productsContainer.innerHTML = `
                    <div style="grid-column: span 3; color: #999; font-style: italic; padding: 20px; text-align: center;">
                        <i class="fa-solid fa-box-open" style="font-size: 2em; margin-bottom: 10px; opacity: 0.5;"></i><br>
                        Bu markaya ait ürünler yakında stoklarımızda olacaktır.
                    </div>
                `;
                return;
            }

            // İlk 3 ürünü göster
            const finalDisplay = brandProducts.slice(0, 3);
            productsContainer.innerHTML = '';

            finalDisplay.forEach(product => {
                const card = document.createElement('article');
                card.className = 'madeniyat-product-card';
                card.style.cursor = 'pointer';

                const imgSource = product.mainImage || product.image || (product.images && product.images[0]) || 'https://placehold.co/400x400/eee/999?text=Resim+Yok';
                const productUrl = `urun-detay.html?id=${product._id || product.id}`;

                const rawPrice = product.priceRaw || product.price;
                const price = parseFloat(product.salePrice || rawPrice) || 0;
                const oldPrice = (product.salePrice && parseFloat(rawPrice) > parseFloat(product.salePrice)) ? parseFloat(rawPrice) : null;

                const priceHtml = oldPrice
                    ? `<span class="current-price" style="color:#e74c3c; font-weight:700;">₺${price.toLocaleString('tr-TR')}</span>
                       <span class="old-price" style="text-decoration:line-through; color:#999; font-size:0.8em; margin-left:8px;">₺${oldPrice.toLocaleString('tr-TR')}</span>`
                    : `<span class="current-price">₺${price.toLocaleString('tr-TR')}</span>`;

                card.innerHTML = `
                    <button class="madeniyat-favorite-btn" aria-label="Favoriye Ekle" onclick="event.stopPropagation(); window.toggleFavorite && window.toggleFavorite('${product._id || product.id}')">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <img src="${imgSource}" alt="${product.name}" class="madeniyat-product-image" loading="lazy" 
                         onerror="this.src='https://placehold.co/400x400/eee/999?text=Resim+Hatası'">
                    <div class="madeniyat-product-info">
                        <h3 class="madeniyat-product-name" title="${product.name}">${product.name}</h3>
                        <p class="madeniyat-product-price">${priceHtml}</p>
                    </div>
                `;

                card.onclick = () => window.location.href = productUrl;
                productsContainer.appendChild(card);
            });

            console.log(`✅ [Vitrin] ${targetBrand} başarıyla yüklendi (${finalDisplay.length} ürün).`);
        });

    } catch (error) {
        console.error('❌ Brand Showcase Critical Error:', error);
    }
};

// Başlatma mantığı
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startShowcaseLoader);
} else {
    startShowcaseLoader();
}

// Global olarak da açalım (belki başka bir yerden tetiklemek gerekebilir)
window.refreshShowcases = startShowcaseLoader;
