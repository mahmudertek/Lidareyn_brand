const fs = require('fs');
const pdfLib = require('pdf-parse');

console.log('Type of pdfLib:', typeof pdfLib);
console.log('Keys:', Object.keys(pdfLib));

const dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');

let parser = pdfLib;
if (typeof parser !== 'function' && parser.default) {
    parser = parser.default;
}

if (typeof parser === 'function') {
    console.log('Parsing...');
    parser(dataBuffer).then(function (data) {
        fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', data.text);
        console.log("Success! Text length:", data.text.length);
    }).catch(e => console.error(e));
} else {
    console.error('pdf-parse is not a function!');
}
