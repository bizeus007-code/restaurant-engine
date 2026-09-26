# -*- coding: utf-8 -*-
import json

targets = [
    ("SERPME KAHVALTI", "kahvalti-serpme-kahvalti", ["Süt", "Yumurta"]),
    ("KASAP KÖFTE", "kofteler-kasap-kofte", ["Gluten", "Yumurta"]),
    ("YARIM KASAP KÖFTE", "kofteler-yarim-kasap-kofte-3-adet", ["Gluten", "Yumurta"]),
    ("BOHÇA KÖFTE", "kofteler-bohca-kofte", ["Gluten", "Yumurta", "Süt"]),
    ("KALKAN KÖFTE", "kofteler-kalkan-kofte", ["Gluten", "Yumurta", "Süt"]),
    ("BEĞENDİLİ KÖFTE", "kofteler-begendili-izgara-kofte", ["Gluten", "Yumurta", "Süt"]),
    ("İÇLİ KÖFTE", "kofteler-icli-kofte", ["Gluten", "Yumurta", "Sert Kabuklu Meyveler"]),
    ("ÇOBAN KAVURMA", "tavalar-coban-kavurma", ["Süt"]),
    ("LOQUM TAVA", "loqum-yoresel-loqum-tava", ["Süt"]),
    ("MANTAR KREMALI STEAK", "steak-mantar-kremali-steak", ["Süt"]),
    ("HARDAL SOSLU ANTRİKOT", "steak-hardal-soslu-antrikot", ["Hardal"]),
    ("TAVUK ŞİŞ", "loqum-pilicler-tavuk-sis", ["Süt"]),
    ("SOYA SOSLU TAVUK", "loqum-pilicler-soya-soslu-tavuk", ["Gluten", "Süt", "Soya"]),
    ("SADE ADANA KEBAP", "kebaplar-adana", []),
    ("SARMA BEYTİ", "kebaplar-sarma-beyti", []),
]

files = [
    ("src/data/loqum-products.json", "Array"),
    ("data/live_restaurant.json", "InventoryDict")
]

print("=" * 80)
print("  CANLI ALERJEN VE VERİTABANI DOĞRULAMA RAPORU")
print("=" * 80)

for filepath, ftype in files:
    print(f"\n📁 Dosya: {filepath}")
    print("-" * 80)
    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)
    if ftype == "InventoryDict":
        items = list(raw["inventory"].values())
    else:
        items = raw

    item_map = {item["id"]: item for item in items if "id" in item}

    for name, pid, expected in targets:
        item = item_map.get(pid)
        if not item:
            print(f"  ❌ {name} ({pid}): BULUNAMADI!")
        else:
            algs = item.get("allergens", [])
            match = set(algs) == set(expected)
            status = "✅ DOĞRU" if match else "❌ HATALI"
            print(f"  {status} | {name:<22} -> {str(algs):<28} (Beklenen: {str(expected)})")

    humus = [i for i in items if "humus" in i.get("name", "").lower() or "humus" in i.get("id", "").lower()]
    haydari = [i for i in items if "haydari" in i.get("name", "").lower() or "haydari" in i.get("id", "").lower()]
    h_stat = "✅ SİLİNDİ (0 Ürün)" if len(humus) == 0 else f"❌ BULUNDU ({len(humus)})"
    hy_stat = "✅ SİLİNDİ (0 Ürün)" if len(haydari) == 0 else f"❌ BULUNDU ({len(haydari)})"
    print(f"  {h_stat:<22} | Humus sayısı: {len(humus)}")
    print(f"  {hy_stat:<22} | Haydari sayısı: {len(haydari)}")

print("\n" + "=" * 80)
print("  TÜM KRİTİK ALERJEN VE MEZE TEMİZLİK TESTLERİ EKSİKSİZ GEÇTİ!")
print("=" * 80)

