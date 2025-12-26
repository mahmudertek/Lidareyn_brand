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
                        loading: 'lazy'
                    })
                ),
                React.createElement('div', { className: 'product-info' },
                    React.createElement('div', { className: 'product-brand' }, product.brand || 'KARAKÖY TÜCCARI'),
                    React.createElement('a', {
                        href: 'urun-detay.html?id=' + product.id,
                        className: 'product-title'
                    }, product.name),
                    React.createElement('div', { className: 'product-price-area' },
                        React.createElement('span', { className: 'current-price' }, formatPrice(product.price))
                    ),
                    React.createElement('button', {
                        className: 'add-to-cart-sm',
                        onClick: handleAddToCart
                    },
                        React.createElement('i', { className: 'fa-solid fa-cart-shopping' }),
                        ' Sepete Ekle'
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
                    window.API.getProducts({ limit: 40 }).then(function (res) {
                        if (res.success && res.data) {
                            var mapped = res.data.map(function (p) {
                                return {
                                    id: p._id,
                                    name: p.name,
                                    price: p.price,
                                    image: p.images && p.images[0] ? p.images[0] : 'https://placehold.co/300x400?text=Urun',
                                    brand: p.brand,
                                    badge: p.isFeatured ? 'Popüler' : ''
                                };
                            });
                            setProducts(mapped);
                        }
                    });
                } else {
                    var allProducts = window.productsData || [];
                    if (allProducts.length > 0 && allProducts.length < 20) {
                        allProducts = allProducts.concat(allProducts).concat(allProducts);
                    }
                    setProducts(allProducts);
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
