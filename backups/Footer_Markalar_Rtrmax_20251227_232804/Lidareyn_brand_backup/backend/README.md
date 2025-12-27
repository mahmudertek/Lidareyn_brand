# Galata Çarşı Backend API

Profesyonel e-ticaret platformu için Node.js + Express + MongoDB backend API.

## 🚀 Özellikler

- ✅ **Kullanıcı Yönetimi**: Kayıt, giriş, e-posta doğrulama
- ✅ **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- ✅ **Şifre Şifreleme**: Bcrypt ile güvenli şifre saklama
- ✅ **Email Servisi**: Nodemailer ile doğrulama ve bildirim mailleri
- ✅ **Ürün Yönetimi**: CRUD işlemleri, kategoriler, stok takibi
- ✅ **Sipariş Sistemi**: Sipariş oluşturma, takip, durum güncellemeleri
- ✅ **Sepet & Favoriler**: Kullanıcı sepeti ve favori ürünler
- ✅ **Admin Panel**: Yönetici yetkilendirmesi
- ✅ **Rate Limiting**: API güvenliği
- ✅ **CORS**: Frontend entegrasyonu

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- MongoDB (v5 veya üzeri)
- npm veya yarn

## 🛠️ Kurulum

### 1. MongoDB Kurulumu

**Windows için:**
```bash
# MongoDB Community Edition indir ve kur
# https://www.mongodb.com/try/download/community

# MongoDB servisini başlat
net start MongoDB
```

**Alternatif: MongoDB Atlas (Cloud)**
- https://www.mongodb.com/cloud/atlas adresinden ücretsiz hesap oluştur
- Cluster oluştur ve connection string'i al

### 2. Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını yapılandır
# .env dosyasını aç ve ayarları yap:
# - MONGODB_URI: MongoDB bağlantı adresi
# - JWT_SECRET: Güvenli bir secret key
# - EMAIL_USER: Gmail adresi
# - EMAIL_PASSWORD: Gmail app password
```

### 3. Gmail App Password Oluşturma

1. Google hesabınıza gidin: https://myaccount.google.com/
2. Security → 2-Step Verification (aktif edin)
3. App Passwords → Select app: Mail → Generate
4. Oluşan 16 haneli şifreyi `.env` dosyasına ekleyin

### 4. .env Dosyası Yapılandırması

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/galata_carsi
# veya MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/galata_carsi

JWT_SECRET=galata_carsi_super_secret_key_2024_CHANGE_THIS
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=Galata Çarşı <noreply@galatacarsi.com>

FRONTEND_URL=file:///C:/Users/pc/Desktop/Lidareyn_brand
NODE_ENV=development
```

### 5. Sunucuyu Başlatma

```bash
# Development mode (otomatik yeniden başlatma)
npm run dev

# Production mode
npm start
```

Sunucu çalışıyorsa şu mesajı göreceksiniz:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: development
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/verify` - E-posta doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama

### Users
- `GET /api/users/profile` - Profil bilgisi
- `PUT /api/users/profile` - Profil güncelleme
- `GET /api/users/addresses` - Adresler
- `POST /api/users/addresses` - Yeni adres
- `GET /api/users/favorites` - Favoriler
- `GET /api/users/cart` - Sepet

### Products
- `GET /api/products` - Tüm ürünler
- `GET /api/products/:id` - Tek ürün
- `POST /api/products` - Yeni ürün (Admin)
- `PUT /api/products/:id` - Ürün güncelleme (Admin)
- `DELETE /api/products/:id` - Ürün silme (Admin)

### Orders
- `GET /api/orders` - Kullanıcı siparişleri
- `GET /api/orders/:id` - Tek sipariş
- `POST /api/orders` - Yeni sipariş
- `PUT /api/orders/:id/cancel` - Sipariş iptali
- `GET /api/orders/admin/all` - Tüm siparişler (Admin)

## 🧪 API Testi

### Postman ile Test

1. Postman'i indir: https://www.postman.com/downloads/
2. Yeni bir request oluştur
3. Test örnekleri:

**Kayıt:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456",
  "gender": "male"
}
```

**Giriş:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

Response'dan `token` değerini kopyalayın ve diğer isteklerde kullanın:
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🔐 Güvenlik

- Şifreler bcrypt ile hash'leniyor
- JWT token'lar 7 gün geçerli
- Rate limiting aktif (15 dakikada 100 istek)
- Helmet.js ile HTTP header güvenliği
- CORS yapılandırması

## 📁 Proje Yapısı

```
backend/
├── controllers/        # İş mantığı
│   └── authController.js
├── middleware/         # Middleware'ler
│   └── auth.js
├── models/            # MongoDB modelleri
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/            # API route'ları
│   ├── auth.js
│   ├── user.js
│   ├── product.js
│   └── order.js
├── utils/             # Yardımcı fonksiyonlar
│   └── sendEmail.js
├── .env               # Çevre değişkenleri
├── package.json       # Bağımlılıklar
└── server.js          # Ana sunucu dosyası
```

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
```
❌ MongoDB Connection Error
```
**Çözüm:**
- MongoDB servisinin çalıştığından emin olun: `net start MongoDB`
- `.env` dosyasındaki `MONGODB_URI` doğru mu kontrol edin
- MongoDB Atlas kullanıyorsanız IP whitelist'e ekleyin

### Email Gönderme Hatası
```
❌ E-posta gönderilirken bir hata oluştu
```
**Çözüm:**
- Gmail App Password oluşturdunuz mu?
- `.env` dosyasındaki email ayarları doğru mu?
- 2-Step Verification aktif mi?

### Port Kullanımda Hatası
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Çözüm:**
- Başka bir port kullanın: `.env` dosyasında `PORT=5001`
- Veya 5000 portunu kullanan uygulamayı kapatın

## 📞 Destek

Sorun yaşarsanız:
1. Konsol loglarını kontrol edin
2. `.env` dosyasını doğrulayın
3. MongoDB bağlantısını test edin
4. Email ayarlarını kontrol edin

## 🚀 Production'a Alma

1. `.env` dosyasında `NODE_ENV=production` yapın
2. Güvenli bir `JWT_SECRET` oluşturun
3. MongoDB Atlas kullanın (cloud database)
4. HTTPS kullanın
5. Environment variables'ı güvenli saklayın

## 📝 Lisans

ISC License
