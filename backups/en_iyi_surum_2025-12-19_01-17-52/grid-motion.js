document.addEventListener('DOMContentLoaded', () => {
    initInfiniteRows();
});

function initInfiniteRows() {
    const container = document.getElementById('grid-motion-container');
    if (!container) return;

    // reset
    container.innerHTML = '';

    // Exactly 9 Categories for 9 Frames
    const images = [
        'gorseller/category_elektrikli_el_aletleri.png',
        'gorseller/category_olcme_kontrol.png',
        'gorseller/category_el_aletleri.png',
        'gorseller/category_yapi_insaat.png',
        'gorseller/category_asindirici_kesici.png',
        'gorseller/category_yapi_kimyasallari.png',
        'gorseller/category_kaynak.png',
        'gorseller/category_hirdavat.png',
        'gorseller/category_is_guvenligi.png'
    ];

    // Preload images
    const imagePromises = images.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(src);
            img.src = src;
        });
    });

    Promise.all(imagePromises).then(() => {
        buildGrid();
    });

    function buildGrid() {
        // BACK TO ORIGINAL: 4 Rows
        const rowConfigs = [
            { id: 1, count: 18, direction: -1 }, // Left
            { id: 2, count: 18, direction: 1 },  // Right
            { id: 3, count: 18, direction: -1 }, // Left
            { id: 4, count: 18, direction: 1 }   // Right
        ];

        const rowsContainer = document.createElement('div');
        rowsContainer.classList.add('grid-rows-container');
        container.appendChild(rowsContainer);

        // Create Rows
        rowConfigs.forEach(config => {
            const row = document.createElement('div');
            row.classList.add('grid-row-track');
            row.dataset.direction = config.direction;

            // Use the 9 images, but repeat them to fill the 18 count
            const baseSetOfImages = [];
            for (let i = 0; i < config.count; i++) {
                baseSetOfImages.push(images[i % images.length]);
            }

            // Repeat to enable seamless looping
            const fullContent = [...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages, ...baseSetOfImages];

            fullContent.forEach(img => {
                const card = document.createElement('div');
                card.classList.add('grid-card');
                card.style.backgroundImage = `url('${img}')`;
                card.style.width = '22%'; // Back to original desktop width

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
        <h1>Profesyonel Çözümler</h1>
        <p>Her işin ustası için kaliteli malzemeler.</p>
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
                        duration: 25 + (i * 3), // Different speeds per row (slower base speed)
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
                    tween.timeScale(1 + Math.abs(mouseX) * 1.5);
                });
            });

            container.addEventListener('mouseleave', () => {
                gsap.to('.grid-rows-container', { rotation: -5, duration: 0.5 });
                scrollers.forEach(tween => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
            });
        }
    } // Close buildGrid function
} // Close initInfiniteRows function
