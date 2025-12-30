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
        // Try to fetch products from API
        // API'den tüm 'featured' etiketli veya isFeatured=true olanları iste
        const response = await window.API.getProducts({ isFeatured: true, limit: 60 });

        if (response && response.success && response.data && response.data.length > 0) {
            console.log('✅ Featured products loaded from API:', response.data.length);

            // API zaten filtrelediği için gelenleri direkt kullanıyoruz
            // Ama yine de client-side bir doğrulama ve veri normalizasyonu yapalım
            products = response.data.map(product => {
                // Try multiple image sources
                let imageUrl = product.mainImage || product.image || (product.images && product.images[0]) || null;
                if (!imageUrl) imageUrl = 'https://placehold.co/300x200?text=' + encodeURIComponent(product.name || 'Ürün');

                return {
                    id: product._id || product.id,
                    name: product.name,
                    price: `₺${product.price ? product.price.toLocaleString() : '0'}`,
                    image: imageUrl,
                    badge: product.isNew ? 'Yeni' : (product.tags && product.tags.includes('new') ? 'Yeni' : ''),
                    link: `urun-detay.html?id=${product._id || product.id}`
                };
            });
        }
    } catch (error) {
        console.error('Failed to fetch featured products from API:', error);
    }

    // Fallback: Try localStorage
    if (products.length === 0) {
        try {
            const localProducts = localStorage.getItem('galatacarsi_products');
            if (localProducts) {
                const allProducts = JSON.parse(localProducts);

                // GÜÇLENDİRİLMİŞ FİLTRELEME:
                // Hem 'isFeatured' boolean'ına hem de 'tags' dizisine bak
                const featuredProducts = allProducts.filter(p =>
                    p.isFeatured === true ||
                    p.isFeatured === 'true' ||
                    (p.tags && Array.isArray(p.tags) && p.tags.includes('featured'))
                );

                if (featuredProducts.length > 0) {
                    console.log('✅ Featured products loaded from localStorage:', featuredProducts.length);
                    products = featuredProducts.map(product => ({
                        id: product._id || product.id,
                        name: product.name,
                        price: `₺${product.price ? parseFloat(product.price).toLocaleString() : '0'}`,
                        image: product.mainImage || product.image || 'https://placehold.co/300x200?text=Ürün',
                        badge: (product.isNew || (product.tags && product.tags.includes('new'))) ? 'Yeni' : '',
                        link: `urun-detay.html?id=${product._id || product.id}`
                    }));
                }
            }
        } catch (e) {
            console.warn('localStorage fallback failed:', e);
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
                    <p class="product-carousel-price">${product.price}</p>
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
