const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_TEXT = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_TEXT = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const BASE_EXCEL = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_CLEANED.xlsx';
const OUTPUT_EXCEL = 'C:/Users/pc/Desktop/Beta_Katalog_REVİZE_SON.xlsx';

function updateExcel() {
    console.log("?? Veriler yükleniyor...");

    // 1. Fiyat Listesini Oku (SKU -> Price)
    const priceTxt = fs.readFileSync(PRICE_TEXT, 'utf8');
    const priceMap = {};
    priceTxt.split('\n').forEach(line => {
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0].replace(/^00/, ''); // 9 haneliden 7 haneliye (Kataloğa uyum için)
            const priceMatch = line.match(/(\d+[,.]\d{2})/);
            if (priceMatch) priceMap[sku] = priceMatch[1].replace(',', '.');
        }
    });

    // 2. Katalog Detaylarını Oku (SKU -> {model, specs})
    const catalogTxt = fs.readFileSync(CATALOG_TEXT, 'utf8');
    const catalogData = {};
    let currentModel = "";
    let currentHeaders = ["Ölçü"];

    catalogTxt.split('\n').forEach(line => {
        const l = line.trim();
        const modelMatch = l.match(/^\|?\*?\s*(\d+[A-Z]*)\s*$/);
        if (modelMatch) {
            currentModel = modelMatch[1];
            // Header tahmini basitçe
            if (l.includes('mm') || l.includes('UNC')) {
                const h = l.match(/\b([LØAHD]\d?)\b/g);
                if (h) currentHeaders = h;
            }
        }

        const skuMatch = l.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0].replace(/^00/, '');
            const parts = l.split(/\s+/).filter(p => p.length > 0 && p !== skuMatch[0]);

            let specStr = "";
            for (let i = 0; i < Math.min(currentHeaders.length, parts.length); i++) {
                specStr += `${currentHeaders[i]}: ${parts[i]} `;
            }
            catalogData[sku] = { model: currentModel, specs: specStr.trim(), mainSize: parts[0] || "" };
        }
    });

    // 3. Mevcut Excel'i Güncelle
    console.log("?? Mevcut Excel güncelleniyor...");
    const workbook = XLSX.readFile(BASE_EXCEL);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const items = XLSX.utils.sheet_to_json(sheet);

    const processed = items.map(item => {
        const sku = String(item.StokKodu || '').trim().replace(/^00/, '');
        const data = catalogData[sku];

        if (data) {
            item.UrunAdi = `Beta ${sku} ${data.model} ${data.mainSize}`.trim();
            item.Aciklama = `Beta ${data.model} profesyonel kullanım için üretilmiştir. Teknik Özellikler: ${data.specs}. Yüksek dayanıklılık ve ergonomik tasarım.`.trim();
        }

        if (priceMap[sku]) {
            item.Fiyat = priceMap[sku];
        }

        // Görsel iyileştirme
        if (!item.GorselURL || item.GorselURL.includes('Çok Büyük')) {
            item.GorselURL = `/gorseller/beta/${sku}.png`;
        }

        item.Marka = "Beta";
        return item;
    });

    const newWs = XLSX.utils.json_to_sheet(processed);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newWs, "Ürünler");
    XLSX.writeFile(newWb, OUTPUT_EXCEL);

    console.log(`\n? BİTTİ! Masaüstüne kaydedildi: ${OUTPUT_EXCEL}`);
    console.log(`?? Toplam ${processed.length} ürün güncellendi.`);
}

updateExcel();
