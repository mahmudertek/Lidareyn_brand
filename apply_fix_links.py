import os

def process_html_files():
    fix_link = '<link rel="stylesheet" href="header-simetri-duzeltme.css">'
    fix_link_sub = '<link rel="stylesheet" href="../header-simetri-duzeltme.css">'
    
    # Root files
    for file in os.listdir('.'):
        if file.endswith('.html'):
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            if fix_link not in content:
                new_content = content.replace('</head>', f'    {fix_link}\n</head>')
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
    
    # Kategori files
    kat_dir = 'kategoriler'
    if os.path.exists(kat_dir):
        for file in os.listdir(kat_dir):
            if file.endswith('.html'):
                path = os.path.join(kat_dir, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if fix_link_sub not in content:
                    new_content = content.replace('</head>', f'    {fix_link_sub}\n</head>')
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    process_html_files()
