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
        if (window.API && typeof window.API.getProducts === 'function') {
            const response = await window.API.getProducts({ featured: 'true', limit: 24 });
            if (response && response.success && response.data && response.data.length > 0) {
                console.log('✅ Featured products loaded from API:', response.data.length);
                products = response.data.map(product => ({
                    id: product._id,
                    name: product.name,
                    price: `₺${product.price.toLocaleString()}`,
                    image: product.mainImage || 'https://placehold.co/300x200?text=' + encodeURIComponent(product.name),
                    badge: product.isNew ? 'Yeni' : (product.tags && product.tags[0]) || '',
                    link: `urun-detay.html?id=${product._id}`
                }));
            }
        }
    } catch (error) {
        console.error('Failed to fetch featured products from API:', error);
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

        // Create grid
        const grid = document.createElement('div');
        grid.classList.add('product-carousel-grid');
        grid.id = 'product-carousel-grid';
        container.appendChild(grid);

        // Create navigation arrows
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
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
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
