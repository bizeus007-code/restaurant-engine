# -*- coding: utf-8 -*-
import json
import os

products_path = 'src/data/loqum-products.json'
menu_path = 'src/data/loqum-menu.json'

with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(menu_path, 'r', encoding='utf-8') as f:
    menu_data = json.load(f)

# 1. Update burger images in products
burger_images = {
    'burgerler-loqum-klasik-burger': '/images/menu/burgerler/loqum-klasik-burger.jpg',
    'burgerler-loqum-double-burger': '/images/menu/burgerler/loqum-double-burger.jpg',
    'burgerler-enfes-loqum-burger': '/images/menu/burgerler/enfes-loqum-burger.jpg',
    'burgerler-loqum-cheese-burger': '/images/menu/burgerler/loqum-cheese-burger.jpg'
}

for p in products:
    if p['id'] in burger_images:
        p['image'] = burger_images[p['id']]

# 2. Priority showcase heavy meats (first 12 items)
priority_ids = [
    'steak-newyork-steak',         # 1. Dallas / Newyork Steak (Dry-Aged İkonik)
    'steak-dana-pirzola',          # 2. Tomahawk / Dana Pirzola (Kemikli Ağır Siklet)
    'steak-loqum',                 # 3. Loqum Bonfile (İmza Mühürleme)
    'steak-satoburyan',            # 4. Şatobüryan (Tereyağında Cızırdayan Spesiyal)
    'firin-etler-kuzu-kol',        # 5. Kuzu Kol Tandır (Taş Fırında 6 Saat Pişen)
    'firin-etler-kuzu-gerdan',     # 6. Kuzu Gerdan (Kemikli Lokum)
    'steak-kuzu-kafes',            # 7. Kuzu Kafes (Bütün Ziyafet)
    'loqum-yoresel-loqum-tava',    # 8. Loqum Tava (Geleneksel Diyarbakır Güveci)
    'kebaplar-citir-yagli-kara',   # 9. Çıtır Yağlı Kara (Meşe Kömüründe Süt Kuzusu)
    'kebaplar-adana',              # 10. Özel Zırh Adana Kebap (Katkısız Kuzu Kaburga)
    'steak-antrikot',              # 11. Dana Antrikot
    'steak-dana-saslik'            # 12. Dana Şaşlık
]

prod_by_id = {p['id']: p for p in products}

# Group products by category
category_hierarchy = [
    'steak',
    'firin-etler',
    'kebaplar',
    'tavalar',
    'loqum-yoresel',
    'kofteler',
    'fajitalar',
    'loqum-pilicler',
    'makarnalar-ve-salatalar',
    'lahmacun-ve-pide',
    'burgerler',
    'kahvalti',
    'tatlilar',
    'icecekler'
]

# Set of placed IDs
placed_ids = set()
reordered_products = []

# First, add the 12 priority heavy meats
for pid in priority_ids:
    if pid in prod_by_id:
        reordered_products.append(prod_by_id[pid])
        placed_ids.add(pid)

# Then add products following category hierarchy
for cat_slug in category_hierarchy:
    cat_prods = [p for p in products if p.get('categorySlug') == cat_slug and p['id'] not in placed_ids]
    for p in cat_prods:
        reordered_products.append(p)
        placed_ids.add(p['id'])

# Add any remaining products (failsafe)
for p in products:
    if p['id'] not in placed_ids:
        reordered_products.append(p)
        placed_ids.add(p['id'])

print(f"Orijinal ürün sayısı: {len(products)}")
print(f"Yeniden sıralanan ürün sayısı: {len(reordered_products)}")
assert len(products) == len(reordered_products) == 160, "Ürün sayısı 160 olmalıdır!"

# Save reordered products
with open(products_path, 'w', encoding='utf-8') as f:
    json.dump(reordered_products, f, ensure_ascii=False, indent=2)

# 3. Reorder categories in loqum-menu.json
cat_order_map = {slug: i + 1 for i, slug in enumerate(category_hierarchy)}
orig_cats = menu_data.get('categories', [])
sorted_cats = sorted(orig_cats, key=lambda c: cat_order_map.get(c.get('slug'), 99))
for i, c in enumerate(sorted_cats):
    c['order'] = i + 1

menu_data['categories'] = sorted_cats
with open(menu_path, 'w', encoding='utf-8') as f:
    json.dump(menu_data, f, ensure_ascii=False, indent=2)

print("Kategori hiyerarşisi ve ürün sıralaması başarıyla güncellendi!")
print("\nİLK 12 ÜRÜN (Vitrin):")
for i, p in enumerate(reordered_products[:12]):
    print(f"{i+1}. {p['name']} ({p['categorySlug']}) - {p['tag']} - {p['calories']} kcal")

print("\nHAMBURGERLER GÖRSELLERİ:")
for p in reordered_products:
    if p.get('categorySlug') == 'burgerler':
        print(f"• {p['name']}: {p['image']}")
