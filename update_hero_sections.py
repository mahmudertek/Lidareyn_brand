import os
import re

files_data = [
    {
        "filename": "kaynak-malzemeleri.html",
        "title": "Kaynak Malzemeleri",
        "desc": "Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlarla işinizi güvenle yapın.",
        "image": "kaynak_hero" 
    },
    {
        "filename": "hirdavat-el-aletleri.html",
        "title": "Hırdavat ve El Aletleri",
        "desc": "Her türlü tamirat ve tadilat işiniz için en kaliteli el aletleri ve hırdavat malzemeleri.",
        "image": "hirdavat_hero"
    },
    {
        "filename": "is-guvenligi-ve-calisma-ekipmanlari.html",
        "title": "İş Güvenliği ve Çalışma Ekipmanları",
        "desc": "Güvenliğiniz önceliğimizdir. Baret, yelek, eldiven ve tüm koruyucu ekipmanlar.",
        "image": "is_guvenligi_hero"
    }
]

base_dir = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

print("Updating category pages with Hero Sections...")

for data in files_data:
    filepath = os.path.join(base_dir, data["filename"])
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Eğer zaten eklenmişse (tekrar çalıştırılırsa duplicate olmasın diye kontrol)
    if 'class="category-hero"' in content:
        print(f"Skipping {data['filename']}, hero section already present.")
        continue

    hero_html = f'''
    <!-- Category Hero Section -->
    <header class="category-hero">
        <div class="container">
            <div class="category-header">
                <div class="category-text-content">
                    <h1>{data["title"]}</h1>
                    <p>{data["desc"]}</p>
                     <div class="category-search">
                        <input type="text" placeholder="{data["title"]} ürünlerinde ara...">
                        <button><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                </div>
                <div class="category-visual">
                    <img src="../gorseller/{data["image"]}.png" alt="{data["title"]}">
                </div>
            </div>
        </div>
    </header>
    '''
    
    # Regex ile breadcrumb bloğunun sonunu bulup ekliyoruz.
    # Breadcrumb yapısı: <div class="breadcrumb"> ... </div> (nested container div'i de var)
    # Bu yüzden <div class="breadcrumb"> ile başlayan ve kapanan bloğu bulmalıyız.
    # Basitçe: <div class="breadcrumb">...</div>...</div> (container kapanışı)
    
    # En güvenli yol: breadcrumb class'ı olan div'i ve içindeki her şeyi geçip, 
    # onun dışındaki ilk kapanış </div>'inden sonra eklemek? Hayır, breadcrumb'dan sonra container bitiminde.
    
    # Dosya içeriğine bakalım (hirdavat.html):
    # 464:     <div class="breadcrumb">
    # 465:         <div class="container">
    # ...
    # 469:         </div>
    # 470:     </div>
    
    # 470'den sonra eklemeliyim.
    
    pattern = r'(<div class="breadcrumb">[\s\S]*?</div>\s*</div>)'
    
    if re.search(pattern, content):
        content_new = re.sub(pattern, r'\1' + '\n' + hero_html, content, count=1)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content_new)
        print(f"Updated: {data['filename']}")
    else:
        print(f"Could not find breadcrumb end in {data['filename']}")

print("Done.")
