document.addEventListener('DOMContentLoaded', () => {
    initInfiniteRows();
});

function initInfiniteRows() {
    const container = document.getElementById('grid-motion-container');
    if (!container) return;

    // reset
    container.innerHTML = '';

    // Exactly 12 Categories for 12 Frames (3 rows * 4 items)
    const images = [
        'gorseller/category_akulu_aletler.png',
        'gorseller/category_jeneratorler.png',
        'gorseller/category_hobi_aletleri.png',
        'gorseller/category_aksesuarlar.png',
        'gorseller/category_elektrikli_el_aletleri.png',
        'gorseller/category_olcme_kontrol.png',
        'gorseller/category_asindirici_kesici.png',
        'gorseller/category_yapi_kimyasallari.png',
        'gorseller/category_kaynak.png',
        'gorseller/category_hirdavat.png',
        'gorseller/category_is_guvenligi.png',
        'gorseller/category_bahce_aletleri.png'
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
        const isMobile = window.innerWidth <= 768;
        buildGrid(isMobile);
    });

    function buildGrid(isMobile = false) {
        // 3 Rows - Each row has 4 specific category images
        // Row 1: Categories 1, 2, 3, 4
        // Row 2: Categories 5, 6, 7, 8
        // Row 3: Categories 9, 10, 11, 12
        const rowConfigs = [
            { id: 1, images: [images[0], images[1], images[2], images[3]], direction: -1 }, // Left scroll
            { id: 2, images: [images[4], images[5], images[6], images[7]], direction: 1 },  // Right scroll
            { id: 3, images: [images[8], images[9], images[10], images[11]], direction: -1 } // Left scroll
        ];

        const rowsContainer = document.createElement('div');
        rowsContainer.classList.add('grid-rows-container');
        container.appendChild(rowsContainer);

        // Create 3 Rows
        rowConfigs.forEach(config => {
            const row = document.createElement('div');
            row.classList.add('grid-row-track');
            row.dataset.direction = config.direction;

            // Repeat the 4 images 6 times for seamless infinite loop
            const repeatCount = 6;
            const fullContent = [];
            for (let r = 0; r < repeatCount; r++) {
                fullContent.push(...config.images);
            }

            fullContent.forEach(img => {
                const card = document.createElement('div');
                card.classList.add('grid-card');
                card.style.backgroundImage = `url('${img}')`;
                // Width calculated: to show ~4 cards, each ~23% of visible area on PC, ~22% on mobile
                card.style.width = isMobile ? '22%' : '23%';
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
        <h1>En Uygun Fiyata En Kaliteli Hırdavat Ürünleri</h1>
        <p>Profesyonel el aletleri, güç aletleri ve yapı malzemelerinde güvenilir tedarikçiniz.</p>
        <a href="#kategoriler" class="btn-explore">Keşfet</a>
    `;
        container.appendChild(content);

        // GSAP Infinite Loop Animation
        if (typeof gsap !== 'undefined') {
            const rows = document.querySelectorAll('.grid-row-track');
            const scrollers = [];

            setTimeout(() => {
                rows.forEach((row, i) => {
                    const direction = parseInt(row.dataset.direction);
                    const fullWidth = row.scrollWidth;
                    // We have 4 images repeated 6 times = 24 cards total per row
                    // One cycle is 4 cards (1/6 of total)
                    const cycleWidth = fullWidth / 6;

                    // Start position - center the view
                    gsap.set(row, { x: -cycleWidth * 2 });

                    const tween = gsap.to(row, {
                        x: direction === 1 ? `+=${cycleWidth}` : `-=${cycleWidth}`,
                        duration: 25 + (i * 3), // Different speeds per row
                        ease: "none",
                        repeat: -1,
                        modifiers: {
                            x: gsap.utils.unitize(x => {
                                const val = parseFloat(x);
                                // Keep seamless loop by wrapping around
                                return (val % cycleWidth) - (cycleWidth * 2);
                            })
                        }
                    });
                    scrollers.push(tween);
                });
            }, 100);

            // Mouse Interaction: Speed modulation and tilt
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1

                // Tilt Container
                gsap.to('.grid-rows-container', {
                    rotation: -5 + (mouseX * 2),
                    duration: 0.5
                });

                // Speed up rows based on mouse
                scrollers.forEach((tween) => {
                    tween.timeScale(1 + Math.abs(mouseX) * 1.5);
                });
            });

            container.addEventListener('mouseleave', () => {
                gsap.to('.grid-rows-container', { rotation: -5, duration: 0.5 });
                scrollers.forEach(tween => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
            });
        }
    }
}
