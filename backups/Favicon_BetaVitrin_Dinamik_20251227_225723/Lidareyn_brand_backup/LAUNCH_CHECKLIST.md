# ✅ YARIN YAYINA ALMA - SON KONTROL LİSTESİ

## 🎯 Tarih: 14 Aralık 2025

---

## SABAH (Domain Satın Alma Sonrası)

### 1. Domain Satın Al ✅
- [ ] Domain satın alındı
- [ ] Domain sağlayıcı: _______________
- [ ] Domain adı: _______________

### 2. Hosting Seçimi
- [ ] Backend hosting: Railway.app / Render / Heroku
- [ ] Frontend hosting: Vercel / Netlify
- [ ] Hesaplar oluşturuldu

---

## ÖĞLE (Backend Deployment)

### 3. MongoDB Atlas Hazırlık
- [ ] Production cluster oluşturuldu
- [ ] Database user oluşturuldu
- [ ] IP Whitelist: 0.0.0.0/0 eklendi
- [ ] Connection string kopyalandı

### 4. JWT Secret Oluştur
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] JWT Secret oluşturuldu: _______________

### 5. Backend Deploy (Railway)
- [ ] Railway.app'e giriş yapıldı
- [ ] "New Project" → GitHub repo seçildi
- [ ] Backend klasörü seçildi
- [ ] Environment Variables eklendi:
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] MONGODB_URI=_______________
  - [ ] JWT_SECRET=_______________
  - [ ] JWT_EXPIRE=30d
  - [ ] FRONTEND_URL=https://_______________
- [ ] Deploy edildi
- [ ] Backend URL kopyalandı: _______________

### 6. Backend Test
```bash
# Tarayıcıda aç:
https://your-backend-url/api/health
```
- [ ] Health check çalışıyor
- [ ] MongoDB bağlantısı başarılı

---

## ÖĞLEDEN SONRA (Frontend Deployment)

### 7. config.js Güncelle
```javascript
// Production URL'leri ekle:
API_URL: 'https://_______________/api'
SITE_URL: 'https://_______________'
```
- [ ] Backend URL eklendi
- [ ] Frontend URL eklendi
- [ ] Dosya kaydedildi

### 8. Frontend Deploy (Vercel)
```bash
npm install -g vercel
vercel login
vercel
```
- [ ] Vercel CLI kuruldu
- [ ] Giriş yapıldı
- [ ] Deploy edildi
- [ ] Production URL: _______________

### 9. Domain Bağlama (Vercel)
- [ ] Vercel Dashboard → Settings → Domains
- [ ] Custom domain eklendi
- [ ] DNS kayıtları kopyalandı

---

## AKŞAM (DNS ve Test)

### 10. Domain DNS Ayarları
Domain sağlayıcıda:
```
A Record:
Name: @
Value: 76.76.21.21

CNAME:
Name: www
Value: cname.vercel-dns.com
```
- [ ] A Record eklendi
- [ ] CNAME eklendi
- [ ] DNS propagation bekleniyor (15-30 dk)

### 11. DNS Test
```bash
# CMD'de çalıştır:
nslookup yourdomain.com
```
- [ ] DNS çözümleniyor
- [ ] HTTPS aktif

---

## GECE (Final Test)

### 12. Fonksiyonel Testler
- [ ] Ana sayfa açılıyor
- [ ] Kayıt ol çalışıyor
- [ ] Email doğrulama geliyor
- [ ] Giriş yapma çalışıyor
- [ ] Sepete ekleme çalışıyor
- [ ] Favorilere ekleme çalışıyor
- [ ] Profil sayfası çalışıyor
- [ ] Ödeme sayfası açılıyor
- [ ] Sipariş takip çalışıyor

### 13. Tarayıcı Testleri
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobil (Chrome Mobile)

### 14. Responsive Test
- [ ] Mobil (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

---

## YAYINA ALMA SONRASI

### 15. SEO ve Analytics
- [ ] Google Search Console'a ekle
- [ ] Google Analytics ekle (opsiyonel)
- [ ] Sitemap.xml submit et

### 16. Monitoring
- [ ] UptimeRobot kurulumu (opsiyonel)
- [ ] Error tracking (Sentry - opsiyonel)

### 17. Sosyal Medya
- [ ] İlk paylaşım yap
- [ ] Arkadaşlarına göster
- [ ] Feedback topla

---

## 🚨 SORUN GİDERME

### Backend Bağlanamıyor
1. CORS ayarlarını kontrol et
2. Environment variables doğru mu?
3. MongoDB Atlas IP whitelist: 0.0.0.0/0
4. Backend logs'u kontrol et

### Email Gelmiyor
1. Spam klasörünü kontrol et
2. EmailJS ayarları doğru mu?
3. Backend'de email servisi çalışıyor mu?

### DNS Çalışmıyor
1. 15-30 dakika bekle (propagation)
2. DNS kayıtlarını tekrar kontrol et
3. nslookup ile test et
4. Farklı DNS kullan (8.8.8.8)

### Deployment Hatası
1. Build logs'u oku
2. Environment variables eksiksiz mi?
3. .vercelignore doğru mu?
4. Gereksiz dosyalar silindi mi?

---

## 📞 YARDIM KAYNAKLARI

**Deployment Rehberi:** `DEPLOYMENT_GUIDE.md`
**Hızlı Başlangıç:** `README.md`
**Pre-deployment Check:** `python pre_deployment_check.py`

**Vercel Docs:** https://vercel.com/docs
**Railway Docs:** https://docs.railway.app
**MongoDB Atlas:** https://www.mongodb.com/docs/atlas

---

## ✅ BAŞARI KRİTERLERİ

Site başarıyla yayında sayılır eğer:
- ✅ HTTPS ile açılıyor
- ✅ Kayıt ol çalışıyor
- ✅ Email doğrulama geliyor
- ✅ Giriş yapma çalışıyor
- ✅ Sepet ve favoriler çalışıyor
- ✅ Tüm sayfalar yükleniyor
- ✅ Mobil uyumlu

---

## 🎉 TEBRIKLER!

Siteyi başarıyla yayına aldın! 🚀

**Sonraki Adımlar:**
1. İlk siparişi bekle 🛍️
2. Müşteri feedback'i topla 📝
3. Sürekli iyileştir 📈
4. Pazarlama yap 📣

**Başarılar! 💪**

---

**Not:** Bu checklist'i yazdırabilir veya ekranda açık tutarak adım adım takip edebilirsin.
