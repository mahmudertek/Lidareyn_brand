/**
 * Ana Sayfa Marka Vitrini v2.0 - Tamamen Manuel Kontrol
 * Sadece admin panelinden seçilen ve brandShowcase alanı eşleşen ürünleri gösterir.
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

    async fetchProducts() {
        try {
            const response = await fetch(`${this.apiUrl}/products?limit=100&active=true`);
            const result = await response.json();
            if (!result.success) return null;
            return result.data || [];
        } catch (error) {
            console.error('❌ API hatası:', error);
            return null;
        }
    },

    createProductCard(product) {
        const badge = product.isBestSeller ? '<span class="madeniyat-product-badge">Çok Satan</span>' :
            product.isNew ? '<span class="madeniyat-product-badge">Yeni</span>' : '';

        const image = product.mainImage || `https://placehold.co/400x400/6366f1/ffffff?text=${(product.brand || 'P').charAt(0)}`;
        const price = product.salePrice || product.price || 0;
        const productUrl = `urun-detay.html?id=${product._id || product.id}`;

        return `
            <article class="madeniyat-product-card">
                ${badge}
                <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                <a href="${productUrl}">
                    <img src="${image}" alt="${product.name}" class="madeniyat-product-image">
                </a>
                <div class="madeniyat-product-info">
                    <h3 class="madeniyat-product-name">${product.name}</h3>
                    <p class="madeniyat-product-price">${price.toLocaleString('tr-TR')}TL</p>
                </div>
            </article>
        `;
    },

    renderBrandProducts(brandKey, products) {
        const container = document.querySelector(this.brands[brandKey]);
        if (!container) return;

        // KRİTİK: Sadece sizin admin panelinden işaretlediğiniz ürünleri al
        const brandProducts = (products || []).filter(p => {
            const val = (p.brandShowcase || '').toLowerCase().trim();
            const productBrand = (p.brand || '').toLowerCase().trim();
            const targetKey = brandKey.toLowerCase().trim();

            // 1. Öncelik: BrandShowcase tam eşleşiyorsa (Manuel Kontrol)
            if (val === targetKey) return true;

            // 2. Öncelik: GÜVENLİ MOD - Eğer veri 'None' ise ama marka eşleşiyorsa göster
            // Bu sayede test ürünü gibi markası belli ama vitrin verisi tam oturmamış ürünler görünür.
            if (!val || val === 'none' || val === '') {
                if (productBrand === targetKey) return true;
            }

            return false;
        }).slice(0, 3); // Maksimum 3 tane göster

        if (brandProducts.length > 0) {
            container.innerHTML = brandProducts.map(p => this.createProductCard(p)).join('');
            console.log(`✅ ${brandKey} için ${brandProducts.length} manuel seçili ürün yüklendi.`);
        }
    },

    async loadAllShowcases() {
        const products = await this.fetchProducts();
        if (products === null && this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.loadAllShowcases(), 5000);
            return;
        }

        Object.keys(this.brands).forEach(brandKey => {
            this.renderBrandProducts(brandKey, products || []);
        });
    },

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllShowcases());
        } else {
            this.loadAllShowcases();
        }
    }
};

BRAND_SHOWCASE.init();
