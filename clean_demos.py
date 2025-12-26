
import re

file_path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match content inside <div class="madeniyat-products-section"> ... </div>
# We want to keep the div, but remove <article class="madeniyat-product-card">...</article> blocks inside it.
# However, regex on nested HTML is hard.
# A simpler approach: Find the section, find the articles, remove them.

# Let's try to match the whole block of articles inside the products-section.
# Since we know the structure:
# <div class="madeniyat-products-section">
#    <article ...> ... </article>
#    <article ...> ... </article>
# </div>

# We will use a regex that matches the opening div, and replaces everything until the closing div
# BUT we must be careful not to consume the closing div if it's nested.
# Fortunately, madeniyat-products-section usually contains just articles.

# Regex explanation:
# <div class="madeniyat-products-section">\s*  --> Start of container
# (.*?)                                        --> Content to capture (and remove/replace)
# \s*</div>                                    --> End of container

# We will replace the group 1 with empty string.

pattern = r'(<div class="madeniyat-products-section">\s*)([\s\S]*?)(\s*</div>)'

def replacement(match):
    # match.group(1) is opening div
    # match.group(2) is the content (articles)
    # match.group(3) is closing div
    # We return opening div + empty content + closing div
    return match.group(1) + "\n                    <!-- Demo Products Removed - Auto Loaded via JS -->\n                " + match.group(3)

# This is risky if there are nested divs inside the product card (which there are: madeniyat-product-info, etc.)
# But since we capture until the first </div> that closes the parent? No, .*? is non-greedy.
# It will stop at the first </div> it finds.
# If product cards have divs inside them (they do!), this regex will break at the first closing div of the first product card.
# Correct. Regex is bad for this.

# Better approach:
# Read file line by line.
# State machine:
# 1. OUTSIDE
# 2. INSIDE_PRODUCTS_SECTION
# 3. INSIDE_ARTICLE (Optional, if we want to selectively remove)

# Since we want to remove ALL demo products inside madeniyat-products-section, we can just skip lines.

new_lines = []
inside_products_section = False
div_counter = 0 # To track nested divs if we were parsing technically, but here we just want to skip <article> blocks?
# No, let's just skip EVERYTHING inside madeniyat-products-section until the closing div of that section.
# How do we know which </div> closes it? Indentation or counting.
# Counting is safer.

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

final_lines = []
stack_count = 0
in_target_section = False

for line in lines:
    stripped = line.strip()
    
    if 'class="madeniyat-products-section"' in line:
        in_target_section = True
        stack_count = 1
        final_lines.append(line)
        # Add a placeholder comment
        final_lines.append("                    <!-- Demo Content Cleared -->\n")
        continue

    if in_target_section:
        # We are inside the section. We want to skip lines until the section closes.
        # But we must track nested divs to know when the SECTION closes.
        open_divs = line.count('<div')
        close_divs = line.count('</div>')
        
        stack_count += (open_divs - close_divs)
        
        if stack_count <= 0:
            in_target_section = False
            final_lines.append(line)
        else:
            # We are inside the section and stack > 0.
            # We want to skip content, BUT...
            # The user wants to remove "demo products". 
            # If we skip everything, we might remove valid structure if there was any.
            # But usually it's just <article>s.
            # So skipping is fine.
            pass
    else:
        final_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("Cleaned demo products from index.html")
