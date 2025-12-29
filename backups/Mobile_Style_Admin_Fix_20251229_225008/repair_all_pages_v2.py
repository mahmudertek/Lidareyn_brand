
import os
import re

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

# Precise garbage string based on what we see in the file view
# Be very specific to avoid accidental deletion
GARBAGE_PART_1 = """html {
            display: none !important;
        }
    </style>"""

def fix_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        
        # 1. REMOVE DUPLICATE MAINTENANCE BLOCKS
        # Strategy: Keep the first valid maintenance block (identified by bakim-ayari.js script tag)
        # remove any subsequent blocks that look like maintenance scripts/styles.
        
        # Split by the unique script src which should appear only once
        # <script src="bakim-ayari.js...
        # or <script src="../bakim-ayari.js...
        
        # Better: Just find the specific garbage pattern that is creating the visible text.
        # The visible text is "html { display: none !important; }" appearing OUTSIDE of a style tag 
        # OR inside a style tag that is somehow Malformed or Duplicate.
        
        # In the view_file (1475), we see:
        # 41:     </script>
        # 42: 
        # 43:         html {
        # 44:             display: none !important;
        # 45:         }
        # 46:     </style>
        
        # This looks like there is NO opening <style> tag for lines 43-45. That's why it shows as text!
        # So we just need to remove that text.
        
        # Regex to match this orphaned style block closure
        orphan_style_regex = r'\s*html\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>'
        
        # We also need to remove the orphaned script that follows it
        orphan_script_regex = r'<script>\s*\(function\s*\(\)\s*\{[\s\S]*?console\.log\(\'🔧 Bakım Modu: Erişim onaylandı\.\'\);\s*\}\)\(\);\s*<\/script>'
        
        # Apply strict replacements
        # We need to make sure we don't delete the GOOD content at the top.
        # The GOOD content is wrapped in <style id="bakim-blocking-style"> ... </style>
        
        # Let's verify we have the Good Block First
        if 'id="bakim-blocking-style"' in content:
            # We preserve the good block. We remove the bad ones which DO NOT have the ID.
            
            # Find all occurrences of the css rule
            # If occurrences > 1, the extras are garbage.
            
            pass
            
        # Let's just blindly remove the orphaned text pattern because valid CSS would be inside <style> tags
        # and we can be sure "html { display: none !important; }" appearing as raw text (without opening style) is garbage.
        # But regex cannot easily tell if it's inside a tag or not without parsing.
        
        # However, we know the "Good" one has an ID.
        # The "Bad" one in the previous file view clearly had NO ID and NO opening tag immediately before it.
        
        # Let's try to remove the specific string sequence:
        # "        html {\n            display: none !important;\n        }\n    </style>"
        
        content = re.sub(orphan_style_regex, '', content, flags=re.MULTILINE)
        
        # Now remove the duplicate script (lines 47-71 in view)
        # It's an identical copy of the maintenance script.
        # We can detect it because it appears twice.
        
        # Pattern for the maintenance script
        script_pattern = r'<script>\s*\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);\s*<\/script>'
        
        matches = list(re.finditer(script_pattern, content))
        if len(matches) > 1:
            # Keep the first one (assuming it's the one with the correct setup or near top)
            # Remove subsequent ones
            # Iterate backwards to remove without messing up indices
            for match in reversed(matches[1:]):
                start, end = match.span()
                # extra safety: ensure this script content looks like the maintenance one
                script_content = content[start:end]
                if "bakimda.html" in script_content:
                     content = content[:start] + content[end:]
        
        # 2. ADD JUVEX LINK (Safety Check)
        if 'populer.html' in content and 'juvex.html' not in content:
             is_in_subdir = 'kategoriler' in file_path or 'admin' in file_path
             match = re.search(r'<li>\s*<a href="([^"]*)populer\.html"', content)
             if match:
                prefix = match.group(1)
                current_replace = r'\1\n                    <li><a href="' + prefix + r'juvex.html" class="nav-link">Juvex</a></li>'
                content = re.sub(SEARCH_LINK_PATTERN, current_replace, content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")

    except Exception as e:
        print(f"Error {file_path}: {e}")

for root, dirs, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith('.html'):
             fix_file(os.path.join(root, file))
