
import os

# Dosya yolları
html_path = r"c:\Users\pc\Desktop\Lidareyn_brand\index.html"
base64_path = r"c:\Users\pc\Desktop\Lidareyn_brand\base64_image.txt"

# Base64 verisini oku
with open(base64_path, "r") as f:
    base64_data = f.read().strip()

# HTML dosyasını oku
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Hedef kod parçası (Değiştirilecek satır)
# Daha önceki adımlarda "bebek_final.jpg" olarak ayarlamıştık.
target_string = "imageUrl = 'file:///C:/Users/pc/Desktop/Lidareyn_brand/gorseller/bebek_final.jpg';"
target_string_alt = "imageUrl = 'gorseller/bebek_final.jpg';" # Alternatif, eğer önceki adımda tam yol işe yaramadıysa

# Yeni kod parçası (Data URI)
new_string = f"imageUrl = 'data:image/jpeg;base64,{base64_data}';"

if target_string in html_content:
    new_content = html_content.replace(target_string, new_string)
    print("Hedef (Tam Yol) bulundu ve değiştirildi.")
elif target_string_alt in html_content:
    new_content = html_content.replace(target_string_alt, new_string)
    print("Hedef (Kısa Yol) bulundu ve değiştirildi.")
else:
    # Eğer tam eşleşme bulamazsak, daha genel bir arama yapıp manuel ekleyelim
    # "if (category.slug === 'bebek-cocuk') {" satırını bulup altına ekleyelim
    search_marker = "if (category.slug === 'bebek-cocuk') {"
    if search_marker in html_content:
        # Mevcut atamayı ezip yenisini ekliyoruz
        new_content = html_content.replace(search_marker, search_marker + "\n" + new_string + "\n//")
        print("Genel işaretleyici bulundu ve altına eklendi.")
    else:
        print("HATA: Hedef kod bulunamadı!")
        exit(1)

# Dosyayı kaydet
with open(html_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("İşlem tamamlandı.")
