import os

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

FAVICON_ROOT = """
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
"""

FAVICON_SUB = """
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon.png">
"""

def add_favicons():
    count = 0
    # Sadece root ve kategoriler klasörü hedeflendiği için walk yerine manuel liste daha güvenli
    # Ama walk ile admin hariç gezmek de olur.
    
    for root, dirs, files in os.walk(BASE_DIR):
        # Exclude
        if 'backups' in root or 'admin' in root or 'backend' in root or '.git' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                
                # Check if root or subfolder
                rel_path = os.path.relpath(root, BASE_DIR)
                is_root = (rel_path == '.')
                
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if 'rel="icon"' in content or 'rel="shortcut icon"' in content:
                        # Zaten var
                        continue
                        
                    # Add to head
                    insertion = FAVICON_ROOT if is_root else FAVICON_SUB
                    
                    if '</head>' in content:
                        new_content = content.replace('</head>', insertion + '\n</head>')
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Favicon eklendi: {file}")
                        count += 1
                except Exception as e:
                    print(f"Hata ({file}): {e}")
    
    print(f"Toplam {count} dosyaya favicon eklendi.")

if __name__ == "__main__":
    add_favicons()
