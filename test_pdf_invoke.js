const pdfLib = require('pdf-parse');

async function test() {
    const fs = require('fs');
    // Read a tiny part of file or use a dummy buffer if possible? 
    // pdf-parse needs valid PDF header usually.
    // Use the real file.
    const buf = fs.readFileSync('c:\\Users\\pc\\Desktop\\PriceList_2025_GBP.pdf');

    // Try finding the constructor
    let PDFParser = pdfLib;
    if (typeof pdfLib === 'object' && pdfLib.PDFParse) PDFParser = pdfLib.PDFParse;

    console.log('Type:', typeof PDFParser);

    // Try without new (Standard)
    try {
        console.log('Attempt 1: function call');
        const res = await PDFParser(buf, { max: 1 });
        console.log('Success 1. Text length:', res.text.length);
        return;
    } catch (e) {
        console.log('Fail 1:', e.message);
    }

    // Try with new
    try {
        console.log('Attempt 2: new Class()');
        // If it's a class, we instantiate it. Does it return a promise?
        // Or does it have methods?
        const instance = new PDFParser(buf);
        console.log('Instance created.', instance);
        if (instance.then) {
            const res = await instance;
            console.log('Success 2 (Promise). Text len:', res.text.length);
        } else {
            console.log('Instance is not a promise. Keys:', Object.keys(instance));
        }
    } catch (e) {
        console.log('Fail 2:', e.message);
    }
}
test();
