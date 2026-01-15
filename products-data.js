// Products Data - Backend API'den Dinamik Yükleme
// Bu dosya ürünleri backend'den çeker ve frontend'de kullanılır

const API_BASE_URL = 'https://galatacarsi-backend-api.onrender.com/api';

// Ürünleri cache'de tutacak dizi
let galataProductsData = [];
let productsLoaded = false;
let loadingPromise = null;

// HIZLI BAŞLANGIÇ: Önce localStorage'dan yükle
(function loadFromCache() {
    try {
        const cached = localStorage.getItem('galata_products_cache');
        if (cached) {
            galataProductsData = JSON.parse(cached);
            productsLoaded = galataProductsData.length > 0;
            console.log('⚡ Cache\'den hızlı yükleme:', galataProductsData.length, 'ürün');
        }
    } catch (e) {
        console.warn('Cache okuma hatası:', e);
    }
})();

// API'den tüm ürünleri çek (arka planda günceller)
async function fetchProductsFromAPI() {
    // Zaten yüklendiyse ve cache varsa, arka planda güncelle
    if (productsLoaded && galataProductsData.length > 0) {
        // Arka planda güncelleme başlat ama bekletme
        updateFromAPIBackground();
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
                galataProductsData = data.data.map(product => {
                    const price = product.price || 0;
                    const salePrice = product.salePrice || null;
                    const displayPrice = salePrice ? salePrice : price;

                    return {
                        id: product._id || product.id,
                        name: product.name,
                        price: displayPrice ? `₺${parseFloat(displayPrice).toLocaleString('tr-TR')}` : '---',
                        oldPrice: salePrice ? `₺${parseFloat(price).toLocaleString('tr-TR')}` : null,
                        priceRaw: price,
                        salePrice: salePrice,
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
                        isPopular: product.isPopular || false,
                        isNew: product.isNew || false,
                        isFeatured: product.isFeatured || false,
                        isBestSeller: product.isBestSeller || false,
                        brandShowcase: product.brandShowcase || false
                    };
                });

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

// Arka planda API'den güncelle (kullanıcıyı bekletmez)
async function updateFromAPIBackground() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
        const data = await response.json();

        if (data.success && data.data) {
            const newData = data.data.map(product => {
                const price = product.price || 0;
                const salePrice = product.salePrice || null;
                const displayPrice = salePrice ? salePrice : price;

                return {
                    id: product._id || product.id,
                    name: product.name,
                    price: displayPrice ? `₺${parseFloat(displayPrice).toLocaleString('tr-TR')}` : '---',
                    oldPrice: salePrice ? `₺${parseFloat(price).toLocaleString('tr-TR')}` : null,
                    priceRaw: price,
                    salePrice: salePrice,
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
                    isPopular: product.isPopular || false,
                    isNew: product.isNew || false,
                    isFeatured: product.isFeatured || false,
                    isBestSeller: product.isBestSeller || false,
                    brandShowcase: product.brandShowcase || false
                };
            });

            galataProductsData = newData;
            localStorage.setItem('galata_products_cache', JSON.stringify(newData));
            console.log('🔄 Arka planda güncellendi:', newData.length, 'ürün');
        }
    } catch (error) {
        console.warn('Arka plan güncelleme hatası:', error);
    }
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
