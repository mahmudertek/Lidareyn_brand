// Web Site API Client
// Bu dosya web sitesinin backend API ile iletişimini sağlar
// IndexedDB kullanarak büyük veri setlerini cache'ler

window.API = {
    baseUrl: window.ENV ? window.ENV.API_URL : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api'),
    /**
     * URL'yi temizler ve tam yol haline getirir
     * @param {string} url - İşlenecek URL veya yol
     * @returns {string} - Tamamlanmış URL
     */
    fixImageUrl: function (url) {
        if (!url || String(url) === 'null' || String(url) === 'undefined' || String(url).trim() === '') {
            return 'https://placehold.co/400x400/f3f4f6/6366f1?text=Urun';
        }

        // URL normalize
        url = String(url).replace(/\\/g, '/');

        // Protokol koruması (Zaten tam URL ise veya Base64 ise dokunma)
        if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file:')) {
            return url;
        }

        // Yerel klasörler (gorseller/, assets/)
        if (url.includes('gorseller/') || url.includes('assets/')) {
            let cleanPath = url;
            if (url.includes('gorseller/')) {
                cleanPath = url.substring(url.lastIndexOf('gorseller/'));
            } else if (url.includes('assets/')) {
                cleanPath = url.substring(url.lastIndexOf('assets/'));
            }

            // Sayfa konumuna göre (kategoriler/, markalar/ vb.) yolun başına ../ ekle
            const isSubPage = window.location.pathname.includes('/kategoriler/') ||
                window.location.pathname.includes('/markalar/') ||
                window.location.pathname.includes('/admin/');

            if (isSubPage) {
                return '../' + cleanPath;
            }

            // Browser root-relative (/) file:// protokolünde çalışmaz (disk köküne gider).
            // Bu yüzden yerel dosya sisteminde daima relative döneriz.
            if (window.location.protocol === 'file:') {
                return cleanPath;
            }

            // Web sunucusunda ise kök dizinden başlaması garanti ( / )
            return '/' + cleanPath;
        }

        // API yolları (uploads/, products/ vb.) - Backend URL'sine ekle
        const backendBase = 'https://galatacarsi-backend-api.onrender.com';
        const path = url.startsWith('/') ? url : '/' + url;
        return backendBase + path;
    },

    // ============ IndexedDB Helper Functions (Ana Depo) ============
    _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('GalataCarsiDB', 2); // Versiyon 2
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Ürün önbelleği
                if (!db.objectStoreNames.contains('products_cache')) {
                    db.createObjectStore('products_cache', { keyPath: 'key' });
                }
                // Genel veri deposu
                if (!db.objectStoreNames.contains('data_store')) {
                    db.createObjectStore('data_store', { keyPath: 'key' });
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

    async _saveToIndexedDB(key, value) {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('products_cache', 'readwrite');
                const store = tx.objectStore('products_cache');
                const request = store.put({ key: key, value: value, timestamp: Date.now() });
                request.onsuccess = () => {
                    console.log(`✅ IndexedDB'ye kaydedildi: ${key}`);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn('IndexedDB kayıt hatası:', e);
            return false;
        }
    },

    async _clearIndexedDB() {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('products_cache', 'readwrite');
                const store = tx.objectStore('products_cache');
                const request = store.clear();
                request.onsuccess = () => {
                    console.log('🧹 IndexedDB temizlendi');
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (e) { return false; }
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

        // 4. API'den veri geldiyse IndexedDB'ye kaydet (localStorage yerine!)
        if (apiData.length > 0) {
            try {
                await this._saveToIndexedDB('products', apiData);
                console.log(`💾 ${apiData.length} ürün IndexedDB'ye kaydedildi`);
            } catch (e) {
                console.warn('IndexedDB kayıt hatası:', e);
            }
        }

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

            // 1. IndexedDB (Ana Depo - Öncelikli)
            const idbProducts = await this._getFromIndexedDB('products');
            if (idbProducts && Array.isArray(idbProducts) && idbProducts.length > 0) {
                console.log(`📦 IndexedDB'den ${idbProducts.length} ürün yüklendi`);
                idbProducts.forEach(p => {
                    const id = p._id || p.id;
                    if (id) {
                        seenIds.add(id.toString());
                        allProducts.push(p);
                    }
                });
            }

            // 2. LocalStorage sadece IndexedDB boşsa veya çok az veri varsa okunur
            // Ayrıca localStorage'daki verileri IndexedDB'ye taşır (migration)
            if (allProducts.length < 5) {
                const keys = ['galatacarsi_products', 'galatat_products', 'products', 'admin_products', 'galata_products_cache'];
                let migratedProducts = [];

                keys.forEach(key => {
                    try {
                        const stored = localStorage.getItem(key);
                        if (stored) {
                            // Eğer veri çok büyükse (1MB+), IndexedDB'ye taşı ve localStorage'dan sil
                            if (stored.length > 1000000) {
                                console.log(`🔄 ${key} IndexedDB'ye taşınıyor (${(stored.length / 1024).toFixed(0)}KB)...`);
                                try {
                                    const parsed = JSON.parse(stored);
                                    if (Array.isArray(parsed)) {
                                        migratedProducts = migratedProducts.concat(parsed);
                                    }
                                    localStorage.removeItem(key);
                                    console.log(`✅ ${key} localStorage'dan silindi`);
                                } catch (e) { }
                                return;
                            }

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
                    } catch (e) {
                        // QuotaExceededError veya parse hatası - temizle ve devam et
                        console.warn(`⚠️ ${key} okunamadı, temizleniyor...`);
                        try { localStorage.removeItem(key); } catch (cleanErr) { }
                    }
                });

                // Taşınan verileri IndexedDB'ye kaydet
                if (migratedProducts.length > 0) {
                    try {
                        await this._saveToIndexedDB('products', migratedProducts);
                        console.log(`🔄 ${migratedProducts.length} ürün IndexedDB'ye taşındı`);
                        migratedProducts.forEach(p => {
                            const id = p._id || p.id;
                            if (id && !seenIds.has(id.toString())) {
                                seenIds.add(id.toString());
                                allProducts.push(p);
                            }
                        });
                    } catch (e) { }
                }
            }

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
