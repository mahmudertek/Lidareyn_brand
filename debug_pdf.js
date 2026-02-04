const fs = require('fs');

async function run() {
    try {
        const pdf = require('fpdf-parse'); // Yanlış isim mi? Hayır pdf-parse olmalı
    } catch (e) { }

    // Klasik yönteme geri dönelim ama debug ile
    const pdfLib = require('pdf-parse');
    console.log('Tipe:', typeof pdfLib);
    console.log('Anahtarlar:', Object.keys(pdfLib));
}
run();
