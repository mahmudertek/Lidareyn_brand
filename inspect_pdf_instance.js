const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
    try {
        let dataBuffer = fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf');
        const instance = new pdf.PDFParse(dataBuffer);
        console.log('Keys:', Object.keys(instance));
        // Eğer asenkron ise promise dönebilir
        if (instance.then) {
            const data = await instance;
            console.log('Got data from then');
        }
    } catch (err) {
        console.error('Hata:', err);
    }
}
run();
