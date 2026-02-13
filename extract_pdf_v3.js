const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('GP_ENG_2025.pdf');

pdf(dataBuffer).then(function (data) {
    fs.writeFileSync('pdf_text_output.txt', data.text);
    console.log("PDF text extracted successfully.");
}).catch(err => {
    console.error("Error:", err);
});
