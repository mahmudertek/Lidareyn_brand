// IndexedDB Storage Wrapper - localStorage yerine 50MB+ depolama
// Galata Çarşı Admin Panel için

const GalataDB = {
    dbName: 'GalataCarsiDB',
    dbVersion: 1,
    db: null,

    // Veritabanını başlat
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('IndexedDB açılamadı:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB başarıyla açıldı');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Ürünler için object store
                if (!db.objectStoreNames.contains('products')) {
                    const productsStore = db.createObjectStore('products', { keyPath: 'id' });
                    productsStore.createIndex('name', 'name', { unique: false });
                    productsStore.createIndex('brand', 'brand', { unique: false });
                    productsStore.createIndex('isLocal', 'isLocal', { unique: false });
                    console.log('📦 Products store oluşturuldu');
                }

                // Pending ürünler için (API'ye kaydedilmemiş)
                if (!db.objectStoreNames.contains('pendingProducts')) {
                    db.createObjectStore('pendingProducts', { keyPath: 'id' });
                    console.log('📦 Pending products store oluşturuldu');
                }

                // Genel key-value storage
                if (!db.objectStoreNames.contains('keyValue')) {
                    db.createObjectStore('keyValue', { keyPath: 'key' });
                    console.log('📦 Key-Value store oluşturuldu');
                }
            };
        });
    },

    // ============ ÜRÜN İŞLEMLERİ ============

    // Tüm ürünleri kaydet
    async saveProducts(products) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');

            // Önce temizle
            store.clear();

            // Sonra ekle
            products.forEach(product => {
                const productWithId = {
                    ...product,
                    id: product._id || product.id || 'temp_' + Date.now(),
                    isLocal: (product._id || product.id || '').toString().startsWith('local_')
                };
                store.put(productWithId);
            });

            transaction.oncomplete = () => {
                console.log('✅ IndexedDB: ' + products.length + ' ürün kaydedildi');
                resolve(true);
            };

            transaction.onerror = (event) => {
                console.error('IndexedDB kayıt hatası:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // Tüm ürünleri getir
    async getProducts() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('📦 IndexedDB: ' + request.result.length + ' ürün yüklendi');
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('IndexedDB okuma hatası:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // Tek ürün kaydet/güncelle
    async saveProduct(product) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');

            const productWithId = {
                ...product,
                id: product._id || product.id || 'temp_' + Date.now(),
                isLocal: (product._id || product.id || '').toString().startsWith('local_')
            };

            const request = store.put(productWithId);

            request.onsuccess = () => {
                console.log('✅ Ürün IndexedDB\'ye kaydedildi:', productWithId.name);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('IndexedDB ürün kayıt hatası:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // Ürün sil
    async deleteProduct(productId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.delete(productId);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // ============ PENDING (YEREL) ÜRÜNLER ============

    // Pending ürün ekle
    async addPendingProduct(product) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingProducts'], 'readwrite');
            const store = transaction.objectStore('pendingProducts');

            const productWithId = {
                ...product,
                id: product._id || product.id || 'local_' + Date.now(),
                addedAt: new Date().toISOString()
            };

            const request = store.put(productWithId);

            request.onsuccess = () => {
                console.log('🔒 Pending ürün kaydedildi:', productWithId.name);
                resolve(true);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Tüm pending ürünleri getir
    async getPendingProducts() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingProducts'], 'readonly');
            const store = transaction.objectStore('pendingProducts');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('🔒 Pending ürünler:', request.result.length);
                resolve(request.result);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Pending ürün sil (API'ye kaydedilince)
    async removePendingProduct(productId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingProducts'], 'readwrite');
            const store = transaction.objectStore('pendingProducts');
            const request = store.delete(productId);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // ============ GENEL KEY-VALUE ============

    async set(key, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['keyValue'], 'readwrite');
            const store = transaction.objectStore('keyValue');
            const request = store.put({ key, value, updatedAt: new Date().toISOString() });

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async get(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['keyValue'], 'readonly');
            const store = transaction.objectStore('keyValue');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // ============ MİGRASYON ============

    // localStorage'dan IndexedDB'ye taşı
    async migrateFromLocalStorage() {
        try {
            // Ürünleri taşı
            const localProducts = localStorage.getItem('galatacarsi_products');
            if (localProducts) {
                const products = JSON.parse(localProducts);
                await this.saveProducts(products);
                console.log('✅ ' + products.length + ' ürün localStorage\'dan IndexedDB\'ye taşındı');
            }

            // Pending ürünleri taşı
            const pendingProducts = localStorage.getItem('galatacarsi_pending_products');
            if (pendingProducts) {
                const pending = JSON.parse(pendingProducts);
                for (const product of pending) {
                    await this.addPendingProduct(product);
                }
                console.log('✅ ' + pending.length + ' pending ürün taşındı');
            }

            return true;
        } catch (error) {
            console.error('Migrasyon hatası:', error);
            return false;
        }
    },

    // Depolama kullanımını göster
    async getStorageInfo() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
            const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
            console.log(`📊 Depolama: ${usedMB} MB / ${quotaMB} MB kullanılıyor`);
            return { used: estimate.usage, quota: estimate.quota, usedMB, quotaMB };
        }
        return null;
    }
};

// Global olarak erişilebilir yap
window.GalataDB = GalataDB;

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await GalataDB.init();
        console.log('🗄️ GalataDB hazır');

        // Depolama bilgisini göster
        await GalataDB.getStorageInfo();
    } catch (error) {
        console.error('GalataDB başlatma hatası:', error);
    }
});

console.log('📦 IndexedDB Storage modülü yüklendi');
