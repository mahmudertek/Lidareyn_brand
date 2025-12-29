import re

file_path = 'index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define patterns to remove
# We want to remove the entire LI element
patterns = [
    r'\s*<li><a href="[^"]*otomobil\.html">Otomobil</a></li>',
    r'\s*<li><a href="[^"]*elektronik\.html">Elektronik</a></li>',
    # Any other unwanted footer links not caught?
    # Boya, Hortum, etc.
    r'\s*<li><a href="[^"]*hirdavat\.html">Hırdavat</a></li>', # User didn't ask to remove Hırdavat? "Hırdavat ve El Aletleri" is valid.
    # Keep Hırdavat unless told otherwise.
]

new_content = content
for p in patterns:
    # re.IGNORECASE just in case
    new_content = re.sub(p, '', new_content, flags=re.IGNORECASE)

# Verify if we removed them
if "otomobil.html" not in new_content:
    print("Successfully removed otomobil.html link.")
else:
    print("WARNING: otomobil.html link might still be present (check case/attributes).")

if "elektronik.html" not in new_content:
    print("Successfully removed elektronik.html link.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
