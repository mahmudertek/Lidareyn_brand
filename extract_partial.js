const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    console.log('--- TEXT ---');
    console.log(text.substring(0, 5000));
    process.exit();
});

// maxPages parametresi var mı? Hayır ama loadPDF ile 
pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
// Bir süreliğine durdurup ilk sayfaları alabiliriz
setTimeout(() => {
    console.log('Timeout - forcing stop');
    process.exit();
}, 10000);
