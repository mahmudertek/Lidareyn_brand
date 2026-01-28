// Products Data - Backend API'den Dinamik Yükleme
// Bu dosya ürünleri backend'den çeker ve frontend'de kullanılır
// IndexedDB kullanarak büyük veri setlerini cache'ler (localStorage kotasını aşmamak için)

const API_BASE_URL = 'https://galatacarsi-backend-api.onrender.com/api';

// Ürünleri cache'de tutacak dizi
let galataProductsData = [];
let productsLoaded = false;
let loadingPromise = null;

// ============ IndexedDB Helper Functions ============
const DB_NAME = 'GalataCarsiDB';
const DB_VERSION = 1;
const STORE_NAME = 'products_cache';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

async function getFromIndexedDB(key) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value || null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('IndexedDB okuma hatası:', e);
        return null;
    }
}

async function saveToIndexedDB(key, value) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put({ key, value, timestamp: Date.now() });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('IndexedDB kaydetme hatası:', e);
        return false;
    }
}

// ============ LocalStorage Temizleme ============
// Eski localStorage cache'lerini temizle (kota sorununu ve hataları çözmek için)
(function cleanupOldLocalStorage() {
    const keysToRemove = [
        'galata_products_cache',
        'galatacarsi_products_cache',
        'products_cache',
        'admin_products_cache'
    ];
    keysToRemove.forEach(key => {
        try {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log('🧹 Eski localStorage cache temizlendi:', key);
            }
        } catch (e) { }
    });
})();

// ============ HIZLI BAŞLANGIÇ ============
// Önce IndexedDB'den yükle
(async function init() {
    try {
        const cached = await getFromIndexedDB('products');
        if (cached && Array.isArray(cached) && cached.length > 0) {
            galataProductsData = cached;
            productsLoaded = true;
            window.galataProductsData = galataProductsData;
            console.log('⚡ IndexedDB cache\'den hızlı yükleme:', galataProductsData.length, 'ürün');
        }
    } catch (e) {
        console.warn('Cache yükleme hatası:', e);
    }
    // API'den çekmeyi denemesi için
    fetchProductsFromAPI();
})();

function mapProduct(product) {
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
        // API fixImageUrl kullan
        image: (window.API && window.API.fixImageUrl) ?
            window.API.fixImageUrl(product.mainImage || product.image) :
            (product.mainImage || product.image || 'https://placehold.co/300x300/f0f0f0/999?text=Ürün'),
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
}

// API'den tüm ürünleri çek (arka planda günceller)
async function fetchProductsFromAPI() {
    // Zaten yüklendiyse ve cache varsa, arka planda güncelle
    if (productsLoaded && galataProductsData.length > 0) {
        updateFromAPIBackground();
        return galataProductsData;
    }

    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            console.log('📦 Ürünler API\'den yükleniyor...');
            const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
            const data = await response.json();

            if (data.success && data.data) {
                galataProductsData = data.data.map(mapProduct);
                productsLoaded = true;
                window.galataProductsData = galataProductsData;

                // Cache'e kaydet (IndexedDB)
                await saveToIndexedDB('products', galataProductsData);
                console.log(`✅ ${galataProductsData.length} ürün API'den yüklendi ve IndexedDB'ye kaydedildi.`);
            }
        } catch (error) {
            console.error('❌ Ürünler yüklenirken hata:', error);
            // Fallback: Zaten init() içinde IndexedDB'den yüklemeye çalışmıştı
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
            const newData = data.data.map(mapProduct);
            galataProductsData = newData;
            window.galataProductsData = galataProductsData;
            await saveToIndexedDB('products', newData);
            console.log('🔄 Arka planda güncellendi (IndexedDB):', newData.length, 'ürün');
        }
    } catch (error) {
        console.warn('Arka plan güncelleme hatası:', error);
    }
}

// ID ile ürün bul
async function getProductById(id) {
    if (!productsLoaded) await fetchProductsFromAPI();
    return galataProductsData.find(p => p.id === id || p.stockCode === id);
}

// Senkron versiyon (cache'den)
function getProductByIdSync(id) {
    return galataProductsData.find(p => p.id === id || p.stockCode === id);
}

// Tüm ürünleri getir
async function getAllProducts() {
    if (!productsLoaded) await fetchProductsFromAPI();
    return galataProductsData;
}

// Senkron versiyon
function getAllProductsSync() {
    return galataProductsData;
}

// Kategoriye göre ürün getir
async function getProductsByCategory(category) {
    if (!productsLoaded) await fetchProductsFromAPI();
    return galataProductsData.filter(p =>
        p.category && p.category.toLowerCase().includes(category.toLowerCase())
    );
}

// Markaya göre ürün getir
async function getProductsByBrand(brand) {
    if (!productsLoaded) await fetchProductsFromAPI();
    return galataProductsData.filter(p =>
        p.brand && p.brand.toLowerCase() === brand.toLowerCase()
    );
}

// Marka vitrin ürünlerini getir
async function getBrandShowcaseProducts(brand) {
    if (!productsLoaded) await fetchProductsFromAPI();
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

console.log('📦 Products Data module loaded - IndexedDB API mode');
