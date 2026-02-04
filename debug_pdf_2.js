const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
    try {
        let dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
        // PDFParse bir class dır.
        const instance = new pdf.PDFParse(dataBuffer);
        // Bu kütüphane bazen senkron bazen asenkron çalışır
        // Ama genellikle parse fonksiyonu kullanılır.
        // package.json'a bakalım kütüphane sürümü ne?
    } catch (err) {
        console.error(err);
    }
}
run();
