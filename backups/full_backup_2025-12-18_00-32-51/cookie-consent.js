document.addEventListener('DOMContentLoaded', function () {
    // Eğer cookie tercihi zaten yapılmışsa gösterme
    if (localStorage.getItem('cookieConsent')) {
        return;
    }

    // HTML Yapısı
    const bannerHTML = `
        <div class="cookie-banner" id="cookie-banner">
            <div class="cookie-text">
                Alışveriş deneyiminizi iyileştirmek ve hizmetlerimizi sunmak için yasal mevzuata uygun çerezler (cookies) kullanıyoruz. Detaylı bilgiye <a href="gizlilik-guvenlik.html" target="_blank">Gizlilik ve Güvenlik</a> ile <a href="kvkk.html" target="_blank">KVKK Aydınlatma Metni</a> sayfalarımızdan ulaşabilirsiniz.
            </div>
            <div class="cookie-buttons">
                <button class="cookie-btn cookie-btn-decline" id="cookie-decline">Reddet</button>
                <button class="cookie-btn cookie-btn-accept" id="cookie-accept">Kabul Et</button>
            </div>
        </div>
    `;

    // Banner'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    // Animasyonlu giriş (biraz gecikmeli)
    setTimeout(() => {
        banner.classList.add('show');
    }, 1000);

    // Kabul Et Aksiyonu
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.classList.remove('show');
        // Banner'ı DOM'dan kaldırmak yerine animasyonla gizleyelim
        setTimeout(() => {
            banner.remove();
        }, 600);
    });

    // Reddet Aksiyonu (Opsiyonel: Zorunlu çerezler hariç reddetme mantığı eklenebilir ama genelde banner kapanır)
    declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 600);
    });
});
