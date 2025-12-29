# 🚀 GALATA ÇARŞI - HIZLI BAŞLANGIÇ

## 📦 Proje Özeti
Modern, full-stack e-ticaret platformu
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT + Email Verification

---

## ⚡ HIZLI DEPLOYMENT (5 Dakika)

### 1️⃣ Backend Deploy (Railway.app)

```bash
# 1. Railway.app'e git: https://railway.app
# 2. "New Project" → "Deploy from GitHub repo"
# 3. Backend klasörünü seç
# 4. Environment Variables ekle:

NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/galatacarsı
JWT_SECRET=<32-karakter-random-string>
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com

# 5. Deploy et ve URL'i kopyala (örn: https://your-app.railway.app)
```

**JWT Secret Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2️⃣ Frontend Deploy (Vercel)

```bash
# 1. config.js dosyasını aç ve güncelle:
# - API_URL: https://your-backend-url.railway.app/api
# - SITE_URL: https://yourdomain.com

# 2. Terminal'de:
npm install -g vercel
vercel login
vercel

# 3. Ayarlar:
# - Framework: Other
# - Build Command: (boş)
# - Output Directory: (boş)

# 4. Deploy:
vercel --prod
```

---

### 3️⃣ Domain DNS Ayarları

Domain sağlayıcında (GoDaddy, Namecheap, vb.):

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### 4️⃣ Test

1. https://yourdomain.com'u aç
2. Kayıt ol → Email doğrula
3. Giriş yap
4. Sepete ürün ekle
5. Favorilere ekle
6. Profil sayfasını kontrol et

---

## 🛠️ Yerel Geliştirme (Development)

### Backend

```bash
cd backend
npm install
# .env dosyasını oluştur ve doldur
npm start
# Backend: http://localhost:5000
```

### Frontend

```bash
# HTML dosyalarını doğrudan tarayıcıda aç
# veya Live Server kullan (VS Code extension)
```

---

## 📁 Proje Yapısı

```
Lidareyn_brand/
├── backend/              # Node.js API
│   ├── routes/          # API endpoints
│   ├── models/          # MongoDB models
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation
│   └── server.js        # Express app
├── *.html               # Frontend pages
├── *.css                # Styles
├── *.js                 # Frontend logic
├── config.js            # Environment config
├── sitemap.xml          # SEO
└── robots.txt           # SEO
```

---

## 🔑 Önemli Dosyalar

### `config.js`
Otomatik environment detection (dev/prod)

### `auth.js`
Kullanıcı authentication logic

### `backend/server.js`
Express server + CORS + Security

### `backend/.env`
Environment variables (GİZLİ!)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Backend Railway'e deploy edildi
- [ ] Frontend Vercel'e deploy edildi
- [ ] config.js production URL'leri güncellendi
- [ ] Domain DNS ayarları yapıldı
- [ ] HTTPS aktif
- [ ] Tüm fonksiyonlar test edildi

---

## 📞 Yardım

**Detaylı Rehber:** `DEPLOYMENT_GUIDE.md`

**Pre-deployment Check:**
```bash
python pre_deployment_check.py
```

**Backend Health Check:**
```
https://your-backend-url/api/health
```

---

## 🎯 Sonraki Adımlar

1. ✅ Siteyi deploy et
2. 📊 Google Analytics ekle
3. 🔍 Google Search Console'a kaydet
4. 📱 Sosyal medya hesapları oluştur
5. 📧 Email marketing hazırlığı
6. 🛍️ İlk siparişi bekle!

---

## 🐛 Sorun Giderme

**Backend bağlanamıyor:**
- CORS ayarlarını kontrol et
- Environment variables doğru mu?
- MongoDB Atlas IP whitelist: 0.0.0.0/0

**Email gelmiyor:**
- Spam klasörünü kontrol et
- EmailJS ayarları doğru mu?
- Backend logs'u kontrol et

**Deployment hataları:**
- .vercelignore dosyasını kontrol et
- Build logs'u oku
- Environment variables eksiksiz mi?

---

## 📄 Lisans

Bu proje özel bir e-ticaret projesidir.

---

**🎉 Başarılar! Sorularınız için her zaman buradayım.**
