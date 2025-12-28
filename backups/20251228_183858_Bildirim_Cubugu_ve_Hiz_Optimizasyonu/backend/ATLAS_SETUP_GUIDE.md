# 🚀 MongoDB Atlas Kurulum - Adım Adım Rehber

## ✅ Adım 1: Hesap Oluştur
- [x] https://www.mongodb.com/cloud/atlas/register
- [ ] Email ve şifre ile kayıt ol
- [ ] Email'i doğrula

---

## 📦 Adım 2: Cluster Oluştur

Kayıt olduktan sonra:

1. **"Build a Database"** butonuna tıkla
2. **Deployment Type** seçimi:
   - ✅ **M0 (FREE)** seç
   - Diğer seçenekleri atlayın

3. **Cloud Provider & Region:**
   - Provider: **AWS** (varsayılan)
   - Region: **Frankfurt (eu-central-1)** veya **Ireland (eu-west-1)**
   - ℹ️ En yakın Avrupa bölgesini seçin

4. **Cluster Name:**
   - Varsayılan: `Cluster0`
   - Veya: `GalataCarsi`

5. **"Create"** butonuna tıkla
   - ⏳ 2-3 dakika bekleyin (cluster oluşturuluyor)

---

## 👤 Adım 3: Database User Oluştur

Cluster oluşturulurken veya sonrasında:

1. **Security → Database Access** (sol menü)
2. **"Add New Database User"** butonu
3. **Authentication Method:** Password
4. **Username:** `galata_admin`
5. **Password:** 
   - **Autogenerate Secure Password** tıkla
   - ⚠️ **ÖNEMLİ:** Şifreyi kopyala ve kaydet!
   - Veya kendi güçlü şifrenizi yazın
6. **Database User Privileges:** 
   - ✅ **"Read and write to any database"** seç
7. **"Add User"** butonu

---

## 🌐 Adım 4: Network Access (IP Whitelist)

1. **Security → Network Access** (sol menü)
2. **"Add IP Address"** butonu
3. **Access List Entry:**
   - ✅ **"Allow Access from Anywhere"** seç
   - IP: `0.0.0.0/0` (otomatik doldurulur)
   - ℹ️ Development için güvenli, production'da değiştirin
4. **"Confirm"** butonu

---

## 🔗 Adım 5: Connection String Al

1. **Database → Clusters** (sol menü)
2. Cluster'ınızın yanında **"Connect"** butonu
3. **Connect to your application** seç
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. **Connection String** görünecek:

```
mongodb+srv://galata_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Copy** butonu ile kopyala
8. ⚠️ **ÖNEMLİ:** `<password>` kısmını kendi şifrenizle değiştirin!

**Örnek:**
```
mongodb+srv://galata_admin:MySecurePass123@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

---

## ⚙️ Adım 6: Backend'e Bağla

1. **`backend/.env`** dosyasını aç
2. **MONGODB_URI** satırını bul
3. Connection string'i yapıştır:

```env
MONGODB_URI=mongodb+srv://galata_admin:SENIN_SIFREN@cluster0.xxxxx.mongodb.net/galata_carsi?retryWrites=true&w=majority
```

⚠️ **DİKKAT:** 
- `<password>` yerine gerçek şifrenizi yazın
- En sona `/galata_carsi` ekleyin (database adı)

---

## 🚀 Adım 7: Backend'i Başlat

```powershell
cd backend
npm run dev
```

**Başarılı olursa göreceksiniz:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: development
🌐 Frontend URL: file:///C:/Users/pc/Desktop/Lidareyn_brand
```

---

## ✅ Adım 8: Test Et

Tarayıcıda: **http://localhost:5000/api/health**

Başarılı yanıt:
```json
{
  "status": "OK",
  "message": "Galata Çarşı API is running",
  "timestamp": "2025-12-13T..."
}
```

---

## 🧭 BONUS: MongoDB Compass ile Görselleştir

1. **MongoDB Compass indir:** https://www.mongodb.com/try/download/compass
2. Kur ve aç
3. **New Connection** butonu
4. Connection string'i yapıştır (aynı .env'deki)
5. **Connect** butonu
6. Artık veritabanınızı görsel olarak görebilirsiniz! 📊

---

## 🐛 Sorun Giderme

### "Authentication failed"
- Şifreyi doğru yazdınız mı?
- `<password>` kısmını değiştirdiniz mi?

### "IP not whitelisted"
- Network Access'te 0.0.0.0/0 eklediniz mi?

### "Cannot connect to cluster"
- Cluster oluşturuldu mu? (2-3 dakika sürer)
- İnternet bağlantınız var mı?

---

## 📞 Yardım

Her adımda takılırsanız ekran görüntüsü alın ve sorun!

---

## ✨ Tebrikler!

Backend artık gerçek bir veritabanına bağlı! 🎉
