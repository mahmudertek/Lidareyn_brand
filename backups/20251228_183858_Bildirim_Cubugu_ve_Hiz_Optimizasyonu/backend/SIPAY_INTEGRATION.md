# 💳 Sipay Ödeme Entegrasyonu - Galata Çarşı

## ✅ Sipay Avantajları

| Özellik | Sipay | iyzico |
|---------|-------|--------|
| **Komisyon** | %1.89 | %2.99-4.29 |
| **Ödeme Süresi** | Ertesi gün | 1-7 gün |
| **Kurulum** | Ücretsiz | Ücretsiz |
| **Aidat** | 0 TL | 0 TL |

**Yıllık Tasarruf (100K TL/ay):** ~20.000 TL 💰

---

## 🚀 Hızlı Başlangıç

### 1. Sipay Hesabı Aç
- https://www.sipay.com.tr adresine git
- "İş Yeri Başvurusu" yap
- Belgelerini yükle ve onay bekle
- Onay sonrası Merchant Panel'e eriş

### 2. API Bilgilerini Al
Sipay Merchant Panel'den:
- **Merchant Key**
- **App Secret**  
- **Merchant ID**

### 3. .env Dosyasına Ekle

```env
# Sipay Production
SIPAY_MERCHANT_KEY=your-merchant-key
SIPAY_APP_SECRET=your-app-secret
SIPAY_MERCHANT_ID=your-merchant-id
SIPAY_BASE_URL=https://api.sipay.com.tr

# Test için Sandbox kullan
# SIPAY_BASE_URL=https://sandbox-api.sipay.com.tr
```

### 4. Frontend Config Güncelle

`config.js` dosyasında:
```javascript
PAYMENT_PROVIDER: 'sipay'  // 'sipay', 'iyzico', veya 'demo'
```

---

## 🔌 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/sipay/get-token` | API token al |
| POST | `/api/sipay/pay-3d` | 3D Secure ödeme başlat |
| POST | `/api/sipay/callback` | Ödeme callback |
| POST | `/api/sipay/installments` | Taksit seçenekleri |
| GET | `/api/sipay/status/:orderId` | Ödeme durumu sorgula |
| POST | `/api/sipay/refund` | İade işlemi (Admin) |
| POST | `/api/sipay/demo` | Demo ödeme (test) |

---

## 🧪 Test Kartları

| Kart Tipi | Numara | SKT | CVV |
|-----------|--------|-----|-----|
| Visa | 4159 5600 0000 0000 | 12/30 | 123 |
| Mastercard | 5400 0100 0000 0000 | 12/30 | 123 |
| Başarısız | 4159 5600 0000 0001 | 12/30 | 123 |

---

## 📋 Dosya Yapısı

```
backend/
├── controllers/
│   ├── sipayController.js     ✅ Sipay ödeme işlemleri
│   ├── paymentController.js   ✅ iyzico ödeme işlemleri
│   └── orderController.js     ✅ Sipariş yönetimi
├── routes/
│   ├── sipay.js               ✅ Sipay API routes
│   ├── payment.js             ✅ iyzico API routes
│   └── order.js               ✅ Sipariş routes
└── server.js                  ✅ Tüm route'lar bağlı

frontend/
├── config.js                  ✅ PAYMENT_PROVIDER ayarı
├── checkout.js                ✅ Dinamik provider seçimi
└── odeme-sonuc.html           ✅ Ödeme sonuç sayfası
```

---

## 🔄 Ödeme Akışı

```
1. Müşteri sepete ürün ekler
   ↓
2. Ödeme sayfasına gider
   ↓
3. Kart bilgilerini girer
   ↓
4. "Siparişi Tamamla" tıklar
   ↓
5. Frontend → Backend API çağrısı
   ↓
6. Backend → Sipay 3D Secure başlatır
   ↓
7. Müşteri 3D doğrulama yapar
   ↓
8. Sipay → Callback ile sonuç bildirir
   ↓
9. Sipariş veritabanına kaydedilir
   ↓
10. Müşteri başarı sayfasına yönlendirilir
```

---

## ⚙️ Provider Değiştirme

`config.js` dosyasında tek satır değişikliği:

```javascript
// Sipay (önerilen - en düşük komisyon)
PAYMENT_PROVIDER: 'sipay'

// iyzico
PAYMENT_PROVIDER: 'iyzico'

// Demo (test modu - gerçek ödeme almaz)
PAYMENT_PROVIDER: 'demo'
```

---

## 🔒 Güvenlik

- ✅ PCI-DSS sertifikalı altyapı
- ✅ 3D Secure zorunlu
- ✅ SSL/TLS şifreleme
- ✅ Hash doğrulama
- ✅ IP kısıtlama (opsiyonel)

---

## 💰 Komisyon Oranları (2025)

| İşlem Tipi | Komisyon |
|------------|----------|
| Tek Çekim | %1.89 |
| 2-3 Taksit | ~%2.5 |
| 4-6 Taksit | ~%3.5 |
| 7-12 Taksit | ~%4.5 |

*Oranlar işletmeye göre değişebilir. Güncel bilgi için Sipay ile iletişime geçin.*

---

## 📞 Destek

- **Sipay Destek:** destek@sipay.com.tr
- **Telefon:** 0850 255 0 755
- **Dokümantasyon:** https://docs.sipay.com.tr

---

*Son güncelleme: 21 Aralık 2025*
