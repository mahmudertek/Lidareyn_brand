document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('tracking-form');
    const resultDiv = document.getElementById('tracking-result');
    const errorDiv = document.getElementById('tracking-error');
    const btn = document.querySelector('.btn-track');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const orderNo = document.getElementById('orderNo').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!orderNo || !email) {
            alert('Lütfen tüm alanları doldurunuz.');
            return;
        }

        // Reset UI
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        // Show Loading State
        const originalBtnText = btn.textContent;
        btn.textContent = 'Sorgulanıyor...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Fake API Call
        setTimeout(() => {

            // For demo purposes:
            // If order number length > 3, show success. 
            // If specific number "0000", show error.

            const isSuccess = orderNo !== '0000' && orderNo.length > 3;

            btn.textContent = originalBtnText;
            btn.disabled = false;
            btn.style.opacity = '1';

            if (isSuccess) {
                // Update Mock Data
                document.getElementById('res-order-no').textContent = '#' + orderNo;

                // Show Result
                resultDiv.style.display = 'block';

                // Optional: Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            } else {
                // Show Error
                errorDiv.style.display = 'flex';
            }

        }, 1500); // 1.5s simulated loading delay

    });

});
