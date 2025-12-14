/* Checkout Interaction Script */

// Step Navigation
function goToPayment() {
    // Hide Address, Show Payment
    document.getElementById('address-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';

    // Update Stepper
    document.getElementById('step-1-indicator').classList.remove('active');
    document.getElementById('step-1-indicator').style.color = '#27ae60'; // Completed
    document.getElementById('step-2-indicator').classList.add('active');

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToAddress() {
    // Hide Payment, Show Address
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('address-section').style.display = 'block';

    // Update Stepper
    document.getElementById('step-2-indicator').classList.remove('active');
    document.getElementById('step-1-indicator').classList.add('active');
    document.getElementById('step-1-indicator').style.color = ''; // Reset color
}

// Visual Card Update Logic
function updateCardVisual() {
    const numberInput = document.getElementById('cardNumber');
    const nameInput = document.getElementById('cardName');
    const monthInput = document.getElementById('cardMonth');
    const yearInput = document.getElementById('cardYear');

    const displayNumber = document.querySelector('.card-number-display');
    const displayName = document.getElementById('card-holder-text');
    const displayExpires = document.getElementById('card-expires-text');

    // Format Card Number (Spaces every 4 digits)
    let rawNumber = numberInput.value.replace(/\D/g, ''); // Remove non-digits
    let formattedNumber = '';
    for (let i = 0; i < rawNumber.length; i++) {
        if (i > 0 && i % 4 === 0) formattedNumber += ' ';
        formattedNumber += rawNumber[i];
    }
    numberInput.value = formattedNumber; // Update input value with spaces

    // Update visuals
    displayNumber.innerText = formattedNumber.length > 0 ? formattedNumber : '#### #### #### ####';
    displayName.innerText = nameInput.value.length > 0 ? nameInput.value.toUpperCase() : 'AD SOYAD';

    let month = monthInput.value.length > 0 ? monthInput.value : 'AA';
    let year = yearInput.value.length > 0 ? yearInput.value : 'YY';
    displayExpires.innerText = `${month}/${year}`;
}

// Add event listener for general input handling if needed
document.addEventListener('DOMContentLoaded', () => {
    // Select address logic
    const addressCards = document.querySelectorAll('.address-card');
    addressCards.forEach(card => {
        card.addEventListener('click', () => {
            addressCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Add new address toggle
    const addNewBtn = document.querySelector('.add-new-address');
    const newAddressForm = document.querySelector('.new-address-form');
    let formVisible = false;

    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            formVisible = !formVisible;
            newAddressForm.style.display = formVisible ? 'block' : 'none';
        });
    }

    // Complete Order Button Logic
    const completeBtn = document.querySelector('.complete-order-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {

            // 1. Get Cart Data
            const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

            if (cart.length === 0) {
                alert('Sepetiniz boş!');
                return;
            }

            // 2. UI Loading State
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> İşleniyor...';
            completeBtn.style.opacity = '0.8';

            // 3. Create Order Object
            const orderId = '#TR-' + Math.floor(Math.random() * 900000 + 100000);
            const total = document.querySelector('.total-price').innerText; // Get from UI
            const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

            const newOrder = {
                id: orderId,
                date: today,
                status: 'Hazırlanıyor',
                statusClass: 'processing', // CSS class
                total: total,
                items: cart
            };

            // 4. Save to LocalStorage
            const savedOrders = JSON.parse(localStorage.getItem('savedOrders')) || [];
            savedOrders.unshift(newOrder); // Add to beginning
            localStorage.setItem('savedOrders', JSON.stringify(savedOrders));

            // 5. Clear Cart
            localStorage.removeItem('shoppingCart');
            // Update cart count event for other tabs if needed
            window.dispatchEvent(new Event('storage'));

            // 6. Redirect
            setTimeout(() => {
                window.location.href = 'siparis-basarili.html';
            }, 1500);
        });
    }
});
```
