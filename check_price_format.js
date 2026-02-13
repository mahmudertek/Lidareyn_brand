const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFileSync('price_list_sample.txt', pdfParser.getRawTextContent());
    console.log('Extracted sample text');
});

pdfParser.loadPDF('C:/Users/pc/Desktop/PriceList_2025_GBP.pdf');
