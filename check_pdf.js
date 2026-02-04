
const fs = require('fs');
const pdf = require('pdf-parse');

async function checkPdf() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const options = {
        max: 5 // Only first 5 pages
    };
    try {
        const data = await pdf(dataBuffer, options);
        console.log('Pages:', data.numpages);
        console.log('Text Content (first 5 pages):');
        console.log(data.text.substring(0, 2000));
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

checkPdf();
