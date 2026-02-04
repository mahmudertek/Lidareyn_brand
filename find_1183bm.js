
const XLSX = require('xlsx');
const filePath = 'c:/Users/pc/Desktop/Beta_Katalog_FINAL.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const item = data.find(r => (r.StokKodu == '1183BM' || r.SKU == '1183BM'));

    if (item) {
        console.log('FOUND 1183BM:', JSON.stringify(item, null, 2));
    } else {
        console.log('1183BM NOT FOUND in Excel');
    }
} catch (e) {
    console.error('Error:', e);
}
