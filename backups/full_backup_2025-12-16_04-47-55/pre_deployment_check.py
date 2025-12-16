import os
import re
from pathlib import Path

print("🔍 PRE-DEPLOYMENT CHECKLIST")
print("=" * 60)

base_dir = Path(r'c:\Users\pc\Desktop\Lidareyn_brand')
issues = []
warnings = []
success = []

# 1. Config.js kontrolü
print("\n1️⃣ Checking config.js...")
config_file = base_dir / 'config.js'
if config_file.exists():
    with open(config_file, 'r', encoding='utf-8') as f:
        config_content = f.read()
        if 'yourdomain.com' in config_content:
            warnings.append("⚠️ config.js'de 'yourdomain.com' hala mevcut - Production URL'i güncelle!")
        else:
            success.append("✅ config.js production URL'i güncellendi")
else:
    issues.append("❌ config.js bulunamadı!")

# 2. Backend .env kontrolü
print("2️⃣ Checking backend environment...")
backend_env = base_dir / 'backend' / '.env'
if backend_env.exists():
    success.append("✅ Backend .env dosyası mevcut")
else:
    warnings.append("⚠️ Backend .env dosyası bulunamadı")

# 3. HTML dosyalarında config.js kontrolü
print("3️⃣ Checking HTML files for config.js...")
html_files = list(base_dir.glob('*.html'))
html_without_config = []
for html_file in html_files:
    if html_file.name.startswith('test') or html_file.name.startswith('simple'):
        continue
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'config.js' not in content:
            html_without_config.append(html_file.name)

if html_without_config:
    warnings.append(f"⚠️ {len(html_without_config)} HTML dosyasında config.js eksik: {', '.join(html_without_config[:3])}")
else:
    success.append(f"✅ Tüm HTML dosyalarında config.js mevcut ({len(html_files)} dosya)")

# 4. Placeholder kontrolleri
print("4️⃣ Checking for placeholders...")
placeholder_patterns = [
    'localhost:5000',
    'http://localhost',
    '127.0.0.1',
    'example.com',
    'placeholder',
    'TODO',
    'FIXME'
]

files_with_placeholders = {}
for pattern in ['*.js', '*.html', '*.css']:
    for file in base_dir.glob(pattern):
        if 'backup' in str(file) or 'node_modules' in str(file):
            continue
        if file.name in ['config.js', 'auth.js']:  # These are expected to have localhost
            continue
        
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                found_placeholders = []
                for ph in placeholder_patterns:
                    if ph in content.lower():
                        found_placeholders.append(ph)
                
                if found_placeholders:
                    files_with_placeholders[file.name] = found_placeholders
        except:
            pass

if files_with_placeholders:
    warnings.append(f"⚠️ {len(files_with_placeholders)} dosyada placeholder bulundu")
    for file, placeholders in list(files_with_placeholders.items())[:5]:
        print(f"   - {file}: {', '.join(placeholders)}")
else:
    success.append("✅ Placeholder kontrolü temiz")

# 5. SEO dosyaları kontrolü
print("5️⃣ Checking SEO files...")
seo_files = ['sitemap.xml', 'robots.txt']
for seo_file in seo_files:
    if (base_dir / seo_file).exists():
        success.append(f"✅ {seo_file} mevcut")
    else:
        warnings.append(f"⚠️ {seo_file} bulunamadı")

# 6. Gereksiz dosya kontrolü
print("6️⃣ Checking for unnecessary files...")
unnecessary_extensions = ['.py', '.bat', '.tmp', '.log']
unnecessary_files = []
for ext in unnecessary_extensions:
    files = list(base_dir.glob(f'*{ext}'))
    unnecessary_files.extend([f.name for f in files])

if unnecessary_files:
    warnings.append(f"⚠️ {len(unnecessary_files)} gereksiz dosya bulundu (deployment öncesi silinebilir)")
    print(f"   Örnekler: {', '.join(unnecessary_files[:5])}")
else:
    success.append("✅ Gereksiz dosya yok")

# 7. Backend server.js CORS kontrolü
print("7️⃣ Checking backend CORS configuration...")
server_js = base_dir / 'backend' / 'server.js'
if server_js.exists():
    with open(server_js, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'allowedOrigins' in content and 'process.env.FRONTEND_URL' in content:
            success.append("✅ Backend CORS yapılandırması güncel")
        else:
            warnings.append("⚠️ Backend CORS yapılandırması kontrol edilmeli")

# 8. Kritik sayfalar kontrolü
print("8️⃣ Checking critical pages...")
critical_pages = [
    'index.html',
    'giris-yap.html',
    'sepet.html',
    'urun-detay.html',
    'profil.html',
    'iletisim.html'
]

for page in critical_pages:
    if (base_dir / page).exists():
        success.append(f"✅ {page} mevcut")
    else:
        issues.append(f"❌ {page} bulunamadı!")

# Sonuçları yazdır
print("\n" + "=" * 60)
print("📊 SONUÇLAR")
print("=" * 60)

if issues:
    print(f"\n❌ KRİTİK SORUNLAR ({len(issues)}):")
    for issue in issues:
        print(f"  {issue}")

if warnings:
    print(f"\n⚠️ UYARILAR ({len(warnings)}):")
    for warning in warnings:
        print(f"  {warning}")

if success:
    print(f"\n✅ BAŞARILI KONTROLLER ({len(success)}):")
    for s in success[:10]:  # İlk 10'unu göster
        print(f"  {s}")
    if len(success) > 10:
        print(f"  ... ve {len(success) - 10} tane daha")

print("\n" + "=" * 60)
if not issues:
    print("🎉 Deployment için hazırsınız!")
    print("\nSONRAKİ ADIMLAR:")
    print("1. config.js'de production URL'lerini güncelle")
    print("2. Backend'i Railway/Render'a deploy et")
    print("3. Frontend'i Vercel/Netlify'a deploy et")
    print("4. Domain DNS ayarlarını yap")
    print("5. Tüm fonksiyonları test et")
else:
    print("⚠️ Lütfen önce kritik sorunları çözün!")

print("=" * 60)
