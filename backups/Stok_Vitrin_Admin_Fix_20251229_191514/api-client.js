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
            const response = await fetch(`${this.baseUrl}/products?${queryString}`);
            return await response.json();
        } catch (error) {
            console.error('Get products error:', error);
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
