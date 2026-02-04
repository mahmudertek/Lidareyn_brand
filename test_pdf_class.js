const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
    try {
        let dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
        // Sadece ilk kısımları parse edelim hız için (Eğer mümkünse)
        // pdf-parse genelde tümünü bitirir.
        const instance = new pdf.PDFParse(dataBuffer);
        // Bu kütüphane bazen olay bazlı çalışır.
        console.log('Instance created:', typeof instance);
        // Genelde instance.text veya benzeridir.
    } catch (err) {
        console.error('Hata:', err);
    }
}
run();
