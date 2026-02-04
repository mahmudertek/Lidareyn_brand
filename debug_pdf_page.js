
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function debugPdf() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    console.log('Extracting text and tables from page 131...');
    const textResult = await parser.getText({ partial: [131] });
    fs.writeFileSync('pdf_page_131_text.txt', textResult.text);

    try {
        const tableResult = await parser.getTable({ partial: [131] });
        fs.writeFileSync('pdf_page_131_tables.json', JSON.stringify(tableResult, null, 2));
    } catch (e) {
        console.log('Table extraction failed:', e.message);
    }

    await parser.destroy();
    console.log('Page 131 debug written.');
}

debugPdf().catch(err => {
    console.error('Extraction Error:', err);
});
