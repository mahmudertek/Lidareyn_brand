const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    const pages = text.split(/-- (\d+) of 772 --/);
    for (let i = 0; i < pages.length; i++) {
        if (pages[i] === "45") {
            const content = pages[i + 1];
            fs.writeFileSync('catalog_page_45.txt', content);
            console.log('Extracted page 45');
            break;
        }
    }
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
