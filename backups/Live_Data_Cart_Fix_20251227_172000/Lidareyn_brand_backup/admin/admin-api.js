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
            return await response.json();
        } catch (error) {
            console.error('Create product error:', error);
            return { success: false, error: error.message };
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
            return await response.json();
        } catch (error) {
            console.error('Update product error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete product
    async deleteProduct(id) {
        try {
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

    // ==================== BRANDS ====================

    // Get all brands
    async getBrands(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/brands?${queryString}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get brands error:', error);
            return { success: false, error: error.message };
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
    async createBrand(brandData) {
        try {
            const response = await fetch(`${this.baseUrl}/brands`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(brandData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create brand error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update brand
    async updateBrand(id, brandData) {
        try {
            const response = await fetch(`${this.baseUrl}/brands/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(brandData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update brand error:', error);
            return { success: false, error: error.message };
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
