// Web Site API Client
// Bu dosya web sitesinin backend API ile iletişimini sağlar

const API = {
    baseUrl: window.ENV ? window.ENV.API_URL : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api'),

    // --- PRODUCTS ---
    async getProducts(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/products?${queryString}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Backend response not ok');
            }

            const result = await response.json();

            // Başarılı ise döndür
            if (result.success && result.data && result.data.length > 0) {
                return result;
            }

            // Veri yoksa localStorage'a bak
            return this.getProductsFromLocalStorage(params);

        } catch (error) {
            console.warn('Backend API error, falling back to localStorage:', error.message);
            return this.getProductsFromLocalStorage(params);
        }
    },

    // LocalStorage'dan ürün çekme (fallback)
    getProductsFromLocalStorage(params = {}) {
        try {
            const stored = localStorage.getItem('galata_products') || localStorage.getItem('products');
            if (!stored) {
                return { success: false, data: [] };
            }

            let products = JSON.parse(stored);

            // Filtrele
            if (params.isNew === 'true') {
                products = products.filter(p => p.isNew === true || p.tags?.includes('Yeni'));
            }
            if (params.isPopular === 'true' || params.isPopular === true) {
                products = products.filter(p => p.isPopular === true || p.tags?.includes('Popüler'));
            }
            if (params.isFeatured === 'true' || params.isFeatured === true) {
                products = products.filter(p => p.isFeatured === true || p.tags?.includes('Öne Çıkan'));
            }

            // Sırala
            if (params.sort === '-createdAt') {
                products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            }

            // Limit
            if (params.limit) {
                products = products.slice(0, parseInt(params.limit));
            }

            return { success: true, data: products };
        } catch (e) {
            console.error('LocalStorage parse error:', e);
            return { success: false, data: [] };
        }
    },

    async getProductBySlug(slug) {
        try {
            const response = await fetch(`${this.baseUrl}/products/slug/${slug}`);
            return await response.json();
        } catch (error) {
            console.error('Get product error:', error);
            return { success: false, data: null };
        }
    },

    async getProductById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`);
            if (!response.ok) {
                // LocalStorage'dan dene
                const stored = localStorage.getItem('galata_products') || localStorage.getItem('products');
                if (stored) {
                    const products = JSON.parse(stored);
                    const product = products.find(p => p._id === id || p.id === id);
                    if (product) {
                        return { success: true, data: product };
                    }
                }
                return { success: false, data: null };
            }
            return await response.json();
        } catch (error) {
            console.error('Get product by ID error:', error);
            return { success: false, data: null };
        }
    },

    // --- CATEGORIES ---
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories?active=true`);
            return await response.json();
        } catch (error) {
            console.error('Get categories error:', error);
            return { success: false, data: [] };
        }
    },

    // --- BRANDS ---
    async getBrands() {
        try {
            const response = await fetch(`${this.baseUrl}/brands?active=true`);
            return await response.json();
        } catch (error) {
            console.error('Get brands error:', error);
            return { success: false, data: [] };
        }
    }
};

// Global erişim için
window.API = API;
