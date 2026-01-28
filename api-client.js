// Web Site API Client
// Bu dosya web sitesinin backend API ile iletişimini sağlar
// IndexedDB kullanarak büyük veri setlerini cache'ler

window.API = {
    baseUrl: window.ENV ? window.ENV.API_URL : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api'),

    fixImageUrl: function (url) {
        // Boş, undefined, null veya "null" string kontrolü
        if (!url || url === 'null' || url === 'undefined' || url.trim() === '') {
            return 'https://placehold.co/400x400/f3f4f6/6366f1?text=Urun';
        }

        // String'e çevir (number vs için)
        url = String(url);

        // Normalize slashes
        url = url.replace(/\\/g, '/');

        // Base64 görseller - direkt dön (en öncelikli)
        if (url.startsWith('data:')) {
            return url;
        }

        // Tam URL (http/https) - direkt dön
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Yerel klasörler (gorseller/, assets/) - Absolute path olarak dön (her dizinden çalışması için)
        if (url.startsWith('gorseller/') || url.startsWith('/gorseller/') ||
            url.startsWith('assets/') || url.startsWith('/assets/')) {
            return url.startsWith('/') ? url : '/' + url;
        }

        // API yolları (uploads/, products/ vs.) - backend URL'sine ekle
        const backendBase = 'https://galatacarsi-backend-api.onrender.com';

        // Başında / yoksa ekle
        const path = url.startsWith('/') ? url : '/' + url;

        return backendBase + path;
    },

    // ============ IndexedDB Helper Functions ============
    _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('GalataCarsiDB', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('products_cache')) {
                    db.createObjectStore('products_cache', { keyPath: 'key' });
                }
            };
        });
    },

    async _getFromIndexedDB(key) {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('products_cache', 'readonly');
                const store = tx.objectStore('products_cache');
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result?.value || null);
                request.onerror = () => reject(request.error);
            });
        } catch (e) { return null; }
    },

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

        // 2. Local Cache'den Çek
        const localRes = await this.getProductsFromLocalCache(params);
        const localData = localRes.data || [];

        // 3. BİRLEŞTİR (GÖRSEL KORUMALI MERGE)
        const mergedMap = new Map();

        // Önce API verisini ekle
        apiData.forEach(p => {
            const id = p._id || p.id;
            if (id) mergedMap.set(id.toString(), p);
        });

        // LocalStorage/IndexedDB verisini akıllı birleştir
        localData.forEach(lp => {
            const id = lp._id || lp.id;
            if (!id) return;

            const existingFromApi = mergedMap.get(id.toString());

            if (existingFromApi) {
                const localImage = lp.mainImage || lp.image;
                const apiImage = existingFromApi.mainImage || existingFromApi.image;

                const isLocalPlaceholder = !localImage ||
                    localImage === '' ||
                    localImage === 'null' ||
                    localImage.includes('placehold.co') ||
                    localImage.includes('placeholder') ||
                    (typeof localImage === 'string' && localImage.length < 500 && localImage.startsWith('data:'));

                const isApiReal = apiImage &&
                    typeof apiImage === 'string' &&
                    apiImage.length > 5 &&
                    !apiImage.includes('placehold.co') &&
                    !apiImage.includes('placeholder');

                const merged = { ...existingFromApi, ...lp };

                if (isApiReal) {
                    if (isLocalPlaceholder) {
                        merged.mainImage = apiImage;
                        merged.image = apiImage;
                    }
                    else if (!localImage.startsWith('data:')) {
                        merged.mainImage = apiImage;
                        merged.image = apiImage;
                    }
                    else {
                        merged.mainImage = localImage;
                        merged.image = localImage;
                    }
                } else {
                    if (localImage && !isLocalPlaceholder) {
                        merged.mainImage = localImage;
                        merged.image = localImage;
                    }
                }
                mergedMap.set(id.toString(), merged);
            } else {
                mergedMap.set(id.toString(), lp);
            }
        });

        let finalProducts = Array.from(mergedMap.values());

        if (params.sort === '-createdAt') {
            finalProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        if (params.limit) {
            finalProducts = finalProducts.slice(0, parseInt(params.limit));
        }

        return { success: true, data: finalProducts };
    },

    async getProductsFromLocalCache(params = {}) {
        try {
            let allProducts = [];
            const seenIds = new Set();

            // 1. IndexedDB
            const idbProducts = await this._getFromIndexedDB('products');
            if (idbProducts && Array.isArray(idbProducts)) {
                idbProducts.forEach(p => {
                    const id = p._id || p.id;
                    if (id) {
                        seenIds.add(id.toString());
                        allProducts.push(p);
                    }
                });
            }

            // 2. LocalStorage Fallback/Migration
            const keys = ['galatacarsi_products', 'galatat_products', 'products', 'admin_products', 'galata_products_cache'];
            keys.forEach(key => {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(p => {
                                const id = p._id || p.id;
                                if (id && !seenIds.has(id.toString())) {
                                    seenIds.add(id.toString());
                                    allProducts.push(p);
                                }
                            });
                        }
                    }
                } catch (e) { }
            });

            let products = allProducts;

            // Filtreler
            if (params.isNew === 'true' || params.isNew === true || params.isNew === 1) {
                products = products.filter(p => p.isNew || (p.tags && p.tags.includes('yeni')));
            }
            if (params.isPopular === 'true' || params.isPopular === true || params.isPopular === 1) {
                products = products.filter(p => p.isPopular || (p.tags && p.tags.includes('popüler')));
            }

            if (params.sort === '-createdAt') {
                products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            }
            if (params.limit) {
                products = products.slice(0, parseInt(params.limit));
            }

            return { success: true, data: products };
        } catch (e) {
            return { success: false, data: [] };
        }
    },

    async getProductBySlug(slug) {
        try {
            const response = await fetch(`${this.baseUrl}/products/slug/${slug}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: null };
        }
    },

    async getProductById(id) {
        let apiProduct = null;
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) apiProduct = result.data;
            }
        } catch (error) { }

        // Local Fallback
        const localCache = await this.getProductsFromLocalCache({});
        const localProduct = localCache.data.find(p => (p._id || p.id) === id);

        if (apiProduct && localProduct) {
            const resolved = { ...apiProduct, ...localProduct };
            const localImage = localProduct.mainImage || localProduct.image;
            const apiImage = apiProduct.mainImage || apiProduct.image;

            if (apiImage && (!localImage || !localImage.startsWith('data:'))) {
                resolved.mainImage = apiImage;
                resolved.image = apiImage;
            }
            return { success: true, data: resolved, fromLocal: true };
        } else if (apiProduct) {
            return { success: true, data: apiProduct };
        } else if (localProduct) {
            return { success: true, data: localProduct, fromLocal: true };
        }

        return { success: false, data: null };
    },

    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories?active=true`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    async getBrands() {
        try {
            const response = await fetch(`${this.baseUrl}/brands?active=true`);
            const result = await response.json();
            if (result.success) return result;
        } catch (error) { }

        try {
            const local = localStorage.getItem('galata_brands');
            if (local) return { success: true, data: JSON.parse(local), fromLocal: true };
        } catch (e) { }

        return { success: false, data: [] };
    }
};
