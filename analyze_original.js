const fs = require('fs');

const originalDir = 'c:\\Users\\pc\\Desktop\\Beta_Katalog_Gorseller';

// Orijinal dosya isimlerini incele
const files = fs.readdirSync(originalDir);
console.log(`Orijinal klasörde ${files.length} dosya var.\n`);

// Dosya isim formatlarını analiz et
const patterns = {
    'img_pXX_X.png': 0,
    'g_d0_img_pXX_X.png': 0,
    'other': 0
};

files.forEach(f => {
    if (f.match(/^img_p\d+_\d+\./)) patterns['img_pXX_X.png']++;
    else if (f.match(/^g_d0_img_p\d+_/)) patterns['g_d0_img_pXX_X.png']++;
    else patterns['other']++;
});

console.log('Dosya isim formatları:');
Object.entries(patterns).forEach(([k, v]) => {
    if (v > 0) console.log(`  ${k}: ${v} adet`);
});

// Hangi sayfalarda görsel var?
const pages = new Set();
files.forEach(f => {
    const m = f.match(/p(\d+)_/);
    if (m) pages.add(parseInt(m[1]));
});

const sortedPages = Array.from(pages).sort((a, b) => a - b);
console.log(`\nGörsel içeren sayfa sayısı: ${sortedPages.length}`);
console.log(`Sayfa aralığı: ${sortedPages[0]} - ${sortedPages[sortedPages.length - 1]}`);

// PDF 772 sayfa ama kaç sayfada görsel var?
console.log(`\nPDF toplam 772 sayfa`);
console.log(`Görsel bulunan sayfa: ${sortedPages.length}`);
console.log(`Görsel bulunmayan sayfa: ${772 - sortedPages.length}`);
