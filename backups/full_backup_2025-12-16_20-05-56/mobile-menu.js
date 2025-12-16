
document.addEventListener('DOMContentLoaded', function () {
    const mobileCatBtn = document.querySelector('.mobile-categories-btn');
    const body = document.body;

    if (mobileCatBtn) {
        mobileCatBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            body.classList.toggle('mobile-menu-active');

            // Toggle icon state if needed (optional)
            const icon = this.querySelector('i');
            if (body.classList.contains('mobile-menu-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Accordion Logic: Direct attachment for reliability
    const megaMenuLinks = document.querySelectorAll('.mega-menu-list > li > a');

    // Helper to toggle
    function toggleCategory(e) {
        if (window.innerWidth > 768) return;

        // "this" refers to the anchor tag
        const parentLi = this.parentElement;
        const hasSubMenu = parentLi.querySelector('.sub-menu');

        if (hasSubMenu) {
            e.preventDefault();
            e.stopPropagation();

            // Check status BEFORE any changes
            const isCurrentlyActive = parentLi.classList.contains('active');

            // 1. Close ALL items first
            const allItems = document.querySelectorAll('.mega-menu-list > li');
            allItems.forEach(item => {
                item.classList.remove('active');
            });

            // 2. If it wasn't active, open it (If it WAS active, we did nothing after step 1, so it stays closed)
            if (!isCurrentlyActive) {
                parentLi.classList.add('active');
            }
        }
    }

    megaMenuLinks.forEach(link => {
        // Remove old if any (good practice but reload handles it)
        link.removeEventListener('click', toggleCategory);
        link.addEventListener('click', toggleCategory);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (body.classList.contains('mobile-menu-active')) {
            const megaMenu = document.querySelector('.mega-menu');
            const clickedInsideMenu = megaMenu && megaMenu.contains(e.target);
            const clickedBtn = mobileCatBtn && mobileCatBtn.contains(e.target);

            if (!clickedInsideMenu && !clickedBtn) {
                body.classList.remove('mobile-menu-active');
                const icon = mobileCatBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
});
