const fs = require('fs');
const pdf = require('node-pdf-parse'); // Eğer isim çakışması varsa

async function test() {
    try {
        const pdfParse = require('pdf-parse');
        // Bazı paketlerde export şekli şöyledir:
        const parse = pdfParse.default || (typeof pdfParse === 'function' ? pdfParse : null);

        console.log('Parse function:', typeof parse);
    } catch (e) { }
}
test();
