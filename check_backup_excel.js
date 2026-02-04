
const XLSX = require('xlsx');
const filePath = 'c:/Users/pc/Desktop/Lidareyn_Urunler_2026-02-02.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Find item with SKU containing 1183BM
    const item = data.find(r => {
        const sku = String(r.StokKodu || r.SKU || '');
        return sku.includes('1183BM');
    });

    if (item) {
        console.log('FOUND in Lidareyn_Urunler:', JSON.stringify(item, null, 2));
    } else {
        console.log('NOT FOUND in Lidareyn_Urunler');
    }
} catch (e) {
    console.error('Error:', e);
}
