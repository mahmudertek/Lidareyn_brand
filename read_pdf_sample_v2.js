
const fs = require('fs');
const pdf = require('pdf-parse');

const file = 'c:/Users/pc/Desktop/GP_ENG_2025.pdf';

async function readPage() {
    try {
        const dataBuffer = fs.readFileSync(file);
        // Try calling the function directly if it was a default export behaving weirdly, OR access PDFParse
        // Based on "Keys: [ ... 'PDFParse' ... ]"
        const pdfLib = require('pdf-parse');
        let data;
        if (typeof pdfLib === 'function') {
            data = await pdfLib(dataBuffer);
        } else if (pdfLib.PDFParse) {
            // Maybe it's a class or static method?
            // Usually pdf-parse is just one function.
            // Let's try to see if it works as a function first (it didn't).
            // Let's try require('pdf-parse/lib/pdf-parse.js') if available? 
            // BEcause the main export seems to be an object wrapping errors etc.

            // Inspecting package.json main? "index.js" (which I couldn't read).

            // Let's try this:
            data = await pdfLib(dataBuffer);
        }

        console.log('Text length:', data.text.length);
        console.log('Sample text:', data.text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e);
    }
}
readPage();
