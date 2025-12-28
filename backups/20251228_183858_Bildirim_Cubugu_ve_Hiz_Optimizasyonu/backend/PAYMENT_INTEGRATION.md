# 💳 Ödeme Entegrasyonu Rehberi - Galata Çarşı

Bu rehber, Galata Çarşı e-ticaret sitesi için ödeme sisteminin nasıl kurulacağını açıklar.

---

## 📋 İçindekiler

1. [Mevcut Durum](#mevcut-durum)
2. [iyzico Entegrasyonu](#iyzico-entegrasyonu)
3. [Demo Ödeme (Test)](#demo-ödeme-test)
4. [API Endpoints](#api-endpoints)
5. [Frontend Entegrasyonu](#frontend-entegrasyonu)
6. [Test Etme](#test-etme)

---

## ✅ Mevcut Durum

### Tamamlanan Özellikler:
- ✅ **Order Controller** (`backend/controllers/orderController.js`)
  - Sipariş oluşturma
  - Sipariş listeleme
  - Sipariş detayı görüntüleme
  - Sipariş iptal etme
  - İade talebi
  - Admin sipariş yönetimi

- ✅ **Payment Controller** (`backend/controllers/paymentController.js`)
  - iyzico 3D Secure ödeme
  - Taksit seçenekleri
  - İade işlemi
  - Demo ödeme (test için)

- ✅ **Frontend Checkout** (`checkout.js`)
  - Form validasyonu
  - Kart formatlama
  - Taksit seçimi
  - Backend entegrasyonu
  - Ödeme sonuç sayfası

---

## 🔐 iyzico Entegrasyonu

### 1. iyzico Hesabı Oluşturma

1. **Sandbox (Test) hesabı için:**
   - https://sandbox-merchant.iyzipay.com adresine git
   - Ücretsiz hesap oluştur
   - API Key ve Secret Key al

2. **Production (Canlı) hesabı için:**
   - https://www.iyzico.com adresine git
   - İşletme başvurusu yap
   - Onay sonrası API keyleri al

### 2. Environment Değişkenleri

`.env` dosyasına ekle:

```env
# Sandbox (Test)
IYZICO_API_KEY=sandbox-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Production (Canlı)
# IYZICO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# IYZICO_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# IYZICO_BASE_URL=https://api.iyzipay.com
```

### 3. Paketi Yükle

```bash
cd backend
npm install iyzipay
```

### 4. Test Kartları (Sandbox)

| Kart Tipi | Kart Numarası | SKT | CVV |
|-----------|---------------|-----|-----|
| Visa | 5528790000000008 | 12/30 | 123 |
| Mastercard | 5400360000000003 | 12/30 | 000 |
| Troy | 9792020000000001 | 12/30 | 123 |
| AMEX | 374427000000003 | 12/30 | 123 |

**Test için başarısız kart:** 5406670000000009

---

## 🧪 Demo Ödeme (Test)

iyzico entegrasyonu olmadan test etmek için **Demo Payment** endpoint'i kullanılabilir.

### Nasıl Çalışır?
- `/api/payment/demo` endpoint'i herhangi bir ödeme servisine bağlanmadan siparişi oluşturur
- Kart validasyonu sadece format kontrolü yapar (gerçek ödeme almaz)
- Test amaçlı kullanılmalıdır

### Kullanım:
```javascript
// Frontend checkout.js'de demo endpoint kullanılıyor
const endpoint = `${API_BASE_URL}/payment/demo`;
```

**⚠️ ÖNEMLİ:** Canlıya çıkmadan önce bunu gerçek iyzico endpoint'ine çevirin!

---

## 🔌 API Endpoints

### Ödeme Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| POST | `/api/payment/demo` | Demo ödeme (test) |
| POST | `/api/payment/initialize` | 3D Secure başlat |
| POST | `/api/payment/callback` | iyzico callback |
| GET | `/api/payment/status/:id` | Ödeme durumu |
| POST | `/api/payment/installments` | Taksit seçenekleri |
| POST | `/api/payment/refund` | İade işlemi (Admin) |

### Sipariş Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| GET | `/api/orders` | Kullanıcı siparişleri |
| GET | `/api/orders/:id` | Sipariş detayı |
| POST | `/api/orders` | Yeni sipariş (bank transfer) |
| PUT | `/api/orders/:id/cancel` | Sipariş iptal |
| PUT | `/api/orders/:id/return` | İade talebi |
| GET | `/api/orders/admin/all` | Tüm siparişler (Admin) |
| GET | `/api/orders/admin/stats` | İstatistikler (Admin) |
| PUT | `/api/orders/admin/:id/status` | Durum güncelle (Admin) |

---

## 💻 Frontend Entegrasyonu

### Checkout Akışı:

```
1. Kullanıcı sepete ürün ekler
   ↓
2. Ödeme sayfasına gider (odeme.html)
   ↓
3. Adres bilgilerini doldurur
   ↓
4. Kart bilgilerini girer
   ↓
5. "Siparişi Tamamla" tıklar
   ↓
6. Backend'e istek gönderilir
   ↓
7. Başarılı → siparis-basarili.html
   Hata → odeme-sonuc.html?status=error
```

### Config Ayarları

`config.js` dosyasını kontrol et:

```javascript
window.CONFIG = {
    API_URL: 'https://your-backend-url.com/api',
    // ...
};
```

---

## 🧪 Test Etme

### 1. Backend'i Başlat

```bash
cd backend
npm install
npm run dev
```

### 2. Demo Ödeme Test Et

1. Sepete ürün ekle
2. Ödeme sayfasına git
3. Test kart bilgilerini gir:
   - Kart: 4111 1111 1111 1111
   - SKT: 12/30
   - CVV: 123
4. "Siparişi Tamamla" tıkla

### 3. Sipariş Kontrol Et

- MongoDB Atlas'ta `orders` koleksiyonunu kontrol et
- LocalStorage'da `savedOrders` kontrol et
- Profil sayfasında siparişleri gör

---

## 🚀 Canlıya Geçiş Checklist

- [ ] iyzico production hesabı aç
- [ ] API keylerini production olarak güncelle
- [ ] IYZICO_BASE_URL'i production yap
- [ ] Demo endpoint'i devre dışı bırak veya kaldır
- [ ] SSL sertifikası aktif olduğundan emin ol
- [ ] Callback URL'lerini production domain'e güncelle
- [ ] Test siparişleri ile doğrula

---

## 💰 Komisyon Oranları (iyzico)

| Ödeme Tipi | Komisyon |
|------------|----------|
| Tek Çekim | %2.79 + 0.35₺ |
| 2-6 Taksit | %3.39 + 0.35₺ |
| 7-12 Taksit | %4.19 + 0.35₺ |

*Fiyatlar değişkenlik gösterebilir. Güncel bilgi için iyzico.com*

---

## 📞 Destek

- **iyzico Destek:** destek@iyzico.com
- **Dokümantasyon:** https://dev.iyzipay.com

---

*Son güncelleme: Aralık 2025*
