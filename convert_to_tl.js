const xlsx = require('xlsx');

const filePath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_HAZIR.xlsx';
const KUR = 41; // İskontolu kur

console.log(`Fiyatlar ${KUR} ile çarpılıyor...`);

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

let updatedCount = 0;

rows.forEach(row => {
    if (row['FiyatListesi_GBP'] && row['FiyatListesi_GBP'] > 0) {
        const gbpPrice = row['FiyatListesi_GBP'];
        const tlPrice = Math.round(gbpPrice * KUR); // Tam sayıya yuvarla
        row['Fiyat'] = tlPrice;
        updatedCount++;
    }
});

console.log(`${updatedCount} satır güncellendi.`);

// Örnek göster
console.log('\nÖrnek fiyatlar (GBP -> TL):');
rows.slice(0, 10).forEach((r, i) => {
    if (r['FiyatListesi_GBP']) {
        console.log(`${r.StokKodu}: ${r.FiyatListesi_GBP} GBP -> ${r.Fiyat} TL`);
    }
});

const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[sheetName] = newSheet;
xlsx.writeFile(workbook, filePath);
console.log('\nDosya kaydedildi:', filePath);
