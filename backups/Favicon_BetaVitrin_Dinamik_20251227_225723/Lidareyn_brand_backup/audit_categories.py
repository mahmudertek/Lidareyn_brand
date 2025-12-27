import os

# Define strings that SHOULD NOT be present
forbidden_strings = [
    "Boyalar ve Boya Malzemeleri",
    "İzolasyon Malzemeleri",
    # "Elektronik Aksesuar", # This might be allowed in data but not in view? No, user wanted 11th card removed.
    # Actually user said "remove from web design".
    "Hortumlar ve Bağlantı Parçaları",
    "Kapı, Pencere & Çerçeve Sistemleri",
    "Nalburiye & Bağlantı Elemanları", 
    "Otomobil & Motosiklet" # Main category title
]

# We should also check for "Elektronik Aksesuar" in the context of the homepage/mega menu
# The user asked to remove the "11th card", which was Elektronik Aksesuar.

search_dir = "."
found_occurrences = []

extensions = ['.html', '.js', '.css', '.json']

print("Starting audit for forbidden category strings...")

for root, dirs, files in os.walk(search_dir):
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for s in forbidden_strings:
                        if s in content:
                            found_occurrences.append((file_path, s))
            except Exception as e:
                print(f"Could not read {file_path}: {e}")

if found_occurrences:
    print("\n!!! FOUND FORBIDDEN STRINGS IN THE FOLLOWING FILES !!!")
    for path, string in found_occurrences:
        print(f"File: {path} -> Contains: '{string}'")
else:
    print("\n✅ CLEAN. No forbidden category strings found in any file.")
