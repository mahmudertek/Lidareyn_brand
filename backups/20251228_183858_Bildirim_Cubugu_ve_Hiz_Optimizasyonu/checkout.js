/**
 * Checkout Script - Galata Çarşı
 * Backend ile entegre ödeme sistemi
 * Desteklenen sağlayıcılar: sipay, iyzico, demo
 */

// API Configuration
const API_BASE_URL = window.CONFIG?.API_URL || 'http://localhost:5000/api';

// Payment Provider Configuration
// Options: 'sipay' (recommended), 'iyzico', 'demo'
const PAYMENT_PROVIDER = window.CONFIG?.PAYMENT_PROVIDER || 'sipay';

// Get payment endpoint based on provider
function getPaymentEndpoint() {
    switch (PAYMENT_PROVIDER) {
        case 'sipay':
            return `${API_BASE_URL}/sipay/demo`; // Use /sipay/pay-3d for real payments
        case 'iyzico':
            return `${API_BASE_URL}/payment/demo`; // Use /payment/initialize for real payments
        case 'demo':
        default:
            return `${API_BASE_URL}/payment/demo`;
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckout();
});

// Initialize checkout page
function initializeCheckout() {
    loadCartSummary();
    setupPaymentTabs();
    setupCardFormatting();
    setupFormValidation();
    setupContractCheckbox();
    setupCompleteOrderButton();
    checkUserAuthentication();
}

// Check if user is logged in
function checkUserAuthentication() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        // Show login prompt
        showAuthPrompt();
    } else {
        // Pre-fill user info
        prefillUserInfo(user);
    }
}

// Show login prompt
function showAuthPrompt() {
    const formsContainer = document.querySelector('.checkout-forms');
    if (!formsContainer) return;

    const authPrompt = document.createElement('div');
    authPrompt.className = 'auth-prompt';
    authPrompt.innerHTML = `
        <div class="auth-prompt-content">
            <i class="fa-solid fa-user-lock"></i>
            <h3>Sipariş vermek için giriş yapmalısınız</h3>
            <p>Hesabınıza giriş yaparak siparişinizi tamamlayabilirsiniz.</p>
            <div class="auth-prompt-buttons">
                <a href="giris-yap.html?redirect=odeme.html" class="btn-primary">Giriş Yap</a>
                <a href="giris-yap.html?tab=register&redirect=odeme.html" class="btn-secondary">Üye Ol</a>
            </div>
            <p class="guest-option">veya <a href="#" id="continue-guest">Misafir olarak devam et</a></p>
        </div>
    `;
    authPrompt.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 2rem;
    `;

    formsContainer.insertBefore(authPrompt, formsContainer.firstChild);

    // Guest checkout option
    document.getElementById('continue-guest')?.addEventListener('click', (e) => {
        e.preventDefault();
        authPrompt.style.display = 'none';
    });
}

// Pre-fill user info
function prefillUserInfo(user) {
    if (user.name) {
        const nameParts = user.name.split(' ');
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');

        if (firstName) firstName.value = nameParts[0] || '';
        if (lastName) lastName.value = nameParts.slice(1).join(' ') || '';
    }

    if (user.phone) {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) phoneInput.value = user.phone;
    }
}

// Load cart summary
function loadCartSummary() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const summaryItems = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    const singlePaymentEl = document.getElementById('single-payment-total');

    if (cart.length === 0) {
        if (summaryItems) {
            summaryItems.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <p>Sepetinizde ürün bulunmamaktadır.</p>
                    <a href="index.html" class="btn-secondary">Alışverişe Başla</a>
                </div>
            `;
        }
        return;
    }

    // Calculate totals
    let subtotal = 0;
    let itemsHtml = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        itemsHtml += `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='gorseller/placeholder.jpg'">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Adet: ${item.quantity}</span>
                </div>
                <span class="item-price">${formatPrice(itemTotal)}</span>
            </div>
        `;
    });

    if (summaryItems) {
        summaryItems.innerHTML = itemsHtml;
    }

    // Shipping calculation
    const shippingCost = subtotal >= 500 ? 0 : 29.90;
    const total = subtotal + shippingCost;

    // Update UI
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (singlePaymentEl) singlePaymentEl.textContent = formatPrice(total);

    // Store totals for later use
    window.checkoutPricing = {
        subtotal,
        shipping: shippingCost,
        tax: 0,
        discount: 0,
        total
    };
}

