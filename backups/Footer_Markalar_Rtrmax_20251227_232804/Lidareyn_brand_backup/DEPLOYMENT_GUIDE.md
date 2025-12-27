# 🚀 YAYINA ALMA REHBERİ - GALATA ÇARŞI

## 📅 Tarih: 14 Aralık 2025
## 🎯 Hedef: Siteyi domain ile canlıya almak

---

## ✅ YAPILMASI GEREKENLER

### 1️⃣ DOMAIN SATIN ALMA SONRASI

#### A. Hosting Seçimi ve Kurulum
- [ ] **Hosting Sağlayıcı Seçimi**
  - Önerilen: Vercel (Frontend için ücretsiz, kolay)
  - Alternatif: Netlify, DigitalOcean, AWS, Hostinger
  
- [ ] **Backend Hosting**
  - Önerilen: Railway, Render, Heroku (ücretsiz planlar mevcut)
  - Alternatif: DigitalOcean, AWS EC2, Google Cloud

#### B. SSL Sertifikası
- [ ] HTTPS için SSL sertifikası (çoğu hosting ücretsiz sağlar)
- [ ] Let's Encrypt otomatik kurulum kontrolü

---

### 2️⃣ BACKEND DEPLOYMENT

#### A. MongoDB Atlas Kontrolü
- [ ] Production cluster oluşturuldu mu?
- [ ] Database user oluşturuldu mu?
- [ ] IP Whitelist ayarlandı mı? (0.0.0.0/0 tüm IP'lere izin verir)
- [ ] Connection string alındı mı?

#### B. Environment Variables (.env)
Backend klasöründe `.env` dosyasını production için güncelle:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/galatacarsı
JWT_SECRET=GÜÇLÜ_RANDOM_SECRET_BURAYA  # En az 32 karakter
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com
```

**JWT_SECRET Oluşturma:**
```bash
# Terminal'de çalıştır:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### C. Backend Deployment Adımları

**Railway.app ile (Önerilen):**
1. Railway.app'e git ve GitHub ile giriş yap
2. "New Project" → "Deploy from GitHub repo"
3. Backend klasörünü seç
4. Environment Variables ekle (.env içeriği)
5. Deploy et
6. URL'i kopyala (örn: `https://your-app.railway.app`)

**Render.com ile:**
1. Render.com'a git
2. "New Web Service" → GitHub repo seç
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables ekle
7. Deploy et

#### D. Backend Test
- [ ] Health check endpoint test: `https://your-backend-url/api/health`
- [ ] Postman ile API endpoint'leri test et

---

### 3️⃣ FRONTEND DEPLOYMENT

#### A. Config.js Güncelleme
`config.js` dosyasını aç ve production URL'lerini güncelle:

```javascript
// Production - BURAYA BACKEND URL'İNİZİ YAZIN
: 'https://your-backend-url.railway.app/api',

// Production - BURAYA DOMAIN'İNİZİ YAZIN
: 'https://yourdomain.com',
```

#### B. Frontend Optimizasyonu
- [ ] Tüm console.log'ları temizle (production için)
- [ ] Gereksiz dosyaları sil (.py scriptleri, test dosyaları)
- [ ] Görselleri optimize et (TinyPNG, ImageOptim)
- [ ] CSS/JS dosyalarını minify et (opsiyonel)

#### C. Vercel ile Deployment (Önerilen)

**1. Vercel Hesabı Oluştur:**
- vercel.com'a git
- GitHub ile giriş yap

**2. Proje Yükle:**
```bash
# Terminal'de:
cd c:\Users\pc\Desktop\Lidareyn_brand
npm install -g vercel  # İlk kez kullanıyorsan
vercel login
vercel
```

**3. Vercel Ayarları:**
- Framework Preset: Other
- Build Command: (boş bırak)
- Output Directory: (boş bırak)
- Install Command: (boş bırak)

**4. Domain Bağlama:**
- Vercel Dashboard → Settings → Domains
- Custom domain ekle
- DNS kayıtlarını güncelle (domain sağlayıcında)

#### D. Netlify ile Deployment (Alternatif)

**1. Netlify Drag & Drop:**
- netlify.com'a git
- "Sites" → Drag & Drop
- Lidareyn_brand klasörünü sürükle
- Deploy et

**2. Domain Bağlama:**
- Site Settings → Domain Management
- Add custom domain
- DNS kayıtlarını güncelle

---

### 4️⃣ DOMAIN DNS AYARLARI

Domain sağlayıcında (GoDaddy, Namecheap, vb.) DNS ayarlarını yap:

**Vercel için:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Netlify için:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

---

### 5️⃣ GÜVENLİK VE PERFORMANS

#### A. Güvenlik Kontrolleri
- [ ] HTTPS aktif mi?
- [ ] CORS doğru yapılandırıldı mı?
- [ ] Environment variables güvende mi? (.env gitignore'da)
- [ ] Rate limiting aktif mi? (server.js'de mevcut ✅)
- [ ] Helmet.js aktif mi? (server.js'de mevcut ✅)

#### B. Performans Optimizasyonu
- [ ] Görseller optimize edildi mi?
- [ ] CDN kullanımı (Cloudflare - ücretsiz)
- [ ] Caching ayarları
- [ ] Gzip compression (çoğu hosting otomatik)

#### C. SEO Kontrolleri
- [ ] Meta tags tüm sayfalarda mevcut
- [ ] Sitemap.xml oluştur
- [ ] robots.txt oluştur
- [ ] Google Search Console'a ekle
- [ ] Google Analytics ekle (opsiyonel)

---

### 6️⃣ TEST VE DOĞRULAMA

#### A. Fonksiyonel Testler
- [ ] Kullanıcı kaydı çalışıyor mu?
- [ ] Email doğrulama geliyor mu?
- [ ] Giriş yapma çalışıyor mu?
- [ ] Sepete ekleme çalışıyor mu?
- [ ] Favorilere ekleme çalışıyor mu?
- [ ] Ödeme sayfası açılıyor mu?
- [ ] Profil sayfası çalışıyor mu?

#### B. Tarayıcı Testleri
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobil tarayıcılar

#### C. Responsive Test
- [ ] Mobil (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

---

### 7️⃣ YAYINA ALMA ÖNCESİ SON KONTROLLER

#### A. İçerik Kontrolleri
- [ ] Tüm placeholder metinler değiştirildi mi?
- [ ] İletişim bilgileri doğru mu?
- [ ] Sosyal medya linkleri doğru mu?
- [ ] Logo ve marka görselleri doğru mu?

#### B. Yasal Gereklilikler
- [ ] Gizlilik Politikası (sozlesmeler.html ✅)
- [ ] Kullanım Koşulları (sozlesmeler.html ✅)
- [ ] KVKK Metni (sozlesmeler.html ✅)
- [ ] İptal ve İade Koşulları (sozlesmeler.html ✅)
- [ ] Mesafeli Satış Sözleşmesi (sozlesmeler.html ✅)

#### C. E-ticaret Gereksinimleri
- [ ] Şirket bilgileri (Hakkımızda sayfası ✅)
- [ ] İletişim formu çalışıyor mu? (iletisim.html ✅)
- [ ] Kargo bilgileri
- [ ] Ödeme yöntemleri bilgisi

---

### 8️⃣ YAYINA ALMA SONRASI

#### A. Monitoring ve Analytics
- [ ] Google Analytics kurulumu
- [ ] Google Search Console ekleme
- [ ] Uptime monitoring (UptimeRobot - ücretsiz)
- [ ] Error tracking (Sentry - ücretsiz plan)

#### B. Yedekleme
- [ ] Otomatik yedekleme ayarla
- [ ] Database backup stratejisi
- [ ] Git repository güncel mi?

#### C. Pazarlama
- [ ] Sosyal medya hesapları oluştur
- [ ] Google My Business kaydı
- [ ] Email marketing hazırlığı

---

## 🎯 HIZLI BAŞLANGIÇ (Minimum Viable Product)

Eğer hızlıca yayına almak istiyorsan, bu minimum adımları takip et:

### 1. Backend (Railway.app)
```bash
1. Railway.app'e git → GitHub ile giriş yap
2. New Project → Deploy from GitHub
3. Backend klasörünü seç
4. Environment Variables ekle:
   - NODE_ENV=production
   - MONGODB_URI=<MongoDB Atlas connection string>
   - JWT_SECRET=<random 32 karakter>
   - FRONTEND_URL=https://yourdomain.com
5. Deploy → URL'i kopyala
```

### 2. Frontend (Vercel)
```bash
1. config.js'i güncelle (backend URL'i ekle)
2. Terminal'de: vercel login
3. vercel
4. Domain ekle: vercel --prod
```

### 3. Domain DNS
```
Domain sağlayıcında:
- A Record: @ → 76.76.21.21
- CNAME: www → cname.vercel-dns.com
```

### 4. Test
```
- https://yourdomain.com'u aç
- Kayıt ol → Email doğrula → Giriş yap
- Sepete ürün ekle → Test et
```

---

## 📞 YARDIM VE DESTEK

### Deployment Sorunları
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://www.mongodb.com/docs/atlas

### Topluluk Desteği
- Stack Overflow
- Reddit: r/webdev
- Discord: Vercel, Railway community

---

## ✅ CHECKLIST ÖZET

**Kritik (Mutlaka Yapılmalı):**
- ✅ Backend deploy edildi (Railway/Render)
- ✅ Frontend deploy edildi (Vercel/Netlify)
- ✅ Domain DNS ayarları yapıldı
- ✅ HTTPS aktif
- ✅ MongoDB Atlas production cluster
- ✅ Environment variables ayarlandı
- ✅ Temel testler yapıldı

**Önemli (İlk hafta içinde):**
- ⚠️ Google Analytics
- ⚠️ Search Console
- ⚠️ Sitemap.xml
- ⚠️ Performans optimizasyonu

**Opsiyonel (Zamanla):**
- 🔵 CDN (Cloudflare)
- 🔵 Error tracking (Sentry)
- 🔵 Uptime monitoring
- 🔵 Email marketing

---

## 🎉 BAŞARILAR!

Siteyi yayına aldıktan sonra:
1. Tüm fonksiyonları test et
2. Arkadaşlarına göster ve feedback al
3. Sosyal medyada paylaş
4. İlk siparişini bekle! 🛍️

**Sorularınız için her zaman buradayım! 💪**
