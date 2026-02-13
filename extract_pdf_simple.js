const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', pdfParser.getRawTextContent());
    console.log("PDF text extracted successfully.");
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
