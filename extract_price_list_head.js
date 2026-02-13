const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    // Only save the first few pages
    const text = pdfParser.getRawTextContent();
    const pages = text.split(/----------------Page \(\d+\) Break----------------/);
    fs.writeFileSync('price_list_head.txt', pages.slice(0, 10).join('\n---\n'));
    console.log('Saved first 10 pages of price list');
});

pdfParser.loadPDF('C:/Users/pc/Desktop/PriceList_2025_GBP.pdf');
