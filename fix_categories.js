const xlsx = require('xlsx');

const excelPath = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_FINAL.xlsx';

console.log('=== KATEGORİ EŞLEŞTİRME VE TÜRKÇELEŞTIRME ===\n');

// Sitedeki kategoriler (Türkçe)
const siteCategories = {
    'Hırdavat ve El Aletleri': [
        'Anahtarlar & Vidalama',
        'Kesme & Şekillendirme',
        'Vurma & Sabitleme',
        'Kavrama ve İnce İşçilik Penseleri'
    ],
    'Ölçme ve Kontrol Aletleri': [
        'Lazerli Ölçüm',
        'Mekanik Ölçüm',
        'Terazi & Açı',
        'Görüntüleme'
    ],
    'İş Güvenliği ve Çalışma Ekipmanları': [
        'Koruyucu Giyim',
        'Ayak & Baş Koruma',
        'Göz & Kulak Koruma',
        'Çalışma Ekipmanları'
    ],
    'Aksesuarlar': [
        'Testere Uçları',
        'Delik Delme',
        'Matkap & Vidalama Uçları'
    ],
    'Elektrikli El Aletleri ve Aksesuarları': [
        'Delme & Vidalama',
        'Kesme & Taşlama',
        'Yüzey İşleme',
        'Diğer Makineler'
    ],
    'Aşındırıcı ve Kesici Uçlar': [
        'Delici & Vidalama',
        'Kesme & Taşlama',
        'Aşındırma ve Zımpara'
    ]
};

// İngilizce -> Türkçe kategori eşleştirmesi
const categoryMapping = {
    // Ana kategoriler
    'Pliers and Nippers': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Kavrama ve İnce İşçilik Penseleri' },
    'Screwdrivers': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Anahtarlar & Vidalama' },
    'Wrenches': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Anahtarlar & Vidalama' },
    'Sockets and Accessories': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Anahtarlar & Vidalama' },
    'Torque Wrenches': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Anahtarlar & Vidalama' },
    'Hammers and Chisels': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Vurma & Sabitleme' },
    'Drilling and Threading': { kategori: 'Aşındırıcı ve Kesici Uçlar', altKategori: 'Delici & Vidalama' },
    'Measuring and Marking': { kategori: 'Ölçme ve Kontrol Aletleri', altKategori: 'Mekanik Ölçüm' },
    'Workshop Equipment': { kategori: 'İş Güvenliği ve Çalışma Ekipmanları', altKategori: 'Çalışma Ekipmanları' },
    'Plumbing Tools': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Kesme & Şekillendirme' },
    'Beta Tools': { kategori: 'Hırdavat ve El Aletleri', altKategori: 'Anahtarlar & Vidalama' },
};

// Excel'i oku
const workbook = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

console.log(`Toplam ürün: ${rows.length}\n`);

// İstatistikler
const stats = {
    mapped: 0,
    unmapped: 0,
    byCategory: {}
};

// Her satırı güncelle
rows.forEach(row => {
    const oldKategori = row['Kategori'] || '';
    const oldAltKategori = row['AltKategori'] || '';

    if (categoryMapping[oldKategori]) {
        const mapping = categoryMapping[oldKategori];
        row['Kategori'] = mapping.kategori;
        row['AltKategori'] = mapping.altKategori;
        stats.mapped++;

        // İstatistik
        if (!stats.byCategory[mapping.kategori]) {
            stats.byCategory[mapping.kategori] = 0;
        }
        stats.byCategory[mapping.kategori]++;
    } else if (oldKategori) {
        // Eşleşme bulunamadı, varsayılan ata
        row['Kategori'] = 'Hırdavat ve El Aletleri';
        row['AltKategori'] = 'Anahtarlar & Vidalama';
        stats.unmapped++;
    }
});

console.log('=== EŞLEŞTİRME SONUÇLARI ===');
console.log(`Eşleşen: ${stats.mapped}`);
console.log(`Varsayılan atanan: ${stats.unmapped}`);

console.log('\n=== KATEGORİ DAĞILIMI ===');
Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} ürün`);
});

// Kaydet
const newSheet = xlsx.utils.json_to_sheet(rows);
workbook.Sheets[workbook.SheetNames[0]] = newSheet;
xlsx.writeFile(workbook, excelPath);
console.log('\nDosya kaydedildi:', excelPath);

// Doğrulama
const finalCats = new Set();
rows.forEach(r => { if (r.Kategori) finalCats.add(r.Kategori); });
console.log('\n=== GÜNCEL KATEGORİLER ===');
[...finalCats].forEach(c => console.log(`  - ${c}`));
