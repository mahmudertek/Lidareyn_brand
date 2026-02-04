
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const XLSX = require('xlsx');

async function convertPdfToExcel() {
    const dataBuffer = fs.readFileSync('C:\\Users\\pc\\Desktop\\GP_ENG_2025.pdf');
    const parser = new PDFParse({ data: dataBuffer });

    const products = [];
    const CATEGORIES = [
        { name: 'Sockets and Accessories', range: [85, 112] },
        { name: 'Pliers and Nippers', range: [124, 142] }, // I saw page 131 belongs here
        // ... more can be added, but I'll focus on demonstrating the conversion
    ];

    // For demonstration, let's process pages 130-135 (Pliers)
    const startPage = 130;
    const endPage = 135;

    for (let p = startPage; p <= endPage; p++) {
        console.log(`Processing page ${p}...`);
        const result = await parser.getText({ partial: [p] });
        const lines = result.text.split('\n');

        let currentModel = '';
        let currentDescriptions = [];

        // Find descriptions (usually lower part of the page)
        // Descriptions often follow a pattern where they describe the model
        // In the sample, they were like "straight wide blade tinsmith’s pliers,"

        const pageData = [];

        lines.forEach(line => {
            const skuMatch = line.match(/(\d\s)?(\d{9})/);
            if (skuMatch) {
                const sku = skuMatch[2];
                const parts = line.trim().split(/\s+/);
                const specs = parts.slice(0, parts.length - 1).join(' ');
                pageData.push({
                    sku,
                    specs,
                    model: currentModel
                });
            } else if (line.includes('|*') || line.includes('|')) {
                const modelMatch = line.match(/\|\**\s*(\d+\w*)/);
                if (modelMatch) {
                    currentModel = 'Beta ' + modelMatch[1];
                }
            } else if (line.length > 20 && !line.includes(' of 772') && !line.match(/^\d+$/)) {
                // Potential description
                currentDescriptions.push(line.trim());
            }
        });

        // Try to match pageData with descriptions
        // For simplicity in this demo, we'll just use the pageData
        pageData.forEach(item => {
            products.push({
                "StokKodu": item.sku,
                "UrunAdi": `${item.model} ${item.specs}`.trim(),
                "Marka": "Beta",
                "Fiyat": 1, // Placeholder
                "IndirimliFiyat": "",
                "Stok": 100,
                "Kategori": "El Aletleri",
                "AltKategori": "Pense ve Yan Keskiler",
                "Aciklama": `${item.model} - ${item.specs}`,
                "Birim": "adet",
                "GorselURL": "",
                "Aktif": "Evet",
                "PopulerMi": "Hayır",
                "YeniMi": "Hayır",
                "OneCikan": "Hayır",
                "CokSatan": "Hayır",
                "MarkaVitrini": ""
            });
        });
    }

    await parser.destroy();

    // Create Excel
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Urunler");

    const outputPath = 'C:\\Users\\pc\\Desktop\\Beta_Katalog_Urunler.xlsx';
    XLSX.writeFile(wb, outputPath);
    console.log(`Excel file created at ${outputPath}`);
}

convertPdfToExcel().catch(err => {
    console.error('Conversion Error:', err);
});
