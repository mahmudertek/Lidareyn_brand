
import os
import re

# Define the root directory to scan
ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

# Define the garbage pattern (orphaned styling and script from previous bad sync)
# Matches:
#    html {
#        display: none !important;
#    }
#    </style>
#    <script> ... (function ... ) ... </script>
#
# We need to be careful not to match the GOOD block.
# The bad block usually looks like:
# html {\s*display:\s*none\s*!important;\s*}\s*<\/style>\s*<script>\s*\(function\s*\(\)\s*\{\s*\/\/ Bakım sayfası ise kontrol etme.*?\}\)\(\);\s*<\/script>

GARBAGE_REGEX = r'\s*html\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>\s*<script>[\s\S]*?console\.log\(\'🔧 Bakım Modu: Erişim onaylandı\.\'\);\s*\}\)\(\);\s*<\/script>'

# Simple regex for just the css part if the script part varies
GARBAGE_CSS_ONLY = r'^\s*html\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>'

# Juvex Link Insertion
SEARCH_LINK_PATTERN = r'(<li>\s*<a href="[^"]*populer\.html"[^>]*>Popüler Ürünler<\/a>\s*<\/li>)'
REPLACE_LINK = r'\1\n                    <li><a href="juvex.html" class="nav-link">Juvex</a></li>'

def fix_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. REMOVE GARBAGE MAINTENANCE CODE
        # ----------------------------------
        # Strategy: Find the *second* occurrence of "html { display: none !important; }" or specific known garbage blocks.
        # Actually, let's look at the specific garbage structure we saw in the view_file.
        
        # It had:
        # 43:         html {
        # 44:             display: none !important;
        # 45:         }
        # 46:     </style>
        # 47:     <script> ... </script>
        
        # This regex tries to capture that block specifically.
        # We use re.MULTILINE and a pattern that matches the css rule followed by closing style and script.
        
        # Remove the big block first
        content = re.sub(GARBAGE_REGEX, '', content, flags=re.MULTILINE)
        
        # Clean up any remaining "html { display: none !important; }" that is NOT inside <style id="bakim-blocking-style">
        # This is tricky with regex alone.
        # Let's split by the Good ID.
        
        parts = content.split('<style id="bakim-blocking-style">')
        if len(parts) > 1:
            header = parts[0] + '<style id="bakim-blocking-style">'
            body = parts[1]
            
            # The body should start with "html {display: none !important;}</style>" or similar.
            # Let's assume the good block is intact.
            # Now we remove any OTHER instances of "html { display: none !important; }" from 'body'.
            
            # This regex matches the CSS rule loosely
            body = re.sub(r'html\s*\{\s*display:\s*none\s*!important;\s*\}', '', body)
            
            # Also remove orphaned </style> tags that appear right before <script> blocks if they were part of the garbage
            # This is risky, let's stick to the specific block if possible or the pattern seen in file.
            
            # Removing the specific "orphaned" style closing tag if it exists with the css rule above it having been removed? 
            # Actually, `body` creates a new string.
            
            content = header + body
            
        # 2. ADD JUVEX LINK
        # -----------------
        # Ensure we are looking at a relative path or absolute path correction?
        # The regex matches href="...populer.html".
        
        if 'populer.html' in content and 'juvex.html' not in content:
            # Check if headers are relative. In subfolders, link might be "../populer.html"
            # The regex handles [^"]* before populer.html
            
            # We also need to make sure the inserted link has the correct relative path.
            # If current file is in "kategoriler/", link should be "../juvex.html".
            # If in root, "juvex.html".
            
            is_in_subdir = 'kategoriler' in file_path or 'admin' in file_path
            
            # Find the match to see what the prefix is
            match = re.search(r'<li>\s*<a href="([^"]*)populer\.html"', content)
            if match:
                prefix = match.group(1) # e.g. "../" or ""
                
                # Construct replacement with correct prefix
                current_replace = r'\1\n                    <li><a href="' + prefix + r'juvex.html" class="nav-link">Juvex</a></li>'
                
                content = re.sub(SEARCH_LINK_PATTERN, current_replace, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
        else:
            pass # No changes needed
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    print("Starting global repair...")
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.html'):
                # skip node_modules or .git if any (shouldn't be but good practice)
                if 'node_modules' in root or '.git' in root:
                    continue
                    
                full_path = os.path.join(root, file)
                fix_file(full_path)
    print("Repair complete.")

if __name__ == "__main__":
    main()
