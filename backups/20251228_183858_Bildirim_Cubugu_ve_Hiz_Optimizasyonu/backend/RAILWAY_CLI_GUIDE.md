# 🚂 RAILWAY DEPLOYMENT - ADIM ADIM REHBER

## ✅ HAZIRLIK TAMAMLANDI
- Railway CLI kuruldu
- Backend dosyaları hazır
- Environment variables template hazır

---

## 📋 ŞİMDİ YAPILACAKLAR

### ADIM 1: MongoDB Atlas Kurulumu (10 dakika)

1. **MongoDB Atlas'a Git**
   - https://cloud.mongodb.com
   - "Try Free" → Google ile giriş yap

2. **Cluster Oluştur**
   - "Create" → "Shared" (M0 FREE)
   - Provider: AWS
   - Region: Frankfurt (eu-central-1)
   - Cluster Name: galatacarsi
   - "Create Cluster" (2-3 dk bekle)

3. **Database User Oluştur**
   - Sol menü: "Database Access"
   - "Add New Database User"
   - Username: galatacarsiadmin
   - Password: "Autogenerate Secure Password" → KAYDET! 📝
   - Privileges: "Atlas admin"
   - "Add User"

4. **IP Whitelist**
   - Sol menü: "Network Access"
   - "Add IP Address"
   - "Allow Access from Anywhere" (0.0.0.0/0)
   - "Confirm"

5. **Connection String Al**
   - Sol menü: "Database"
   - "Connect" → "Drivers"
   - Connection string kopyala:
   ```
   mongodb+srv://galatacarsiadmin:<password>@galatacarsi.xxxxx.mongodb.net/
   ```
   - `<password>` yerine gerçek şifreyi yaz
   - Sonuna database adını ekle: `/galatacarsı`
   
   **Final:**
   ```
   mongodb+srv://galatacarsiadmin:ŞİFREN@galatacarsi.xxxxx.mongodb.net/galatacarsı?retryWrites=true&w=majority
   ```
   
   KAYDET! 📝

---

### ADIM 2: JWT Secret Oluştur (1 dakika)

Terminal'de çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıkan değeri KAYDET! 📝

---

### ADIM 3: Railway'e Giriş (2 dakika)

Terminal'de:
```bash
railway login
```

- Tarayıcı açılacak
- GitHub ile giriş yap
- Railway'e GitHub erişimi ver
- Terminal'e dön

---

### ADIM 4: Railway Projesi Oluştur (1 dakika)

```bash
cd c:\Users\pc\Desktop\Lidareyn_brand\backend
railway init
```

- Proje adı: galatacarsi-backend (veya istediğin)
- Enter

---

### ADIM 5: Environment Variables Ekle (5 dakika)

**Seçenek A: Railway Dashboard'dan (Kolay)**
```bash
railway open
```
- Tarayıcıda proje açılır
- "Variables" sekmesi
- Aşağıdaki değişkenleri ekle

**Seçenek B: Terminal'den (Hızlı)**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="..."
railway variables set JWT_EXPIRE=30d
railway variables set FRONTEND_URL=https://yourdomain.com
```

**Gerekli Variables:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<32 karakter random string>
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com
```

---

### ADIM 6: Deploy! (3 dakika)

```bash
railway up
```

- Dosyalar yüklenecek
- Build başlayacak
- Deploy tamamlanacak

---

### ADIM 7: Public URL Al (1 dakika)

**Seçenek A: Dashboard'dan**
```bash
railway open
```
- "Settings" → "Networking"
- "Generate Domain"
- URL'i kopyala

**Seçenek B: Terminal'den**
```bash
railway domain
```
- Otomatik domain oluşturulacak
- URL gösterilecek

**URL Formatı:**
```
https://galatacarsi-backend-production.up.railway.app
```

KAYDET! 📝

---

### ADIM 8: Test (2 dakika)

**Health Check:**
```
https://your-app.up.railway.app/api/health
```

Tarayıcıda aç, şunu görmelisin:
```json
{
  "status": "OK",
  "message": "Galata Çarşı API is running",
  "timestamp": "2025-12-14T..."
}
```

**Logs Kontrol:**
```bash
railway logs
```

Şunu görmelisin:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

## ✅ TAMAMLANDI!

Backend başarıyla deploy edildi! 🎉

**Backend URL'in:** `https://_____________________.up.railway.app`

---

## 🔜 SONRAKI ADIM

Frontend'de `config.js`'i güncelle:

```javascript
// Satır 12-13:
: 'https://your-backend-url.up.railway.app/api',
```

---

## 🆘 SORUN ÇIKARSA

**Build hatası:**
```bash
railway logs
# Hata mesajını oku
```

**MongoDB bağlanamıyor:**
- Connection string doğru mu?
- Şifre doğru mu?
- IP Whitelist 0.0.0.0/0 eklendi mi?

**Port hatası:**
- Environment variables PORT=5000 ekli mi?

**CORS hatası:**
- FRONTEND_URL doğru mu?

---

## 📞 YARDIM KOMUTLARI

```bash
railway status          # Proje durumu
railway logs            # Canlı logs
railway open            # Dashboard'u aç
railway variables       # Variables listesi
railway domain          # Domain bilgisi
railway help            # Tüm komutlar
```

---

**Hazır mısın? Başlayalım! 🚀**
