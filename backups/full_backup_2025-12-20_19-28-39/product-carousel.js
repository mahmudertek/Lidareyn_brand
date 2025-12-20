/* ============================================
   PRODUCT CAROUSEL - 18 Products Per Page
   3 Rows x 6 Columns with Arrow Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initProductCarousel();
});

function initProductCarousel() {
    const container = document.getElementById('product-carousel-container');
    if (!container) return;

    // Sample Products Data (replace with real data)
    const products = [
        // Page 1 - 18 products
        { id: 1, name: 'Bosch GSB 18V-55 Akülü Darbeli Matkap', price: '7,899.00TL', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=Bosch+Matkap', badge: 'Çok Satan', link: 'urun-detay.html?id=1' },
        { id: 2, name: 'Makita DTD172 18V Darbe Vidalama', price: '5,999.00TL', image: 'https://placehold.co/300x200/6b9bd8/ffffff?text=Makita+Vidalama', badge: 'Yeni', link: 'urun-detay.html?id=2' },
        { id: 3, name: 'Knipex Cobra 87 01 250 Su Pompa Pense', price: '1,899.00TL', image: 'https://placehold.co/300x200/a29bfe/ffffff?text=Knipex+Pense', badge: '', link: 'urun-detay.html?id=3' },
        { id: 4, name: 'Beta 666N/30 Tork Anahtarı 40-200Nm', price: '5,499.00TL', image: 'https://placehold.co/300x200/74b9ff/ffffff?text=Beta+Tork', badge: 'Premium', link: 'urun-detay.html?id=4' },
        { id: 5, name: 'Bosch GWS 18V-10 Akülü Avuç Taşlama', price: '6,499.00TL', image: 'https://placehold.co/300x200/9b8fd8/ffffff?text=Bosch+Taslama', badge: '', link: 'urun-detay.html?id=5' },
        { id: 6, name: 'Makita DHS680 18V Daire Testere', price: '8,499.00TL', image: 'https://placehold.co/300x200/8ba9d8/ffffff?text=Makita+Testere', badge: 'Yeni', link: 'urun-detay.html?id=6' },
        { id: 7, name: 'Knipex 70 06 160 Yan Keski', price: '899.00TL', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=Knipex+Keski', badge: '', link: 'urun-detay.html?id=7' },
        { id: 8, name: 'Beta 903E/C98 Profesyonel Lokma Seti', price: '4,299.00TL', image: 'https://placehold.co/300x200/6b9bd8/ffffff?text=Beta+Lokma', badge: 'Çok Satan', link: 'urun-detay.html?id=8' },
        { id: 9, name: 'Bosch GLL 3-80 Profesyonel Lazer', price: '9,299.00TL', image: 'https://placehold.co/300x200/a29bfe/ffffff?text=Bosch+Lazer', badge: 'Premium', link: 'urun-detay.html?id=9' },
        { id: 10, name: 'Makita DUB184 Akülü Yaprak Üfleyici', price: '4,299.00TL', image: 'https://placehold.co/300x200/74b9ff/ffffff?text=Makita+Ufleyici', badge: '', link: 'urun-detay.html?id=10' },
        { id: 11, name: 'Knipex 86 05 250 Pliers Wrench', price: '2,499.00TL', image: 'https://placehold.co/300x200/9b8fd8/ffffff?text=Knipex+Wrench', badge: 'Premium', link: 'urun-detay.html?id=11' },
        { id: 12, name: 'Beta C24S/8 8 Çekmeceli Alet Dolabı', price: '28,999.00TL', image: 'https://placehold.co/300x200/8ba9d8/ffffff?text=Beta+Dolap', badge: 'Özel', link: 'urun-detay.html?id=12' },
        { id: 13, name: 'Milwaukee M18 FPD2 Darbeli Matkap', price: '9,999.00TL', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=Milwaukee+Matkap', badge: 'Yeni', link: 'urun-detay.html?id=13' },
        { id: 14, name: 'DeWalt DCD796 Akülü Matkap Set', price: '6,799.00TL', image: 'https://placehold.co/300x200/6b9bd8/ffffff?text=DeWalt+Matkap', badge: '', link: 'urun-detay.html?id=14' },
        { id: 15, name: 'Stanley FATMAX Alet Çantası 200 Parça', price: '3,499.00TL', image: 'https://placehold.co/300x200/a29bfe/ffffff?text=Stanley+Set', badge: 'Çok Satan', link: 'urun-detay.html?id=15' },
        { id: 16, name: 'Einhell TC-CD 18/35 Li Akülü Matkap', price: '2,199.00TL', image: 'https://placehold.co/300x200/74b9ff/ffffff?text=Einhell+Matkap', badge: '', link: 'urun-detay.html?id=16' },
        { id: 17, name: 'Fisco 3m Profesyonel Şerit Metre', price: '299.00TL', image: 'https://placehold.co/300x200/9b8fd8/ffffff?text=Fisco+Metre', badge: '', link: 'urun-detay.html?id=17' },
        { id: 18, name: 'WD-40 Çok Amaçlı 400ml Sprey', price: '149.00TL', image: 'https://placehold.co/300x200/8ba9d8/ffffff?text=WD40+Sprey', badge: '', link: 'urun-detay.html?id=18' },
        // Page 2 - 6 more products (24 total for 4 mobile pages)
        { id: 19, name: 'ASKA Pro 20V Akülü Matkap Set', price: '3,299.00TL', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=ASKA+Matkap', badge: 'Özel Üretim', link: 'urun-detay.html?id=19' },
        { id: 20, name: 'Madeniyat Pro 18V Darbeli Matkap', price: '2,799.00TL', image: 'https://placehold.co/300x200/D4AF37/1a1a1a?text=Madeniyat+Matkap', badge: 'Çok Satan', link: 'urun-detay.html?id=20' },
        { id: 21, name: 'Izeltaş 10mm Kombinasyon Anahtar', price: '189.00TL', image: 'https://placehold.co/300x200/a29bfe/ffffff?text=Izeltas+Anahtar', badge: '', link: 'urun-detay.html?id=21' },
        { id: 22, name: 'Black+Decker BDCDD12 10.8V Matkap', price: '1,599.00TL', image: 'https://placehold.co/300x200/74b9ff/ffffff?text=BlackDecker', badge: '', link: 'urun-detay.html?id=22' },
        { id: 23, name: 'Einhell TE-AG 125/750 Avuç Taşlama', price: '1,299.00TL', image: 'https://placehold.co/300x200/9b8fd8/ffffff?text=Einhell+Taslama', badge: '', link: 'urun-detay.html?id=23' },
        { id: 24, name: 'ASKA Premium Alet Çantası 150 Parça', price: '4,499.00TL', image: 'https://placehold.co/300x200/8b7bd8/ffffff?text=ASKA+Set', badge: 'Premium', link: 'urun-detay.html?id=24' }
    ];


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

        prevBtn.disabled = pageIndex === 0;
        nextBtn.disabled = pageIndex === totalPages - 1;
    }
}
