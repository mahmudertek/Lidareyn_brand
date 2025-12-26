
document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'https://galatacarsi-backend-api.onrender.com/api/products';

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
        // 1. Fetch all products (or filter via API if supported)
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API Error');
        const allProducts = await response.json();

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
            const brandProducts = allProducts.filter(p =>
                p.brand && p.brand.toLowerCase().includes(targetBrand.toLowerCase())
            ).slice(0, 3); // Take top 3

            // 4. Update the container
            const productsContainer = section.querySelector('.madeniyat-products-section');
            if (!productsContainer) return;

            // CLEAR DEMO CONTENT
            productsContainer.innerHTML = '';

            if (brandProducts.length === 0) {
                // If no products fond, we can either leave it empty or show a placeholder message. 
                // Leaving empty removes the demos.
                // Or we can create "Empty Slots" to keep layout structure if needed.
                // For now, let's leave it empty or show a "Coming Soon" card if desired.
                return;
            }

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
