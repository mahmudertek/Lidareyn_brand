const fs = require('fs');

async function run() {
    try {
        const pdf = await import('pdf-parse');
        const PDFParse = pdf.PDFParse;
        let dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');

        // PDFParse bir class ise new ile çağıralım
        const data = await new PDFParse(dataBuffer);
        console.log('Metin uzunluğu:', data.text.length);
        console.log(data.text.substring(0, 2000));
    } catch (err) {
        console.error('Hata:', err);
    }
}

run();
