
/**
 * Ana Sayfa Marka Vitrini v2.6 - Ultra Robust Sync with Tags
 * Hem API hem LocalStorage desteği ile admin panelindeki seçimleri anında yansıtır.
 */

const BRAND_SHOWCASE = {
    apiUrl: 'https://galatacarsi-backend-api.onrender.com/api',
    retryCount: 0,
    maxRetries: 3,

    brands: {
        'beta': '.theme-beta .madeniyat-products-section',
        'bosch': '.theme-bosch .madeniyat-products-section',
        'makita': '.theme-makita .madeniyat-products-section',
        'knipex': '.theme-knipex .madeniyat-products-section',
        'dewalt': '.theme-dewalt .madeniyat-products-section',
        'blackdecker': '.theme-blackdecker .madeniyat-products-section'
    },

    async fetchUnifiedProducts() {
        const TIMESTAMP = new Date().getTime();
        let apiProducts = [];
        let localProducts = [];

        // 1. Local Data
        try {
            localProducts = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
        } catch (e) { console.error('Local data error'); }

        // 2. API Data
        try {
            const response = await fetch(`${this.apiUrl}/products?limit=1000&t=${TIMESTAMP}`);
            const result = await response.json();
            if (result.success) {
                apiProducts = result.data || [];
            }
        } catch (error) {
            console.warn('API fetch error, using local only');
        }

        // 3. Merge (Local overrides API)
        const idMap = new Map();
        apiProducts.forEach(p => idMap.set(p._id || p.id, p));
        localProducts.forEach(p => idMap.set(p._id || p.id, p));

        return Array.from(idMap.values());
    },

    createProductCard(product) {
        if (!product) return '';
        const badge = product.isBestSeller ? '<span class="madeniyat-product-badge">Çok Satan</span>' :
            product.isNew ? '<span class="madeniyat-product-badge">Yeni</span>' : '';

        const image = product.mainImage || product.image || (product.images && product.images[0]) || 'https://placehold.co/400x400/eee/999?text=Resim+Yok';
        const price = parseFloat(product.salePrice || product.price) || 0;
        const oldPrice = (product.salePrice && product.price > product.salePrice) ? product.price : null;
        const productUrl = `urun-detay.html?id=${product._id || product.id}`;

        const priceHtml = oldPrice
            ? `<span style="color:#e74c3c; font-weight:700;">₺${price.toLocaleString('tr-TR')}</span>
               <span style="text-decoration:line-through; color:#999; font-size:0.8em; margin-left:8px;">₺${oldPrice.toLocaleString('tr-TR')}</span>`
            : `<span>₺${price.toLocaleString('tr-TR')}</span>`;

        return `
            <article class="madeniyat-product-card" onclick="window.location.href='${productUrl}'">
                ${badge}
                <button class="madeniyat-favorite-btn" onclick="event.stopPropagation(); window.toggleFavorite && window.toggleFavorite('${product._id || product.id}')">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <img src="${image}" alt="${product.name}" class="madeniyat-product-image" style="object-fit: contain;">
                <div class="madeniyat-product-info">
                    <h3 class="madeniyat-product-name" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3em;">${product.name}</h3>
                    <p class="madeniyat-product-price">${priceHtml}</p>
                </div>
            </article>
        `;
    },

    renderBrandProducts(brandKey, allProducts) {
        const container = document.querySelector(this.brands[brandKey]);
        if (!container) return;

        const normalizedTarget = brandKey.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Robust match (seçilen markayı içerenleri al)
        const brandProducts = allProducts.filter(p => {
            const val1 = (p.brandShowcase || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const val2 = (p.showcase || '').toLowerCase().replace(/[^a-z0-9]/g, '');

            // TAG CONTROL: Etiketlerde "showcase-beta" var mı?
            const tags = Array.isArray(p.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];
            const tagMatch = tags.some(t => t === `showcase-${normalizedTarget}` || t === normalizedTarget);

            return val1 === normalizedTarget || val2 === normalizedTarget || tagMatch;
        }).slice(0, 3);

        let html = '';
        for (let i = 0; i < 3; i++) {
            const p = brandProducts[i];
            if (p) {
                html += this.createProductCard(p);
            } else {
                html += `
                    <article class="madeniyat-product-card">
                        <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                        <div class="madeniyat-placeholder-box">
                            <i class="fa-solid fa-toolbox"></i>
                        </div>
                        <div class="madeniyat-product-info">
                            <h3 class="madeniyat-product-name" style="color:#ccc;">Ürün Seçilmedi</h3>
                            <p class="madeniyat-product-price" style="color:#eee;">--- TL</p>
                        </div>
                    </article>
                `;
            }
        }
        container.innerHTML = html;
    },

    async init() {
        console.log('🚀 Brand Showcase Starting Unified Init...');
        const products = await this.fetchUnifiedProducts();

        Object.keys(this.brands).forEach(brandKey => {
            this.renderBrandProducts(brandKey, products);
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BRAND_SHOWCASE.init());
} else {
    BRAND_SHOWCASE.init();
}
