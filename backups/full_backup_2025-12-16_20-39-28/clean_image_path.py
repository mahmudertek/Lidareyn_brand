
import os
import re

html_path = r"c:\Users\pc\Desktop\Lidareyn_brand\index.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# "if (category.slug === 'bebek-cocuk') {" bloğunu ve içindeki base64 atamasını bulup değiştireceğiz.
# Regex kullanarak o bloğu temizleyelim ve basit hale getirelim.

# Hedef desen: if (category.slug === 'bebek-cocuk') { ... imageUrl = ...; }
# Ancak regex çok satırlı ve karmaşık olabilir.
# Daha basit bir yöntem: "data:image/jpeg;base64," içeren satırı bulup değiştirmek.

if "data:image/jpeg;base64," in content:
    print("Base64 string bulundu, temizleniyor...")
    # Satır satır işleyelim
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        if "data:image/jpeg;base64," in line and "imageUrl =" in line:
            # Bu satırı yeni basit yol ile değiştir
            new_lines.append("                    imageUrl = 'bebek_final.jpg';")
        else:
            new_lines.append(line)
    
    new_content = "\n".join(new_lines)
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Base64 temizlendi ve 'bebek_final.jpg' olarak ayarlandı.")

else:
    print("Base64 bulunamadı. Kod zaten temiz olabilir veya başka bir sorun var.")
    # Yine de emin olmak için slug kontrol bloğunu zorla düzeltelim
    # Bu kısım biraz riskli, string replace ile yapalım
    marker = "if (category.slug === 'bebek-cocuk') {"
    if marker in content:
        # Basit replace yapamıyoruz çünkü içindeki ne bilmiyoruz.
        pass
    else:
        print("Slug kontrol bloğu bulunamadı!")

