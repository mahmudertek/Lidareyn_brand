
/**
 * Brand Showcase Loader v3.1 - Ultra Robust Sync with Tags Support
 * Bu script ana sayfadaki marka bölümlerini (Beta, Bosch vb.) doldurur.
 * Admin panelinden yapılan seçimleri (LocalStorage) ve API verilerini birleştirir.
 * Backend schema kısıtlamalarına karşı Tag (Etiket) desteği eklenmiştir.
 */

document.addEventListener('DOMContentLoaded', async function () {
    const TIMESTAMP = new Date().getTime();
    const API_URL = (window.ENV && window.ENV.API_URL)
        ? `${window.ENV.API_URL}/products?t=${TIMESTAMP}`
        : `https://galatacarsi-backend-api.onrender.com/api/products?limit=1000&t=${TIMESTAMP}`;

    const brandMap = {
        'theme-beta': 'Beta',
        'theme-bosch': 'Bosch',
        'theme-makita': 'Makita',
        'theme-knipex': 'Knipex',
        'theme-dewalt': 'DeWalt',
        'theme-blackdecker': 'Black+Decker'
    };

    try {
        console.log('🔄 Brand Showcase Loader: Ultra-Sync started...');

        let apiProducts = [];
        let localProducts = [];

        // 1. Local Storage'dan tüm olası ürünleri topla
        try {
            const keys = ['galatacarsi_products', 'products', 'admin_products'];
            keys.forEach(key => {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        localProducts = [...localProducts, ...parsed];
                    }
                }
            });
        } catch (e) {
            console.warn('LocalStorage okuma hatası');
        }

        // 2. API'den verileri çek
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const jsonResponse = await response.json();
                apiProducts = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.data || []);
            }
        } catch (apiErr) {
            console.warn('API\'den veri çekilemedi, yerel verilerle devam ediliyor.');
        }

        // 3. Verileri Birleştir (ID bazlı tekilleştirme, Yerel veri öncelikli)
        const idMap = new Map();

        // Önce API verilerini ekle
        apiProducts.forEach(p => {
            const id = String(p._id || p.id || '');
            if (id) idMap.set(id, p);
        });

        // Sonra Yerel verileri ekle (Üstüne yazar veya yeni ekler)
        localProducts.forEach(p => {
            const id = String(p._id || p.id || '');
            if (id) {
                const existing = idMap.get(id) || {};
                idMap.set(id, { ...existing, ...p });
            }
        });

        const allProducts = Array.from(idMap.values());
        console.log(`✅ Toplam Birleştirilmiş Ürün: ${allProducts.length}`);

        // 4. Hero Seksiyonlarını Güncelle
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
            const showcaseKey = normalizedTarget; // Örn: 'beta', 'makita', 'blackdecker'

            // 5. Ürünleri Filtrele ve Puanla (AKILLI ÖNCELİKLENDİRME)
            let brandProducts = allProducts.map(p => {
                let score = 0;
                const pBrandRaw = String(p.brand || p.marka || '').toLowerCase().trim();
                const pBrandNorm = pBrandRaw.replace(/[^a-z0-9]/g, '');
                const pName = String(p.name || '').toLowerCase();
                const pShowcase = String(p.brandShowcase || '').toLowerCase().trim();

                // 1. TAM EŞLEŞME (Admin Panelinden Vitrin Seçilmişse)
                if (pShowcase === showcaseKey) {
                    score += 1000;
                }

                // 2. ETİKET EŞLEŞME (showcase-beta vb.)
                if (p.tags && Array.isArray(p.tags)) {
                    if (p.tags.some(t => t && t.toLowerCase() === `showcase-${showcaseKey}`)) {
                        score += 500;
                    }
                }

                // 3. GENEL MARKA EŞLEŞME
                if (pBrandNorm === normalizedTarget || pBrandRaw.includes(normalizedTarget)) {
                    score += 10;
                }

                // 4. ÇAPRAZ KONTROL (GÜVENLİK): Yanlış marka ürününü ele
                // Eğer ürün isminde BAŞKA bir dev markanın adı geçiyorsa ve marka seçimi hatalıysa ele
                const knownBrands = ['wilke', 'bosch', 'makita', 'dewalt', 'knipex', 'blackdecker', 'einhell', 'stanley', 'izeltas', 'fisco', 'proxxon', 'gedore', 'milwaukee', 'metabo', 'beta'];
                const otherBrands = knownBrands.filter(b => b !== normalizedTarget);
                const isContaminated = otherBrands.some(badBrand => {
                    // Sadece tam kelime veya belirgin parça kontrolü
                    if (badBrand === 'beta' && pName.includes('betatools')) return false; // Beta Tools özel durumu - kirli değil
                    return pName.includes(badBrand);
                });

                // Eğer kirliyse ve puanı düşükse (özellikle seçilmemişse) ele
                if (isContaminated && score < 500) {
                    score = 0;
                }

                return { ...p, _showcaseScore: score };
            })
                .filter(p => p._showcaseScore > 0) // Sadece eşleşenleri al
                .sort((a, b) => {
                    // Önce puana göre (1000 > 500 > 10)
                    if (b._showcaseScore !== a._showcaseScore) {
                        return b._showcaseScore - a._showcaseScore;
                    }
                    // Puanlar eşitse en yeni ürünü al
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                });

            // İlk 3 ürünü al (En yüksek puanlı ve en yeni olanlar)
            // Eğer puanı 500+ olan (seçilmiş) ürün yoksa, markaya ait rastgele/yeni 3 ürünü gösterir (skor 10 olanlar)
            brandProducts = brandProducts.slice(0, 3);

            const productsContainer = section.querySelector('.madeniyat-products-section');
            if (!productsContainer) return;

            productsContainer.innerHTML = '';

            // 6. Render Et (Tam 3 slot)
            for (let i = 0; i < 3; i++) {
                const product = brandProducts[i];
                const card = document.createElement('article');
                card.className = 'madeniyat-product-card';

                if (product) {
                    card.style.cursor = 'pointer';
                    const imgSource = product.mainImage || product.image || (product.images && product.images[0]) || 'https://placehold.co/400x400/eee/999?text=Resim+Yok';
                    const productUrl = `urun-detay.html?id=${product._id || product.id}`;

                    const price = parseFloat(product.salePrice || product.price) || 0;
                    const oldPrice = (product.salePrice && product.price > product.salePrice) ? product.price : null;

                    const priceHtml = oldPrice
                        ? `<span style="color:#e74c3c; font-weight:700;">₺${price.toLocaleString('tr-TR')}</span>
                           <span style="text-decoration:line-through; color:#999; font-size:0.8em; margin-left:8px;">₺${oldPrice.toLocaleString('tr-TR')}</span>`
                        : `<span>₺${price.toLocaleString('tr-TR')}</span>`;

                    card.innerHTML = `
                        <button class="madeniyat-favorite-btn" onclick="event.stopPropagation(); window.toggleFavorite && window.toggleFavorite('${product._id || product.id}')">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <img src="${imgSource}" alt="${product.name}" class="madeniyat-product-image" style="object-fit: contain;">
                        <div class="madeniyat-product-info">
                            <h3 class="madeniyat-product-name" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3em;">${product.name}</h3>
                            <p class="madeniyat-product-price">${priceHtml}</p>
                        </div>
                    `;

                    card.onclick = () => window.location.href = productUrl;
                } else {
                    // Ürün Seçilmedi Placeholder'ı
                    card.innerHTML = `
                        <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                        <div class="madeniyat-placeholder-box">
                            <i class="fa-solid fa-toolbox"></i>
                        </div>
                        <div class="madeniyat-product-info">
                            <h3 class="madeniyat-product-name" style="color:#ccc;">Ürün Seçilmedi</h3>
                            <p class="madeniyat-product-price" style="color:#eee;">--- TL</p>
                        </div>
                    `;
                }
                productsContainer.appendChild(card);
            }
        });

    } catch (error) {
        console.error('Brand Showcase Critical Error:', error);
    }
});
