
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

            // 5. Ürünleri Filtrele (Sadece Manuel Seçilenler)
            // Tags desteği eklendi: "showcase-beta" vb.
            let brandProducts = allProducts.filter(p => {
                // Her türlü etiket alanına bakıyoruz (case/trim insensitive)
                const val1 = String(p.brandShowcase || '').toLowerCase().trim();
                const val2 = String(p.showcase || '').toLowerCase().trim();
                const val3 = String(p.vitrin || '').toLowerCase().trim();

                // TAG CONTROL: Etiketlerde "showcase-beta" var mı?
                const tags = Array.isArray(p.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];
                const tagMatch = tags.some(t => t === `showcase-${normalizedTarget}` || t === normalizedTarget);

                return val1 === normalizedTarget ||
                    val2 === normalizedTarget ||
                    val3 === normalizedTarget ||
                    tagMatch;
            });

            // İlk 3 ürünü al
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
