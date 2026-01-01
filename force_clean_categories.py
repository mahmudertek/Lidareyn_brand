import os
import re

# Klasör yolu
categories_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'

# Standart, temiz section yapısı
clean_section = '''    <section class="category-products-section" style="padding: 20px 0;">
        <div class="container">
            <div class="products-grid">
                <!-- Ürünler Admin Panelinden Yüklenecektir -->
            </div>
        </div>
    </section>'''

print("Starting deep cleaning process...")

success_count = 0
fail_count = 0

for filename in os.listdir(categories_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(categories_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Ürün Sayısını "0 Ürün" yap
        # Her türlü sayı varyasyonunu yakala: "198 Ürün", " 198 Ürün ", "0 Ürün", boş vb.
        # <span class="product-count">...</span> içeriğini tamamen değiştirir.
        content = re.sub(r'(<span class="product-count">).*?(</span>)', r'\1 0 Ürün \2', content, flags=re.DOTALL)
        
        # 2. Ürün Bölümünü Temizle
        # Regex: <section class="category-products-section" ... > ... </section>
        # Bu regex, section etiketinin içindeki tüm özellikleri de kapsar ve greedy olmayan bir şekilde eşleşir.
        
        pattern = r'(<section class="category-products-section".*?>)([\s\S]*?)(</section>)'
        
        # Eğer section varsa, içini temizlenmiş yapıyla değiştir
        if re.search(pattern, content):
            # Bulunan kısmın tamamını (açılış, içerik, kapanış) clean_section ile değiştir
            # clean_section zaten <section...>...</section> içeriyor.
            # Ancak clean_section'daki class ve style'ın dosyadaki ile uyuşmama ihtimaline karşı
            # sadece İÇERİĞİ değiştirmek yerine tüm bloğu değiştirmek daha güvenli.
            # Ama regex ile bulduğumuz section'ın attribüteleri önemli olabilir mi? Genelde standarttır.
            # Bizim clean_section'ımız standart: class="category-products-section" style="padding: 20px 0;"
            
            content = re.sub(pattern, clean_section, content, flags=re.DOTALL)
            
            # Ekstra güvenlik: Bazen section'dan sonra serseri div'ler kalabilir (önceki hatalı kopyalamalardan).
            # Eğer dosya sonunda footer'dan önce garip divler varsa??
            # Şimdilik section değişimi yeterli olmalı çünkü demo ürünler section içindeydi.
        else:
            print(f"UYARI: {filename} dosyasında 'category-products-section' bloğu bulunamadı!")
            fail_count += 1
            continue

        # Değişiklik olduysa kaydet
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Düzeldi: {filename}")
            success_count += 1
        else:
            print(f"Değişiklik gerekmedi (Zaten temiz): {filename}")

print(f"\nİşlem Tamamlandı.")
print(f"Başarılı: {success_count}")
print(f"Başarısız/Bulunamayan: {fail_count}")
