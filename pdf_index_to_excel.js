
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const XLSX = require('xlsx');

const RANGES = [
    { cat: 'Workshop Equipment', sub: 'General', pages: [[416, 440], [488, 491], [51, 53], [43, 51], [41, 43], [36, 41]] },
    { cat: 'Sockets and Accessories', sub: 'General', pages: [[85, 112], [69, 78]] },
    { cat: 'Screwdrivers', sub: 'General', pages: [[143, 157], [115, 117], [78, 85], [18, 23]] },
    { cat: 'Pliers and Nippers', sub: 'General', pages: [[112, 117], [23, 28], [11, 17], [126, 133], [137, 140]] },
    { cat: 'Torque Wrenches', sub: 'General', pages: [[164, 167], [9, 10]] },
    { cat: 'Wrenches', sub: 'General', pages: [[57, 69], [54, 56]] },
    { cat: 'Hammers and Chisels', sub: 'General', pages: [[178, 178], [156, 157], [121, 122]] },
    { cat: 'Drilling and Threading', sub: 'General', pages: [[204, 204], [213, 223]] },
    { cat: 'Measuring and Marking', sub: 'General', pages: [[233, 237]] },
    { cat: 'Plumbing Tools', sub: 'General', pages: [[146, 149], [140, 142], [124, 125]] },
];

function getCategory(page) {
    const p = parseInt(page);
    for (const r of RANGES) {
        for (const [start, end] of r.pages) {
            if (p >= start && p <= end) return { cat: r.cat, sub: r.sub };
        }
    }
    return { cat: 'Beta Tools', sub: 'Katalog' };
}

async function convertIndexOnly() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    console.log('Extracting Alphanumeric Index (Pages 741-755)...');
    const indexResult = await parser.getText({ partial: [741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755] });
    const lines = indexResult.text.split('\n');

    const products = [];
    const skuSeen = new Set();

    lines.forEach(line => {
        const match = line.trim().match(/^(.+?)\s+(\d+)$/);
        if (match) {
            const sku = match[1].trim();
            const page = match[2];
            const { cat, sub } = getCategory(page);

            if (!skuSeen.has(sku) && sku.length > 1 && !sku.includes('--') && !sku.includes('ALPHANUMERIC')) {
                skuSeen.add(sku);
                products.push({
                    "StokKodu": sku,
                    "UrunAdi": `Beta ${sku} Profesyonel El Aleti`,
                    "Marka": "Beta",
                    "Fiyat": 0,
                    "IndirimliFiyat": "",
                    "Stok": 100,
                    "Kategori": cat,
                    "AltKategori": sub,
                    "Aciklama": `Beta Markalı Profesyonel Ürün. Katalog Sayfası: ${page}`,
                    "Birim": "adet",
                    "GorselURL": "",
                    "Aktif": "Evet",
                    "PopulerMi": "Hayır",
                    "YeniMi": "Hayır",
                    "OneCikan": "Hayır",
                    "CokSatan": "Hayır",
                    "MarkaVitrini": ""
                });
            }
        }
    });

    await parser.destroy();

    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Urunler");

    const outputPath = 'C:\\Users\\pc\\Desktop\\Beta_Katalog_Tablo.xlsx';
    XLSX.writeFile(wb, outputPath);
    console.log(`Excel file created at ${outputPath} with ${products.length} products.`);
}

convertIndexOnly().catch(err => {
    console.error('Conversion Error:', err);
});
