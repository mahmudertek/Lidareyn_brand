

document.addEventListener('DOMContentLoaded', async function () {
    // Dynamic API URL from config or fallback
    const API_URL = (window.ENV && window.ENV.API_URL)
        ? `${window.ENV.API_URL}/products`
        : 'https://galatacarsi-backend-api.onrender.com/api/products';

    // Brand Config: Maps CSS theme classes to Brand Names in DB
    const brandMap = {
        'theme-beta': 'Beta',
        'theme-bosch': 'Bosch',
        'theme-makita': 'Makita',
        'theme-knipex': 'Knipex',
        'theme-dewalt': 'DeWalt',
        'theme-black-decker': 'Black+Decker'
    };

    try {
        console.log('🔄 Brand Showcase Loader: Starting...');
        console.log('📡 API URL:', API_URL);

        // 1. Fetch all products (or filter via API if supported)
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API Error');

        const jsonResponse = await response.json();
        // API yapısı: { success: true, data: [...] }
        const allProducts = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.data || []);

        console.log('✅ Products fetched:', allProducts.length);
        console.log('📦 All products:', allProducts);

        // 2. Iterate over hero sections
        const heroSections = document.querySelectorAll('.madeniyat-hero');

        heroSections.forEach(section => {
            // Determine brand from class
            let targetBrand = null;
            for (const [cls, brandName] of Object.entries(brandMap)) {
                if (section.classList.contains(cls)) {
                    targetBrand = brandName;
                    break;
                }
            }

            if (!targetBrand) return;

            // 3. Find products for this brand
            // Flexible matching: case insensitive includes
            // 3. Find products for this brand
            // Enhanced fuzzy matching
            const brandProducts = allProducts.filter(p => {
                if (!p.brand) return false;
                const dbBrand = p.brand.toLowerCase().trim();
                const target = targetBrand.toLowerCase().trim();

                // 1. Direct includes match
                if (dbBrand.includes(target)) return true;

                // 2. Reverse includes (Target inside DB brand)
                if (target.includes(dbBrand)) return true;

                // 3. Special handling for multi-word brands
                // e.g. "Black+Decker" vs "Black Decker" vs "Black&Decker"
                const normalize = (s) => s.replace(/[^a-z0-9]/g, '');
                return normalize(dbBrand).includes(normalize(target));
            }).slice(0, 3);

            // 4. Update the container
            // 5. Update the container
            const productsContainer = section.querySelector('.madeniyat-products-section');
            if (!productsContainer) return;

            if (brandProducts.length === 0) {
                // Ürün yoksa placeholderları koru (silme)
                // İsterseniz burada "Ürün Bulunamadı" mesajı ekleyebilirsiniz ama şimdilik çerçeveleri tutmak daha estetik.
                console.log(`No products found for ${targetBrand} - Keeping placeholders.`);
                return;
            }

            // CLEAR DEMO CONTENT ONLY IF WE HAVE DATA
            productsContainer.innerHTML = '';

            // 5. Render Cards
            brandProducts.forEach(product => {
                const card = document.createElement('article');
                card.className = 'madeniyat-product-card';

                // Image handling
                const imgSource = product.mainImage || 'https://placehold.co/400x400/eee/999?text=Resim+Yok';

                card.innerHTML = `
                    <button class="madeniyat-favorite-btn" aria-label="Favorilere Ekle" onclick="toggleFavorite(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <img src="${imgSource}" alt="${product.name}" class="madeniyat-product-image" 
                         onclick="window.location.href='urun-detay.html?id=${product._id}'" style="cursor:pointer">
                    <div class="madeniyat-product-info">
                        <h3 class="madeniyat-product-name">${product.name}</h3>
                        <p class="madeniyat-product-price">${product.price.toLocaleString('tr-TR')} TL</p>
                    </div>
                `;
                productsContainer.appendChild(card);
            });
        });

    } catch (error) {
        console.error('Brand Showcase Error:', error);
    }
});
