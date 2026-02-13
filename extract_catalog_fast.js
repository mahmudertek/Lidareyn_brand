const fs = require('fs');
const PDFParse = require('pdf-parse');

const options = {
    max: 0,
    pagerender: function (pageData) {
        return pageData.getTextContent()
            .then(function (textContent) {
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY == item.transform[5] || !lastY) {
                        text += item.str + ' ';
                    }
                    else {
                        text += '\n' + item.str + ' ';
                    }
                    lastY = item.transform[5];
                }
                return text;
            });
    }
};

async function extractPage() {
    const dataBuffer = fs.readFileSync('C:/Users/pc/Desktop/GP_ENG_2025.pdf');
    const data = await PDFParse(dataBuffer, {
        max: 45 // Only first 45 pages to stop soon
    });
    // The library doesn't easily let us pick just one page without processing previous ones if we use high-level API
    // but we can look at the output.
    // Actually pdf-parse 'max' option means only process up to 'max' pages.
    // Page 45 text will be in data.text (but joined).
    // Let's use the 'pagerender' to separate them.
}

// Scratch that, let's use a simpler way to get page 45 text with pdf-parse.
// We can just use the page count.
const dataBuffer = fs.readFileSync('C:/Users/pc/Desktop/GP_ENG_2025.pdf');
PDFParse(dataBuffer, { max: 45 }).then(function (data) {
    // This will contain text of first 45 pages.
    // We can split by something or just look at the end.
    fs.writeFileSync('catalog_first_45.txt', data.text);
    console.log('Saved first 45 pages');
});
