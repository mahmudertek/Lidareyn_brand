
import os

html_path = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand\\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '<!-- Demo Content Cleared -->'
replacement = """
                    <article class="madeniyat-product-card">
                        <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                        <img src="https://placehold.co/400x400/f3f3f3/ddd?text=Beta+Tools" class="madeniyat-product-image">
                        <div class="madeniyat-product-info"><h3 class="madeniyat-product-name">Yükleniyor...</h3><p class="madeniyat-product-price">--- TL</p></div>
                    </article>
                    <article class="madeniyat-product-card">
                        <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                        <img src="https://placehold.co/400x400/f3f3f3/ddd?text=Beta+Tools" class="madeniyat-product-image">
                        <div class="madeniyat-product-info"><h3 class="madeniyat-product-name">Yükleniyor...</h3><p class="madeniyat-product-price">--- TL</p></div>
                    </article>
                    <article class="madeniyat-product-card">
                        <button class="madeniyat-favorite-btn"><i class="fa-regular fa-heart"></i></button>
                        <img src="https://placehold.co/400x400/f3f3f3/ddd?text=Beta+Tools" class="madeniyat-product-image">
                        <div class="madeniyat-product-info"><h3 class="madeniyat-product-name">Yükleniyor...</h3><p class="madeniyat-product-price">--- TL</p></div>
                    </article>
"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced placeholder content.")
else:
    print("Target not found.")
