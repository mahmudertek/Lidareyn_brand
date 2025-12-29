/* ============================================
   CATEGORY ACCORDION - JavaScript Controller
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Ana dropdown toggle
    const mainTrigger = document.querySelector('.accordion-main-trigger');
    const accordionContent = document.querySelector('.accordion-content');

    if (mainTrigger && accordionContent) {
        mainTrigger.addEventListener('click', function () {
            this.classList.toggle('active');
            accordionContent.classList.toggle('open');
        });
    }

    // Üst başlık (parent) toggle'ları
    const parentTriggers = document.querySelectorAll('.accordion-parent-trigger');

    parentTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            // Bu parent'ın children container'ını bul
            const parent = this.closest('.accordion-parent');
            const children = parent.querySelector('.accordion-children');

            // Toggle
            this.classList.toggle('active');
            if (children) {
                children.classList.toggle('open');
            }

            // Opsiyonel: Diğer açık parent'ları kapat (accordion davranışı)
            // parentTriggers.forEach(otherTrigger => {
            //     if (otherTrigger !== this) {
            //         otherTrigger.classList.remove('active');
            //         const otherChildren = otherTrigger.closest('.accordion-parent').querySelector('.accordion-children');
            //         if (otherChildren) otherChildren.classList.remove('open');
            //     }
            // });
        });
    });
});
