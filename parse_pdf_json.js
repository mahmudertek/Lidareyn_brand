
const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const raw = pdfParser.getRawTextContent();
    console.log("Text length:", raw.length);

    // Search for 1183BM
    const index = raw.indexOf("1183BM");
    if (index !== -1) {
        console.log("Found 1183BM!");
        console.log("Context:", raw.substring(index - 100, index + 300));
    } else {
        console.log("1183BM NOT FOUND");
    }
});

pdfParser.loadPDF("c:/Users/pc/Desktop/PriceList_2025_GBP.pdf");
