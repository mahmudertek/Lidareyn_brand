const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    const index = text.indexOf("366");
    if (index !== -1) {
        console.log('--- Context of 366 ---');
        console.log(text.substring(index - 200, index + 200));
    } else {
        console.log('366 not found');
    }
    process.exit();
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
