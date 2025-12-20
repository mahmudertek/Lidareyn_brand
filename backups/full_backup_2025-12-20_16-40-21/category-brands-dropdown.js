/**
 * Category Brands Dropdown - Mobile Only
 * Handles brand filtering and pagination within category pages
 */

document.addEventListener('DOMContentLoaded', function () {
    initBrandsDropdown();
});

function initBrandsDropdown() {
    const wrapper = document.querySelector('.brands-dropdown-wrapper');
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.brands-dropdown-trigger');
    const content = wrapper.querySelector('.brands-dropdown-content');
    const searchInput = wrapper.querySelector('.brands-search-input');
    const brandsGrid = wrapper.querySelector('.brands-grid');
    const paginationDots = wrapper.querySelector('.pagination-dots');
    const prevBtn = wrapper.querySelector('.pagination-prev');
    const nextBtn = wrapper.querySelector('.pagination-next');

    // Sample brands data - will be replaced with actual data
    const allBrands = [
        'Bosch', 'Makita', 'Dewalt', 'Stanley', 'Knipex',
        'Beta', 'Milwaukee', 'Izeltaş', 'Einhell', 'Black+Decker',
        'Fisco', 'WD-40', 'Bahco', 'Irwin', 'Tork Craft',
        'Gedore', 'Wiha', 'Wera', 'Stahlwille', 'Hazet',
        'Facom', 'SK11', 'Tone', 'Vessel', 'Proxxon'
    ];

    const ITEMS_PER_PAGE = 12;
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
                // Filter products by brand (to be implemented)
                console.log('Filter by brand:', brandName);
                // You can redirect or filter here
                // window.location.href = `../arama.html?marka=${encodeURIComponent(brandName)}`;
            });
        });
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

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
