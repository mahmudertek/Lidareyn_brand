// Pre-compiled Populer Page Components (No Babel Required)

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
        // ProductCard Component
        var ProductCard = function (props) {
            var product = props.product;

            var handleAddToCart = function (e) {
                e.preventDefault();
                if (typeof window.addToCart === 'function') {
                    window.addToCart(Object.assign({}, product, { variant: 'Standart' }));
                } else if (typeof window.addToCartMock === 'function') {
                    window.addToCartMock(e.target, product.id);
                } else {
                    alert('Sepete eklendi (Demo): ' + product.name);
                }
            };

            var handleToggleFav = function (e) {
                e.preventDefault();
                if (typeof window.toggleFavorite === 'function') {
                    window.toggleFavorite(product);
                }
            };

            var formatPrice = function (price) {
                if (typeof price === 'number') {
                    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
                }
                return price;
            };

            return React.createElement('article', { className: 'product-card' },
                React.createElement('button', {
                    className: 'fav-btn-card',
                    onClick: handleToggleFav,
                    title: 'Favorilere Ekle'
                },
                    React.createElement('i', { className: 'fa-regular fa-heart' })
                ),
                React.createElement('button', {
                    className: 'cart-btn-card',
                    onClick: handleAddToCart,
                    title: 'Sepete Ekle'
                },
                    React.createElement('i', { className: 'fa-solid fa-cart-plus' })
                ),
                React.createElement('a', {
                    href: 'urun-detay.html?id=' + product.id,
                    className: 'product-img-wrapper'
                },
                    React.createElement('img', {
                        src: product.image,
                        alt: product.name,
                        loading: 'lazy',
                        style: { opacity: 1, visibility: 'visible', display: 'block', width: '100%', height: '100%', objectFit: 'contain' }
                    })
                ),
                React.createElement('div', { className: 'product-info' },
                    React.createElement('div', { className: 'product-brand' }, product.brand || 'KARAKÖY TÜCCARI'),
                    React.createElement('a', {
                        href: 'urun-detay.html?id=' + product.id,
                        className: 'product-title'
                    }, product.name),
                    React.createElement('div', { className: 'product-price-area' },
                        product.oldPrice ? React.createElement('span', { className: 'old-price-strikethrough', style: { textDecoration: 'line-through', color: '#999', fontSize: '0.8rem', marginRight: '8px' } }, formatPrice(product.oldPrice)) : null,
                        React.createElement('span', { className: 'current-price' }, formatPrice(product.price))
                    )
                )
            );
        };

        // Main App Component
        var App = function () {
            var _useState = React.useState([]);
            var products = _useState[0];
            var setProducts = _useState[1];

            React.useEffect(function () {
                if (window.API && typeof window.API.getProducts === 'function') {
                    // isPopular: true ile sadece popüler ürünleri iste
                    // api-client.js artık hem API'yi hem LocalStorage'ı akıllıca birleştirip filtreliyor.
                    window.API.getProducts({ isPopular: true, limit: 120, sort: '-createdAt' }).then(function (res) {
                        if (res.success && res.data) {
                            // SAFETY FILTER: Sadece gerçekten popüler olanları al (API her zaman doğru filtrelemeyebilir)
                            var filtered = res.data.filter(function (p) {
                                if (p.isPopular === false || p.isPopular === 'false') return false;
                                var isPopProp = p.isPopular === true || p.isPopular === 'true' || p.isPop === true || p.isPop === 1;
                                var hasPopTag = p.tags && Array.isArray(p.tags) && p.tags.some(function (t) {
                                    return t && typeof t === 'string' && (t.toLowerCase() === 'popular' || t.toLowerCase() === 'popüler' || t.toLowerCase() === 'populer');
                                });
                                return isPopProp || hasPopTag;
                            });

                            var mapped = filtered.map(function (p) {
                                var hasSalePrice = p.salePrice && parseFloat(p.salePrice) > 0;
                                return {
                                    id: p._id || p.id,
                                    name: p.name,
                                    price: hasSalePrice ? p.salePrice : p.price,
                                    oldPrice: hasSalePrice ? p.price : null,
                                    image: p.mainImage || p.image || (p.images && p.images[0]) || 'https://placehold.co/400x400/f3f4f6/6366f1?text=Urun',
                                    brand: p.brand || 'Lidareyn',
                                    badge: 'Popüler'
                                };
                            });
                            setProducts(mapped);
                            console.log('✨ Popüler ürünler yüklendi:', mapped.length);
                        }
                    }).catch(function (err) {
                        console.error('Popüler ürün yükleme hatası:', err);
                    });
                }
            }, []);

            return React.createElement('div', { className: 'populer-grid' },
                products.map(function (product, index) {
                    return React.createElement(ProductCard, {
                        key: product.id + '-' + index,
                        product: product
                    });
                })
            );
        };

        // Mount the App
        var rootElement = document.getElementById('circular-gallery-root');
        if (rootElement) {
            var root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(App));
            console.log('✅ Populer page components mounted (pre-compiled, no Babel)');
        }
    });
})();
