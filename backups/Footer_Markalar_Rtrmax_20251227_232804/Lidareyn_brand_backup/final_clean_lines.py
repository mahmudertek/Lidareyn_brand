
import os

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

def clean_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip_count = 0
    
    # Track if we have seen the Valid Maintenance Script already
    maintenance_script_count = 0
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # 1. Detect Orphaned CSS Garbage
        # Pattern:
        # html {
        #     display: none !important;
        # }
        # </style>
        
        if stripped == 'html {' and (i+3 < len(lines)):
            l2 = lines[i+1].strip()
            l3 = lines[i+2].strip()
            l4 = lines[i+3].strip()
            
            if l2 == 'display: none !important;' and l3 == '}' and l4 == '</style>':
                # Check if the previous line was NOT <style...>
                # If the previous line was <style...>, then this is valid css (maybe).
                # But our valid one has an ID.
                prev = lines[i-1].strip() if i > 0 else ""
                
                if 'id="bakim-blocking-style"' in prev:
                    # This is the GOOD one. Keep it.
                    new_lines.append(line)
                    i += 1
                    continue
                else:
                    # This is GARBAGE (orphaned text). Skip 4 lines.
                    i += 4
                    continue
        
        # 2. Detect Duplicate Script
        # <script>
        # (function () {
        # ...
        # </script>
        if stripped.startswith('<script>') and (i+1 < len(lines)):
            # Check if this looks like the maintenance script
            # Look ahead a few lines
            is_maintenance = False
            lookahead = "".join(lines[i:i+15]) # Check first 15 lines of script
            if "bakimda.html" in lookahead and "localStorage.getItem" in lookahead:
                is_maintenance = True
            
            if is_maintenance:
                maintenance_script_count += 1
                if maintenance_script_count > 1:
                    # This is a duplicate! Skip until </script>
                    # Find closing tag
                    j = i
                    while j < len(lines):
                        if '</script>' in lines[j]:
                            i = j + 1 # Skip this closing line too, move to next
                            break
                        j += 1
                    continue

        new_lines.append(line)
        i += 1
    
    # Write back if changed
    if len(new_lines) != len(lines):
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Cleaned {file_path}")

for root, dirs, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith('.html'):
            clean_file(os.path.join(root, file))
