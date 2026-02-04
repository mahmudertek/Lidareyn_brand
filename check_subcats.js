const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

const subcats = {};
rows.forEach(r => {
    const k = r.AltKategori || 'BOŞ';
    if (!subcats[k]) subcats[k] = 0;
    subcats[k]++;
});

let output = '=== EXCEL ALT KATEGORİ DAĞILIMI ===\n\n';

let total = 0;
Object.entries(subcats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    output += `${k}: ${v}\n`;
    total += v;
});

output += `\n=== TOPLAM: ${total} ürün ===\n`;
output += `Excel satır sayısı: ${rows.length}\n`;

fs.writeFileSync('c:\\Users\\pc\\Desktop\\subcat_report.txt', output);
console.log(output);
