// Hero Slider JavaScript
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

function showSlide(n) {
    if (slides.length === 0) return;

    if (n >= slides.length) currentSlide = 0;
    if (n < 0) currentSlide = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    currentSlide += direction;
    showSlide(currentSlide);
    resetSlideInterval();
}

function currentSlideFunc(n) {
    currentSlide = n - 1;
    showSlide(currentSlide);
    resetSlideInterval();
}

function autoSlide() {
    currentSlide++;
    showSlide(currentSlide);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, 5000);
}

// Initialize slider when page loads
document.addEventListener('DOMContentLoaded', function () {
    if (slides.length > 0) {
        showSlide(currentSlide);
        slideInterval = setInterval(autoSlide, 5000);
    }
});

// Make functions global
window.changeSlide = changeSlide;
window.currentSlide = currentSlideFunc;
