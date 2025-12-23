const galataProductsData = [
    // --- ERKEK ---
    {
        id: "erkek-siyah-tshirt",
        name: "Erkek Siyah Oversize Tişört",
        price: "249.90 TL",
        priceRaw: 249.90,
        category: "Erkek > Giyim",
        description: "Pamuık kumaştan üretilmiş, rahat kalıp siyah oversize tişört. Dört mevsim kullanıma uygundur.",
        image: "https://picsum.photos/seed/erkek1/600/800",
        images: ["https://picsum.photos/seed/erkek1/600/800", "https://picsum.photos/seed/erkek1_2/600/800", "https://picsum.photos/seed/erkek1_3/600/800"],
        specs: ["%100 Pamuk", "Oversize Kalıp", "Bisiklet Yaka"]
    },
    {
        id: "erkek-mavi-kot",
        name: "Erkek Mavi Slim Fit Kot Pantolon",
        price: "699.00 TL",
        priceRaw: 699.00,
        category: "Erkek > Giyim",
        description: "Esnek kumaş yapısıyla gün boyu konfor sağlayan slim fit mavi kot pantolon.",
        image: "https://picsum.photos/seed/erkek2/600/800",
        images: ["https://picsum.photos/seed/erkek2/600/800", "https://picsum.photos/seed/erkek2_2/600/800"],
        specs: ["%98 Pamuk, %2 Elastan", "Slim Fit", "Normal Bel"]
    },
    {
        id: "erkek-deri-ceket",
        name: "Erkek Siyah Deri Ceket",
        price: "1999.00 TL",
        priceRaw: 1999.00,
        category: "Erkek > Giyim",
        description: "Şıklığınızı tamamlayacak suni deri motorcu ceketi.",
        image: "https://picsum.photos/seed/erkek3/600/800",
        images: ["https://picsum.photos/seed/erkek3/600/800", "https://picsum.photos/seed/erkek3_2/600/800"],
        specs: ["Suni Deri", "Fermuarlı", "Astarlı"]
    },

    // --- KADIN ---
    {
        id: "kadin-yazlik-elbise",
        name: "Kadın Çiçek Desenli Yazlık Elbise",
        price: "450.00 TL",
        priceRaw: 450.00,
        category: "Kadın > Giyim",
        description: "Yaz ayları için hafif ve ferah, çiçek desenli midi boy elbise.",
        image: "https://picsum.photos/seed/kadin1/600/800",
        images: ["https://picsum.photos/seed/kadin1/600/800", "https://picsum.photos/seed/kadin1_2/600/800"],
        specs: ["Viskon Kumaş", "Midi Boy", "V Yaka"]
    },
    {
        id: "kadin-beyaz-sneaker",
        name: "Kadın Beyaz Sneaker",
        price: "899.90 TL",
        priceRaw: 899.90,
        category: "Kadın > Ayakkabı",
        description: "Günlük kullanım için ideal, yumuşak tabanlı beyaz sneaker.",
        image: "https://picsum.photos/seed/kadin2/600/800",
        images: ["https://picsum.photos/seed/kadin2/600/800", "https://picsum.photos/seed/kadin2_2/600/800"],
        specs: ["Suni Deri", "Ortopedik Taban", "Bağcıklı"]
    },
    {
        id: "kadin-kol-cantasi",
        name: "Kadın Siyah Kol Çantası",
        price: "349.90 TL",
        priceRaw: 349.90,
        category: "Kadın > Aksesuar",
        description: "Şık ve fonksiyonel, çok bölmeli siyah kol çantası.",
        image: "https://picsum.photos/seed/kadin3/600/800",
        images: ["https://picsum.photos/seed/kadin3/600/800"],
        specs: ["Suni Deri", "Fermuarlı", "3 Bölmeli"]
    },

    // --- ELEKTRONİK ---
    {
        id: "bluetooth-kulaklik",
        name: "Kablosuz Bluetooth Kulaklık",
        price: "1299.00 TL",
        priceRaw: 1299.00,
        category: "Elektronik > Aksesuar",
        description: "Yüksek ses kalitesi ve uzun pil ömrü sunan bluetooth kulaklık.",
        image: "https://picsum.photos/seed/elek1/600/800",
        images: ["https://picsum.photos/seed/elek1/600/800", "https://picsum.photos/seed/elek1_2/600/800"],
        specs: ["Bluetooth 5.2", "20 Saat Pil", "Gürültü Engelleme"]
    },
    {
        id: "akilli-saat",
        name: "Akıllı Saat - Spor Modlu",
        price: "2499.00 TL",
        priceRaw: 2499.00,
        category: "Elektronik > Giyilebilir",
        description: "Nabız, uyku ve spor takibi yapabilen su geçirmez akıllı saat.",
        image: "https://picsum.photos/seed/elek2/600/800",
        images: ["https://picsum.photos/seed/elek2/600/800"],
        specs: ["1.4 inç Ekran", "Su Geçirmez", "Android/iOS Uyumlu"]
    },

    // --- EV & MOBİLYA ---
    {
        id: "dekoratif-vazo",
        name: "Modern Dekoratif Vazo",
        price: "299.90 TL",
        priceRaw: 299.90,
        category: "Ev & Mobilya > Dekorasyon",
        description: "Evinize modern bir hava katacak seramik dekoratif vazo.",
        image: "https://picsum.photos/seed/ev1/600/800",
        images: ["https://picsum.photos/seed/ev1/600/800"],
        specs: ["Seramik", "25cm Yükseklik", "El Yapımı"]
    },
    {
        id: "lambader",
        name: "Ahşap Ayaklı Lambader",
        price: "549.90 TL",
        priceRaw: 549.90,
        category: "Ev & Mobilya > Aydınlatma",
        description: "Doğal ahşap ayaklı, keten başlıklı şık lambader.",
        image: "https://picsum.photos/seed/ev2/600/800",
        images: ["https://picsum.photos/seed/ev2/600/800"],
        specs: ["Ahşap Gövde", "E27 Duy", "150cm Yükseklik"]
    },

    // --- KOZMETİK ---
    {
        id: "nemlendirici-krem",
        name: "Yüz Nemlendirici Krem",
        price: "189.90 TL",
        priceRaw: 189.90,
        category: "Kozmetik > Cilt Bakımı",
        description: "Tüm cilt tipleri için uygun, yoğun nemlendirici etkili yüz kremi.",
        image: "https://picsum.photos/seed/koz1/600/800",
        images: ["https://picsum.photos/seed/koz1/600/800"],
        specs: ["50ml", "Vitamin E", "Su Bazlı"]
    },
    {
        id: "kirmizi-ruj",
        name: "Mat Kırmızı Ruj",
        price: "129.90 TL",
        priceRaw: 129.90,
        category: "Kozmetik > Makyaj",
        description: "Uzun süre kalıcı, kadifemsi mat bitişli kırmızı ruj.",
        image: "https://picsum.photos/seed/koz2/600/800",
        images: ["https://picsum.photos/seed/koz2/600/800"],
        specs: ["Mat Bitiş", "24 Saat Kalıcı", "Nemlendirici Etki"]
    },

    // --- ÇOK SATANLAR (Mock for automated generation filler if needed, but manual better) ---
    // Adding generic ones for volume
    { id: "cok-satan-1", name: "Çok Satan Ürün 1", price: "150.00 TL", priceRaw: 150.00, image: "https://picsum.photos/seed/cs1/600/800", category: "Karışık", description: "Popüler ürün.", images: ["https://picsum.photos/seed/cs1/600/800"], specs: ["Standart"] },
    { id: "cok-satan-2", name: "Çok Satan Ürün 2", price: "250.00 TL", priceRaw: 250.00, image: "https://picsum.photos/seed/cs2/600/800", category: "Karışık", description: "Popüler ürün.", images: ["https://picsum.photos/seed/cs2/600/800"], specs: ["Standart"] },
    { id: "cok-satan-3", name: "Çok Satan Ürün 3", price: "350.00 TL", priceRaw: 350.00, image: "https://picsum.photos/seed/cs3/600/800", category: "Karışık", description: "Popüler ürün.", images: ["https://picsum.photos/seed/cs3/600/800"], specs: ["Standart"] },
    { id: "cok-satan-4", name: "Çok Satan Ürün 4", price: "450.00 TL", priceRaw: 450.00, image: "https://picsum.photos/seed/cs4/600/800", category: "Karışık", description: "Popüler ürün.", images: ["https://picsum.photos/seed/cs4/600/800"], specs: ["Standart"] },
];

function getProductById(id) {
    return galataProductsData.find(p => p.id === id);
}

function getAllProducts() {
    return galataProductsData;
}

function getProductsByCategory(category) {
    return galataProductsData.filter(p => p.category.includes(category));
}

// Expose to window for global access
window.galataProductsData = galataProductsData;
window.getProductById = getProductById;
window.getAllProducts = getAllProducts;
window.getProductsByCategory = getProductsByCategory;
