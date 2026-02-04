const pdf = require('pdf-parse');
console.log('Type of pdf export:', typeof pdf);
if (typeof pdf === 'object') {
    if (pdf.PDFParse) {
        console.log('pdf.PDFParse is:', typeof pdf.PDFParse);
    } else {
        console.log('PDFParse property not found');
    }

    // Check if it's a default export
    if (pdf.default) {
        console.log('pdf.default is:', typeof pdf.default);
    }
}
