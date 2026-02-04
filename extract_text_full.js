const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/full_pdf_text.txt', text);
    console.log('Bitti! Kaydedildi.');
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
