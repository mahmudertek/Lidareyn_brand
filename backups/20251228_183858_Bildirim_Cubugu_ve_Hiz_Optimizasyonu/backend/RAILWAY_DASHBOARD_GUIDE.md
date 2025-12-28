# 🚂 RAILWAY DASHBOARD İLE DEPLOYMENT (EN KOLAY YÖNTEM)

## 🎯 Bu yöntem Git veya CLI gerektirmez!

---

## ADIM 1: MongoDB Atlas Kurulumu

### 1.1 MongoDB Atlas'a Git
- Tarayıcıda aç: https://cloud.mongodb.com
- "Try Free" veya "Sign Up"
- Google hesabınla giriş yap

### 1.2 Cluster Oluştur
1. "Create" butonuna tıkla
2. **Shared** (M0 - FREE) seç
3. **Provider:** AWS
4. **Region:** Frankfurt (eu-central-1)
5. **Cluster Name:** galatacarsi
6. "Create Cluster" (2-3 dakika bekle)

### 1.3 Database User Oluştur
1. Sol menü: **"Database Access"**
2. "Add New Database User"
3. **Username:** galatacarsiadmin
4. **Password:** "Autogenerate Secure Password" → **KAYDET!** 📝
   ```
   Örnek: xK9mP2nQ7vR4sL8t
   ```
5. **Privileges:** "Atlas admin"
6. "Add User"

### 1.4 IP Whitelist
1. Sol menü: **"Network Access"**
2. "Add IP Address"
3. **"Allow Access from Anywhere"** seç
   - IP: 0.0.0.0/0
4. "Confirm"

### 1.5 Connection String Al
1. Sol menü: **"Database"**
2. "Connect" butonu
3. **"Drivers"** seç
4. Connection string kopyala ve düzenle:

**Orijinal:**
```
mongodb+srv://galatacarsiadmin:<password>@galatacarsi.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Düzenlenmiş (şifre ve database adı eklenmiş):**
```
mongodb+srv://galatacarsiadmin:xK9mP2nQ7vR4sL8t@galatacarsi.xxxxx.mongodb.net/galatacarsı?retryWrites=true&w=majority
```

**KAYDET!** 📝

---

## ADIM 2: JWT Secret Oluştur

### Windows PowerShell'de çalıştır:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Çıktı:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**KAYDET!** 📝

---

## ADIM 3: Backend Klasörünü ZIP'le

1. `c:\Users\pc\Desktop\Lidareyn_brand\backend` klasörüne git
2. Tüm dosyaları seç (Ctrl+A)
3. Sağ tık → "Send to" → "Compressed (zipped) folder"
4. İsim: `backend.zip`
5. Desktop'a taşı

**ÖNEMLİ:** ZIP içinde şunlar olmalı:
- server.js
- package.json
- routes/
- models/
- controllers/
- middleware/
- utils/
- .gitignore
- railway.json
- .env.example

**.env dosyası olmamalı!** (Zaten .gitignore'da)

---

## ADIM 4: Railway'e Giriş ve Proje Oluştur

### 4.1 Railway'e Git
- Tarayıcıda aç: https://railway.app
- **"Login"** veya **"Start a New Project"**
- **GitHub ile giriş yap**

### 4.2 Yeni Proje Oluştur
1. **"New Project"** tıkla
2. **"Empty Project"** seç (en altta)
3. Proje adı: **galatacarsi-backend**

### 4.3 Service Ekle
1. **"+ New"** tıkla
2. **"Empty Service"** seç
3. Service adı: **backend**

---

## ADIM 5: Kodu Yükle

### 5.1 GitHub Repo Oluştur (Kolay Yol)

**A. GitHub'da:**
1. https://github.com/new
2. Repository name: **galatacarsi-backend**
3. **Private** seç
4. **Initialize:** Hiçbir şey seçme
5. "Create repository"

**B. GitHub Desktop Kullan (Git bilmiyorsan):**
1. GitHub Desktop indir: https://desktop.github.com
2. Yükle ve GitHub hesabınla giriş yap
3. "File" → "Add local repository"
4. `c:\Users\pc\Desktop\Lidareyn_brand\backend` seç
5. "Create a repository" → "Publish repository"
6. **Private** seç → "Publish"

**C. Railway'de Bağla:**
1. Railway'de service'e tıkla
2. **"Settings"** → **"Source"**
3. **"Connect Repo"**
4. **galatacarsi-backend** seç
5. **"Connect"**

---

## ADIM 6: Environment Variables Ekle

1. Railway'de service'e tıkla
2. **"Variables"** sekmesi
3. **"+ New Variable"** tıkla
4. Aşağıdaki değişkenleri tek tek ekle:

### Gerekli Variables:

**NODE_ENV**
```
production
```

**PORT**
```
5000
```

**MONGODB_URI**
```
mongodb+srv://galatacarsiadmin:xK9mP2nQ7vR4sL8t@galatacarsi.xxxxx.mongodb.net/galatacarsı?retryWrites=true&w=majority
```
*(MongoDB Atlas'tan aldığın connection string)*

**JWT_SECRET**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```
*(Yukarıda oluşturduğun 64 karakterlik string)*

