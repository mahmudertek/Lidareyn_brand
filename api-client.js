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
            // 1. Yeni Ürünler (isNew)
            if (params.isNew === 'true' || params.isNew === true || params.isNew === 1) {
                products = products.filter(p => {
                    const isNewProp = p.isNew === true || p.isNew === 'true' || p.isNew === 1 || p.isNew === '1';
                    const hasNewTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                        t && typeof t === 'string' && (t.toLowerCase() === 'new' || t.toLowerCase() === 'yeni')
                    );
                    return isNewProp || hasNewTag;
                });
            }

            // 2. Popüler Ürünler (isPopular)
            if (params.isPopular === 'true' || params.isPopular === true || params.isPopular === 1) {
                products = products.filter(p => {
                    if (p.isPopular === false || p.isPopular === 'false') return false;
                    const isPopProp = p.isPopular === true || p.isPopular === 'true' || p.isPopular === 1 || p.isPopular === '1';
                    const hasPopTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                        t && typeof t === 'string' && (t.toLowerCase() === 'popular' || t.toLowerCase() === 'popüler' || t.toLowerCase() === 'populer')
                    );
                    return isPopProp || hasPopTag;
                });
            }

            // 3. Öne Çıkanlar (isFeatured)
            if (params.isFeatured === 'true' || params.isFeatured === true || params.isFeatured === 1) {
                products = products.filter(p => {
                    const isFeatProp = p.isFeatured === true || p.isFeatured === 'true' || p.isFeatured === 1 || p.isFeatured === '1';
                    const hasFeatTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
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
                    return isFeatProp || hasFeatTag;
                });
            }

            // 4. Çok Satanlar (isBestSeller)
            if (params.isBestSeller === 'true' || params.isBestSeller === true || params.isBestSeller === 1) {
                products = products.filter(p => {
                    const isBestProp = p.isBestSeller === true || p.isBestSeller === 'true' || p.isBestSeller === 1 || p.isBestSeller === '1';
                    const hasBestTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                        t && typeof t === 'string' && (t.toLowerCase() === 'bestseller' || t.toLowerCase() === 'çok satan' || t.toLowerCase() === 'cok satan' || t.toLowerCase() === 'coksatan')
                    );
                    return isBestProp || hasBestTag;
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
            if (response.ok) {
                return await response.json();
            }
            // Sunucuda bulunamazsa veya hata verirse LocalStorage'dan dene
            const keys = ['galatacarsi_products', 'galata_products', 'products', 'admin_products'];
            for (const key of keys) {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const products = JSON.parse(stored);
                    const product = products.find(p => p._id === id || p.id === id);
                    if (product) {
                        return { success: true, data: product, fromLocal: true };
                    }
                }
            }
            return { success: false, data: null };
        } catch (error) {
            console.error('Get product by ID error:', error);
            // Catch durumunda da LocalStorage'a bak
            const keys = ['galatacarsi_products', 'galata_products', 'products'];
            for (const key of keys) {
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const products = JSON.parse(stored);
                        const product = products.find(p => p._id === id || p.id === id);
                        if (product) return { success: true, data: product, fromLocal: true };
                    } catch (e) { }
                }
            }
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
