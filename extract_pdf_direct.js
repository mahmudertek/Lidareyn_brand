const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function extractText() {
    const data = new Uint8Array(fs.readFileSync('c:/Users/pc/Desktop/GP_ENG_2025.pdf'));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    let fullText = '';

    console.log(`PDF loaded. Total pages: ${pdf.numPages}`);

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map(item => item.str);
        fullText += strings.join(' ') + '\n';
        if (i % 50 === 0) console.log(`Processed ${i} pages...`);
    }

    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt', fullText);
    console.log('Done! Text saved to pdf_text_output.txt');
}

extractText().catch(console.error);
