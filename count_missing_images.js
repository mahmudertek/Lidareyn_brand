
const XLSX = require('xlsx');

const filePath = 'c:/Users/pc/Desktop/Beta_Katalog_REVİZE_v2.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const items = XLSX.utils.sheet_to_json(sheet);

    let noImageCount = 0;
    const missingImageSkus = [];

    items.forEach(item => {
        const img = item.GorselURL || '';
        // Check if empty, or is a placeholder, or just very short
        if (!img || img.trim() === '' || img.includes('placehold.co') || img.includes('placeholder.com')) {
            noImageCount++;
            if (missingImageSkus.length < 5) {
                missingImageSkus.push(item.StokKodu || item.SKU);
            }
        }
    });

    console.log(`Toplam Ürün Sayısı: ${items.length}`);
    console.log(`Görselsiz Ürün Sayısı: ${noImageCount}`);
    if (noImageCount > 0) {
        console.log(`Örnek Görselsiz SKU'lar: ${missingImageSkus.join(', ')}...`);
    }

} catch (e) {
    console.error('Hata:', e);
}
