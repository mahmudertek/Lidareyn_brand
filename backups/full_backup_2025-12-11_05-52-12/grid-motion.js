document.addEventListener('DOMContentLoaded', () => {
    initInfiniteRows();
});

function initInfiniteRows() {
    const container = document.getElementById('grid-motion-container');
    if (!container) return;

    // reset
    container.innerHTML = '';

    // Images - Updated with 11 Unique Custom Assets
    // Images - Updated with CORRECTED Unique Custom Assets
    const images = [
        'gorseller/mega_menu_erkek_otantik.png',
        'gorseller/mega_menu_women_products.png',
        'gorseller/bebek_final.jpg',
        'gorseller/elektronik_beige.png',
        'gorseller/mega_menu_fragrance_products.png',
        'gorseller/mega_menu_yapi_market.png',
        'gorseller/mega_menu_yapi_market.png',
        'gorseller/mega_menu_mobilya_otantik.png',
        'gorseller/mega_menu_kozmetik.png',
        'gorseller/mega_menu_canta.png',
        'gorseller/mega_menu_oto_moto.png'
    ];

    // Config: 4 Rows with specific card counts (visible items)
    // We duplicate content to create the infinite loop wormhole effect
    const rowConfigs = [
        { id: 1, count: 11, direction: -1 }, // Left - Show all 11
        { id: 2, count: 11, direction: 1 },  // Right - Show all 11
        { id: 3, count: 11, direction: -1 }, // Left - Show all 11
        { id: 4, count: 11, direction: 1 }   // Right - Show all 11
    ];

    const rowsContainer = document.createElement('div');
    rowsContainer.classList.add('grid-rows-container');
    container.appendChild(rowsContainer);

    // Create Rows
    rowConfigs.forEach(config => {
        const row = document.createElement('div');
        row.classList.add('grid-row-track');
        row.dataset.direction = config.direction; // 1 = right, -1 = left

        // We need enough items to fill the width + extra for seamless looping.
        // A standard approach is to repeat the set multiple times.
        // Base set based on count config, but we need more to fill screen width.
        const baseSetOfImages = [];
        for (let i = 0; i < config.count; i++) {
            baseSetOfImages.push(images[i % images.length]);
        }

        // Repeat the set many times to ensure we have "infinite" content to scroll
        // 5 repetitions should be plenty for a hero width
        const fullContent = [...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages];

        fullContent.forEach(img => {
            const card = document.createElement('div');
            card.classList.add('grid-card');
            card.style.backgroundImage = `url('${img}')`;

            // Adjust width based on row density
            // Fewer items = wider cards
            if (config.count === 2) card.style.width = '40%';
            else if (config.count === 3) card.style.width = '30%';
            else card.style.width = '22%';

            row.appendChild(card);
        });

        rowsContainer.appendChild(row);
    });

    // Overlays
    const overlay = document.createElement('div');
    overlay.classList.add('grid-overlay-gradient');
    container.appendChild(overlay);

    // Content
    const content = document.createElement('div');
    content.classList.add('grid-content-overlay');
    content.innerHTML = `
        <h1>Premium Alışveriş</h1>
        <p>Sınırsız stil, sonsuz seçenekler.</p>
        <a href="#kategoriler">Keşfet</a>
    `;
    container.appendChild(content);

    // GSAP Interactions
    if (typeof gsap !== 'undefined') {
        const rows = document.querySelectorAll('.grid-row-track');
        const scrollers = [];

        // --- 1. Infinite Loop Animation (The "Wormhole") ---
        rows.forEach((row) => {
            const direction = parseInt(row.dataset.direction); // -1 or 1

            // We need to calculate the width of ONE set of items to know where to wrap
            // Since we repeated the base set 6 times, we can assume the repeat point is at 1/6th or similar
            // A safer way is to just assume a large enough translation and wrap with mod
        });

        setTimeout(() => {
            rows.forEach((row, i) => {
                const direction = parseInt(row.dataset.direction);
                const fullWidth = row.scrollWidth;
                const cycleWidth = fullWidth / 6; // We repeated content 6 times

                // Set initial position to center roughly so we have buffer both ways
                gsap.set(row, { x: -cycleWidth * 2 });

                const tween = gsap.to(row, {
                    x: direction === 1 ? `+=${cycleWidth}` : `-=${cycleWidth}`,
                    duration: 15 + (i * 2), // Different speeds per row
                    ease: "none",
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize(x => {
                            const val = parseFloat(x);
                            // Wrap logic: keep x between -cycleWidth*3 and -cycleWidth*2 (example)
                            // Simpler: use the cycle width modulo
                            // If moving left (-), and we go past a point, snap back
                            return (val % cycleWidth) - (cycleWidth * 2);
                        })
                    }
                });
                scrollers.push(tween);
            });
        }, 100);

        // --- 2. Mouse Interaction: Modulate Speed (TimeScale) ---
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1

            // Tilt Container
            gsap.to('.grid-rows-container', {
                rotation: -5 + (mouseX * 2),
                duration: 0.5
            });

            // Speed up rows based on mouse direction
            scrollers.forEach((tween, i) => {
                // If moving right (mouseX > 0) and row moves right (dir 1), speed up
                // This gives a feeling of control
                tween.timeScale(1 + Math.abs(mouseX) * 2);
            });
        });

        container.addEventListener('mouseleave', () => {
            gsap.to('.grid-rows-container', { rotation: -5, duration: 0.5 });
            scrollers.forEach(tween => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
        });
    }
}
