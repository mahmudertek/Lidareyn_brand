document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Cart Logic
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderOrderSummary(cart);

    // 2. Handle Payment Method Tabs
    const tabs = document.querySelectorAll('.payment-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding content
            const method = tab.getAttribute('data-method');
            if (method === 'credit-card') {
                document.getElementById('credit-card-content').classList.add('active');
            } else if (method === 'transfer') {
                document.getElementById('transfer-content').classList.add('active');
            }
        });
    });

    // 3. Handle Contracts Checkbox
    const contractsCheckbox = document.getElementById('acceptContracts');
    const completeBtn = document.getElementById('complete-order-btn');

    contractsCheckbox.addEventListener('change', (e) => {
        // Basic form validation check can be added here
        if (e.target.checked && cart.length > 0) {
            completeBtn.disabled = false;
        } else {
            completeBtn.disabled = true;
        }
    });

    // 4. Handle Order Completion
    completeBtn.addEventListener('click', () => {
        if (!validateForms()) {
            return;
        }

        // Show loading state
        completeBtn.textContent = 'İşleniyor...';
        completeBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Show success modal
            document.getElementById('success-modal').style.display = 'block';

            // Generate random order number
            document.getElementById('order-number').textContent = '#' + Math.floor(Math.random() * 900000 + 100000);

            // Clear cart
            localStorage.removeItem('cart');

            // Could trigger an event for the main script to update cart count if needed, 
            // but we are redirecting anyway usually.
        }, 1500);
    });
});

function renderOrderSummary(cart) {
    const container = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const singlePaymentTotalEl = document.getElementById('single-payment-total');

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">Sepetinizde ürün bulunmamaktadır.</div>';
        subtotalEl.textContent = '0.00 TL';
        totalEl.textContent = '0.00 TL';
        if (singlePaymentTotalEl) singlePaymentTotalEl.textContent = '0.00 TL';
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-meta">Adet: ${item.quantity}</div>
                <div class="item-price">${formatMoney(itemTotal)}</div>
            </div>
        `;
        container.appendChild(itemEl);
    });

    subtotalEl.textContent = formatMoney(subtotal);
    totalEl.textContent = formatMoney(subtotal); // Since shipping is free for now
    if (singlePaymentTotalEl) singlePaymentTotalEl.textContent = formatMoney(subtotal);
}

function formatMoney(amount) {
    return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

function validateForms() {
    // Basic HTML5 validation trigger
    const addressForm = document.getElementById('address-form');
    const paymentForm = document.getElementById('payment-form');

    // Check if Address form is valid
    if (!addressForm.checkValidity()) {
        addressForm.reportValidity();
        return false;
    }

    // Check payment form only if credit card is selected
    const activeMethod = document.querySelector('.payment-tab.active').getAttribute('data-method');
    if (activeMethod === 'credit-card') {
        if (!paymentForm.checkValidity()) {
            paymentForm.reportValidity();
            return false;
        }
    }

    return true;
}

// Input formatting for Card Number (Simple space addition)
document.getElementById('cardNumber')?.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    e.target.value = formattedValue;
});
