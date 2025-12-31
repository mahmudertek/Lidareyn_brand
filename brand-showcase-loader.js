
document.addEventListener('DOMContentLoaded', async function () {
    // Dynamic API URL from config or fallback
    const API_URL = (window.ENV && window.ENV.API_URL)
        ? `${window.ENV.API_URL}/products`
        : 'https://galatacarsi-backend-api.onrender.com/api/products?limit=500';

    // Brand Config: Maps CSS theme classes to Brand Names in DB
    const brandMap = {
        'theme-beta': 'Beta',
        'theme-bosch': 'Bosch',
        'theme-makita': 'Makita',
        'theme-knipex': 'Knipex',
        'theme-dewalt': 'DeWalt',
        'theme-blackdecker': 'Black+Decker'
    };

    try {
        console.log('🔄 Brand Showcase Loader: Starting...');

        let allProducts = [];

        // 1. Try API first
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API Error');

            const jsonResponse = await response.json();
            allProducts = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.data || []);
            console.log('✅ Products fetched from API:', allProducts.length);
        } catch (apiErr) {
            console.warn('⚠️ API failed, trying localStorage...', apiErr.message);

            // 2. Fallback to localStorage
            const localProducts = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
            if (localProducts.length > 0) {
                allProducts = localProducts;
                console.log('✅ Products loaded from localStorage:', allProducts.length);
            } else {
                // 3. Try products-data.js global function
                if (typeof window.getAllProductsSync === 'function') {
                    allProducts = window.getAllProductsSync() || [];
                    console.log('✅ Products loaded from products-data.js:', allProducts.length);
                }
            }
        }

        if (allProducts.length === 0) {
            console.warn('⚠️ No products found from any source');
            return;
        }

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

            const normalizedTarget = targetBrand.toLowerCase().replace(/[^a-z0-9]/g, '');

            // 3. Find products for this brand
            let brandProducts = allProducts.filter(p => {
                // EXCEPTION: If the product SPECIFICALLY chose this showcase, include it
                const showcaseVal = (p.brandShowcase || p.showcase || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (showcaseVal === normalizedTarget) return true;

                if (!p.brand) return false;
                const dbBrand = p.brand.toLowerCase().trim();
                const target = targetBrand.toLowerCase().trim();

                // 1. Direct includes match
                if (dbBrand.includes(target)) return true;

                // 2. Reverse includes
                if (target.includes(dbBrand)) return true;

                // 3. Normalized match
                const normalize = (s) => s.replace(/[^a-z0-9]/g, '');
                return normalize(dbBrand).includes(normalize(target));
            });

            // 4. Sort
            brandProducts.sort((a, b) => {
                const aVal = (a.brandShowcase || a.showcase || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const bVal = (b.brandShowcase || b.showcase || '').toLowerCase().replace(/[^a-z0-9]/g, '');

                const aExact = aVal === normalizedTarget;
                const bExact = bVal === normalizedTarget;

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                if ((a._id || a.id) > (b._id || b.id)) return -1;
                if ((a._id || a.id) < (b._id || b.id)) return 1;
                return 0;
            });

            // Take top 3
            brandProducts = brandProducts.slice(0, 3);

            const productsContainer = section.querySelector('.madeniyat-products-section');
            if (!productsContainer) return;

            if (brandProducts.length === 0) {
                console.log(`No products found for ${targetBrand} - Keeping placeholders.`);
                return;
            }

            productsContainer.innerHTML = '';

            // 5. Render
            brandProducts.forEach(product => {
                const card = document.createElement('article');
                card.className = 'madeniyat-product-card';
                card.style.cursor = 'pointer';

                const imgSource = product.mainImage || product.image || (product.images && product.images[0]) || 'https://placehold.co/400x400/eee/999?text=Resim+Yok';
                const productUrl = `urun-detay.html?id=${product._id || product.id}`;

                const price = parseFloat(product.price) || 0;
                const salePriceVal = parseFloat(product.salePrice);
                const hasSalePrice = !isNaN(salePriceVal) && salePriceVal > 0 && salePriceVal < price;

                const displayPrice = hasSalePrice ? salePriceVal : price;
                const oldPrice = hasSalePrice ? price : null;

                const priceHtml = hasSalePrice
                    ? `<span style="color:#e74c3c; font-weight:700;">₺${displayPrice.toLocaleString('tr-TR')}</span>
                       <span style="text-decoration:line-through; color:#999; font-size:0.8em; margin-left:8px;">₺${oldPrice.toLocaleString('tr-TR')}</span>`
                    : `<span>₺${displayPrice.toLocaleString('tr-TR')}</span>`;

                card.innerHTML = `
                    <button class="madeniyat-favorite-btn" aria-label="Favorilere Ekle" onclick="event.stopPropagation(); window.toggleFavorite && window.toggleFavorite('${product._id || product.id}')">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <img src="${imgSource}" alt="${product.name}" class="madeniyat-product-image" style="opacity: 1 !important; visibility: visible !important; display: block !important; object-fit: contain;">
                    <div class="madeniyat-product-info">
                        <h3 class="madeniyat-product-name" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; height: 3em;">${product.name}</h3>
                        <p class="madeniyat-product-price">${priceHtml}</p>
                    </div>
                `;

                card.onclick = function () {
                    window.location.href = productUrl;
                };

                productsContainer.appendChild(card);
            });
        });

    } catch (error) {
        console.error('Brand Showcase Error:', error);
    }
});
