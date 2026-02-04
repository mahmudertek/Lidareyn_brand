const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx';

console.log('=== BETA TOOLS SKU BAZLI KATEGORİLENDİRME ===\n');

// Beta Tools SKU numaralama sistemine göre kategori haritası
// https://www.beta-tools.com kataloğundan alınmıştır
const skuCategoryMap = [
    // 100-199: Kıskaç ve Ayarlı Anahtarlar
    { range: [100, 199], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Ayarlı Anahtarlar' },

    // 200-399: Socket / Lokma Takımları
    { range: [200, 399], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Lokma Takımları' },

    // 400-599: Anahtarlar (Kombine, Yıldız, Açık Ağız)
    { range: [400, 599], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Kombine Anahtarlar' },

    // 600-799: Tornavidalar
    { range: [600, 799], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Tornavidalar' },

    // 800-999: Alyan Anahtarlar (Hex Keys)
    { range: [800, 999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Alyan Anahtarlar' },

    // 1000-1199: Penseler
    { range: [1000, 1199], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Penseler' },

    // 1200-1399: Çekiç, Keskiler, Zımbalar
    { range: [1200, 1399], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Çekiç ve Keskiler' },

    // 1400-1599: Eğe ve Törpüler
    { range: [1400, 1599], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Eğe ve Törpüler' },

    // 1600-1799: Testere ve Kesiciler
    { range: [1600, 1799], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Testere ve Kesiciler' },

    // 1800-1999: Ölçme Aletleri
    { range: [1800, 1999], kategori: 'Ölçme ve Kontrol Aletleri', altKategori: 'Mekanik Ölçüm' },

    // 2000-2199: Diş Açma (Kılavuz, Pafta)
    { range: [2000, 2199], kategori: 'Aşındırıcı ve Kesici Uçlar', altKategori: 'Diş Açma Takımları' },

    // 2200-2399: Matkap Uçları
    { range: [2200, 2399], kategori: 'Aşındırıcı ve Kesici Uçlar', altKategori: 'Matkap Uçları' },

    // 2400-2599: Elektrik / İzoleli Aletler
    { range: [2400, 2599], kategori: 'Hırdavat ve El Aletleri', altKategori: 'İzoleli Aletler' },

    // 2600-2799: Boru Aletleri
    { range: [2600, 2799], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Boru Aletleri' },

    // 2800-2999: Tork Anahtarları
    { range: [2800, 2999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Tork Anahtarları' },

    // 3000-3499: Takım Dolapları ve Arabaları
    { range: [3000, 3499], kategori: 'İş Güvenliği ve Çalışma Ekipmanları', altKategori: 'Takım Dolapları' },

    // 3500-3999: Takım Çantaları ve Sandıkları
    { range: [3500, 3999], kategori: 'İş Güvenliği ve Çalışma Ekipmanları', altKategori: 'Takım Çantaları' },

    // 4000-4999: Hidrolik Aletler
    { range: [4000, 4999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Hidrolik Aletler' },

    // 5000-5999: Pnömatik Aletler
    { range: [5000, 5999], kategori: 'Elektrikli El Aletleri ve Aksesuarları', altKategori: 'Pnömatik Aletler' },

    // 6000-6999: Otomotiv Aletleri
    { range: [6000, 6999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Otomotiv Aletleri' },

    // 7000-7999: Özel Aletler
    { range: [7000, 7999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Özel Aletler' },

    // 8000-8999: Takım Setleri
    { range: [8000, 8999], kategori: 'Hırdavat ve El Aletleri', altKategori: 'Takım Setleri' },

    // 9000+: Aksesuar ve Yedek Parçalar
    { range: [9000, 99999], kategori: 'Aksesuarlar', altKategori: 'Yedek Parçalar' }
];

// SKU'dan sayısal kısmı çıkar
function extractNumber(sku) {
    const match = String(sku).match(/^(\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Excel'i oku
const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

console.log(`Toplam ürün: ${rows.length}\n`);

let updatedCount = 0;
const subCategoryCounts = {};

rows.forEach(row => {
    const sku = row['StokKodu'] || '';
    const skuNum = extractNumber(sku);

    if (skuNum) {
        // SKU numarasına göre kategori bul
        const mapping = skuCategoryMap.find(m => skuNum >= m.range[0] && skuNum <= m.range[1]);

        if (mapping) {
            row['Kategori'] = mapping.kategori;
            row['AltKategori'] = mapping.altKategori;
            updatedCount++;

            if (!subCategoryCounts[mapping.altKategori]) subCategoryCounts[mapping.altKategori] = 0;
            subCategoryCounts[mapping.altKategori]++;
        }
    }
});

console.log(`${updatedCount} ürün güncellendi.\n`);

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
