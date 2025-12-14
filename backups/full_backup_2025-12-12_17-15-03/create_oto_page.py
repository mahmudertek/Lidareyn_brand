import os

def main():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    src_file = os.path.join(base_dir, 'kategoriler', 'hirdavat-teknik-malzemeler.html')
    dst_file = os.path.join(base_dir, 'kategoriler', 'oto-bakim-tamir.html')
    
    with open(src_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace Metadata
    content = content.replace('Hırdavat & Teknik Malzemeler', 'Oto Bakım ve Tamir Malzemeleri')
    content = content.replace('Hırdavat ve teknik malzemeler. Elektrik, tesisat, boya ekipmanları ve profesyonel el aletleri en uygun fiyatlarla.', 'Oto bakım, tamir, onarım ürünleri ve servis ekipmanları en uygun fiyatlarla.')
    
    # Replace Hero Icon
    content = content.replace('fa-screwdriver-wrench', 'fa-car-wrench')
    
    # Replace Hero Description
    # Logic: Look for the specific paragraph in hero
    # "Hırdavat ve teknik malzemeler. Elektrik, tesisat, boya ekipmanları ve profesyonel el aletleri en\n                        uygun fiyatlarla."
    # It might have newlines.
    # We already replaced "Hırdavat & Teknik Malzemeler" -> "Oto Bakım..." globally which covers the H1 and Breadcrumb.
    # But description usually has different text.
    # Let's find the hero <p> tag contents.
    
    # Actually, simpler: just regex replace the paragraph content in the hero section.
    import re
    hero_p_pattern = re.compile(r'(<div class="category-info">\s*<h1>[^<]*</h1>\s*<p>)(.*?)(</p>)', re.DOTALL)
    content = hero_p_pattern.sub(r'\1Oto bakım, tamir ve onarım ürünleri. Krikolar, takviye kabloları, lastik tamir kitleri ve daha fazlası.\3', content)

    # Replace Subcategories Grid
    # We will construct the new grid HTML
    new_grid_html = '''
            <div class="subcategories-grid">
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-car-side"></i></div>
                    <h3>Kaldırma ve Taşıma</h3>
                    <ul class="subcategory-items">
                        <li>Kriko</li>
                        <li>Araç Sehpası</li>
                        <li>Motor Vinci</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-battery-full"></i></div>
                    <h3>Takviye ve Bakım</h3>
                    <ul class="subcategory-items">
                        <li>Akü Takviye Kablosu</li>
                        <li>Gres Tabancası</li>
                        <li>Yağ Pompası</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-wrench"></i></div>
                    <h3>Lastik Onarım</h3>
                    <ul class="subcategory-items">
                        <li>Lastik Tamir Kiti</li>
                        <li>Şişirme Pompası</li>
                        <li>Bijon Anahtarı</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-toolbox"></i></div>
                    <h3>Depolama</h3>
                    <ul class="subcategory-items">
                        <li>Alet Çantası</li>
                        <li>Takım Arabası</li>
                        <li>Organizer</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>'''
            
    # Find existing grid
    grid_pattern = re.compile(r'<div class="subcategories-grid">.*?</div>\s*</div>', re.DOTALL) 
    # This might match too much if there are nested divs inside grid?
    # subcategories-grid contains subcategory-card divs.
    # It ends with </div> and then closing container </div>?
    # View file:
    # <div class="subcategories-grid">
    #    ... cards ...
    # </div>
    # </div> <!-- container -->
    
    # A safer regex: match <div class="subcategories-grid"> until <div class="sidebar-overlay"> (which follows container closing)
    # No, container closing is in between.
    
    # Regex matching balanced tags is hard.
    # But indentation is key.
    # 81:             <div class="subcategories-grid">
    # ...
    # 136:             </div>
    # 137:         </div>
    
    # We can use splitting.
    parts = content.split('<div class="subcategories-grid">')
    if len(parts) > 1:
        prefix = parts[0]
        suffix_parts = parts[1].split('</div>\n        </div>') # Assumptions on whitespace?
        # Let's try to find the END of the grid by looking for the next "container" ending or section ending.
        # Section ends with </section>.
        # Grid is inside container.
        
        # Simpler: Search for `</section>` and replace the grid before it.
        # The grid is the LAST thing in `.subcategories-section`.
        
        section_pattern = re.compile(r'(<section class="subcategories-section">.*?<h2 class="section-title">Alt Kategoriler</h2>)(.*?)(</section>)', re.DOTALL)
        
        # Check if match works
        if section_pattern.search(content):
            content = section_pattern.sub(r'\1' + new_grid_html + '\n        </div>\n    \3', content)
        else:
            print("Could not match section pattern")
            
    with open(dst_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Created {dst_file}")
    
    # os.remove(src_file) # Uncomment to delete

if __name__ == '__main__':
    main()
