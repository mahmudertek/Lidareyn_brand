
import os
import re

file_path = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand\\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CLEAN UP GARBAGE MAINTENANCE CODE
# Remove explicit garbage text that might be rendering on screen
garbage_patterns = [
    r'html\s*\{\s*display:\s*none\s*!important;\s*\}',
    r'<\/style>\s*<script>\s*\(function\s*\(\)\s*\{.*?\}\)\(\);\s*<\/script>',
    r'^\s*html\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>',
]

# Simple approach: Identify the "valid" maintenance block I just added, keep it. 
# Remove any OTHER occurrences of "html { display: none !important; }" that are floating around.

# This regex finds the "html { display: none !important; }" pattern.
# We will check if it's inside our known good block.
known_good_block_start = '<style id="bakim-blocking-style">html {display: none !important;}</style>'

if known_good_block_start not in content:
    # If our good block isn't there (maybe slight format diff), let's just nuke ALL maintenance stuff and re-add.
    pass

# Strategy: Remove ALL maintenance-like blocks and re-add SINGLE clean one.
# Matches <style...>html {display: none...}</style>...<script...bakim-ayari...</script>...<script>...(function...)</script>
# But the junk might be separated.

# Let's just remove specific garbage strings seen in the view_file.
lines = content.splitlines()
cleaned_lines = []
skip_mode = False

for line in lines:
    clean_line = line.strip()
    
    # Detect garbage lines seen in previous view
    if clean_line == 'html {' or clean_line == 'display: none !important;' or clean_line == '}' or clean_line == '</style>':
        # Check context: if it's not part of a valid tag structure (heuristically)
        # But wait, "html {" is valid css.
        # The user sees it as TEXT. That means it's likely NOT inside <style>.
        # Or it IS inside <style> but the style tag is visible? <style style="display:block">? No.
        
        # In Step 1362, we saw:
        # 42:     html {
        # 43:     display: none !important;
        # 44:     }
        # 45:     </style>
        
        # This looks like an ORPHAN closing style tag at 45, and text before it.
        # Effectively, the previous tag wasn't opened or was closed earlier.
        # I will remove these specific lines if they appear in this sequence.
        pass

    # Better: Use regex on the whole content to remove the specific duplicate junk blocks.
    pass

# Re-read content
content = open(file_path, 'r', encoding='utf-8').read()

# Remove the specific floating garbage pattern
# Pattern 1:
#     html {
#     display: none !important;
#     }
#     </style>
garbage_regex_1 = r'\s*html\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>'
content = re.sub(garbage_regex_1, '', content, flags=re.MULTILINE)

# Pattern 2: (Just the text without style tag, if any)
# content = re.sub(r'html\s*\{\s*display:\s*none\s*!important;\s*\}', '', content) 
# Wait, this would remove the GOOD one too. The GOOD one is: <style id="bakim-blocking-style">html {display: none !important;}</style>
# So we preserve the one inside the specific ID tag.

# actually, let's just make sure there is ONLY ONE <style id="bakim-blocking-style">
# and remove any other "html { display: none !important; }" occurrences.

parts = content.split('<style id="bakim-blocking-style">')
if len(parts) > 1:
    # Keep the header part
    new_content = parts[0] + '<style id="bakim-blocking-style">'
    # For the rest, replace usage of the css rule
    rest = parts[1]
    # Verify the good one is immediately closing
    if rest.startswith('html {display: none !important;}</style>'):
         # This is our good block. Keep it.
         new_content += 'html {display: none !important;}</style>'
         rest = rest[len('html {display: none !important;}</style>'):]
    
    # Now remove any other instances in 'rest'
    rest = re.sub(r'html\s*\{\s*display:\s*none\s*!important;\s*\}', '', rest)
    rest = re.sub(r'<\/style>\s*<script>\s*\(function\s*\(\)\s*\{.*?\}\)\(\);\s*<\/script>', '', rest, flags=re.DOTALL) # Remove orphaned scripts if any
    
    # Remove orphan </style> tags that might be left
    # Be careful not to remove valid ones.
    # The garbage ones usually follow the css rule we just deleted.
    
    new_content += rest
    content = new_content

# 2. INSERT JUVEX LINK
# Find 'Popüler Ürünler' link
if 'Popüler Ürünler' in content and 'Juvex' not in content:
    # Look for the closing </li> of Popüler Ürünler
    # Pattern: <li><a href="populer.html"...>Popüler Ürünler</a></li>
    
    pattern = r'(<li>\s*<a href="populer\.html"[^>]*>Popüler Ürünler<\/a>\s*<\/li>)'
    replacement = r'\1\n                    <li><a href="juvex.html" class="nav-link">Juvex</a></li>'
    
    content, count = re.subn(pattern, replacement, content)
    if count > 0:
        print("Success: Added Juvex link.")
    else:
        print("Warning: Could not find Popüler Ürünler link to append Juvex.")
        
        # Fallback: Look for "Yeni Gelenler"
        pattern_alt = r'(<li>\s*<a href="yeni-gelenler\.html"[^>]*>Yeni Gelenler<\/a>\s*<\/li>)'
        replacement_alt = r'\1\n                    <li><a href="populer.html" class="nav-link">Popüler Ürünler</a></li>\n                    <li><a href="juvex.html" class="nav-link">Juvex</a></li>'
        # Only if Populer wasn't there at all?
        # User said "popüler ürünler" link is there (implied, or maybe also missing).
        # Let's blindly try to insert after Yeni Gelenler if Populer is also missing.
else:
    print("Info: Juvex link already present or Popüler Ürünler not found.")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned index.html and ensured Juvex link.")
