// Admin Panel API Functions
// Bu dosya admin panelini backend API'lere bağlar

const ADMIN_API = {
    // API Base URL
    baseUrl: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : 'https://galatacarsi-backend-api.onrender.com/api',

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

    // Get all orders
    async getOrders(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/orders?${queryString}`, {
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
            const [products, orders, brands] = await Promise.all([
                this.getProductStats(),
                this.getOrders({ limit: 10 }),
                this.getBrands()
            ]);

            return {
                success: true,
                data: {
                    products: products.data || {},
                    recentOrders: orders.data || [],
                    totalBrands: brands.count || 0
                }
            };
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make globally available
window.ADMIN_API = ADMIN_API;

// Log API connection status
console.log('🔌 Admin API initialized');
console.log('📡 API URL:', ADMIN_API.baseUrl);
