const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(null, 1);
const outputFolder = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_pages_text';

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    // pdf2json RawTextContent yields the whole text. 
    // We want per-page if possible.
    // Actually, we can split by -- PAGE_NO of 772 -- if getRawTextContent includes it.
    const text = pdfParser.getRawTextContent();
    const pages = text.split(/-- \d+ of \d+ --/);

    pages.forEach((pageText, index) => {
        if (pageText.trim()) {
            fs.writeFileSync(path.join(outputFolder, `page_${index}.txt`), pageText);
        }
    });
    console.log(`Bitti! ${pages.length} sayfa kaydedildi.`);
});

const path = require('path');
pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
