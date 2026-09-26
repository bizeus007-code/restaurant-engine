import json

def update_products_list(products):
    for p in products:
        pid = p.get("id", "")
        name = p.get("name", "").upper()
        slug = p.get("categorySlug", "")

        # 1. BURGERLER
        if slug == "burgerler" or slug == "burger":
            p["allergens"] = ["Gluten", "Süt", "Susam"]
            if pid in [
                "burgerler-loqum-cheese-burger",
                "burgerler-enfes-loqum-burger",
                "burgerler-loqum-double-burger",
                "burgerler-loqum-klasik-burger"
            ]:
                p["image"] = "/images/menu/burgerler/loqum-burger.jpg"

        # 2. SOSLU ETLER & ANTRİKOTLAR
        elif pid == "steak-hardal-soslu-antrikot":
            p["image"] = "/images/menu/steak/hardal-soslu-antrikot.jpg"
            p["allergens"] = ["Hardal"]
        elif pid == "steak-hardal-soslu-loqum":
            p["allergens"] = ["Hardal"]
        elif pid == "tavalar-hardal-soslu-bonfile-tava":
            p["allergens"] = ["Hardal"]
        elif pid == "steak-sos-karnavalli-saslik":
            p["allergens"] = ["Hardal"]
        elif pid == "steak-cheddar-soslu-antrikot":
            p["image"] = "/images/menu/steak/cheddar-soslu-antrikot.jpg"
            p["allergens"] = ["Süt"]
        elif pid in ["steak-cheddar-soslu-loqum", "tavalar-cheddar-soslu-bonfile-tava"]:
            p["allergens"] = ["Süt"]

        # 3. KEBAPLAR & FIRIN ÜRÜNLERİ
        elif pid in [
            "kebaplar-begendili-kebap",
            "kebaplar-begendili-kusbasi",
            "loqum-yoresel-begendi-incik",
            "kofteler-begendili-izgara-kofte"
        ]:
            p["allergens"] = ["Süt", "Gluten"]
        elif pid in [
            "kebaplar-firinda-kasarli-sarma-beyti",
            "kebaplar-mantarli-kasarli-sarma"
        ]:
            p["allergens"] = ["Süt", "Gluten"]
        elif pid in [
            "kebaplar-yogurtlu-kebap",
            "kebaplar-yogurtlu-kusbasi",
            "kebaplar-adana-dolama",
            "kebaplar-iskender-usulu-kebap",
            "kebaplar-alinazik",
            "kebaplar-ufo-kebap"
        ]:
            p["allergens"] = ["Süt"]
        elif pid == "kebaplar-loqum-kebap":
            p["allergens"] = ["Sert Kabuklu Meyveler"]
        elif pid in [
            "kebaplar-adana-kebap",
            "kebaplar-urfa-kebap",
            "kebaplar-sade-kebap",
            "kebaplar-kuzu-sirt",
            "kebaplar-kuzu-pirzola",
            "kebaplar-kuzu-sis",
            "kebaplar-kuzu-kusbasi",
            "kebaplar-kuzu-kusleme",
            "kebaplar-kuzu-taraklik",
            "steak-dallas-steak",
            "steak-t-bone",
            "steak-antrikot",
            "steak-newyork-steak",
            "steak-kuzu-kafes",
            "steak-biftek",
            "steak-loqum",
            "steak-satoburyan"
        ]:
            p["allergens"] = []

        # 4. KAHVALTI
        elif pid == "kahvalti-serpme-kahvalti":
            p["allergens"] = ["Süt", "Yumurta"]

    return products

# Update src/data/loqum-products.json
with open("src/data/loqum-products.json", "r", encoding="utf-8") as f:
    src_prods = json.load(f)
updated_src = update_products_list(src_prods)
with open("src/data/loqum-products.json", "w", encoding="utf-8") as f:
    json.dump(updated_src, f, ensure_ascii=False, indent=2)
print("Updated src/data/loqum-products.json successfully.")

# Update data/loqum-products.json
with open("data/loqum-products.json", "r", encoding="utf-8") as f:
    data_prods = json.load(f)
updated_data = update_products_list(data_prods)
with open("data/loqum-products.json", "w", encoding="utf-8") as f:
    json.dump(updated_data, f, ensure_ascii=False, indent=2)
print("Updated data/loqum-products.json successfully.")

# Update data/live_restaurant.json inventory
with open("data/live_restaurant.json", "r", encoding="utf-8") as f:
    live = json.load(f)

inv = live.get("inventory", {})
for p in updated_src:
    pid = p["id"]
    if pid in inv:
        inv[pid]["image"] = p["image"]
        inv[pid]["allergens"] = p.get("allergens", [])

with open("data/live_restaurant.json", "w", encoding="utf-8") as f:
    json.dump(live, f, ensure_ascii=False, indent=2)
print("Updated data/live_restaurant.json inventory successfully.")

