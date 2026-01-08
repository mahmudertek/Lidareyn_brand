// Admin Panel API Functions
// Bu dosya admin panelini backend API'lere bağlar

const ADMIN_API = {
    // API Base URL - HER ZAMAN CANLI API KULLAN
    // Bakım modu ve diğer ayarlar canlı siteyi etkilemeli
    baseUrl: 'https://galatacarsi-backend-api.onrender.com/api',

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('adminToken') || localStorage.getItem('token');
    },

    // Headers with authentication
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },

    // ==================== PRODUCTS ====================

    // Get all products
    async getProducts(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/products?${queryString}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get products error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get single product
    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get product error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create product
    async createProduct(productData) {
        try {
            const response = await fetch(`${this.baseUrl}/products`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });
            const result = await response.json();

            // LocalStorage'a da kaydet (fallback için)
            if (result.success && result.data) {
                this.saveProductToLocalStorage(result.data);
            }

            return result;
        } catch (error) {
            console.error('Create product error:', error);

            // Backend başarısız olursa sadece localStorage'a kaydet
            const localProduct = {
                ...productData,
                _id: 'local_' + Date.now(),
                id: 'local_' + Date.now(),
                createdAt: new Date().toISOString()
            };
            this.saveProductToLocalStorage(localProduct);

            return { success: true, data: localProduct, savedLocally: true };
        }
    },

    // LocalStorage'a ürün kaydet
    saveProductToLocalStorage(product) {
        try {
            let products = JSON.parse(localStorage.getItem('galata_products') || '[]');

            // Eğer mevcut ürün varsa güncelle, yoksa ekle
            const existingIndex = products.findIndex(p => p._id === product._id || p.id === product.id);
            if (existingIndex >= 0) {
                products[existingIndex] = product;
            } else {
                products.unshift(product); // Yeni ürünü başa ekle
            }

            localStorage.setItem('galata_products', JSON.stringify(products));
            console.log('✅ Ürün localStorage\'a kaydedildi:', product.name);
        } catch (e) {
            console.error('LocalStorage save error:', e);
        }
    },

    // Update product
    async updateProduct(id, productData) {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });
            const result = await response.json();

            // Eğer sunucu açık ama işlem başarısızsa (örn: validation hatası veya 500)
            // Yine de yerel olarak kaydetmek istiyoruz (Kullanıcı verisi kaybolmasın)
            if (!result.success) {
                console.warn('Backend rejected update, falling back to local:', result.error);
                throw new Error(result.error || 'Server rejected update');
            }

            return result;
        } catch (error) {
            console.error('Update product error:', error);

            // Backend başarısız olursa localStorage'a kaydet (Fallback)
            // Backend ID'sini ve güncel verileri birleştir
            const localProduct = {
                ...productData,
                _id: id,
                id: id,
                updatedAt: new Date().toISOString()
            };

            this.saveProductToLocalStorage(localProduct);

            return { success: true, data: localProduct, savedLocally: true };
        }
    },

    // Delete product - ÇÖP KUTUSUNA TAŞI
    async deleteProduct(id) {
        try {
            // Silmeden ÖNCE ürünü çöp kutusuna kaydet (geri getirme için)
            await this.moveToTrash(id);

            const response = await fetch(`${this.baseUrl}/products/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Delete product error:', error);
            return { success: false, error: error.message };
        }
    },

    // ==================== ÇÖP KUTUSU (TRASH BIN) ====================

    // Ürünü çöp kutusuna taşı
    async moveToTrash(productId) {
        try {
            // Önce ürünü API'den al
            let product = null;
            try {
                const response = await this.getProduct(productId);
                if (response.success && response.data) {
                    product = response.data;
                }
            } catch (e) {
                console.log('API\'den ürün alınamadı, localStorage\'a bakılıyor...');
            }

            // API'den bulunamadıysa localStorage'dan bak
            if (!product) {
                const localProducts = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
                product = localProducts.find(p => (p._id || p.id) === productId);
            }

            if (!product) {
                const localProducts2 = JSON.parse(localStorage.getItem('galata_products') || '[]');
                product = localProducts2.find(p => (p._id || p.id) === productId);
            }

            if (product) {
                // Çöp kutusu verilerini al
                let trash = JSON.parse(localStorage.getItem('galatacarsi_trash') || '[]');

                // Ürüne silme tarihi ekle
                product.deletedAt = new Date().toISOString();

                // En başa ekle (en son silinen en üstte)
                trash.unshift(product);

                // Maksimum 50 ürün tut (eski olanları temizle)
                if (trash.length > 50) {
                    trash = trash.slice(0, 50);
                }

                // Kaydet
                localStorage.setItem('galatacarsi_trash', JSON.stringify(trash));
                console.log('🗑️ Ürün çöp kutusuna taşındı:', product.name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Çöp kutusuna taşıma hatası:', error);
            return false;
        }
    },

    // Çöp kutusundaki ürünleri getir
    getTrashProducts() {
        try {
            return JSON.parse(localStorage.getItem('galatacarsi_trash') || '[]');
        } catch (error) {
            console.error('Çöp kutusu okuma hatası:', error);
            return [];
        }
    },

    // Ürünü çöp kutusundan geri yükle
    async restoreFromTrash(productId) {
        try {
            let trash = JSON.parse(localStorage.getItem('galatacarsi_trash') || '[]');
            const productIndex = trash.findIndex(p => (p._id || p.id) === productId);

            if (productIndex === -1) {
                return { success: false, error: 'Ürün çöp kutusunda bulunamadı' };
            }

            const product = trash[productIndex];

            // Silme tarihini kaldır
            delete product.deletedAt;

            // Yeni ID oluştur (eski ID çakışma yapabilir)
            const oldId = product._id || product.id;
            delete product._id;
            delete product.id;
            product.restoredFrom = oldId;
            product.restoredAt = new Date().toISOString();

            // API'ye tekrar kaydet
            const response = await this.createProduct(product);

            if (response.success) {
                // Çöp kutusundan kaldır
                trash.splice(productIndex, 1);
                localStorage.setItem('galatacarsi_trash', JSON.stringify(trash));
                console.log('✅ Ürün geri yüklendi:', product.name);
                return { success: true, data: response.data, message: 'Ürün başarıyla geri yüklendi!' };
            } else {
                // API başarısız olsa bile localStorage'a kaydet
                this.saveProductToLocalStorage({
                    ...product,
                    _id: 'restored_' + Date.now(),
                    id: 'restored_' + Date.now()
                });

                // Çöp kutusundan kaldır
                trash.splice(productIndex, 1);
                localStorage.setItem('galatacarsi_trash', JSON.stringify(trash));

                return { success: true, savedLocally: true, message: 'Ürün yerel olarak geri yüklendi!' };
            }
        } catch (error) {
            console.error('Geri yükleme hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // Çöp kutusundan kalıcı olarak sil
    permanentlyDeleteFromTrash(productId) {
        try {
            let trash = JSON.parse(localStorage.getItem('galatacarsi_trash') || '[]');
            trash = trash.filter(p => (p._id || p.id) !== productId);
            localStorage.setItem('galatacarsi_trash', JSON.stringify(trash));
            return { success: true };
        } catch (error) {
            console.error('Kalıcı silme hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // Çöp kutusunu tamamen boşalt
    emptyTrash() {
        try {
            localStorage.removeItem('galatacarsi_trash');
            return { success: true, message: 'Çöp kutusu boşaltıldı' };
        } catch (error) {
            console.error('Çöp kutusu boşaltma hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // Update stock
    async updateStock(id, stock) {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}/stock`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ stock })
            });
            return await response.json();
        } catch (error) {
            console.error('Update stock error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get product stats
    async getProductStats() {
        try {
            const response = await fetch(`${this.baseUrl}/products/admin/stats`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, error: error.message };
        }
    },

    // ==================== CATEGORIES ====================

    // Get all categories
    async getCategories(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/categories?${queryString}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get categories error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create category
    async createCategory(categoryData) {
        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(categoryData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create category error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update category
    async updateCategory(id, categoryData) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(categoryData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update category error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete category
    async deleteCategory(id) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Delete category error:', error);
            return { success: false, error: error.message };
        }
    },

    // LocalStorage'a marka kaydet
    saveBrandToLocalStorage(brand) {
        try {
            let brands = JSON.parse(localStorage.getItem('galata_brands') || '[]');
            const existingIndex = brands.findIndex(b => b._id === brand._id || b.id === brand.id);
            if (existingIndex >= 0) brands[existingIndex] = brand;
            else brands.unshift(brand);
            localStorage.setItem('galata_brands', JSON.stringify(brands));
        } catch (e) { console.error('Brand LS error', e); }
    },

    // ==================== BRANDS ====================

    // Get all brands
    // Get all brands
    async getBrands(params = {}) {
        let apiData = [];
        let success = false;
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/brands?${queryString}`, {
                headers: this.getHeaders()
            });
            const result = await response.json();
            if (result.success) {
                apiData = result.data;
                success = true;

                // Cache to local
                if (!params.limit && !params.search) { // Only cache full lists or careful
                    // Actually maybe don't overwrite local list completely to preserve local-only items?
                    // Let's just retrieve local items below and merge.
                }
            }
        } catch (error) {
            console.error('Get brands error:', error);
        }

        // Merge with Local (Offline/New items)
        try {
            const localBrands = JSON.parse(localStorage.getItem('galata_brands') || '[]');

            const brandMap = new Map();
            // API first
            apiData.forEach(b => brandMap.set(b._id || b.id, b));
            // Local fallback/merge
            localBrands.forEach(b => {
                const id = b._id || b.id;
                // If ID is pseudo-local (starts with local_) OR not in API, add it
                // Or simply if not in map (which covers both)
                if (!brandMap.has(id)) {
                    brandMap.set(id, b);
                }
            });

            return {
                success: true, // Always return success if we have ANY data or valid empty
                data: Array.from(brandMap.values()),
                count: brandMap.size,
                fromLocal: !success
            };

        } catch (e) {
            // If API failed and Local failed, return error
            if (!success) return { success: false, error: 'Could not load brands' };
            return { success: true, data: apiData };
        }
    },

    // Get single brand
    async getBrand(id) {
        try {
            const response = await fetch(`${this.baseUrl}/brands/${id}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get brand error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create brand
    // Create brand
    async createBrand(brandData) {
        try {
            const response = await fetch(`${this.baseUrl}/brands`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(brandData)
            });
            const result = await response.json();

            if (result.success && result.data) {
                this.saveBrandToLocalStorage(result.data);
            }
            return result;
        } catch (error) {
            console.error('Create brand error:', error);
            // Local Fallback
            const localBrand = {
                ...brandData,
                _id: 'local_' + Date.now(),
                id: 'local_' + Date.now(),
                createdAt: new Date().toISOString()
            };
            this.saveBrandToLocalStorage(localBrand);
            return { success: true, data: localBrand, savedLocally: true };
        }
    },

    // Update brand
    // Update brand
    async updateBrand(id, brandData) {
        try {
            const response = await fetch(`${this.baseUrl}/brands/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(brandData)
            });
            const result = await response.json();

            // Eğer sunucu başarısız olursa yine de local'e kaydet (UI optimistik)
            this.saveBrandToLocalStorage({ ...brandData, _id: id, id: id });

            return result.success ? result : { success: true, message: 'Updated locally (Server failed)', savedLocally: true };
        } catch (error) {
            console.error('Update brand error:', error);
            this.saveBrandToLocalStorage({ ...brandData, _id: id, id: id });
            return { success: true, savedLocally: true };
        }
    },

    // Delete brand
    async deleteBrand(id) {
        try {
            const response = await fetch(`${this.baseUrl}/brands/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Delete brand error:', error);
            return { success: false, error: error.message };
        }
    },

    // Seed initial brands
    async seedBrands() {
        try {
            const response = await fetch(`${this.baseUrl}/brands/seed`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Seed brands error:', error);
            return { success: false, error: error.message };
        }
    },

    // ==================== ORDERS ====================

    // Get all orders (Admin)
    async getOrders(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/orders/admin/all?${queryString}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get orders error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update order status
    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${this.baseUrl}/orders/${id}/status`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ status })
            });
            return await response.json();
        } catch (error) {
            console.error('Update order status error:', error);
            return { success: false, error: error.message };
        }
    },

    // ==================== AUTH ====================

    // Admin login
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if admin is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Logout
    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    },

    // Get current admin user
    getCurrentUser() {
        const user = localStorage.getItem('adminUser');
        return user ? JSON.parse(user) : null;
    },

    // ==================== DASHBOARD STATS ====================

    // Get dashboard stats
    async getDashboardStats() {
        try {
            // Parallel requests for all stats
            const [productsRes, ordersRes, brandsRes] = await Promise.all([
                this.getProductStats(),
                this.getOrders({ limit: 100 }),
                this.getBrands()
            ]);

            // Calculate order stats
            const orders = ordersRes.data || [];
            const totalSales = orders.reduce((sum, order) => {
                if (order.status !== 'cancelled' && order.status !== 'refunded') {
                    return sum + (order.pricing?.total || order.totalAmount || 0);
                }
                return sum;
            }, 0);

            const pendingOrders = orders.filter(o =>
                ['pending', 'confirmed', 'processing'].includes(o.status)
            ).length;

            // Product stats
            const productStats = productsRes.data || {};
            const totalProducts = productStats.totalProducts || 0;
            const activeProducts = productStats.activeProducts || totalProducts;

            return {
                success: true,
                data: {
                    totalSales: totalSales,
                    totalOrders: orders.length,
                    totalProducts: totalProducts,
                    activeProducts: activeProducts,
                    pendingOrders: pendingOrders,
                    totalBrands: brandsRes.count || 0,
                    recentOrders: orders.slice(0, 5),
                    salesTrend: 0, // Will be calculated from historical data
                    ordersTrend: 0
                }
            };
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get customers (users with role 'customer')
    async getCustomers(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit || 50);
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${this.baseUrl}/users?${queryParams}`, {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (data.success) {
                // Filter only customers
                const customers = (data.data || []).filter(u => u.role === 'customer' || !u.role);
                return { success: true, data: customers, count: customers.length };
            }
            return data;
        } catch (error) {
            console.error('Get customers error:', error);
            // Return demo data if API fails
            return {
                success: true,
                data: [],
                count: 0
            };
        }
    },
    // ==================== SETTINGS ====================
    async getSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get settings error:', error);
            return { success: false, error: error.message };
        }
    },

    async updateMaintenanceMode(isMaintenanceMode) {
        console.log('🔄 Bakım modu güncelleniyor:', isMaintenanceMode);
        try {
            // Yeni public endpoint kullan (secret key ile)
            const response = await fetch(`${this.baseUrl}/settings/maintenance-toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isMaintenanceMode,
                    secretKey: 'galatacarsi2024-bakim-secret'
                })
            });
            const data = await response.json();
            console.log('📥 Sunucu yanıtı:', data);
            return data;
        } catch (error) {
            console.error('❌ Fetch hatası detayı:', error);
            throw error;
        }
    }
};

// Make globally available
window.ADMIN_API = ADMIN_API;

// Log API connection status
console.log('🔌 Admin API initialized');
console.log('📡 API URL:', ADMIN_API.baseUrl);
