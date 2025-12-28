# 🚂 RAILWAY.APP İLE BACKEND DEPLOYMENT REHBERİ

## 📋 ÖN HAZIRLIK

### 1. MongoDB Atlas Hazırlığı

#### A. MongoDB Atlas Hesabı Oluştur
1. https://cloud.mongodb.com adresine git
2. "Try Free" veya "Sign Up" tıkla
3. Google hesabınla giriş yap

#### B. Cluster Oluştur
1. "Create" butonuna tıkla
2. **Shared** (M0 - FREE) seç
3. **Provider:** AWS
4. **Region:** Frankfurt (eu-central-1) - Türkiye'ye en yakın
5. **Cluster Name:** galatacarsi (veya istediğin)
6. "Create Cluster" tıkla (2-3 dakika sürer)

#### C. Database User Oluştur
1. Sol menüden **Database Access** tıkla
2. "Add New Database User" tıkla
3. **Authentication Method:** Password
4. **Username:** galatacarsiadmin (veya istediğin)
5. **Password:** "Autogenerate Secure Password" tıkla ve KAYDET! 📝
   ```
   Örnek: xK9mP2nQ7vR4sL8t
   ```
6. **Database User Privileges:** "Atlas admin" seç
7. "Add User" tıkla

#### D. Network Access (IP Whitelist)
1. Sol menüden **Network Access** tıkla
2. "Add IP Address" tıkla
3. **"Allow Access from Anywhere"** seç
   - IP: `0.0.0.0/0`
   - Açıklama: "Railway Deployment"
4. "Confirm" tıkla

#### E. Connection String Al
1. Sol menüden **Database** tıkla
2. Cluster'ın yanındaki **"Connect"** butonuna tıkla
3. **"Drivers"** seç
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. Connection string'i kopyala:
   ```
   mongodb+srv://galatacarsiadmin:<password>@galatacarsi.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. `<password>` kısmını gerçek şifrenle değiştir
8. Sonuna database adını ekle:
   ```
   mongodb+srv://galatacarsiadmin:xK9mP2nQ7vR4sL8t@galatacarsi.xxxxx.mongodb.net/galatacarsı?retryWrites=true&w=majority
   ```

✅ **MongoDB Atlas Hazır!**

---

### 2. JWT Secret Oluştur

Terminal'de çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıktı:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Bu değeri KAYDET! 📝

---

## 🚂 RAILWAY DEPLOYMENT

### Adım 1: Railway Hesabı Oluştur

1. https://railway.app adresine git
2. **"Login"** veya **"Start a New Project"** tıkla
3. **GitHub ile giriş yap** (önerilen)
4. Railway'e GitHub erişimi ver

### Adım 2: GitHub Repository Oluştur (Eğer yoksa)

#### A. GitHub'da Yeni Repo Oluştur
1. https://github.com/new adresine git
2. **Repository name:** galatacarsi-backend
3. **Visibility:** Private (önerilen)
4. **Initialize:** Hiçbir şey seçme
5. "Create repository" tıkla

#### B. Local Backend'i GitHub'a Push Et
```bash
# Terminal'de backend klasörüne git:
cd c:\Users\pc\Desktop\Lidareyn_brand\backend

# Git başlat
git init

# Dosyaları ekle
git add .

# Commit yap
git commit -m "Initial backend commit"

# GitHub repo'yu ekle (URL'i GitHub'dan kopyala)
git remote add origin https://github.com/KULLANICI_ADIN/galatacarsi-backend.git

# Main branch oluştur
git branch -M main

# Push et
git push -u origin main
```

**NOT:** Eğer Git yüklü değilse:
```bash
# Git indir ve yükle:
https://git-scm.com/download/win
```

### Adım 3: Railway'de Proje Oluştur

1. Railway Dashboard'da **"New Project"** tıkla
2. **"Deploy from GitHub repo"** seç
3. Repository listesinden **galatacarsi-backend** seç
4. Railway otomatik deploy'u başlatacak (bekle)

### Adım 4: Environment Variables Ekle

1. Railway Dashboard'da projeye tıkla
2. **"Variables"** sekmesine git
3. Aşağıdaki değişkenleri tek tek ekle:

#### Gerekli Environment Variables:

```env
NODE_ENV=production
```

```env
PORT=5000
```

```env
MONGODB_URI=mongodb+srv://galatacarsiadmin:xK9mP2nQ7vR4sL8t@galatacarsi.xxxxx.mongodb.net/galatacarsı?retryWrites=true&w=majority
```
*MongoDB Atlas'tan aldığın connection string'i buraya yapıştır*

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```
*Yukarıda oluşturduğun JWT secret'ı buraya yapıştır*

```env
JWT_EXPIRE=30d
```

```env
FRONTEND_URL=https://yourdomain.com
```
*Domain'ini buraya yaz (henüz yoksa geçici olarak https://localhost bırak, sonra güncellersin)*

