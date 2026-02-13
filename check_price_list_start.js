const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFileSync('price_list_start.txt', pdfParser.getRawTextContent());
    console.log('Extracted price list start');
});

pdfParser.loadPDF('C:/Users/pc/Desktop/PriceList_2025_GBP.pdf');
// Using loadPDF which extracts the whole thing but I only need to see the start.
// Actually pdf2json doesn't have a 'max pages' in loadPDF easily.