// Setup payment tabs
function setupPaymentTabs() {
    const tabs = document.querySelectorAll('.payment-tab');
    const contents = document.querySelectorAll('.payment-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const method = tab.dataset.method;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content visibility
            contents.forEach(c => c.classList.remove('active'));
            const targetContent = document.getElementById(`${method}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Setup card number formatting
function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryMonth = document.getElementById('expiryMonth');
    const expiryYear = document.getElementById('expiryYear');
    const cvv = document.getElementById('cvv');

    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 16);

            // Add spaces every 4 digits
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            e.target.value = formatted;

            // Detect card type
            detectCardType(value);

            // Get installments when 6 digits entered
            if (value.length >= 6) {
                fetchInstallments(value.substring(0, 6));
            }
        });
    }

    if (expiryMonth) {
        expiryMonth.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) value = value.substring(0, 2);
            if (parseInt(value) > 12) value = '12';
            e.target.value = value;
        });
    }

    if (expiryYear) {
        expiryYear.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.substring(0, 2);
        });
    }

    if (cvv) {
        cvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

// Detect card type
function detectCardType(cardNumber) {
    const cardIcons = {
        visa: 'fa-cc-visa',
        mastercard: 'fa-cc-mastercard',
        amex: 'fa-cc-amex',
        troy: 'fa-credit-card'
    };

    let cardType = 'unknown';

    if (/^4/.test(cardNumber)) cardType = 'visa';
    else if (/^5[1-5]/.test(cardNumber)) cardType = 'mastercard';
    else if (/^3[47]/.test(cardNumber)) cardType = 'amex';
    else if (/^9792/.test(cardNumber)) cardType = 'troy';

    // Update card icon if exists
    const cardIcon = document.querySelector('.detected-card-icon');
    if (cardIcon && cardType !== 'unknown') {
        cardIcon.className = `fa-brands ${cardIcons[cardType]} detected-card-icon`;
        cardIcon.style.display = 'inline';
    }
}

// Fetch installment options
async function fetchInstallments(binNumber) {
    const installmentContainer = document.querySelector('.installment-options');
    if (!installmentContainer) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/payment/installments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                binNumber,
                price: window.checkoutPricing?.total || 0
            })
        });

        const data = await response.json();

        if (data.success && data.data.installments) {
            renderInstallments(data.data);
        }
    } catch (error) {
        console.log('Installment fetch skipped (using defaults)');
    }
}

// Render installment options
function renderInstallments(data) {
    const container = document.querySelector('.installment-options');
    if (!container) return;

    let html = '<h3>Taksit Seçenekleri</h3>';

    if (data.bankName) {
        html += `<p class="bank-name">${data.bankName} - ${data.cardFamily || ''}</p>`;
    }

    data.installments.forEach((inst, index) => {
        const isSelected = inst.installment === 1 ? 'selected' : '';
        html += `
            <div class="installment-option ${isSelected}">
                <input type="radio" name="installment" value="${inst.installment}" ${index === 0 ? 'checked' : ''}>
                <span class="inst-label">${inst.installment === 1 ? 'Tek Çekim' : `${inst.installment} Taksit`}</span>
                <span class="inst-price">
                    ${inst.installment === 1 ? '' : `${formatPrice(inst.installmentPrice)} x ${inst.installment} = `}
                    ${formatPrice(inst.totalPrice)}
                </span>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.installment-option').forEach(opt => {
        opt.addEventListener('click', () => {
            container.querySelectorAll('.installment-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            opt.querySelector('input').checked = true;
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const addressForm = document.getElementById('address-form');
    const paymentForm = document.getElementById('payment-form');

    if (addressForm) {
        addressForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    if (paymentForm) {
        paymentForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }
}

// Validate single field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Bu alan zorunludur';
    } else if (field.id === 'phone' && value) {
        const phoneRegex = /^(05\d{9}|5\d{9})$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Geçerli bir telefon numarası giriniz';
        }
    } else if (field.id === 'cardNumber' && value) {
        const cardNum = value.replace(/\s/g, '');
        if (cardNum.length !== 16) {
            isValid = false;
            errorMessage = '16 haneli kart numarası giriniz';
        }
    } else if (field.id === 'cvv' && value) {
        if (value.length < 3) {
            isValid = false;
            errorMessage = 'Geçerli bir CVV giriniz';
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');

    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'color: #e74c3c; font-size: 12px; display: block; margin-top: 5px;';
    field.parentNode.appendChild(errorEl);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) errorEl.remove();
}

// Setup contract checkbox
function setupContractCheckbox() {
    const checkbox = document.getElementById('acceptContracts');
    const completeBtn = document.getElementById('complete-order-btn');

    if (checkbox && completeBtn) {
        checkbox.addEventListener('change', () => {
            completeBtn.disabled = !checkbox.checked;
        });
    }
}

// Setup complete order button
function setupCompleteOrderButton() {
    const completeBtn = document.getElementById('complete-order-btn');

    if (completeBtn) {
        completeBtn.addEventListener('click', handleCompleteOrder);
    }
}

// Handle complete order
async function handleCompleteOrder(e) {
    e.preventDefault();

    const completeBtn = document.getElementById('complete-order-btn');
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Validate cart
    if (cart.length === 0) {
        showNotification('Sepetiniz boş!', 'error');
        return;
    }

    // Validate forms
    if (!validateAllForms()) {
        showNotification('Lütfen tüm alanları doldurunuz', 'error');
        return;
    }

    // Get form data
    const orderData = collectOrderData(cart);

    // Show loading state
    completeBtn.disabled = true;
    completeBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> İşleniyor...';

    try {
        const token = localStorage.getItem('authToken');

        // Check active payment method
        const activePaymentTab = document.querySelector('.payment-tab.active');
        const paymentMethod = activePaymentTab?.dataset.method || 'credit-card';

        if (paymentMethod === 'transfer') {
            // Bank transfer - create order directly
            await createBankTransferOrder(orderData, token);
        } else {
            // Credit card payment
            await processCreditCardPayment(orderData, token);
        }
    } catch (error) {
        console.error('Order error:', error);
        showNotification(error.message || 'Sipariş oluşturulurken bir hata oluştu', 'error');
        completeBtn.disabled = false;
        completeBtn.innerHTML = 'Siparişi Tamamla';
    }
}

// Collect order data from forms
function collectOrderData(cart) {
    return {
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity
        })),
        shippingAddress: {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            city: document.getElementById('city')?.value || '',
            district: document.getElementById('city')?.value || '',
            address: document.getElementById('address')?.value || '',
            postalCode: ''
        },
        paymentMethod: 'credit_card',
        pricing: window.checkoutPricing || {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            discount: 0,
            total: 0
        },
        card: {
            cardHolderName: document.getElementById('cardHolder')?.value || '',
            cardNumber: document.getElementById('cardNumber')?.value || '',
            expireMonth: document.getElementById('expiryMonth')?.value || '',
            expireYear: document.getElementById('expiryYear')?.value || '',
            cvc: document.getElementById('cvv')?.value || ''
        },
        installment: parseInt(document.querySelector('input[name="installment"]:checked')?.value || '1'),
        notes: ''
    };
}

// Process credit card payment
async function processCreditCardPayment(orderData, token) {
    // Use configured payment provider endpoint
    const endpoint = getPaymentEndpoint();

    console.log(`💳 Processing payment with: ${PAYMENT_PROVIDER}`);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (data.success) {
        // Payment successful
        handlePaymentSuccess(data.data);
    } else {
        throw new Error(data.message || 'Ödeme işlemi başarısız');
    }
}

// Create bank transfer order
async function createBankTransferOrder(orderData, token) {
    orderData.paymentMethod = 'bank_transfer';

    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
            items: orderData.items,
            shippingAddress: {
                fullName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
                phone: orderData.shippingAddress.phone,
                city: orderData.shippingAddress.city,
                district: orderData.shippingAddress.district,
                address: orderData.shippingAddress.address
            },
            paymentMethod: 'bank_transfer',
            pricing: orderData.pricing,
            notes: orderData.notes
        })
    });

    const data = await response.json();

    if (data.success) {
        handlePaymentSuccess(data.data);
    } else {
        throw new Error(data.message || 'Sipariş oluşturulamadı');
    }
}

