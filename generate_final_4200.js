const fs = require('fs');
const XLSX = require('xlsx');

const CATALOG_TEXT = 'c:/Users/pc/Desktop/Lidareyn_brand/pdf_text_output.txt';
const PRICE_TEXT = 'c:/Users/pc/Desktop/Lidareyn_brand/price_list_text.txt';
const OUTPUT_EXCEL = 'C:/Users/pc/Desktop/Beta_Katalog_4200_Urun.xlsx';

function generateExcel() {
    console.log("?? Veriler işleniyor...");

    const priceTxt = fs.readFileSync(PRICE_TEXT, 'utf8');
    const catalogTxt = fs.readFileSync(CATALOG_TEXT, 'utf8');

    // 1. Fiyatları Çek (SKU -> Price)
    // 패턴: SKU genellikle 9 haneli ve 00 ile başlıyor. Price ise £ simgesinden sonra gelen rakamlar.
    // Ancak text'te SKU ve Fiyat yan yana olmayabilir. 
    // Daha basit bir eşleme: Satırlarda SKU ve Fiyatı bul.
    const priceMap = {};
    const priceLines = priceTxt.split('\n');
    let lastPrice = 0;

    // Basit bir fiyat yakalama: her £ simgesinden sonraki rakamı "sıradaki ürünler için fiyat" olarak alabiliriz
    // Ama Beta fiyat listesinde her SKU'nun yanında fiyat olur genelde.
    priceLines.forEach(line => {
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            // Satırda fiyat ara (Örn: 42,50 veya 12.00)
            const priceMatch = line.match(/(\d+[,.]\d{2})/);
            if (priceMatch) {
                priceMap[sku] = parseFloat(priceMatch[1].replace(',', '.'));
            }
        }
    });

    // 2. Katalog Verilerini İşle
    const catalogLines = catalogTxt.split('\n');
    const products = [];
    let currentModel = "Beta Alet";
    let currentCategory = "Hırdavat";
    let currentHeaders = ["Ölçü"];

    for (let i = 0; i < catalogLines.length; i++) {
        const line = catalogLines[i].trim();
        if (!line) continue;

        // Model Değişimi Kontrolü (Örn: 430ASC)
        const modelMatch = line.match(/^\|?\*?\s*(\d+[A-Z]*)\s*$/);
        if (modelMatch) {
            currentModel = "Beta " + modelMatch[1];
            // Headers'ı bir sonraki satırlardan bulmaya çalış (L, L1 vb)
            // Genelde tablonun üstünde olur
            let nextLines = catalogLines.slice(i, i + 10).join(' ');
            if (nextLines.includes('UNC')) currentCategory = "Klavuz ve Paftalar";
            if (nextLines.includes('mm')) {
                // mm içeren kelimeleri header olarak alabiliriz (L, L1, Ø vb)
                const headerMatch = nextLines.match(/\b([LØAHD]\d?)\s*mm\b/g);
                if (headerMatch) {
                    currentHeaders = headerMatch.map(h => h.replace(' mm', ''));
                }
            }
        }

        // Ürün Satırı Kontrolü (SKU ve Ölçüler)
        const skuMatch = line.match(/00\d{7}/);
        if (skuMatch) {
            const sku = skuMatch[0];
            const parts = line.split(/\s+/).filter(p => p.length > 0);

            // Ölçüleri yakala (SKU'dan önceki kısımlar)
            let specs = [];
            for (let part of parts) {
                if (part === sku) break;
                specs.push(part);
            }

            // Açıklama oluştur (L: 70 L1: 30 gibi)
            let descSpecs = "";
            let mainSize = specs[0] || "";

            // Header'ları speclerle eşleştir
            for (let j = 0; j < Math.min(currentHeaders.length, specs.length); j++) {
                descSpecs += `${currentHeaders[j]}: ${specs[j]} `;
            }

            const price = priceMap[sku] || 0;

            products.push({
                "StokKodu": sku,
                "UrunAdi": `${currentModel} ${mainSize}`.trim(),
                "Marka": "Beta",
                "Fiyat": price,
                "IndirimliFiyat": "",
                "Stok": 20,
                "Kategori": "El Aletleri",
                "AltKategori": currentCategory,
                "Aciklama": `${currentModel} - Profesyonel kullanım için. Teknik Özellikler: ${descSpecs}`.trim(),
                "Birim": "adet",
                "GorselURL": `/gorseller/beta/${sku.substring(2)}.png`, // Tahmin
                "Aktif": "Evet",
                "PopulerMi": "Hayır",
                "YeniMi": "Evet",
                "OneCikan": "Hayır",
                "CokSatan": "Hayır",
                "MarkaVitrini": ""
            });
        }
    }

    console.log(`?? ${products.length} ürün hazırlandı.`);

    // Excel Dosyasını Oluştur
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Urunler");
    XLSX.writeFile(wb, OUTPUT_EXCEL);

    console.log(`? Tamamlandı: ${OUTPUT_EXCEL}`);
}

generateExcel();
