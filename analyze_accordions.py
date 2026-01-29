
import os

def read_accordion_part(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # accordion-content div'ini bul
    start_tag = '<div class="accordion-content">'
    if start_tag in content:
        start_idx = content.find(start_tag)
        # Yaklaşık 2000 karakter oku
        return content[start_idx:start_idx+3000]
    return "Not found"

print("--- JENERATORLER (DOGRU) ---")
print(read_accordion_part('kategoriler/jeneratorler.html'))
print("\n--- KAYNAK MALZEMELERI (HATALI) ---")
print(read_accordion_part('kategoriler/kaynak-malzemeleri.html'))
