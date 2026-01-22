/**
 * Category Brands Dropdown - Mobile & Web
 * Handles brand filtering dynamically based on products in the current category
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Ürünlerin yüklenmesini bekle (products-data.js)
    if (window.fetchProductsFromAPI) {
        await window.fetchProductsFromAPI();
    }
    initBrandsDropdown();
});

async function initBrandsDropdown() {
    const wrapper = document.querySelector('.brands-dropdown-wrapper');
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.brands-dropdown-trigger');
    const content = wrapper.querySelector('.brands-dropdown-content');
    const searchInput = wrapper.querySelector('.brands-search-input');
    const brandsGrid = wrapper.querySelector('.brands-grid');
    const paginationDots = wrapper.querySelector('.pagination-dots');
    const prevBtn = wrapper.querySelector('.pagination-prev');
    const nextBtn = wrapper.querySelector('.pagination-next');

    // 1. Kategori slug'ını belirle
    const path = window.location.pathname;
    const categorySlug = path.split('/').pop().replace('.html', '');

    // 2. Bu kategorideki ürünleri bul
    let allProducts = [];
    if (typeof window.getAllProductsSync === 'function') {
        allProducts = window.getAllProductsSync();
    } else {
        // Fallback
        const cached = localStorage.getItem('galata_products_cache');
        if (cached) allProducts = JSON.parse(cached);
    }

    // Kategoriye göre filtrele (category-products.js mantığıyla paralel)
    function matchesCategory(product, slug) {
        if (!product) return false;
        if (product.categorySlug === slug) return true;
        if (product.category) {
            const cat = product.category.toLowerCase();
            const s = slug.toLowerCase().replace(/-/g, ' ');
            if (cat.includes(s)) return true;

            // Özel eşleştirmeler
            const mapping = {
                'hirdavat-el-aletleri': ['hırdavat', 'el aletleri', 'hirdavat'],
                'elektrikli-el-aletleri': ['elektrikli', 'elektrikli el aletleri'],
                'asindirici-kesici': ['aşındırıcı', 'kesici'],
                'yapi-kimyasallari': ['yapıştırıcı', 'dolgu', 'kimyasal'],
                'kaynak-malzemeleri': ['kaynak'],
                'is-guvenligi-ve-calisma-ekipmanlari': ['iş güvenliği', 'güvenlik'],
                'olcme-ve-kontrol-aletleri': ['ölçme', 'kontrol', 'ölçü']
            };
            if (mapping[slug]) return mapping[slug].some(term => cat.includes(term));
        }
        return false;
    }

    const categoryProducts = allProducts.filter(p => matchesCategory(p, categorySlug));

    // 3. Benzersiz markaları çıkar
    const brandSet = new Set();
    categoryProducts.forEach(p => {
        if (p.brand && p.brand.trim() !== '') {
            brandSet.add(p.brand.trim());
        }
    });

    const allBrands = Array.from(brandSet).sort();
    console.log(`🏷️ ${categorySlug} kategorisi için ${allBrands.length} marka bulundu.`);

    // 3x3 grid = 9 items per page
    const ITEMS_PER_PAGE = 9;
    const MAX_VISIBLE_DOTS = 3;
    let currentPage = 0;
    let filteredBrands = [...allBrands];

    // Toggle dropdown
    trigger.addEventListener('click', function () {
        trigger.classList.toggle('active');
        content.classList.toggle('active');
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        filteredBrands = allBrands.filter(brand =>
            brand.toLowerCase().includes(query)
        );
        currentPage = 0;
        renderBrands();
        renderPagination();
    });

    // Render brands for current page
    function renderBrands() {
        const start = currentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageBrands = filteredBrands.slice(start, end);

        if (allBrands.length === 0) {
            brandsGrid.innerHTML = '<div class="no-brands-found">Bu kategoride henüz markalı ürün bulunmuyor</div>';
            return;
        }

        if (pageBrands.length === 0) {
            brandsGrid.innerHTML = '<div class="no-brands-found">Marka bulunamadı</div>';
            return;
        }

        brandsGrid.innerHTML = pageBrands.map(brand =>
            `<a href="#" class="brand-item" data-brand="${brand}">${brand}</a>`
        ).join('');

        // Add click handlers
        brandsGrid.querySelectorAll('.brand-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const brandName = this.dataset.brand;
                // Arama sayfasına yönlendir (o kategorideki o marka)
                // Veya mevcut sayfada filtrele (ileride eklenebilir)
                const searchPath = window.location.pathname.includes('/kategoriler/') ? '../arama.html' : 'arama.html';
                window.location.href = `${searchPath}?q=${encodeURIComponent(brandName)}`;
            });
        });
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

        if (totalPages <= 1) {
            paginationDots.parentElement.style.display = 'none';
            return;
        } else {
            paginationDots.parentElement.style.display = 'flex';
        }

        // Update arrows
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= totalPages - 1;

        // Calculate visible dot range
        let startDot = 0;
        let endDot = Math.min(totalPages, MAX_VISIBLE_DOTS);

        if (totalPages > MAX_VISIBLE_DOTS) {
            if (currentPage >= MAX_VISIBLE_DOTS - 1) {
                startDot = Math.min(currentPage - 1, totalPages - MAX_VISIBLE_DOTS);
                endDot = startDot + MAX_VISIBLE_DOTS;
            }
        }

        // Render dots
        paginationDots.innerHTML = '';
        for (let i = startDot; i < endDot; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot' + (i === currentPage ? ' active' : '');
            dot.dataset.page = i;
            dot.addEventListener('click', () => goToPage(i));
            paginationDots.appendChild(dot);
        }
    }

    // Navigation
    function goToPage(page) {
        const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
        if (page < 0 || page >= totalPages) return;
        currentPage = page;
        renderBrands();
        renderPagination();
    }

    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // Initial render
    renderBrands();
    renderPagination();
}

