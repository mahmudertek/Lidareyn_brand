
import os
import re

# Directory containing HTML files
root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'

# Defines the paths to be used
favicon_path = "gorseller/logo.png"
og_image_path = "gorseller/sosyal_medya_gorseli.png"

# Walk through all directories
for dirpath, dirnames, filenames in os.walk(root_dir):
    # Skip excluded directories
    if 'node_modules' in dirnames: dirnames.remove('node_modules')
    if '.git' in dirnames: dirnames.remove('.git')
    
    for filename in filenames:
        if filename.endswith(".html"):
            filepath = os.path.join(dirpath, filename)
            
            # Determine relative path from current HTML file to 'gorseller'
            # If html is in root, rel path is 'gorseller/...'
            # If html is in 'kategoriler/', rel path is '../gorseller/...'
            # simplified logic: calculate relative path via os.path.relpath
            gorseller_abs = os.path.join(root_dir, 'gorseller')
            
            try:
                # We need the relative path to the gorseller folder from the HTML file's dir
                rel_gorseller = os.path.relpath(gorseller_abs, dirpath).replace('\\', '/')
                
                final_favicon = f"{rel_gorseller}/logo.png"
                final_og = f"{rel_gorseller}/sosyal_medya_gorseli.png"
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Regex to update or insert favicon
                # Look for existing icon link
                # <link rel="icon" ... href="...">
                favicon_regex = re.compile(r'<link[^>]*rel=["\']icon["\'][^>]*>', re.IGNORECASE)
                match_favicon = favicon_regex.search(content)
                
                new_favicon_tag = f'<link rel="icon" type="image/png" href="{final_favicon}">'
                
                if match_favicon:
                    content = favicon_regex.sub(new_favicon_tag, content)
                else:
                    # Insert before </head>
                    content = content.replace('</head>', f'    {new_favicon_tag}\n</head>')

                # Regex to update or insert og:image
                og_image_regex = re.compile(r'<meta[^>]*property=["\']og:image["\'][^>]*>', re.IGNORECASE)
                match_og = og_image_regex.search(content)
                
                new_og_tag = f'<meta property="og:image" content="{final_og}">'
                
                if match_og:
                    content = og_image_regex.sub(new_og_tag, content)
                else:
                    # Insert after favicon or before </head>
                    if new_favicon_tag in content:
                        content = content.replace(new_favicon_tag, f'{new_favicon_tag}\n    {new_og_tag}')
                    else:
                         content = content.replace('</head>', f'    {new_og_tag}\n</head>')

                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filename}")
                
            except Exception as e:
                print(f"Failed to process {filepath}: {e}")

