# MongoDB Atlas Kurulum Rehberi

## Adım 1: Hesap Oluştur
1. https://www.mongodb.com/cloud/atlas/register adresine git
2. Email ile ücretsiz hesap oluştur
3. Email'i doğrula

## Adım 2: Cluster Oluştur
1. "Build a Database" butonuna tıkla
2. "FREE" (M0) seçeneğini seç
3. Cloud Provider: AWS
4. Region: Frankfurt (eu-central-1) - En yakın
5. Cluster Name: Galata-Carsi
6. "Create" butonuna tıkla (2-3 dakika sürer)

## Adım 3: Database User Oluştur
1. Security → Database Access
2. "Add New Database User"
3. Username: galata_admin
4. Password: Güçlü bir şifre oluştur (kaydet!)
5. Database User Privileges: "Read and write to any database"
6. "Add User"

## Adım 4: Network Access (IP Whitelist)
1. Security → Network Access
2. "Add IP Address"
3. "Allow Access from Anywhere" (0.0.0.0/0) - Development için
4. "Confirm"

## Adım 5: Connection String Al
1. Database → Connect
2. "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Connection string'i kopyala:
   mongodb+srv://galata_admin:<password>@galata-carsi.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. <password> kısmını kendi şifrenle değiştir

## Adım 6: .env Dosyasına Ekle
Connection string'i .env dosyasındaki MONGODB_URI'ye yapıştır

MONGODB_URI=mongodb+srv://galata_admin:SENIN_SIFREN@galata-carsi.xxxxx.mongodb.net/galata_carsi?retryWrites=true&w=majority

## Alternatif: Yerel MongoDB
Eğer yerel MongoDB kullanmak istersen:
1. https://www.mongodb.com/try/download/community
2. Windows MSI installer indir
3. Kur (varsayılan ayarlarla)
4. .env'de şunu kullan:
   MONGODB_URI=mongodb://localhost:27017/galata_carsi
