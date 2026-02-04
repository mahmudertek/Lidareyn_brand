const { exportImages } = require('pdf-export-images');
const path = require('path');
const fs = require('fs');

const pdfPath = 'c:/Users/pc/Desktop/GP_ENG_2025.pdf';
const outputDir = 'c:/Users/pc/Desktop/Beta_Katalog_Gorseller';

async function run() {
    console.log('Başlatılıyor: ' + pdfPath);
    console.log('Kaydedilecek yer: ' + outputDir);

    try {
        const images = await exportImages(pdfPath, outputDir);
        console.log(`Başarıyla ${images.length} adet görsel ayıklandı.`);
    } catch (err) {
        console.error('Hata oluştu:', err);
    }
}

run();
