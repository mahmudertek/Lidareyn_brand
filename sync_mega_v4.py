# -*- coding: utf-8 -*-
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
KATEGORILER_DIR = os.path.join(ROOT_DIR, "kategoriler")

# index.html'den satir 281-737 arasi mega menu'yu al
with open(os.path.join(ROOT_DIR, "index.html"), 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

# 281-737 arasi satirlar (0-indexed: 280-736)
mega_menu_lines = lines[280:737]
mega_menu_content = ''.join(mega_menu_lines)

print(f'Mega menu icerigi: {len(mega_menu_content)} karakter')

# Kategori sayfalari icin ayarla
category_mega = mega_menu_content
category_mega = category_mega.replace('kategoriler/', '')
category_mega = category_mega.replace('"arama.html', '"../arama.html')

print(f'Kategori icin hazir: {len(category_mega)} karakter')

# Tum kategori sayfalarini guncelle
updated = 0
failed = []
for filename in os.listdir(KATEGORILER_DIR):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(KATEGORILER_DIR, filename)
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    # Eski mega menu'yu regex ile bul ve degistir
    # Pattern: <div class="mega-menu">...tum icerik...</div> (</li> oncesi)
    # Mega menu: <div class="mega-menu"> ile baslar
    # </ul>\n...whitespace...</div> ile biter (nav-item-dropdown icindeki)
    
    start_marker = '<div class="mega-menu">'
    start_idx = content.find(start_marker)
    
    if start_idx < 0:
        print(f'  {filename}: mega menu yok, atlaniyor')
        continue
    
    # Mega menu'nun icindeki mega-menu-list'in sonunu bul
    # </ul> sonrasi gelen ilk </div>'i bul
    # Ama dikkat: ic ice sub-menu'ler var
    
    # Basit yaklasim: </ul> + whitespace + </div> pattern'ini bul
    # ve </li> ile devam eden yeri bul
    
    # mega-menu-list'in kapanisini bul
    search_start = start_idx
    
    # </ul> sayisini takip et
    ul_count = 0
    end_idx = -1
    
    i = search_start
    while i < len(content) - 10:
        if content[i:i+4] == '<ul>':
            ul_count += 1
        elif content[i:i+4] == '<ul ':
            ul_count += 1
        elif content[i:i+5] == '</ul>':
            ul_count -= 1
            # Eger ul_count 0 olduysa ve sonrasinda </div> varsa, mega menu bitti
            if ul_count == 0:
                # </div> ara
                rest = content[i+5:i+100]
                div_match = re.search(r'^\s*</div>', rest)
                if div_match:
                    end_idx = i + 5 + div_match.end()
                    break
        i += 1
    
    if end_idx < 0:
        print(f'  {filename}: mega menu sonu bulunamadi')
        failed.append(filename)
        continue
    
    # Yeni icerik olustur
    new_content = content[:start_idx] + category_mega + content[end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    updated += 1
    print(f'  {filename}: Guncellendi')

print(f'\nToplam {updated} dosya guncellendi')
if failed:
    print(f'Basarisiz: {failed}')
