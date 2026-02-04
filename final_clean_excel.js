
const XLSX = require('xlsx');

const INPUT_PATH = 'c:/Users/pc/Desktop/Beta_Katalog_REVİZE_v2.xlsx';
const OUTPUT_PATH = 'c:/Users/pc/Desktop/Beta_Katalog_FINAL_CLEANED.xlsx';

const CATEGORY_MAP = {
    "Alyan Anahtarlar": "Alyan Anahtar",
    "Anahtarlar & Vidalama": "Anahtar ve Vidalama Aleti",
    "Ayarlı Anahtarlar": "Ayarlı Anahtar",
    "Diş Açma Takımları": "Diş Açma Takımı",
    "Eğe ve Törpüler": "Eğe",
    "Hidrolik Aletler": "Hidrolik Alet",
    "Kavrama ve İnce İşçilik Penseleri": "Kavrama Pensesi",
    "Kombine Anahtarlar": "Kombine Anahtar",
    "Lokma Takımları": "Lokma",
    "Matkap Uçları": "Matkap Ucu",
    "Mekanik Ölçüm": "Ölçüm Aleti",
    "Otomotiv Aletleri": "Otomotiv Aleti",
    "Penseler": "Pense",
    "Pnömatik Aletler": "Pnömatik Alet",
    "Takım Dolapları": "Takım Dolabı",
    "Takım Setleri": "Takım Seti",
    "Takım Çantaları": "Takım Çantası",
    "Testere ve Kesiciler": "Kesici Alet",
    "Tornavidalar": "Tornavida",
    "Yedek Parçalar": "Yedek Parça",
    "Çalışma Ekipmanları": "Çalışma Ekipmanı",
    "Çekiç ve Keskiler": "Çekiç",
    "Özel Aletler": "Özel Alet",
    "İzoleli Aletler": "İzoleli Alet"
};

function process() {
    console.log("Reading...");
    const workbook = XLSX.readFile(INPUT_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let items = XLSX.utils.sheet_to_json(sheet);

    console.log(`Original Count: ${items.length}`);

    // 1. FILTER: Has Image
    const withImages = items.filter(item => {
        const url = item.GorselURL;
        return url &&
            typeof url === 'string' &&
            url.length > 10 &&
            !url.includes('placeholder.com') &&
            !url.includes('placehold.co');
        // Also check specific missing ones if any
    });

    console.log(`With Images: ${withImages.length} (Deleted ${items.length - withImages.length})`);

    // 2. RENAME & DESCRIBE
    const processed = withImages.map(item => {
        const sku = String(item.StokKodu || item.SKU || '').trim();
        const cat = String(item.AltKategori || '').trim();

        let singularName = CATEGORY_MAP[cat] || cat.replace(/lar$|ler$/i, ''); // Fallback singularization

        // Refine name based on content if "Lokma" or "Çekiç" logic needed
        if (singularName === 'Lokma' && (item.UrunAdi || '').toLowerCase().includes('set')) {
            singularName = 'Lokma Takımı';
        }
        if (singularName === 'Çekiç' && (item.UrunAdi || '').toLowerCase().includes('keski')) {
            singularName = 'Keski';
        }

        // NEW NAME
        item.UrunAdi = `Beta ${sku} ${singularName}`;

        // NEW DESCRIPTION
        // "Beta markalı 1183BM Ayarlı Anahtar. Profesyonel..."
        item.Aciklama = `Beta markalı ${sku} kodlu ${singularName}. Profesyonel endüstriyel kullanım için yüksek standartlarda üretilmiştir. Dayanıklı yapısı ve ergonomik tasarımı ile uzun ömürlü kullanım sağlar.`;

        // Clean text
        item.UrunAdi = item.UrunAdi.replace(/\s+/g, ' ').trim();

        return item;
    });

    // Save
    const newSheet = XLSX.utils.json_to_sheet(processed);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Ürünler");
    XLSX.writeFile(newWorkbook, OUTPUT_PATH);
    console.log(`Saved to ${OUTPUT_PATH}`);
}

process();
