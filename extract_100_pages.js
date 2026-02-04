const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const text = pdfParser.getRawTextContent();
    // İlk 100 sayfayı alalım
    const pages = text.split(/-- \d+ of 772 --/);
    const subset = pages.slice(0, 101).join('\n--- PAGE BREAK ---\n');
    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/katalog_ilk_100_sayfa.txt', subset);
    console.log('Bitti! İlk 100 sayfa kaydedildi.');
    process.exit();
});

pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
setTimeout(() => { console.log('Timeout'); process.exit(); }, 180000); // 3 dk
