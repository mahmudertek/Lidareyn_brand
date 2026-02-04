const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(null, 1);

pdfParser.on('pdfParser_dataError', errData => {
    console.error('Hata:', errData.parserError);
    process.exit(1);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
    console.log('PDF işlendi, metin alınıyor...');
    const text = pdfParser.getRawTextContent();
    fs.writeFileSync('c:/Users/pc/Desktop/Lidareyn_brand/full_pdf_text_final.txt', text);
    console.log('Bitti! Kaydedildi.');
    process.exit(0);
});

console.log('PDF yükleniyor...');
pdfParser.loadPDF('c:/Users/pc/Desktop/GP_ENG_2025.pdf');

// Uzun surerse diye zamanlayıcı
setTimeout(() => {
    console.log('Zaman aşımı! Kısmi kayıt denenebilir mi?');
    // Eğer veri hala gelmediyse yapacak bir şey yok
}, 600000); // 10 dakika
