import os

def inject_cookie_script():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    script_tag = '<script src="cookie-consent.js"></script>'
    
    count = 0
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".gemini" in root or "backups" in root:
            continue
            
        for file in files:
            if file.endswith(".html"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Eğer script zaten varsa geç
                    if 'cookie-consent.js' in content:
                        print(f"Atlandi (Zaten var): {file}")
                        continue
                    
                    # script.js veya auth.js'den SONRA, </body>'den ÖNCE ekle.
                    if '</body>' in content:
                        new_content = content.replace('</body>', f'    {script_tag}\n</body>')
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Eklendi: {file}")
                        count += 1
                    else:
                        print(f"Uyarı: </body> bulunamadı: {file}")
                        
                except Exception as e:
                    print(f"Hata {file}: {e}")

    print(f"Tamamlandi. Toplam {count} dosyaya cookie script eklendi.")

if __name__ == "__main__":
    inject_cookie_script()
