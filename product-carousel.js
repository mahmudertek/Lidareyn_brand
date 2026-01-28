/* ============================================
   PRODUCT CAROUSEL - 18 Products Per Page
   3 Rows x 6 Columns with Arrow Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initProductCarousel();
});

async function initProductCarousel() {
    const container = document.getElementById('product-carousel-container');
    if (!container) return;

    // Default static products as fallback
    let products = [];

    // Try to fetch products from API
    try {
        console.log('🔄 Fetching featured products...');
        // API'den tüm 'featured' etiketli veya isFeatured=true olanları iste
        // api-client.js zaten LocalStorage ile birleştirme (merge) yapıyor.
        const response = await window.API.getProducts({ isFeatured: true, limit: 120, sort: '-createdAt' });

        if (response && response.success && response.data) {
            console.log('📦 Total products received (API+Local):', response.data.length);

            // Filtreleme - Ekstra güvenlik: response.data zaten filtrelenmiş olmalı ama teyit ediyoruz
            const rawProducts = response.data.filter(p => {
                const isFeaturedProp = p.isFeatured === true || p.isFeatured === 'true' || p.isFeatured === 1 || p.isFeatured === '1';
                const hasFeaturedTag = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                    t && typeof t === 'string' && (t.toLowerCase() === 'featured' || t.toLowerCase() === 'öne çıkan' || t.toLowerCase() === 'onecikan' || t.toLowerCase() === 'one cikan')
                );
                return isFeaturedProp || hasFeaturedTag;
            });

            console.log('✨ Featured products after filter:', rawProducts.length);

            if (rawProducts.length === 0 && response.data.length > 0) {
                console.warn('⚠️ No products matched featured criteria despite response having data.');
                // Debug için ilk 3 ürünü logla
                console.log('Sample data:', response.data.slice(0, 3));
            }

            products = rawProducts.map(product => {
                // Use centralized image helper
                const imageUrl = window.API.fixImageUrl(product.mainImage || product.image || (product.images && product.images[0]));

                // Fiyat değerlerini güvenli şekilde al
                const rawSalePrice = parseFloat(product.salePrice);
                const rawPrice = parseFloat(product.price);
                
                // NaN kontrolü ile fiyat belirleme
                const hasSalePrice = !isNaN(rawSalePrice) && rawSalePrice > 0;
                const displayPrice = hasSalePrice ? rawSalePrice : (isNaN(rawPrice) ? 0 : rawPrice);
                const oldPrice = hasSalePrice && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : null;

                return {
                    id: product._id || product.id,
                    name: product.name,
                    price: displayPrice > 0 ? `₺${displayPrice.toLocaleString('tr-TR')}` : 'Fiyat Yok',
                    oldPrice: oldPrice ? `₺${oldPrice.toLocaleString('tr-TR')}` : null,
                    image: imageUrl,
                    badge: (product.isNew || (product.tags && product.tags.includes('new'))) ? 'Yeni' : '',
                    link: `urun-detay.html?id=${product._id || product.id}`
                };
            });
        }
    } catch (error) {
        console.error('❌ Failed to fetch featured products:', error);
    }

    // fallback if still empty (e.g. API failed completely)
    if (products.length === 0) {
        console.log('⚠️ Products list empty, checking direct LocalStorage as final fallback...');
        try {
            const keys = ['galatacarsi_products', 'galata_products', 'products'];
            let localRaw = null;
            for (const key of keys) {
                localRaw = localStorage.getItem(key);
                if (localRaw) {
                    console.log(`📂 Found local data in key: ${key}`);
                    break;
                }
            }

            if (localRaw) {
                const allProducts = JSON.parse(localRaw);
                const featuredProducts = allProducts.filter(p => {
                    const isF = p.isFeatured === true || p.isFeatured === 'true' || p.isFeatured === 1;
                    const hasT = p.tags && Array.isArray(p.tags) && p.tags.some(t =>
                        t && typeof t === 'string' && (t.toLowerCase() === 'featured' || t.toLowerCase() === 'öne çıkan' || t.toLowerCase() === 'onecikan')
                    );
                    return isF || hasT;
                });

                if (featuredProducts.length > 0) {
                    console.log('✅ Fallback success, products found:', featuredProducts.length);
                    products = featuredProducts.map(product => {
                        // Fiyat değerlerini güvenli şekilde al
                        const rawSalePrice = parseFloat(product.salePrice);
                        const rawPrice = parseFloat(product.price);
                        
                        // NaN kontrolü ile fiyat belirleme
                        const hasSalePrice = !isNaN(rawSalePrice) && rawSalePrice > 0;
                        const displayPrice = hasSalePrice ? rawSalePrice : (isNaN(rawPrice) ? 0 : rawPrice);
                        const oldPrice = hasSalePrice && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : null;
                        
                        return {
                            id: product._id || product.id,
                            name: product.name,
                            price: displayPrice > 0 ? `₺${displayPrice.toLocaleString('tr-TR')}` : 'Fiyat Yok',
                            oldPrice: oldPrice ? `₺${oldPrice.toLocaleString('tr-TR')}` : null,
                            image: product.mainImage || product.image || 'https://placehold.co/400x400/f3f4f6/6366f1?text=Urun',
                            badge: product.isNew ? 'Yeni' : '',
                            link: `urun-detay.html?id=${product._id || product.id}`
                        };
                    });
                }
            }
        } catch (e) {
            console.error('Final fallback failed:', e);
        }
    }

    // Configuration - Responsive
    const isMobile = () => window.innerWidth <= 768;
    let PRODUCTS_PER_PAGE = isMobile() ? 6 : 12; // Mobile: 2x3=6, Desktop: 4x3=12

    let currentPage = 0;
    let totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

    // Build the carousel
    buildCarousel();

    // Rebuild on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newProductsPerPage = isMobile() ? 6 : 12;

            if (newProductsPerPage !== PRODUCTS_PER_PAGE) {
                PRODUCTS_PER_PAGE = newProductsPerPage;
                totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
                currentPage = 0;
                buildCarousel();
            }
        }, 200);
    });

    function buildCarousel() {
        container.innerHTML = '';

        // Eğer ürün yoksa gösterme
        if (products.length === 0) return;

        // Create grid
        const grid = document.createElement('div');
        grid.classList.add('product-carousel-grid');
        grid.id = 'product-carousel-grid';
        container.appendChild(grid);

        // Gezinme oklarını sadece birden fazla sayfa varsa göster
        if (totalPages > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.classList.add('carousel-nav-arrow', 'prev');
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.onclick = () => changePage(-1);
            container.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.classList.add('carousel-nav-arrow', 'next');
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.onclick = () => changePage(1);
            container.appendChild(nextBtn);
        }

        // Create page indicators
        const indicators = document.createElement('div');
        indicators.classList.add('carousel-page-indicator');
        indicators.id = 'carousel-indicators';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-page-dot');
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => goToPage(i);
            indicators.appendChild(dot);
        }
        container.appendChild(indicators);

        // Render first page
        renderPage(0);
    }


    function renderPage(pageIndex) {
        const grid = document.getElementById('product-carousel-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const startIndex = pageIndex * PRODUCTS_PER_PAGE;
        const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, products.length);
        const pageProducts = products.slice(startIndex, endIndex);

        pageProducts.forEach(product => {
            const card = document.createElement('a');
            card.classList.add('product-carousel-card');
            card.href = product.link;

            card.innerHTML = `
                <div class="product-carousel-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" style="opacity: 1 !important;">
                    ${product.badge ? `<span class="product-carousel-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-carousel-info">
                    <h3 class="product-carousel-name">${product.name}</h3>
                    <div class="product-carousel-price-area">
                        <p class="product-carousel-price">${product.price}</p>
                        ${product.oldPrice ? `<p class="product-carousel-old-price">${product.oldPrice}</p>` : ''}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // Update indicators
        updateIndicators(pageIndex);
        updateArrows(pageIndex);
    }

    function changePage(direction) {
        const newPage = currentPage + direction;
        if (newPage >= 0 && newPage < totalPages) {
            currentPage = newPage;
            renderPage(currentPage);
        }
    }

    function goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            currentPage = pageIndex;
            renderPage(currentPage);
        }
    }

    function updateIndicators(pageIndex) {
        const dots = document.querySelectorAll('.carousel-page-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === pageIndex);
        });
    }

    function updateArrows(pageIndex) {
        const prevBtn = document.querySelector('.carousel-nav-arrow.prev');
        const nextBtn = document.querySelector('.carousel-nav-arrow.next');

        if (prevBtn) prevBtn.disabled = pageIndex === 0;
        if (nextBtn) nextBtn.disabled = pageIndex === totalPages - 1;
    }
}
