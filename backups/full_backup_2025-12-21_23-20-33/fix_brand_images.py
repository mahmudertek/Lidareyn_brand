
import re

html_path = r"c:\Users\pc\Desktop\Lidareyn_brand\index.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Eski domain: via.placeholder.com
# Yeni domain: placehold.co
# Format farkı: 
# via: https://via.placeholder.com/150x150/ffffff/fd79a8?text=Brand+12
# placehold.co: https://placehold.co/150x150/fd79a8/ffffff?text=Brand+12 (Renk sırası Background/Text)
# Via: Background (ffffff) / TextColor (fd79a8)
# Placehold.co: Background / TextColor
# Yani Via'daki sondaki renk kodunu başa, baştaki ffffff'i sona almalıyız.

# Regex: https://via\.placeholder\.com/(\d+x\d+)/([a-fA-F0-9]+)/([a-fA-F0-9]+)\?text=(Brand\+\d+)
def replace_match(match):
    size = match.group(1)
    bg_color = match.group(2) # Via'da ilk renk background
    text_color = match.group(3) # Via'da ikinci renk text color
    text = match.group(4)
    # Placehold.co da Background / Text Color şeklindedir
    # O yüzden sırayı koruyoruz: Background=ffffff, Text=Color
    # Ama via linkinde: /ffffff/fd79a8 idi. Yani Beyaz arka plan, renkli yazı.
    
    return f"https://placehold.co/{size}/{bg_color}/{text_color}?text={text}"

# Ancak hata mesajı şuydu: fd79a8?text=Brand+12
# Demek ki link yapısı bozulmuş olabilir. Biz sıfırdan temiz link oluşturalım.

# Basit değiştirelim: via.placeholder.com -> placehold.co yapalım.
# Link yapısı çok benzer.
new_content = content.replace("via.placeholder.com", "placehold.co")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Tüm placeholder linkleri placehold.co ile değiştirildi.")
