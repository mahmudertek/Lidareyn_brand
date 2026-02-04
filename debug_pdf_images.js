
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function debugImages() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    console.log('Extracting images from page 131...');
    const imageResult = await parser.getImage({ partial: [131], imageThreshold: 50 });

    if (imageResult.pages && imageResult.pages[0] && imageResult.pages[0].images) {
        console.log(`Found ${imageResult.pages[0].images.length} images on page 131`);
        imageResult.pages[0].images.forEach((img, idx) => {
            fs.writeFileSync(`page_131_img_${idx}.png`, img.data);
        });
    } else {
        console.log('No images found on page 131');
    }

    await parser.destroy();
}

debugImages().catch(err => {
    console.error('Image Error:', err);
});
