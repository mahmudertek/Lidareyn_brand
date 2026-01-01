
import os

# Bildirim çubuğu HTML kodu
NOTICE_HTML = """
    <!-- Geliştirme Aşaması Bildirimi -->
    <div class="development-notice">
        <div class="notice-content">
            <i class="fa-solid fa-circle-info"></i>
            <span>Sitemiz gelişme aşamasındadır. Siparişleriniz için <a href="mailto:mail@galatacarsi.com">mail</a> veya <a href="https://wa.me/905550501374" target="_blank">WhatsApp</a> yoluyla ulaşabilirsiniz.</span>
        </div>
    </div>
"""

# İşlenecek dosyalar listesi (public sayfalar)
TARGET_FILES = [
    "cok-satanlar.html",
    "favoriler.html",
    "giris-yap.html",
    "gizlilik-guvenlik.html",
    "hakkimizda.html",
    "iade-iptal.html",
    "iletisim.html",
    "juvex.html",
    "kvkk.html",
    "mesafeli-satis-sozlesmesi.html",
    "odeme.html",
    "odeme-sonuc.html",
    "profil.html",
    "sifremi-unuttum.html",
    "siparis-basarili.html",
    "siparis-detay.html",
    "siparis-takip.html",
    "tum-siparislerim.html",
    "404.html"
]

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

def add_notice():
    count = 0
    for filename in TARGET_FILES:
        filepath = os.path.join(BASE_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"Atlandi (Bulunamadi): {filename}")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'class="development-notice"' in content:
                print(f"Atlandi (Zaten var): {filename}")
                continue
                
            # <body> etiketini bul ve sonrasına ekle
            if '<body' in content:
                # basit replace yerine regex veya index bulma daha güvenli olabilir ama
                # standart bir yapı varsa replace de çalışır.
                # Ancak body tag'i class'lı olabilir (örn <body class="xyz">), bu yüzden ">" ile biten body tagini bulmak lazım.
                
                # Basit bir yaklaşım: <body...> tag'inin kapanışını bul
                import re
                
                # <body ... > etiketini bul (non-greedy)
                # re.IGNORECASE ile büyük/küçük harf duyarsız
                # Bu regex <body ile başlayıp > ile biten ilk eşleşmeyi bulur
                updated_content = re.sub(r'(<body[^>]*>)', r'\1' + NOTICE_HTML, content, count=1, flags=re.IGNORECASE)
                
                if updated_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"Eklendi: {filename}")
                    count += 1
                else:
                    print(f"Uyari: body etiketi stili farkli, eklenemedi: {filename}")
            else:
                 print(f"Uyari: body etiketi bulunamadi: {filename}")
                 
        except Exception as e:
            print(f"Hata ({filename}): {e}")

    print(f"\nTopam {count} dosyaya bildirim cubugu eklendi.")

if __name__ == "__main__":
    add_notice()
