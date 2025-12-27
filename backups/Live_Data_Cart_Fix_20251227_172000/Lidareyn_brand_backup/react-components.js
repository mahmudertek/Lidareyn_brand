// Pre-compiled React Components (No Babel Required)
// ChromaGrid and FlowingMenu components

// Wait for React and ReactDOM to load
(function () {
    'use strict';

    // Wait for dependencies
    function waitForDependencies(callback) {
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            callback();
        } else {
            setTimeout(function () { waitForDependencies(callback); }, 50);
        }
    }

    waitForDependencies(function () {
        const { useRef, useEffect, useState } = React;

        // --- ChromaGrid Component ---
        const ChromaGrid = function (props) {
            const items = props.items || [];
            const className = props.className || '';

            const handleCardClick = function (url) {
                if (url) {
                    window.location.href = url;
                }
            };

            const handleImageError = function (e, imagePath) {
                console.error('Image failed to load:', imagePath);
                e.target.style.border = '2px solid red';
                e.target.alt = 'Image not found: ' + imagePath;
            };

            const handleImageLoad = function (e, imagePath) {
                console.log('Image loaded successfully:', imagePath);
            };

            return React.createElement('div', { className: 'chroma-grid ' + className },
                items.map(function (c, i) {
                    return React.createElement('article', {
                        key: i,
                        className: 'chroma-card',
                        onClick: function () { handleCardClick(c.url); },
                        style: { cursor: c.url ? 'pointer' : 'default' }
                    },
                        React.createElement('div', { className: 'chroma-img-wrapper' },
                            React.createElement('img', {
                                src: c.image,
                                alt: c.title,
                                loading: 'eager',
                                onError: function (e) { handleImageError(e, c.image); },
                                onLoad: function (e) { handleImageLoad(e, c.image); },
                                style: {
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }
                            })
                        ),
                        React.createElement('footer', { className: 'chroma-info' },
                            React.createElement('h3', { className: 'name' }, c.title)
                        )
                    );
                })
            );
        };

        // --- FlowingMenu Component ---
        const FlowingMenu = function () {
            const _useState = useState(null);
            const activeBrandId = _useState[0];
            const setActiveBrandId = _useState[1];

            // 20 Brand Names
            const brands = [
                { id: 1, name: 'Beta', slug: 'beta' },
                { id: 2, name: 'Bosch', slug: 'bosch' },
                { id: 3, name: 'Makita', slug: 'makita' },
                { id: 4, name: 'Knipex', slug: 'knipex' },
                { id: 5, name: 'WD-40', slug: 'wd-40' },
                { id: 6, name: 'Fisco', slug: 'fisco' },
                { id: 7, name: 'Einhell', slug: 'einhell' },
                { id: 8, name: 'Black+Decker', slug: 'black-decker' },
                { id: 9, name: 'Dewalt', slug: 'dewalt' },
                { id: 10, name: 'İzeltaş', slug: 'izeltas' },
                { id: 11, name: 'Stanley', slug: 'stanley' },
                { id: 12, name: 'Gedore', slug: 'gedore' },
                { id: 13, name: 'Metabo', slug: 'metabo' },
                { id: 14, name: 'Milwaukee', slug: 'milwaukee' },
                { id: 15, name: 'Kama', slug: 'kama' },
                { id: 16, name: 'Proxxon', slug: 'proxxon' },
                { id: 17, name: 'Karbosan', slug: 'karbosan' },
                { id: 18, name: 'Kristal', slug: 'kristal' },
                { id: 19, name: 'Osaka', slug: 'osaka' },
                { id: 20, name: 'Gison', slug: 'gison' }
            ];

            return React.createElement('div', { className: 'flowing-menu-container' },
                React.createElement('div', { className: 'flowing-menu-scroll-wrapper' },
                    React.createElement('ul', {
                        className: 'flowing-menu-list-column',
                        style: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', width: '100%' }
                    },
                        brands.map(function (brand) {
                            var isActive = activeBrandId === brand.id;
                            return React.createElement('li', {
                                key: brand.id,
                                className: 'flowing-menu-item ' + (isActive ? 'active' : ''),
                                onClick: function () {
                                    setActiveBrandId(brand.id);
                                    window.location.href = 'markalar/' + brand.slug + '.html';
                                },
                                style: { cursor: 'pointer' }
                            }, brand.name);
                        })
                    )
                )
            );
        };

        // --- Mounting Logic ---

        // Mount ChromaGrid
        var categoriesNode = document.getElementById('kategoriler');
        if (categoriesNode) {
            // Categories data
            var directCategories = [
                {
                    title: 'Elektrikli El Aletleri',
                    description: 'Profesyonel kullanım için yüksek performanslı elektrikli el aletleri.',
                    slug: 'elektrikli-el-aletleri',
                    image: 'gorseller/category_elektrikli_el_aletleri.png'
                },
                {
                    title: 'Ölçme & Kontrol Aletleri',
                    description: 'Hassas ölçüm ve kontrol işlemleri için profesyonel cihazlar.',
                    slug: 'olcme-ve-kontrol-aletleri',
                    image: 'gorseller/category_olcme_kontrol.png'
                },
                {
                    title: 'El Aletleri',
                    description: 'Profesyonel ve hobi kullanımı için dayanıklı ve ergonomik el aletleri.',
                    slug: 'el-aletleri',
                    image: 'gorseller/category_el_aletleri.png'
                },
                {
                    title: 'Yapı ve İnşaat Malzemeleri',
                    description: 'İnşaat, tadilat ve tamirat işleriniz için profesyonel yapı kimyasalları ve malzemeleri.',
                    slug: 'nalbur-yapi-malzemeleri',
                    image: 'gorseller/category_yapi_insaat.png'
                },
                {
                    title: 'Aşındırıcı ve Kesici Uçlar',
                    description: 'Her türlü yüzey işlemi için profesyonel kesme, taşlama ve zımparalama ürünleri.',
                    slug: 'asindirici-kesici',
                    image: 'gorseller/category_asindirici_kesici.png'
                },
                {
                    title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
                    description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
                    slug: 'yapi-kimyasallari',
                    image: 'gorseller/category_yapi_kimyasallari.png'
                },
                {
                    title: 'Kaynak Malzemeleri',
                    description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
                    slug: 'kaynak-malzemeleri',
                    image: 'gorseller/category_kaynak.png'
                },
                {
                    title: 'Hırdavat ve El Aletleri',
                    description: 'Her türlü tamirat işi için el aletleri.',
                    slug: 'hirdavat-el-aletleri',
                    image: 'gorseller/category_hirdavat.png'
                },
                {
                    title: 'İş Güvenliği ve Çalışma Ekipmanları',
                    description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
                    slug: 'is-guvenligi-ve-calisma-ekipmanlari',
                    image: 'gorseller/category_is_guvenligi.png'
                }
            ];

            // Map to items format
            var items = directCategories.slice(0, 18).map(function (category) {
                return {
                    title: category.title,
                    subtitle: category.description,
                    url: 'kategoriler/' + category.slug + '.html',
                    image: category.image
                };
            });

            // Add section title
            var titleElement = document.createElement('h2');
            titleElement.className = 'section-title page-main-title';
            titleElement.textContent = 'Tüm Kategoriler';
            categoriesNode.appendChild(titleElement);

            // Create grid container
            var gridContainer = document.createElement('div');
            gridContainer.id = 'categories-grid-root';
            categoriesNode.appendChild(gridContainer);

            var rootCategoriesGrid = ReactDOM.createRoot(gridContainer);
            rootCategoriesGrid.render(React.createElement(ChromaGrid, { items: items }));
        }

        // Mount FlowingMenu
        var flowingNode = document.getElementById('flowing-menu-root');
        if (flowingNode) {
            var rootFlowing = ReactDOM.createRoot(flowingNode);
            rootFlowing.render(React.createElement(FlowingMenu));
        }

        console.log('✅ React components mounted successfully (pre-compiled, no Babel)');
    });
})();
