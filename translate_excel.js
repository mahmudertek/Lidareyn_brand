const XLSX = require('xlsx');
const excelPath = 'c:/Users/pc/Desktop/Beta_Katalog_Tablo.xlsx';
const outputPath = 'c:/Users/pc/Desktop/Beta_Katalog_Tablo_Final.xlsx';

const dictionary = {
    'adjustable wrenches': 'kurbağacık anahtar',
    'combination wrenches': 'kombine anahtar',
    'open end wrenches': 'iki ağızlı anahtar',
    'offset hex wrenches': 'allen anahtar',
    'socket': 'lokma',
    'sockets': 'lokmalar',
    'ratchet': 'cırcır',
    'extension': 'uzatma',
    'pliers': 'pense',
    'nippers': 'keski',
    'side cutters': 'yan keski',
    'long nose': 'kargaburun',
    'screwdrivers': 'tornavida',
    'hammer': 'çekiç',
    'torque wrench': 'tork anahtarı',
    'sparkproof': 'kıvılcım çıkarmaz (anti-statik)',
    'chrome vanadium': 'krom vanadyum çeliği',
    'chrome plated': 'krom kaplama',
    'phosphated': 'fosfat kaplama',
    'insulated': 'izoleli (yalıtımlı)',
    'heavy duty': 'ağır hizmet tipi',
    'professional': 'profesyonel',
    'industrial': 'endüstriyel',
    'high quality': 'yüksek kaliteli',
    'stainless steel': 'paslanmaz çelik',
    'magnetic': 'mıknatıslı',
    'set': 'takım / set',
    'module': 'modül',
    'bits': 'uçlar',
    'hexagon': 'altı köşe',
    'impact': 'havalı (darbeli)',
    'digital': 'dijital',
    'with': 'ile',
    'and': 've',
    'for': 'için',
    'tools': 'aletler',
    'workshop': 'atölye / servis'
};

function translateText(text) {
    if (!text) return '';
    let translated = text.toLowerCase();
    const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        translated = translated.replace(regex, dictionary[key]);
    }
    return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function getSizeInfo(sku, urunAdi) {
    sku = sku.toString();
    urunAdi = urunAdi.toLowerCase();

    if (sku.includes('/S') || sku.includes('/C') || urunAdi.includes('set') || urunAdi.includes('parça')) {
        const setMatch = sku.match(/[SC](\d+)/);
        if (setMatch) return `${setMatch[1]} parça profesyonel set.`;
        return 'Çok parçalı profesyonel set.';
    }

    const sizeMatch = sku.match(/[\/ \-](\d+)([a-zA-Z]*)$/);
    if (sizeMatch) {
        const val = sizeMatch[1];
        const unit = sizeMatch[2];
        if (urunAdi.includes('wrench') || urunAdi.includes('anahtar') || urunAdi.includes('socket') || urunAdi.includes('lokma')) {
            return `Ölçü: ${val} mm.`;
        }
        if (urunAdi.includes('plier') || urunAdi.includes('pense') || urunAdi.includes('cutter') || urunAdi.includes('keski')) {
            return `Uzunluk: ${val} mm.`;
        }
        return `Ölçü/Uzunluk: ${val}${unit ? ' ' + unit : ' mm'}.`;
    }

    const driveMatch = sku.match(/(\d\/\d)/);
    if (driveMatch) {
        return `Sürücü Ölçüsü: ${driveMatch[1]} inç.`;
    }

    return '';
}

async function run() {
    console.log('Excel okunuyor...');
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const items = XLSX.utils.sheet_to_json(sheet);

    console.log(`${items.length} ürün güncelleniyor...`);

    const updatedItems = items.map(item => {
        const sku = item.StokKodu || '';
        const urunAdi = item.UrunAdi || '';
        const eskiAciklama = item.Aciklama || '';

        const pageMatch = eskiAciklama.match(/(?:Sayfası|Sayfa|Numarası):\s*(\d+)/i);
        const pageSuffix = pageMatch ? `\n\n[Katalog Sayfası: ${pageMatch[1]}]` : '';

        let temizAd = urunAdi.replace(/^Beta\s+/i, '');
        let turkceTur = translateText(temizAd);
        let olcuBilgisi = getSizeInfo(sku, urunAdi);

        let yeniAciklama = `Beta markalı yüksek kaliteli ${turkceTur}. `;
        if (olcuBilgisi) yeniAciklama += olcuBilgisi + " ";
        yeniAciklama += `Profesyonel endüstriyel kullanım için tasarlanmıştır. `;

        if (turkceTur.includes('krom vanadyum')) yeniAciklama += `Dayanıklılık için krom vanadyum çeliğinden üretilmiştir. `;
        if (turkceTur.includes('izoleli')) yeniAciklama += `Elektrik işleri için özel yalıtımlı gövdeye sahiptir. `;
        if (turkceTur.includes('kıvılcım')) yeniAciklama += `Güvenlik için kıvılcım çıkarmaz özelliktedir. `;

        item.Aciklama = yeniAciklama.trim() + pageSuffix;

        if (!item.UrunAdi.startsWith('Beta')) {
            item.UrunAdi = 'Beta ' + item.UrunAdi;
        }

        return item;
    });

    const newSheet = XLSX.utils.json_to_sheet(updatedItems);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Ürünler');
    XLSX.writeFile(newWorkbook, outputPath);
    console.log('Bitti! Dosya: ' + outputPath);
}

run();
