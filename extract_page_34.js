const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    // Sayfa 34 civarını bulalım. 
    // Sayfalar -- 34 of 772 -- şeklinde ayrılıyor
    const parts = text.split(/-- (\d+) of 772 --/);
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "34") {
            console.log('--- Page 34 Content ---');
            console.log(parts[i + 1]);
            break;
        }
    }
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
