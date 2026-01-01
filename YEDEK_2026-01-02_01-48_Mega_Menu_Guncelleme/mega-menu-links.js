/**
 * MEGA MENU LINKS UPDATER
 * Mega menüdeki alt kategori linklerini dinamik olarak günceller
 * href="#" olan linkleri kategori sayfalarına yönlendirir
 */

(function () {
    'use strict';

    // Kategori eşleştirmeleri - hangi kategori hangi sayfaya yönlendirilecek
    const categoryPages = {
        'Elektrikli El Aletleri': 'elektrikli-el-aletleri.html',
        'Ölçme & Kontrol Aletleri': 'olcme-ve-kontrol-aletleri.html',
        'El Aletleri': 'el-aletleri.html',
        'Hırdavat ve El Aletleri': 'hirdavat-el-aletleri.html',
        'Aşındırıcı ve Kesici Uçlar': 'asindirici-kesici.html',
        'Yapıştırıcı, Dolgu ve Kimyasallar': 'yapi-kimyasallari.html',
        'Kaynak Malzemeleri': 'kaynak-malzemeleri.html',
        'İş Güvenliği ve Çalışma Ekipmanları': 'is-guvenligi-ve-calisma-ekipmanlari.html'
    };

    function updateMegaMenuLinks() {
        // Tüm mega menu listelerini bul
        const megaMenuItems = document.querySelectorAll('.mega-menu-list > li');

        megaMenuItems.forEach(item => {
            // Ana kategori linkini bul
            const mainLink = item.querySelector('a');
            if (!mainLink) return;

            // Ana kategori href'ini al
            let categoryHref = mainLink.getAttribute('href');

            // kategoriler/ klasöründe olmayan sayfadaysak prefix ekle
            const isInKategoriler = window.location.pathname.includes('/kategoriler/');
            const prefix = isInKategoriler ? '' : 'kategoriler/';

            // Alt menüdeki tüm linkleri güncelle
            const subMenuLinks = item.querySelectorAll('.sub-menu-column ul li a');

            subMenuLinks.forEach(link => {
                const href = link.getAttribute('href');

                // Sadece # veya boş linkleri güncelle
                if (href === '#' || href === '' || !href) {
                    const subcategoryText = link.textContent.trim();

                    // Kategori href'inden sayfa adını çıkar
                    let pageName = categoryHref;
                    if (pageName.includes('kategoriler/')) {
                        pageName = pageName.replace('kategoriler/', '');
                    }
                    if (pageName.startsWith('../')) {
                        pageName = pageName.replace('../', '');
                    }

                    // Yeni href oluştur
                    const encodedSubcategory = encodeURIComponent(subcategoryText);
                    const newHref = `${prefix}${pageName}?subcategory=${encodedSubcategory}`;

                    link.setAttribute('href', newHref);

                    // Tıklama işleyicisi - sayfa yönlendirmesi yap
                    link.addEventListener('click', function (e) {
                        // Normal tıklama davranışını koru, sadece href'i güncelle
                        // e.preventDefault(); // Bunu kaldırarak normal link davranışı korunur
                    });
                }
            });
        });

        // Accordion linkleri de güncelle (mobil için)
        updateAccordionLinks();

        console.log('✅ Mega menü alt kategori linkleri güncellendi');
    }

    function updateAccordionLinks() {
        const accordionItems = document.querySelectorAll('.accordion-child-item');

        // Mevcut sayfanın kategori slug'ını al
        const path = window.location.pathname;
        const isInKategoriler = path.includes('/kategoriler/');

        let categorySlug = '';
        if (isInKategoriler) {
            categorySlug = path.split('/').pop().replace('.html', '');
        }

        accordionItems.forEach(link => {
            const href = link.getAttribute('href');

            if (href === '#' || href === '' || !href) {
                const subcategoryText = link.textContent.trim();
                const encodedSubcategory = encodeURIComponent(subcategoryText);

                if (categorySlug) {
                    // Kategori sayfasındaysak, aynı sayfaya subcategory parametresiyle git
                    const newHref = `${categorySlug}.html?subcategory=${encodedSubcategory}`;
                    link.setAttribute('href', newHref);
                }
            }
        });
    }

    // DOM hazır olduğunda çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMegaMenuLinks);
    } else {
        updateMegaMenuLinks();
    }

    // Ayrıca sayfa yüklendikten 500ms sonra tekrar çalıştır (gecikmeli yüklenen içerikler için)
    setTimeout(updateMegaMenuLinks, 500);

})();