// Handle payment success
function handlePaymentSuccess(orderData) {
    // Clear cart
    localStorage.removeItem('shoppingCart');

    // Save order to local history
    saveOrderToHistory(orderData);

    // Update cart count
    window.dispatchEvent(new Event('storage'));
    updateCartCount();

    // Redirect to success page
    const params = new URLSearchParams({
        orderNumber: orderData.orderNumber,
        orderId: orderData.orderId
    });

    window.location.href = `siparis-basarili.html?${params.toString()}`;
}

// Save order to local history
function saveOrderToHistory(orderData) {
    const savedOrders = JSON.parse(localStorage.getItem('savedOrders')) || [];

    savedOrders.unshift({
        id: orderData.orderId,
        orderNumber: orderData.orderNumber,
        date: new Date().toLocaleDateString('tr-TR'),
        status: orderData.status || 'confirmed',
        total: orderData.total
    });

    localStorage.setItem('savedOrders', JSON.stringify(savedOrders));
}

// Validate all forms
function validateAllForms() {
    let isValid = true;
    const requiredFields = [
        'firstName', 'lastName', 'phone', 'city', 'address',
        'cardHolder', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'
    ];

    // Check if bank transfer is selected
    const activePaymentTab = document.querySelector('.payment-tab.active');
    if (activePaymentTab?.dataset.method === 'transfer') {
        // Skip card validation for bank transfer
        requiredFields.splice(requiredFields.indexOf('cardHolder'), 5);
    }

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            isValid = false;
            showFieldError(field, 'Bu alan zorunludur');
        }
    });

    return isValid;
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cartCount;
    });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.checkout-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `checkout-notification ${type}`;
    notification.innerHTML = `
        <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        background: ${type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#eef'};
        color: ${type === 'error' ? '#c00' : type === 'success' ? '#090' : '#009'};
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #e74c3c !important;
    }
    
    .auth-prompt-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .auth-prompt-buttons .btn-primary,
    .auth-prompt-buttons .btn-secondary {
        padding: 0.75rem 2rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
    }
    
    .auth-prompt-buttons .btn-primary {
        background: white;
        color: #667eea;
    }
    
    .auth-prompt-buttons .btn-secondary {
        background: transparent;
        color: white;
        border: 2px solid white;
    }
    
    .guest-option {
        margin-top: 1rem;
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .guest-option a {
        color: white;
        text-decoration: underline;
    }
    
    .summary-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
    }
    
    .summary-item img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .summary-item .item-info {
        flex: 1;
    }
    
    .summary-item .item-name {
        display: block;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .summary-item .item-quantity {
        display: block;
        font-size: 0.8rem;
        color: #666;
    }
    
    .summary-item .item-price {
        font-weight: 600;
    }
    
    .bank-name {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 1rem;
    }
    
    .installment-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .installment-option:hover {
        border-color: #667eea;
    }
    
    .installment-option.selected {
        border-color: #667eea;
        background: #f8f9ff;
    }
    
    .installment-option .inst-label {
        flex: 1;
    }
    
    .installment-option .inst-price {
        font-weight: 600;
        color: #333;
    }
    
    .empty-cart-msg {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .empty-cart-msg i {
        font-size: 3rem;
        color: #ddd;
        margin-bottom: 1rem;
    }
    
    .empty-cart-msg .btn-secondary {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        background: #333;
        color: white;
        text-decoration: none;
        border-radius: 25px;
    }
`;
document.head.appendChild(style);
