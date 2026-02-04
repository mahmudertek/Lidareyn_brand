
const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const raw = pdfParser.getRawTextContent();
    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', raw);
    console.log("PDF extraction complete. Length:", raw.length);
});

console.log("Starting extraction...");
pdfParser.loadPDF("c:/Users/pc/Desktop/PriceList_2025_GBP.pdf");
