# 📦 Kargo Entegrasyonu Rehberi - Galata Çarşı

## ✅ Desteklenen Kargo Firmaları

| Firma | Anlaşma Fiyatı (1 desi) | Ücretsiz Kargo | İletişim |
|-------|-------------------------|----------------|----------|
| **Yurtiçi Kargo** | ~32 TL | 500 TL+ | yurticikargo.com/kurumsal |
| **MNG Kargo** | ~30 TL | 500 TL+ | mngkargo.com.tr/kurumsal |
| **Aras Kargo** | ~31 TL | 500 TL+ | araskargo.com.tr/kurumsal |
| **PTT Kargo** | ~28 TL | 500 TL+ | ptt.gov.tr |
| **Sürat Kargo** | ~29 TL | 500 TL+ | suratkargo.com.tr |

*Fiyatlara KDV dahil değildir. Gerçek fiyatlar anlaşmaya göre değişir.*

---

## 🚀 Hızlı Başlangıç

### 1. Demo Modda Test Et

`.env` dosyasında:
```env
CARGO_MODE=demo
DEFAULT_CARGO_PROVIDER=yurtici
```

Demo modda gerçek API çağrısı yapılmaz, test kargo numaraları oluşturulur.

### 2. Kargo Firmasıyla Anlaşma Yap

**Yurtiçi Kargo için:**
1. https://www.yurticikargo.com/tr/kurumsal-cozumler adresine git
2. Kurumsal müşteri başvurusu yap
3. Vergi levhası, imza sirküleri belgelerini hazırla
4. Bölge müdürü ile görüşerek fiyat anlaşması yap
5. API bilgilerini al

**MNG Kargo için:**
1. https://www.mngkargo.com.tr/kurumsal
2. "Kurumsal Çözümler" formunu doldur
3. Temsilci ile iletişime geç

### 3. API Bilgilerini .env'ye Ekle

```env
CARGO_MODE=live
DEFAULT_CARGO_PROVIDER=yurtici

# Yurtiçi Kargo
YURTICI_USERNAME=kullanici_adi
YURTICI_PASSWORD=sifre
YURTICI_CUSTOMER_CODE=musteri_kodu
```

---

## 📡 API Endpoints

### Herkese Açık

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/cargo/providers` | Kargo firmalarını listele |
| POST | `/api/cargo/calculate` | Kargo ücreti hesapla |
| GET | `/api/cargo/track/:trackingNumber` | Kargo takip |

### Admin

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/cargo/create-shipment` | Kargo oluştur |
| DELETE | `/api/cargo/shipment/:trackingNumber` | Kargo iptal |
| GET | `/api/cargo/label/:trackingNumber` | Etiket/barkod al |
| POST | `/api/cargo/pickup` | Kapıdan alım talebi |

---

## 💰 Kargo Ücreti Hesaplama

### Desi Hesabı
```
Desi = (En x Boy x Yükseklik) / 3000
```

Gerçek ağırlık ve desi değerinden büyük olan kullanılır.

### API Kullanımı

```javascript
// Kargo ücreti hesapla
const response = await fetch('/api/cargo/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        provider: 'yurtici',      // opsiyonel
        weight: 2,                // kg
        width: 30,                // cm
        height: 20,               // cm
        depth: 15,                // cm
        orderTotal: 450,          // TL
        paymentMethod: 'prepaid'  // 'prepaid' veya 'cod'
    })
});

const data = await response.json();
// {
//   success: true,
//   data: {
//     provider: "Yurtiçi Kargo",
//     desi: 3,
//     shippingCost: 50.40,
//     isFreeShipping: false,
//     freeShippingThreshold: 500
//   }
// }
```

---

## 📦 Kargo Oluşturma

### Admin Panelden

```javascript
// Kargo oluştur ve takip numarası al
const response = await fetch('/api/cargo/create-shipment', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin_token'
    },
    body: JSON.stringify({
        orderId: '64abc123...',
        provider: 'yurtici',
        packageInfo: {
            desi: 2,
            weight: 1.5
        }
    })
});

const data = await response.json();
// {
//   success: true,
//   data: {
//     orderNumber: "GC2024123456",
//     tracking: {
//       company: "Yurtiçi Kargo",
//       trackingNumber: "YK12345678901",
//       trackingUrl: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=YK12345678901"
//     }
//   }
// }
```

---

## 🔍 Kargo Takip

```javascript
// Kargo durumu sorgula
const response = await fetch('/api/cargo/track/YK12345678901?provider=yurtici');

const data = await response.json();
// {
//   success: true,
//   data: {
//     trackingNumber: "YK12345678901",
//     status: "in_transit",
//     statusText: "Taşıma Aşamasında",
//     estimatedDelivery: "2024-12-22T18:00:00Z",
//     history: [
//       { date: "...", status: "picked_up", description: "Kargo teslim alındı" },
//       { date: "...", status: "in_transit", description: "Transfer merkezinde" }
//     ]
//   }
// }
```

---

## 🏷️ Kargo Etiketi

```javascript
// Kargo etiketi al
const response = await fetch('/api/cargo/label/YK12345678901?format=pdf', {
    headers: { 'Authorization': 'Bearer admin_token' }
});
```

---

## 📞 Kapıdan Alım

```javascript
// Kurye çağır
const response = await fetch('/api/cargo/pickup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin_token'
    },
    body: JSON.stringify({
        provider: 'yurtici',
        date: '2024-12-22',
        timeSlot: '09:00-12:00',
        packageCount: 5,
        notes: 'Zil çalışmıyor'
    })
});
```

---

## 💡 E-ticaret Kargo Anlaşması İpuçları

### Anlaşma Yaparken Dikkat Edilecekler:

1. **Desi Fiyatı**: 1 desi için ne kadar ödeyeceksiniz?
2. **Kapıdan Alım**: Ek ücret var mı?
3. **İade Kargo**: İade kargolarda ücret uygulanıyor mu?
4. **Ödeme Süresi**: Haftalık mı, aylık mı ödeme?
5. **Yoğun Dönem**: Kampanya dönemlerinde fiyat artışı var mı?

### Pazarlık Taktikleri:

- Aylık minimum gönderi taahhüdü verin (örn: 100 adet)
- Birden fazla firmayla görüşün, teklif isteyin
- İlk ay indirimli fiyat isteyin
- Yıllık sözleşme yaparak ek indirim talep edin

### Örnek Anlaşmalı Fiyatlar (2024):

| Aylık Gönderi | Tahmini 1 Desi Fiyatı |
|---------------|----------------------|
| 0-50 adet | 35-40 TL |
| 50-200 adet | 28-35 TL |
| 200-500 adet | 22-28 TL |
| 500+ adet | 18-22 TL |

---

## 📁 Dosya Yapısı

```
backend/
├── controllers/
│   └── cargoController.js    ✅ Kargo işlemleri
├── routes/
│   └── cargo.js              ✅ Kargo API routes
├── server.js                 ✅ Route bağlantısı
└── .env.example              ✅ Konfigürasyon şablonu
```

---

## 🔗 Kargo Firması İletişim

| Firma | Kurumsal | Telefon |
|-------|----------|---------|
| **Yurtiçi** | yurticikargo.com/kurumsal | 444 0 500 |
| **MNG** | mngkargo.com.tr/kurumsal | 444 0 664 |
| **Aras** | araskargo.com.tr/kurumsal | 444 25 52 |
| **PTT** | ptt.gov.tr | 444 1 788 |
| **Sürat** | suratkargo.com.tr | 444 0 717 |

---

*Son güncelleme: 21 Aralık 2025*
