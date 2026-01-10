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
                    return price.toLocaleString('tr-TR') + ' TL';
                }
                return price;
            };

            return React.createElement('a', {
                href: 'urun-detay.html?id=' + product.id,
                className: 'product-card'
            },
                React.createElement('div', { className: 'card-actions' },
                    React.createElement('button', {
                        className: 'action-btn',
                        onClick: handleToggleFav,
                        title: 'Favorilere Ekle'
                    },
                        React.createElement('i', { className: 'fa-regular fa-heart' })
                    ),
                    React.createElement('button', {
                        className: 'action-btn',
                        onClick: handleAddToCart,
                        title: 'Sepete Ekle'
                    },
                        React.createElement('i', { className: 'fa-solid fa-cart-shopping' })
                    )
                ),
                React.createElement('img', {
                    src: product.image,
                    alt: product.name,
                    className: 'product-image',
                    loading: 'lazy',
                    style: { opacity: 1, visibility: 'visible', display: 'block', width: '100%', height: '100%', objectFit: 'contain' }
                }),
                React.createElement('div', { className: 'product-info' },
                    React.createElement('div', { className: 'product-name' }, product.name),
                    React.createElement('div', { className: 'product-price-container', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        React.createElement('div', { className: 'product-price' }, formatPrice(product.price)),
                        product.oldPrice ? React.createElement('div', { className: 'product-old-price', style: { textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' } }, formatPrice(product.oldPrice)) : null
                    )
                )
            );
        };

        // Main App Component
        var App = function () {
            var _useState = React.useState([]);
            var products = _useState[0];
            var setProducts = _useState[1];
            var _useStateLoading = React.useState(true);
            var loading = _useStateLoading[0];
            var setLoading = _useStateLoading[1];

            React.useEffect(function () {
                if (window.API && typeof window.API.getProducts === 'function') {
                    setLoading(true);
                    window.API.getProducts({ limit: 1000, sort: '-createdAt' }).then(function (res) {
                        if (res.success && res.data && res.data.length > 0) {
                            var filtered = res.data.filter(function (p) {
                                if (p.isPopular === false || p.isPopular === 'false') return false;
                                var isPopProp = p.isPopular === true || p.isPopular === 'true' || p.isPop === true || p.isPop === 1;
                                var hasPopTag = p.tags && Array.isArray(p.tags) && p.tags.some(function (t) {
                                    return t && typeof t === 'string' && (t.toLowerCase() === 'popular' || t.toLowerCase() === 'popüler' || t.toLowerCase() === 'populer');
                                });
                                return isPopProp || hasPopTag;
                            });

                            // FALLBACK: Eğer popüler işaretli ürün yoksa, son 24 ürünü göster
                            if (filtered.length === 0) {
                                console.log('⚠️ Popüler işaretli ürün bulunamadı, son 24 ürün gösteriliyor');
                                filtered = res.data.slice(0, 24);
                            }

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
                            setLoading(false);
                            console.log('✨ Popüler ürünler yüklendi:', mapped.length);
                        } else {
                            setLoading(false);
                        }
                    }).catch(function (err) {
                        console.error('Popüler ürün yükleme hatası:', err);
                        setLoading(false);
                    });
                }
            }, []);

            if (loading) {
                return React.createElement('div', {
                    style: { textAlign: 'center', padding: '100px 0', width: '100%', gridColumn: '1/-1' }
                },
                    React.createElement('i', { className: 'fa-solid fa-spinner fa-spin', style: { fontSize: '40px', color: '#6366f1' } }),
                    React.createElement('p', { style: { marginTop: '15px', color: '#64748b' } }, 'Popüler ürünler yükleniyor...')
                );
            }

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