#### Opsiyonel (Email için):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@galatacarsı.com
```

### Adım 5: Deploy'u Tetikle

1. Environment variables ekledikten sonra Railway otomatik re-deploy yapacak
2. **"Deployments"** sekmesinden ilerlemeyi izle
3. Build logs'u kontrol et:
   ```
   ✓ Installing dependencies
   ✓ Building application
   ✓ Starting server
   ```

### Adım 6: Public URL Al

1. **"Settings"** sekmesine git
2. **"Networking"** bölümünü bul
3. **"Generate Domain"** tıkla
4. Railway otomatik bir domain oluşturacak:
   ```
   https://galatacarsi-backend-production.up.railway.app
   ```
5. Bu URL'i KAYDET! 📝

---

## ✅ TEST

### 1. Health Check
Tarayıcıda aç:
```
https://your-app.up.railway.app/api/health
```

Beklenen yanıt:
```json
{
  "status": "OK",
  "message": "Galata Çarşı API is running",
  "timestamp": "2025-12-14T00:00:00.000Z"
}
```

### 2. MongoDB Bağlantısı
Railway logs'unda şunu görmelisin:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: production
🌐 Frontend URL: https://yourdomain.com
```

### 3. API Endpoints Test (Postman veya Thunder Client)

#### Register Endpoint:
```http
POST https://your-app.up.railway.app/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456",
  "name": "Test User",
  "gender": "male"
}
```

Beklenen yanıt:
```json
{
  "success": true,
  "message": "Doğrulama kodu email adresinize gönderildi"
}
```

---

## 🔧 SORUN GİDERME

### "Build Failed" Hatası
```bash
# Logs'u kontrol et:
# - package.json doğru mu?
# - Dependencies yüklü mü?
# - Node version uyumlu mu?

# Çözüm: Railway otomatik Node version seçer, genelde sorun olmaz
```

### "MongoDB Connection Error"
```bash
# Kontrol et:
# 1. MONGODB_URI doğru mu?
# 2. Şifre doğru mu? (özel karakterler URL-encoded olmalı)
# 3. IP Whitelist: 0.0.0.0/0 eklendi mi?
# 4. Database user oluşturuldu mu?

# Şifrede özel karakter varsa encode et:
# @ → %40
# # → %23
# $ → %24
```

### "CORS Error" (Frontend'den)
```javascript
// server.js'de CORS ayarları doğru mu kontrol et
// FRONTEND_URL environment variable doğru mu?
```

### "Port Already in Use"
```bash
# Railway otomatik PORT atar, sorun olmamalı
# Ama eğer olursa, server.js'de:
const PORT = process.env.PORT || 5000;
```

---

## 🔄 GÜNCELLEME (Re-deploy)

Kod değişikliği yaptığında:

```bash
# Backend klasöründe:
git add .
git commit -m "Update: açıklama"
git push

# Railway otomatik yeni deploy yapacak!
```

---

## 📊 MONITORING

### Railway Dashboard'da:

1. **Deployments:** Deploy geçmişi
2. **Metrics:** CPU, Memory, Network kullanımı
3. **Logs:** Real-time server logs
4. **Settings:** Domain, environment variables

### Logs İzleme:
```bash
# Railway CLI ile (opsiyonel):
npm install -g @railway/cli
railway login
railway logs
```

---

## 💰 MALIYET

**Railway Free Plan:**
- ✅ $5 ücretsiz kredi/ay
- ✅ 500 saat çalışma/ay
- ✅ 100GB network/ay
- ✅ Shared CPU & Memory

**Küçük bir e-ticaret sitesi için yeterli!**

Eğer limitler aşılırsa:
- Hobby Plan: $5/ay (daha fazla kaynak)
- Pro Plan: $20/ay (production için)

---

## 🎯 SONRAKI ADIMLAR

✅ Backend Railway'de çalışıyor
✅ MongoDB Atlas bağlı
✅ Public URL alındı

**Şimdi:**
1. ✅ Backend URL'i kaydet
2. 🔜 Frontend'de `config.js`'i güncelle
3. 🔜 Frontend'i Vercel'e deploy et
4. 🔜 Domain bağla

---

## 📞 YARDIM

**Railway Docs:** https://docs.railway.app
**Railway Discord:** https://discord.gg/railway
**MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas

---

## ✅ CHECKLIST

Backend deployment tamamlandı mı?

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user oluşturuldu
- [ ] IP Whitelist (0.0.0.0/0) eklendi
- [ ] Connection string alındı
- [ ] JWT Secret oluşturuldu
- [ ] GitHub repo oluşturuldu
- [ ] Backend GitHub'a push edildi
- [ ] Railway projesi oluşturuldu
- [ ] Environment variables eklendi
- [ ] Deploy başarılı
- [ ] Public URL alındı
- [ ] Health check çalışıyor
- [ ] MongoDB bağlantısı başarılı

**Hepsi ✅ ise, backend hazır! 🎉**

---

**Backend URL'in:** `https://_____________________.up.railway.app`

Bu URL'i `config.js`'de kullanacaksın!
