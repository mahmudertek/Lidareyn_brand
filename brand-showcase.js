/**
 * Ana Sayfa Marka Vitrini Dinamik Yükleme
 * Admin panelinden eklenen ürünleri marka bölümlerine yükler
 */

const BRAND_SHOWCASE = {
    // API URL
    apiUrl: 'https://galatacarsi-backend-api.onrender.com/api',
    retryCount: 0,
    maxRetries: 5,

    // Marka ID'leri ve container seçicileri
    brands: {
        'beta': '.theme-beta .madeniyat-products-section',
        'bosch': '.theme-bosch .madeniyat-products-section',
        'makita': '.theme-makita .madeniyat-products-section',
        'knipex': '.theme-knipex .madeniyat-products-section',
        'dewalt': '.theme-dewalt .madeniyat-products-section',
        'blackdecker': '.theme-blackdecker .madeniyat-products-section'
    },

    // Ürünleri API'den çek
    async fetchProducts() {
        try {
            console.log(`📡 Ürünler çekiliyor (Deneme ${this.retryCount + 1})...`);
            const response = await fetch(`${this.apiUrl}/products?limit=100`);
            const result = await response.json();

            // Eğer bakım modundaysa veya hata varsa
            if (!result.success || result.isMaintenance) {
                console.warn('⚠️ Sunucu bakım modunda veya hata verdi.');
                return null;
            }

            return result.data || [];
        } catch (error) {
            console.error('❌ Marka vitrini API hatası:', error);
            return null;
        }
    },

    // Ürün kartı HTML oluştur
    createProductCard(product) {
        const badge = product.isBestSeller ? '<span class="madeniyat-product-badge">Çok Satan</span>' :
            product.isNew ? '<span class="madeniyat-product-badge">Yeni</span>' : '';

        const image = product.mainImage || `https://placehold.co/400x400/6366f1/ffffff?text=${(product.brand || 'P').charAt(0)}`;
        const price = product.salePrice || product.price || 0;
        const productUrl = `urun-detay.html?id=${product._id || product.id}`;

        return `
            <article class="madeniyat-product-card" data-product-id="${product._id || product.id}">
                ${badge}
                <button class="madeniyat-favorite-btn" aria-label="Favorilere Ekle">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <a href="${productUrl}">
                    <img src="${image}" 
                         alt="${product.name}" 
                         class="madeniyat-product-image"
                         onerror="this.src='https://placehold.co/400x400/6366f1/ffffff?text=${(product.brand || 'P').charAt(0)}'">
                </a>
                <div class="madeniyat-product-info">
                    <h3 class="madeniyat-product-name">${product.name}</h3>
                    <p class="madeniyat-product-price">${price.toLocaleString('tr-TR')}TL</p>
                </div>
            </article>
        `;
    },

    // Marka bölümüne ürünleri yerleştir
    renderBrandProducts(brandKey, products) {
        const selector = this.brands[brandKey];
        const container = document.querySelector(selector);

        if (!container) return;

        // Bu marka için ürünleri filtrele (Daha esnek filtreleme)
        const brandProducts = (products || []).filter(p => {
            const showcaseValue = (p.brandShowcase || '').toLowerCase().trim();
            const productBrand = (p.brand || '').toLowerCase().trim();

            // 1. Öncelik: BrandShowcase alanı eşleşiyorsa
            if (showcaseValue === brandKey.toLowerCase()) return true;

            // 2. Öncelik: BrandShowcase alanı boşsa ama ürünün markası bu marka ile aynıysa (Yedek Plan)
            if (showcaseValue === '' && productBrand === brandKey.toLowerCase()) return true;

            return false;
        }).slice(0, 3);

        if (brandProducts.length > 0) {
            container.innerHTML = brandProducts.map(p => this.createProductCard(p)).join('');
            console.log(`✅ ${brandKey} vitrini güncellendi: ${brandProducts.length} ürün`);
        }
    },

    // Tüm marka vitrinlerini yükle
    async loadAllShowcases() {
        const products = await this.fetchProducts();

        // Ürün listesi null ise (bakım modu/hata)
        const productList = products || [];

        // Her marka için ürünleri render et (Boş olsa bile render edecek, placeholder gösterecek)
        Object.keys(this.brands).forEach(brandKey => {
            this.renderBrandProducts(brandKey, productList);
        });

        if (products === null && this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.loadAllShowcases(), 30000);
        }
    },

    // Başlat
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllShowcases());
        } else {
            this.loadAllShowcases();
        }
    }
};

BRAND_SHOWCASE.init();
