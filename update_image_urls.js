const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx';

console.log('Görsel URL\'leri güncelleniyor...');

const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

let updatedCount = 0;

rows.forEach(row => {
    if (row['GorselDosyaAdi']) {
        // Görsel URL'sini oluştur
        const filename = row['GorselDosyaAdi'];
        row['GorselURL'] = `gorseller/products/${filename}`;
        updatedCount++;
    }
});

console.log(`${updatedCount} ürünün görsel URL'si güncellendi.`);

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[workbook.SheetNames[0]] = newSheet;
xlsx.writeFile(workbook, excelPath);
console.log('Dosya kaydedildi:', excelPath);

// Örnek göster
console.log('\nÖrnek GorselURL:');
rows.filter(r => r.GorselURL).slice(0, 5).forEach(r => {
    console.log(`  ${r.StokKodu}: ${r.GorselURL}`);
});
