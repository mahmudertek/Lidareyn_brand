// Products Data - Backend API'den Dinamik Yükleme
// Bu dosya ürünleri backend'den çeker ve frontend'de kullanılır

const API_BASE_URL = 'https://galatacarsi-backend-api.onrender.com/api';

// Ürünleri cache'de tutacak dizi
let galataProductsData = [];
let productsLoaded = false;
let loadingPromise = null;

// API'den tüm ürünleri çek
async function fetchProductsFromAPI() {
    // Zaten yüklendiyse tekrar yükleme
    if (productsLoaded && galataProductsData.length > 0) {
        return galataProductsData;
    }

    // Eğer zaten yükleme işlemi devam ediyorsa, aynı promise'i döndür
    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = (async () => {
        try {
            console.log('📦 Ürünler API\'den yükleniyor...');
            const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
            const data = await response.json();

            if (data.success && data.data) {
                galataProductsData = data.data.map(product => ({
                    id: product._id || product.id,
                    name: product.name,
                    price: product.price ? `₺${parseFloat(product.price).toLocaleString('tr-TR')}` : '---',
                    priceRaw: product.price,
                    image: product.mainImage || product.image || 'https://placehold.co/300x300/f0f0f0/999?text=Ürün',
                    images: product.images || [],
                    brand: product.brand,
                    category: product.category,
                    description: product.description,
                    stockCode: product.stockCode || product.sku || product._id,
                    barcode: product.barcode || product.ean || '',
                    stock: product.stock || 0,
                    specs: product.specs || product.features || [],
                    tags: product.tags || [],
                    brandShowcase: product.brandShowcase || false
                }));

                productsLoaded = true;
                console.log(`✅ ${galataProductsData.length} ürün yüklendi.`);
            }
        } catch (error) {
            console.error('❌ Ürünler yüklenirken hata:', error);
            // Fallback: localStorage'dan yükle
            try {
                const localProducts = localStorage.getItem('galata_products_cache');
                if (localProducts) {
                    galataProductsData = JSON.parse(localProducts);
                    console.log('📂 Ürünler cache\'den yüklendi.');
                }
            } catch (e) {
                console.error('Cache yükleme hatası:', e);
            }
        }

        // Cache'e kaydet
        if (galataProductsData.length > 0) {
            try {
                localStorage.setItem('galata_products_cache', JSON.stringify(galataProductsData));
            } catch (e) {
                console.warn('Cache kaydetme hatası:', e);
            }
        }

        loadingPromise = null;
        return galataProductsData;
    })();

    return loadingPromise;
}

// ID ile ürün bul
async function getProductById(id) {
    await fetchProductsFromAPI();
    return galataProductsData.find(p => p.id === id || p.stockCode === id);
}

// Senkron versiyon (cache'den)
function getProductByIdSync(id) {
    return galataProductsData.find(p => p.id === id || p.stockCode === id);
}

// Tüm ürünleri getir
async function getAllProducts() {
    await fetchProductsFromAPI();
    return galataProductsData;
}

// Senkron versiyon
function getAllProductsSync() {
    return galataProductsData;
}

// Kategoriye göre ürün getir
async function getProductsByCategory(category) {
    await fetchProductsFromAPI();
    return galataProductsData.filter(p =>
        p.category && p.category.toLowerCase().includes(category.toLowerCase())
    );
}

// Markaya göre ürün getir
async function getProductsByBrand(brand) {
    await fetchProductsFromAPI();
    return galataProductsData.filter(p =>
        p.brand && p.brand.toLowerCase() === brand.toLowerCase()
    );
}

// Marka vitrin ürünlerini getir
async function getBrandShowcaseProducts(brand) {
    await fetchProductsFromAPI();
    return galataProductsData.filter(p =>
        p.brand && p.brand.toLowerCase() === brand.toLowerCase() && p.brandShowcase
    );
}

// Expose to window for global access
window.galataProductsData = galataProductsData;
window.getProductById = getProductById;
window.getProductByIdSync = getProductByIdSync;
window.getAllProducts = getAllProducts;
window.getAllProductsSync = getAllProductsSync;
window.getProductsByCategory = getProductsByCategory;
window.getProductsByBrand = getProductsByBrand;
window.getBrandShowcaseProducts = getBrandShowcaseProducts;
window.fetchProductsFromAPI = fetchProductsFromAPI;

// Sayfa yüklendiğinde ürünleri çek
document.addEventListener('DOMContentLoaded', () => {
    fetchProductsFromAPI();
});

// Eğer DOMContentLoaded zaten çalıştıysa hemen yükle
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fetchProductsFromAPI();
}

console.log('📦 Products Data module loaded - API mode');
