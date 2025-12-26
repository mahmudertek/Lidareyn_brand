
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        
        # Pattern 1: Missing closing > for style.css and malformed mobile.css tag with double >>
        # Matches: <link rel="stylesheet" href="...style.css" <link rel="stylesheet" href="...mobile.css?v=5">>
        # We need to be careful about what comes between.
        
        # This regex looks for:
        # 1. <link ... style.css" (without closing >)
        # 2. whitespace
        # 3. <link ... mobile.css?v=5">> (double >)
        
        pattern = r'(<link rel="stylesheet" href="[^"]*style\.css")(\s*)(<link rel="stylesheet" href="[^"]*mobile\.css\?v=5">)>'
        
        if re.search(pattern, new_content):
            # Replace with: \1>\2\3 (removing the last > matches the group, so we keep group 3 which is the tag, but we matched the last > outside group 3? 
            # Wait, group 3 in my regex above includes the first > of >>.
            # Let's refine.
            print(f"Found broken CSS tags in {os.path.basename(filepath)}")
            
            # Simple string replacement for the specific broken string seen in view_file
            # <link rel="stylesheet" href="style.css"
            # <link rel="stylesheet" href="mobile.css?v=5">>
            
            # For root files
            new_content = new_content.replace(
                '<link rel="stylesheet" href="style.css"\n    <link rel="stylesheet" href="mobile.css?v=5">>',
                '<link rel="stylesheet" href="style.css">\n    <link rel="stylesheet" href="mobile.css?v=5">'
            )
             # Handle variation with different whitespace
            new_content = new_content.replace(
                '<link rel="stylesheet" href="style.css" <link rel="stylesheet" href="mobile.css?v=5">>',
                 '<link rel="stylesheet" href="style.css">\n    <link rel="stylesheet" href="mobile.css?v=5">'
            )

            # For category files (../)
            new_content = new_content.replace(
                '<link rel="stylesheet" href="../style.css"\n    <link rel="stylesheet" href="../mobile.css?v=5">>',
                '<link rel="stylesheet" href="../style.css">\n    <link rel="stylesheet" href="../mobile.css?v=5">'
            )
            new_content = new_content.replace(
                '<link rel="stylesheet" href="../style.css" <link rel="stylesheet" href="../mobile.css?v=5">>',
                '<link rel="stylesheet" href="../style.css">\n    <link rel="stylesheet" href="../mobile.css?v=5">'
            )

        # General regex cleanup if exact string match fails but pattern exists
        updated_content = re.sub(
            r'(<link rel="stylesheet" href="[^"]*style\.css")\s*(<link rel="stylesheet" href="[^"]*mobile\.css\?v=5">)>',
            r'\1>\n    \2',
            new_content
        )
        
        if updated_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"Fixed CSS links in: {os.path.basename(filepath)}")
        else:
             print(f"No CSS fix needed for: {os.path.basename(filepath)}")
             
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    print("Scanning root directory...")
    for filename in os.listdir(ROOT_DIR):
        if filename.endswith(".html"):
            fix_file(os.path.join(ROOT_DIR, filename))
            
    categories_dir = os.path.join(ROOT_DIR, "kategoriler")
    if os.path.exists(categories_dir):
        print("\nScanning categories directory...")
        for filename in os.listdir(categories_dir):
            if filename.endswith(".html"):
                fix_file(os.path.join(categories_dir, filename))

if __name__ == "__main__":
    main()
