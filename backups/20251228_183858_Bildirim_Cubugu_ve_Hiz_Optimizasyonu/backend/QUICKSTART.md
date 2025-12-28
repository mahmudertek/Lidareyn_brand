# 🚀 Backend Hızlı Başlangıç Rehberi

## ✅ npm install TAMAMLANDI! (147 paket yüklendi)

## 📋 Şimdi Yapılacaklar:

### 1. MongoDB Kurulumu (2 Seçenek)

#### Seçenek A: MongoDB Atlas (Önerilen - Ücretsiz Cloud) ☁️
1. https://www.mongodb.com/cloud/atlas/register
2. Ücretsiz hesap oluştur
3. FREE Cluster oluştur (M0)
4. Database User ekle
5. IP Whitelist: "Allow from Anywhere"
6. Connection string'i kopyala
7. `backend/.env` dosyasını aç
8. `MONGODB_URI` satırını connection string ile değiştir

Detaylı rehber: `MONGODB_SETUP.md` dosyasına bakın

#### Seçenek B: Yerel MongoDB 💻
1. https://www.mongodb.com/try/download/community
2. Windows MSI installer indir ve kur
3. MongoDB servisini başlat: `net start MongoDB`
4. `.env` dosyasında zaten hazır: `mongodb://localhost:27017/galata_carsi`

---

### 2. .env Dosyasını Düzenle

`backend/.env` dosyasını bir metin editörü ile aç ve şunları ayarla:

```env
# MongoDB bağlantısı (yukarıdaki seçeneklerden birine göre)
MONGODB_URI=mongodb://localhost:27017/galata_carsi

# Email (şimdilik opsiyonel, test modunda çalışır)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Not:** Email olmadan da test edebilirsiniz! Doğrulama kodu konsola yazılacak.

---

### 3. Backend'i Başlat

```powershell
cd backend
npm run dev
```

Başarılı olursa şunu göreceksiniz:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: development
```

---

### 4. API'yi Test Et

Tarayıcıda: http://localhost:5000/api/health

Görmek istediğiniz:
```json
{
  "status": "OK",
  "message": "Galata Çarşı API is running",
  "timestamp": "2025-12-13T..."
}
```

---

### 5. Postman ile Test (Opsiyonel)

1. Postman indir: https://www.postman.com/downloads/
2. Yeni request oluştur
3. Test et:

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

---

## 🐛 Sorun Giderme

### MongoDB bağlanamıyor?
- MongoDB servisi çalışıyor mu? `net start MongoDB`
- Atlas kullanıyorsanız IP whitelist eklediniz mi?
- Connection string doğru mu?

### Port 5000 kullanımda?
`.env` dosyasında `PORT=5001` yapın

### Email gönderilmiyor?
Sorun değil! Doğrulama kodu konsola yazılıyor. Email'i daha sonra ayarlayabilirsiniz.

---

## 📞 Yardım

Sorun yaşarsanız konsol loglarını kontrol edin. Backend çalışırken tüm hatalar detaylı gösterilir.

---

## ✨ Sonraki Adım: Frontend Entegrasyonu

Backend çalıştıktan sonra frontend'i backend'e bağlayacağız!