**JWT_EXPIRE**
```
30d
```

**FRONTEND_URL**
```
https://yourdomain.com
```
*(Henüz domain yoksa geçici olarak `https://localhost` yaz)*

---

## ADIM 7: Deploy!

1. Variables ekledikten sonra Railway otomatik deploy başlatır
2. **"Deployments"** sekmesinden ilerlemeyi izle
3. Build logs:
   ```
   ✓ Installing dependencies
   ✓ Building application
   ✓ Starting server
   ```
4. **"Success"** görene kadar bekle (2-3 dakika)

---

## ADIM 8: Public URL Al

1. **"Settings"** sekmesi
2. **"Networking"** bölümü
3. **"Generate Domain"** tıkla
4. Railway otomatik domain oluşturur:
   ```
   https://galatacarsi-backend-production.up.railway.app
   ```
5. **KAYDET!** 📝

---

## ADIM 9: Test

### 9.1 Health Check
Tarayıcıda aç:
```
https://your-app.up.railway.app/api/health
```

**Beklenen:**
```json
{
  "status": "OK",
  "message": "Galata Çarşı API is running",
  "timestamp": "2025-12-14T..."
}
```

### 9.2 Logs Kontrol
1. Railway'de **"Deployments"** sekmesi
2. Son deployment'a tıkla
3. **"View Logs"**

**Görmek istediğin:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: production
🌐 Frontend URL: https://yourdomain.com
```

---

## ✅ BAŞARILI!

Backend Railway'de çalışıyor! 🎉

**Backend URL'in:**
```
https://_____________________.up.railway.app
```

---

## 🔜 SONRAKI ADIM

`c:\Users\pc\Desktop\Lidareyn_brand\config.js` dosyasını aç ve güncelle:

```javascript
// Satır 12-13:
? 'http://localhost:5000/api'
: 'https://YOUR-BACKEND-URL.up.railway.app/api',  // ← BURAYA YAPIŞT IR
```

---

## 🆘 SORUN GİDERME

### "Build Failed"
- **Logs'u oku:** Hangi adımda hata verdi?
- **package.json kontrol:** Doğru mu?
- **Node version:** Railway otomatik seçer

### "MongoDB Connection Error"
- **Connection string doğru mu?**
- **Şifre doğru mu?** (özel karakterler URL-encoded olmalı)
- **IP Whitelist:** 0.0.0.0/0 eklendi mi?
- **Database user:** Oluşturuldu mu?

**Şifrede özel karakter varsa encode et:**
```
@ → %40
# → %23
$ → %24
! → %21
```

### "Application Error"
- **Environment variables:** Hepsi eklendi mi?
- **PORT:** 5000 olarak ayarlı mı?
- **Logs:** Hata mesajı var mı?

---

## 📊 RAILWAY DASHBOARD

**Önemli Sekmeler:**
- **Deployments:** Deploy geçmişi ve logs
- **Metrics:** CPU, Memory, Network kullanımı
- **Variables:** Environment variables
- **Settings:** Domain, source repo, vb.

---

## 💰 MALIYET

**Railway Free Plan:**
- $5 ücretsiz kredi/ay
- 500 saat çalışma/ay
- Küçük projeler için yeterli!

---

**Başarılar! Sorularınız için buradayım! 🚀**
