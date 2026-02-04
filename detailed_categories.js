const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx';

console.log('=== DETAYLI ALT KATEGORİ ATAMASI ===\n');

// Beta Tools ürün türlerine göre alt kategori haritası
const productTypeMapping = {
    // Anahtarlar
    'wrench': 'Anahtarlar',
    'spanner': 'Anahtarlar',
    'key': 'Anahtarlar',
    'allen': 'Alyan Anahtarlar',
    'hex': 'Alyan Anahtarlar',
    'torque': 'Tork Anahtarları',
    'ratchet': 'Cırcır Anahtarlar',
    'adjustable': 'Ayarlı Anahtarlar',
    'combination': 'Kombine Anahtarlar',
    'ring': 'Yıldız Anahtarlar',
    'open end': 'Açık Ağız Anahtarlar',

    // Lokma ve Aksesuarlar
    'socket': 'Lokma Takımları',
    'bit': 'Uç Setleri',
    'extension': 'Uzatma Kolları',
    'adapter': 'Adaptörler',

    // Tornavidalar
    'screwdriver': 'Tornavidalar',
    'phillips': 'Yıldız Tornavidalar',
    'slotted': 'Düz Tornavidalar',
    'pozidriv': 'Pozidriv Tornavidalar',
    'torx': 'Torx Tornavidalar',

    // Penseler
    'plier': 'Penseler',
    'nipper': 'Kerpeten',
    'cutter': 'Kesici Penseler',
    'long nose': 'Sivri Uç Penseler',
    'needle nose': 'Sivri Uç Penseler',
    'grip': 'Mengene Penseler',
    'locking': 'Kilitli Penseler',
    'slip joint': 'Pense',
    'circlip': 'Segman Penseleri',

    // Çekiçler
    'hammer': 'Çekiçler',
    'mallet': 'Tokmaklar',
    'chisel': 'Keskiler',
    'punch': 'Zımbalar',

    // Ölçüm
    'tape': 'Metre',
    'ruler': 'Cetveller',
    'caliper': 'Kumpaslar',
    'gauge': 'Mastarlar',
    'level': 'Su Terazileri',
    'measure': 'Ölçüm Aletleri',

    // İş Ekipmanları
    'trolley': 'Takım Arabaları',
    'cabinet': 'Takım Dolapları',
    'tool box': 'Takım Çantaları',
    'tool chest': 'Takım Sandıkları',
    'workbench': 'Çalışma Tezgahları',

    // Delme & Diş Açma
    'drill': 'Matkap Uçları',
    'tap': 'Kılavuz Setleri',
    'die': 'Pafta Setleri',
    'threading': 'Diş Açma',

    // Kesme
    'saw': 'Testereler',
    'blade': 'Testere Bıçakları',
    'file': 'Eğeler',
    'rasp': 'Törpüler',

    // Boru Aletleri
    'pipe': 'Boru Anahtarları',
    'tube': 'Boru Kesiciler',
    'flare': 'Boru Genişleticiler',

    // Elektrik
    'insulated': 'İzoleli Aletler',
    'cable': 'Kablo Aletleri',
    'crimping': 'Sıkma Penseleri',
    'stripper': 'Sıyırma Aletleri'
};

// Excel'i oku
const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

console.log(`Toplam ürün: ${rows.length}\n`);

// Her ürün için daha spesifik alt kategori ata
let updatedCount = 0;
const subCategoryCounts = {};

rows.forEach(row => {
    const name = (row['UrunAdi'] || '').toLowerCase();
    const currentSubCat = row['AltKategori'] || '';

    // Ürün adına göre en uygun alt kategoriyi bul
    let bestMatch = null;
    let matchLength = 0;

    for (const [keyword, subCat] of Object.entries(productTypeMapping)) {
        if (name.includes(keyword) && keyword.length > matchLength) {
            bestMatch = subCat;
            matchLength = keyword.length;
        }
    }

    if (bestMatch) {
        row['AltKategori'] = bestMatch;
        updatedCount++;

        if (!subCategoryCounts[bestMatch]) subCategoryCounts[bestMatch] = 0;
        subCategoryCounts[bestMatch]++;
    }
});

console.log(`${updatedCount} ürünün alt kategorisi güncellendi.\n`);

console.log('=== YENİ ALT KATEGORİ DAĞILIMI ===');
Object.entries(subCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} ürün`);
    });

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[workbook.SheetNames[0]] = newSheet;
xlsx.writeFile(workbook, excelPath);
console.log('\nDosya kaydedildi:', excelPath);
