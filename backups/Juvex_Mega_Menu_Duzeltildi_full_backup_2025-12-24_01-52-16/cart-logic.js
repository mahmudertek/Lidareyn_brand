/* ============================================
   CART & FAVORITES MANAGEMENT
   ============================================ */

const Storage = {
    getCart: () => JSON.parse(localStorage.getItem('galatacarsi_cart')) || [],
    saveCart: (cart) => localStorage.setItem('galatacarsi_cart', JSON.stringify(cart)),
    getFavorites: () => JSON.parse(localStorage.getItem('galatacarsi_favorites')) || [],
    saveFavorites: (favs) => localStorage.setItem('galatacarsi_favorites', JSON.stringify(favs))
};

function addToCart(product) {
    const cart = Storage.getCart();
    const existing = cart.find(item => item.id === product.id && item.variant === product.variant);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    Storage.saveCart(cart);
    updateCartCount();

    // Optional: Show toast notification
    alert('Ürün sepete eklendi!');
}

function removeFromCart(index) {
    const cart = Storage.getCart();
    cart.splice(index, 1);
    Storage.saveCart(cart);
    renderCart(); // Re-render if on cart page
    updateCartCount();
}

function updateCartQuantity(index, change) {
    const cart = Storage.getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        Storage.saveCart(cart);
        renderCart();
    }
}

function toggleFavorite(product) {
    const favs = Storage.getFavorites();
    const index = favs.findIndex(item => item.id === product.id);

    if (index > -1) {
        favs.splice(index, 1);
        alert('Favorilerden çıkarıldı.');
    } else {
        favs.push(product);
        alert('Favorilere eklendi!');
    }

    Storage.saveFavorites(favs);
    renderFavorites(); // Re-render if on fav page
}

function updateCartCount() {
    const cart = Storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

/* ============================================
   PAGE RENDERING
   ============================================ */

function renderCart() {
    const container = document.getElementById('cart-items-list');
    const summaryPanel = document.getElementById('cart-summary-panel');
    const totalCountEl = document.getElementById('cart-total-count');

    if (!container) return; // Not on cart page

    const cart = Storage.getCart();

    if (totalCountEl) totalCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cart-shopping empty-icon"></i>
                <p class="empty-text">Sepetinizde henüz ürün bulunmamaktadır.</p>
                <a href="index.html" class="continue-shopping-btn">Alışverişe Başla</a>
            </div>
        `;
        if (summaryPanel) summaryPanel.style.display = 'none';
        return;
    }

    if (summaryPanel) summaryPanel.style.display = 'block';


    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        // Handle price strings like "1.250 TL" or "500,00 TL" or just number
        let priceVal = 0;
        if (typeof item.price === 'string') {
            priceVal = parseFloat(item.price.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
            // The above regex might be tricky depending on dot/comma usage (TR uses dot for thousands, comma for decimal).
            // Let's assume standard format like "1.299,90 TL" -> 1299.90
        } else {
            priceVal = item.price;
        }

        // Simple fallback if price parsing fails or is different format in data
        // For this demo, let's assume item.price is visually correct, but for math we might need a rawPrice property or consistent parsing.
        // I will trust existing parsing logic but refine it.
        // Actually, let's look at existing logic: `parseFloat(item.price.replace(/[^0-9,]/g, '').replace(',', '.'))` 
        // That logic removes dots (thousands separator) which is good for TR format.

        const rawPrice = parseFloat(item.price.toString().replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
        const itemTotal = rawPrice * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <a href="urun-detay.html" class="cart-item-title">${item.name}</a>
                    <div class="cart-item-variant">${item.variant || 'Standart'}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                            <input type="text" class="qty-input" value="${item.quantity}" readonly>
                            <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                        </div>
                        <div class="cart-item-price">${item.price}</div>
                        <button class="remove-btn" onclick="removeFromCart(${index})" title="Sepetten Kaldır">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Update summary
    const shipping = 29.99;
    const isFreeShipping = subtotal >= 500;
    const shippingDisplay = isFreeShipping ? 0 : shipping;
    const total = subtotal + shippingDisplay;

    if (document.getElementById('summary-subtotal'))
        document.getElementById('summary-subtotal').textContent = '₺' + subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (document.getElementById('summary-shipping')) {
        const el = document.getElementById('summary-shipping');
        if (isFreeShipping) {
            el.innerHTML = '<span style="text-decoration: line-through; color: #999;">₺29,99</span> <span style="color: #2ecc71;">Bedava</span>';
        } else {
            el.textContent = '₺' + shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
        }
    }

    if (document.getElementById('summary-total'))
        document.getElementById('summary-total').textContent = '₺' + total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    const countEl = document.getElementById('fav-count');

    if (!container) return; // Not on fav page

    const favs = Storage.getFavorites();
    if (countEl) countEl.textContent = favs.length;

    if (favs.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fa-regular fa-heart empty-icon"></i>
                <p class="empty-text">Favori listeniz şu an boş.</p>
                <a href="index.html" class="continue-shopping-btn">Keşfetmeye Başla</a>
            </div>
        `;
        return;
    }

    let html = '';
    favs.forEach((item) => {
        html += `
            <div class="fav-card">
                <button class="fav-remove-btn" onclick='toggleFavorite(${JSON.stringify(item)})'>
                    <i class="fa-solid fa-times"></i>
                </button>
                <a href="urun-detay.html" class="fav-img-container">
                    <img src="${item.image}" alt="${item.name}">
                </a>
                <div class="fav-info">
                    <a href="urun-detay.html" class="fav-name">${item.name}</a>
                    <span class="fav-price">${item.price}</span>
                    <button class="fav-add-btn" onclick='addToCart(${JSON.stringify(item)})'>
                        <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initial Call
document.addEventListener('DOMContentLoaded', updateCartCount);
