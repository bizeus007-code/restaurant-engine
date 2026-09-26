import json
import os

with open('/Users/mesa/restaurant-engine/src/data/loqum-products.json') as f:
    products = json.load(f)

print(f"--- VERIFYING {len(products)} PRODUCTS ---")
errors = []

# 1. Unique IDs
ids = [p["id"] for p in products]
if len(ids) != len(set(ids)):
    errors.append(f"Duplicate IDs detected: {len(ids)} vs {len(set(ids))} unique")

# 2. Check each product
categories_found = set()
popular_count = 0

for p in products:
    categories_found.add(p["categoryId"])
    if p.get("isPopular"):
        popular_count += 1
        
    # Check fields
    for field in ["id", "categoryId", "categorySlug", "name", "price", "description", "calories", "prepTime", "stock", "allergens", "image"]:
        if field not in p:
            errors.append(f"Missing field {field} in product {p.get('name')}")
            
    # Check price
    if not isinstance(p["price"], (int, float)) or p["price"] <= 0:
        errors.append(f"Invalid price {p.get('price')} in product {p.get('name')}")
        
    # Check image on disk
    img_rel = p["image"].lstrip('/')
    disk_path = os.path.join('/Users/mesa/restaurant-engine/public', img_rel)
    if not os.path.exists(disk_path):
        errors.append(f"Missing image on disk: {disk_path} for {p.get('name')}")
    elif os.path.getsize(disk_path) < 1000:
        errors.append(f"Suspiciously small image ({os.path.getsize(disk_path)} bytes): {disk_path}")

    # Allergen audit: Saf kırmızı et ve zırh kebap kontrolü
    name_upper = p["name"].upper()
    cat_slug = p["categorySlug"]
    allergens = p["allergens"]
    
    # Pure steaks should NEVER have lactose unless explicit cheddar/butter/cream
    if cat_slug == "steak":
        if "LOQUM" in name_upper and "CHEDDAR" not in name_upper and "HARDAL" not in name_upper:
            if "Laktoz" in allergens:
                errors.append(f"FORBIDDEN: Lactose on plain steak: {p['name']}")
        if any(s in name_upper for s in ["DANA PİRZOLA", "ANTRİKOT", "NEWYORK STEAK", "T-BONE", "BİFTEK", "KUZU KAFES"]) and "CHEDDAR" not in name_upper and "MANTAR" not in name_upper and "HARDAL" not in name_upper:
            if "Laktoz" in allergens:
                errors.append(f"FORBIDDEN: Lactose on plain steak: {p['name']}")
                
    # Plain kebaps should NEVER have lactose
    if cat_slug == "kebaplar":
        if any(k in name_upper for k in ["ADANA", "URFA", "SADE KEBAP", "KUZU ŞİŞ", "KUZU PİRZOLA", "KUZU KÜŞLEME", "KUZU SIRT", "KUZU KÜLBASTI", "KUZU TARAKLIK"]):
            if "Laktoz" in allergens and "YOĞURTLU" not in name_upper and "BEĞENDİ" not in name_upper and "SARMA" not in name_upper and "DOLAMA" not in name_upper:
                errors.append(f"FORBIDDEN: Lactose on plain kebap: {p['name']}")

print(f"Categories covered: {len(categories_found)} / 14")
print(f"Popular products count: {popular_count}")
print(f"Total validation errors: {len(errors)}")

if errors:
    for e in errors[:10]:
        print("ERROR:", e)
else:
    print("ALL 160 PRODUCTS PASSED 100% VALIDATION AUDIT!")

