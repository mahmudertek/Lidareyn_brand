# -*- coding: utf-8 -*-
import os

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
for filename in os.listdir(KATEGORILER_DIR):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(KATEGORILER_DIR, filename)
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    # Eski mega menu baslangicini bul
    start_marker = '<div class="mega-menu">'
    end_marker = '</ul>\n                        </div>'
    
    start_idx = content.find(start_marker)
    if start_idx < 0:
        print(f'  {filename}: mega menu yok, atlaniyor')
        continue
    
    # End marker'i bul - mega-menu'nun kapanisi
    # mega-menu icinde </ul> ve </div> arayalim
    search_start = start_idx + len(start_marker)
    
    # Son li'nin kapanisini bul (</li> sonrasi </ul> ve </div>)
    # Pattern: </li>\n                            </ul>\n                        </div>
    end_pattern = '</li>\n                            </ul>\n                        </div>'
    end_idx = content.find(end_pattern, search_start)
    
    if end_idx < 0:
        # Alternatif pattern dene
        end_pattern2 = '</li>\r\n                            </ul>\r\n                        </div>'
        end_idx = content.find(end_pattern2, search_start)
    
    if end_idx < 0:
        print(f'  {filename}: mega menu sonu bulunamadi')
        continue
    
    end_idx = end_idx + len(end_pattern)
    
    # Yeni icerik olustur
    new_content = content[:start_idx] + category_mega + content[end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    updated += 1
    print(f'  {filename}: Guncellendi')

print(f'\nToplam {updated} dosya guncellendi')
