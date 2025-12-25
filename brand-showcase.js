/**
 * Ana Sayfa Marka Vitrini Dinamik Yükleme
 * Admin panelinden eklenen ürünleri marka bölümlerine yükler
 */

const BRAND_SHOWCASE = {
    // API URL
    apiUrl: 'https://galatacarsi-backend-api.onrender.com/api',

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
            const response = await fetch(`${this.apiUrl}/products?limit=100`);
            const result = await response.json();

            if (result.success && result.data) {
                return result.data;
            }
            return [];
        } catch (error) {
            console.error('Marka vitrini ürünleri yüklenemedi:', error);
            return [];
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

        if (!container) {
            console.log(`Marka container bulunamadı: ${brandKey}`);
            return;
        }

        // Bu marka için ürünleri filtrele (max 3)
        const brandProducts = products
            .filter(p => p.brandShowcase === brandKey)
            .slice(0, 3);

        if (brandProducts.length === 0) {
            // Ürün yoksa placeholder göster
            console.log(`${brandKey} için vitrin ürünü bulunamadı.`);
            return;
        }

        // Ürünleri render et (placeholder otomatik kaybolur)
        container.innerHTML = brandProducts.map(p => this.createProductCard(p)).join('');
        console.log(`✅ ${brandKey} vitrini güncellendi: ${brandProducts.length} ürün`);
    },

    // Tüm marka vitrinlerini yükle
    async loadAllShowcases() {
        console.log('🏪 Marka vitrinleri yükleniyor...');

        const products = await this.fetchProducts();

        if (products.length === 0) {
            console.log('API\'den ürün gelmedi, statik içerik korunuyor.');
            return;
        }

        // Her marka için ürünleri render et
        Object.keys(this.brands).forEach(brandKey => {
            this.renderBrandProducts(brandKey, products);
        });

        console.log('✅ Marka vitrinleri yüklendi!');
    },

    // Başlat
    init() {
        // DOM hazır olduğunda çalıştır
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllShowcases());
        } else {
            this.loadAllShowcases();
        }
    }
};

// Scripti başlat
BRAND_SHOWCASE.init();
