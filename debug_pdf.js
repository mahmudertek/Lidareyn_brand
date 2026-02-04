
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function debugPdf() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    console.log('Extracting text from first 5 pages...');
    const textResult = await parser.getText({ first: 5 });
    fs.writeFileSync('pdf_sample_text.txt', textResult.text);

    console.log('Extracting tables from first 5 pages...');
    try {
        const tableResult = await parser.getTable({ first: 5 });
        fs.writeFileSync('pdf_sample_tables.json', JSON.stringify(tableResult, null, 2));
    } catch (e) {
        console.log('Table extraction not supported or failed:', e.message);
    }

    await parser.destroy();
    console.log('Debug files written.');
}

debugPdf().catch(err => {
    console.error('Extraction Error:', err);
});
