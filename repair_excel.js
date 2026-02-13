const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Paths
const INPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_CLEANED.xlsx';
const MAPPING_PATH = 'c:/Users/pc/Desktop/Lidareyn_brand/image_mapping.json';
const OUTPUT_PATH = 'C:/Users/pc/Desktop/Beta_Katalog_TAMIR_EDILDI.xlsx';

async function repairExcel() {
    console.log("?? Excel dosyası okunuyor...");

    if (!fs.existsSync(INPUT_PATH)) {
        console.error(`?? Hata: ${INPUT_PATH} bulunamadı!`);
        return;
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
    const skuToImg = {};
    mapping.forEach(m => {
        skuToImg[String(m.sku).trim().toLowerCase()] = m.img;
    });

    const workbook = XLSX.readFile(INPUT_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const items = XLSX.utils.sheet_to_json(sheet);

    console.log(`?? ${items.length} ürün işleniyor...`);

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

    const processed = items.map(item => {
        const sku = String(item.StokKodu || item.SKU || '').trim().toLowerCase();
        const currentUrl = String(item.GorselURL || '');

        // 1. GÖRSEL TAMİRİ
        const isBadUrl = currentUrl.includes('[Görsel Verisi') ||
            currentUrl.startsWith('data:image') ||
            currentUrl === 'undefined' ||
            currentUrl === '' ||
            currentUrl === 'null';

        if (isBadUrl) {
            if (skuToImg[sku]) {
                item.GorselURL = `/gorseller/beta/${skuToImg[sku]}`;
            } else {
                // SKU'da tire veya slash varsa temizleyip ara
                const cleanSku = sku.replace(/[\/-]/g, '');
                if (skuToImg[cleanSku]) {
                    item.GorselURL = `/gorseller/beta/${skuToImg[cleanSku]}`;
                } else {
                    item.GorselURL = `/gorseller/beta/beta_${sku.replace(/[^a-z0-9]/g, '_')}.jpg`;
                }
            }
        }

        // 2. İSİM VE AÇIKLAMA DÜZENLEME
        const cat = String(item.AltKategori || '').trim();
        let singularName = CATEGORY_MAP[cat] || cat.replace(/lar$|ler$/i, '');

        // İsmi temizle ve "Beta [SKU] [Ürün Tipi]" yap
        const baseName = `Beta ${sku.toUpperCase()} ${singularName}`;
        item.UrunAdi = baseName.replace(/\s+/g, ' ').trim();

        // Ölçü bilgisini ekle
        let measure = String(item.Olcu || '').trim();
        if (measure && measure !== 'undefined' && !item.UrunAdi.includes(measure)) {
            item.UrunAdi += ` - ${measure}`;
        }

        // Açıklamayı profesyonel yap
        const sizeText = measure ? ` Ölçü: ${measure}.` : '';
        item.Aciklama = `Beta markalı ${singularName}.${sizeText} Profesyonel endüstriyel kullanım için yüksek standartlarda üretilmiştir. Dayanıklı yapısı ve ergonomik tasarımı ile uzun ömürlü kullanım sağlar.`.replace(/\s+/g, ' ').trim();

        // 3. DİĞER TEMİZLİKLER
        item.Marka = "Beta";
        item.Birim = "adet";
        item.Aktif = "Evet";

        return item;
    });

    const newWs = XLSX.utils.json_to_sheet(processed);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newWs, "Ürünler");
    XLSX.writeFile(newWb, OUTPUT_PATH);

    console.log(`\n? İŞLEM TAMAMLANDI!`);
    console.log(`?? Kaydedilen Dosya: ${OUTPUT_PATH}`);
}

repairExcel().catch(err => console.error("?? Hata:", err));
