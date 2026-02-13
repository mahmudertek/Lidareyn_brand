const fs = require('fs');
const pdfLib = require('pdf-parse/node');

console.log('Type of pdfLib:', typeof pdfLib);
console.log('Is function:', typeof pdfLib === 'function');
console.log('Keys:', Object.keys(pdfLib));

const dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');

// Based on typical usage of this newer pdf-parse
if (typeof pdfLib === 'function') {
    pdfLib(dataBuffer).then(data => {
        fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', data.text);
        console.log("Success! Text extracted.");
    }).catch(console.error);
} else if (pdfLib.parse) {
    pdfLib.parse(dataBuffer).then(data => {
        fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', data.text);
        console.log("Success with .parse!");
    }).catch(console.error);
} else {
    console.log('Could not find a valid parse function');
}
