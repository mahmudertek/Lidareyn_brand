
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function debugPdf() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    console.log('Extracting text from page 741...');
    const textResult = await parser.getText({ partial: [741, 742, 743] });
    fs.writeFileSync('pdf_index_sample.txt', textResult.text);

    await parser.destroy();
    console.log('Index sample written.');
}

debugPdf().catch(err => {
    console.error('Extraction Error:', err);
});
