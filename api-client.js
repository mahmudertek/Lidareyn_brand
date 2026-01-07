// Web Site API Client
// Bu dosya web sitesinin backend API ile iletişimini sağlar

const API = {
    baseUrl: window.ENV ? window.ENV.API_URL : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api'),

    // --- PRODUCTS ---
    async getProducts(params = {}) {
        let apiData = [];

        // 1. API'den Çek
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/products?${queryString}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    apiData = result.data;
                }
            }
        } catch (error) {
            console.warn('Backend API error, defaulting to local merge:', error.message);
        }

        // 2. LocalStorage'dan Çek (Filtrelenmiş olarak gelir)
        const localRes = this.getProductsFromLocalStorage(params);
        const localData = localRes.data || [];

        // 3. BİRLEŞTİR (Local Veri Öncelikli - ID çakışmasında local kazanır)
        const mergedMap = new Map();

        // Önce API verisini ekle
        apiData.forEach(p => mergedMap.set(p._id || p.id, p));

        // Sonra Local veriyi ekle (Varsa API'nin üstüne yazar - Güncelleme için kritik)
        localData.forEach(p => mergedMap.set(p._id || p.id, p));

        let finalProducts = Array.from(mergedMap.values());

        // 4. Yeniden Sırala (Merge sırayı bozabilir)
        if (params.sort === '-createdAt') {
            finalProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        // 5. Limit Uygula
        if (params.limit) {
            finalProducts = finalProducts.slice(0, parseInt(params.limit));
        }

        return { success: true, data: finalProducts };
    },

    // LocalStorage'dan ürün çekme (fallback)
    getProductsFromLocalStorage(params = {}) {
        try {
            // Admin panel 'galatacarsi_products' kullanıyor, eski sürüm 'galata_products' veya 'products'
            const stored = localStorage.getItem('galatacarsi_products') || localStorage.getItem('galata_products') || localStorage.getItem('products');
            if (!stored) {
                return { success: false, data: [] };
            }

            let products = JSON.parse(stored);

            // Filtrele
            if (params.isNew === 'true' || params.isNew === true) {
                products = products.filter(p => p.isNew === true || p.tags?.includes('new') || p.tags?.includes('Yeni'));
            }
            if (params.isPopular === 'true' || params.isPopular === true) {
                products = products.filter(p => {
                    // 1. KESİN ENGEL: Admin panelinden özellikle kapatıldıysa
                    if (p.isPopular === false || p.isPopular === 'false') return false;

                    // 2. KABUL ET: Boolean true ise
                    if (p.isPopular === true || p.isPopular === 'true') return true;

                    // 3. TAG KONTROLÜ (Array veya String)
                    if (p.tags) {
                        if (Array.isArray(p.tags)) {
                            return p.tags.some(t => t && (t.toLowerCase() === 'popular' || t.toLowerCase() === 'popüler'));
                        }
                        if (typeof p.tags === 'string') {
                            const lowerTags = p.tags.toLowerCase();
                            return lowerTags.includes('popular') || lowerTags.includes('popüler');
                        }
                    }
                    return false;
                });
            }
            if (params.isFeatured === 'true' || params.isFeatured === true || params.isFeatured === 1) {
                products = products.filter(p => {
                    const isFeaturedProp = p.isFeatured === true || p.isFeatured === 'true' || p.isFeatured === 1 || p.isFeatured === '1';
                    const hasFeaturedTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                        t && typeof t === 'string' && (
                            t.toLowerCase() === 'featured' ||
                            t.toLowerCase() === 'öne çıkan' ||
                            t.toLowerCase() === 'onecikan' ||
                            t.toLowerCase() === 'one cikan' ||
                            t.toLowerCase() === 'one-cikan' ||
                            t.toLowerCase() === 'fırsat' ||
                            t.toLowerCase() === 'firsat'
                        )
                    );
                    return isFeaturedProp || hasFeaturedTag;
                });
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
            const result = await response.json();
            if (result.success && result.data) {
                return result;
            }
        } catch (error) {
            console.error('Get brands error:', error);
        }

        // Fallback to localStorage
        try {
            const local = localStorage.getItem('galata_brands');
            if (local) {
                const brands = JSON.parse(local);
                return { success: true, data: brands, fromLocal: true };
            }
        } catch (e) {
            console.error('Brands localStorage error:', e);
        }

        return { success: false, data: [] };
    }
};

// Global erişim için
window.API = API;
