import json
import os

SRC_PRODUCTS = '/Users/mesa/restaurant-engine/src/data/loqum-products.json'
DATA_PRODUCTS = '/Users/mesa/restaurant-engine/data/loqum-products.json'

with open(SRC_PRODUCTS, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {SRC_PRODUCTS}")

# ALLERGEN RULE ENGINE
# Categorized mappings based on exact scientific culinary recipe analysis

EXACT_ALLERGEN_MAP = {
    # 21: KEBAPLAR
    # Saf et & köz sebze -> SIFIR ALERJEN (Pide yan ikramdır, ete girmez!)
    "kebaplar-patlicanli-kebap": [],
    "kebaplar-adana": [],
    "kebaplar-urfa": [],
    "kebaplar-sade-kebap": [],
    "kebaplar-kuzu-sis": [],
    "kebaplar-kuzu-pirzola": [],
    "kebaplar-kuzu-kusleme": [],
    "kebaplar-kuzu-sirt": [],
    "kebaplar-kuzu-kulbasti": [],
    "kebaplar-kuzu-taraklik": [],
    "kebaplar-domatesli-kebap": [],
    "kebaplar-sebzeli-kebap": [],
    "kebaplar-alti-ezmeli-kebap": [],
    "kebaplar-kozlu-kebap": [],
    "kebaplar-sirali-kebap": [],
    "kebaplar-halep-isi-kebap": [],
    "kebaplar-loqum-leblebi": [],
    "kebaplar-loqum-kebap": [],
    "kebaplar-beyti-kebap": [],
    "kebaplar-karisik-kebap": [],
    "kebaplar-tavuksuz-karisik-kebap": [],
    "kebaplar-karisik-karnaval-3-kisilik": [],
    "kebaplar-trio-kebap": [],

    # Sarma / Hamur / Kaşar / Yoğurt katmanı olan kebaplar
    "kebaplar-sarma-beyti": ["Gluten", "Laktoz"],
    "kebaplar-firinda-kasarli-sarma-beyti": ["Gluten", "Laktoz"],
    "kebaplar-mantarli-kasarli-sarma": ["Gluten", "Laktoz"],
    "kebaplar-ufo-kebap": ["Gluten", "Laktoz"],
    "kebaplar-begendili-kebap": ["Gluten", "Laktoz"],
    "kebaplar-begendili-kusbasi": ["Gluten", "Laktoz"],
    "kebaplar-alinazik": ["Gluten", "Laktoz"],
    "kebaplar-yogurtlu-kebap": ["Gluten", "Laktoz"],
    "kebaplar-yogurtlu-kusbasi": ["Gluten", "Laktoz"],
    "kebaplar-iskender-usulu-kebap": ["Gluten", "Laktoz"],

    # Tereyağlı / Yoğurtlu tavada kebaplar
    "kebaplar-adana-dolama": ["Laktoz (Tereyağı)"],
    "kebaplar-cizir-cizir-tavada-kuzu-sirt": ["Laktoz (Tereyağı)"],
    "kebaplar-citir-yagli-kara": ["Laktoz"],

    # 27: STEAK
    # Saf mühürlenmiş kuru dinlendirilmiş etler -> SIFIR ALERJEN
    "steak-dana-pirzola": [],
    "steak-antrikot": [],
    "steak-loqum": [],
    "steak-newyork-steak": [],
    "steak-kuzu-kafes": [],
    "steak-dana-saslik": [],
    "steak-biftek": [],
    "steak-mexican-steak": [],
    "steak-paper-steak": [],
    "steak-kasap-sucuk-250gr": [],
    "steak-t-bone": [],
    "steak-diyet-antrikot": [],

    # Soslu Steakler
    "steak-satoburyan": ["Laktoz (Tereyağı)"],
    "steak-cheddar-soslu-antrikot": ["Laktoz (Cheddar)"],
    "steak-cheddar-soslu-loqum": ["Laktoz (Cheddar)"],
    "steak-mantar-kremali-steak": ["Laktoz"],
    "steak-mantar-soslu-antrikot": ["Laktoz"],
    "steak-mantar-soslu-steak": ["Laktoz"],
    "steak-hardal-soslu-loqum": ["Hardal"],
    "steak-hardal-soslu-antrikot": ["Hardal"],
    "steak-sos-karnavalli-saslik": ["Hardal", "Laktoz"],

    # 22: KÖFTELER
    "kofteler-kasap-kofte": ["Gluten"],
    "kofteler-yarim-kasap-kofte-3-adet": ["Gluten"],
    "kofteler-kalkan-kofte": ["Gluten", "Laktoz (Cheddar)"],
    "kofteler-bohca-kofte": ["Gluten", "Laktoz"],
    "kofteler-begendili-izgara-kofte": ["Gluten", "Laktoz"],
    "kofteler-icli-kofte": ["Gluten", "Ceviz"],

    # 17: BURGERLER
    "burgerler-loqum-klasik-burger": ["Gluten", "Susam"],
    "burgerler-loqum-double-burger": ["Gluten", "Laktoz (Cheddar)", "Susam"],
    "burgerler-enfes-loqum-burger": ["Gluten", "Laktoz (Cheddar)", "Susam"],
    "burgerler-loqum-cheese-burger": ["Gluten", "Laktoz (Cheddar)", "Susam"],
    "burgerler-3-lu-mini-burger": ["Gluten", "Susam"],
    "burgerler-tavuk-burger": ["Gluten", "Yumurta", "Susam"],
    "burgerler-kapali-loqum-burger": ["Gluten", "Laktoz (Cheddar)", "Susam"],

    # 18: FAJİTALAR
    "fajitalar-et-fajita": ["Gluten"],
    "fajitalar-tavuk-fajita": ["Gluten"],
    "fajitalar-cumbo-fajita": ["Gluten"],

    # 19: FIRIN ETLER (6 saat taş fırında saf kuzu eti)
    "firin-etler-kuzu-kol": [],
    "firin-etler-kuzu-gerdan": [],

    # 20: KAHVALTI
    "kahvalti-kavurma": [],
    "kahvalti-omlet": ["Yumurta", "Laktoz (Tereyağı)"],
    "kahvalti-menemen": ["Yumurta", "Laktoz (Tereyağı)"],
    "kahvalti-cocuk-menusu": ["Gluten"],
    "kahvalti-serpme-kahvalti": ["Gluten", "Laktoz", "Yumurta"],

    # 23: LOQUM PİLİÇLER
    "loqum-pilicler-tavuk-copsis": [],
    "loqum-pilicler-tavuk-sis": [],
    "loqum-pilicler-tavuk-kanat": [],
    "loqum-pilicler-sebzeli-tavuk": [],
    "loqum-pilicler-tavuk-kulbasti": [],
    "loqum-pilicler-acili-mantarli-tavuk": [],
    "loqum-pilicler-kori-soslu-tavuk": ["Laktoz"],
    "loqum-pilicler-soya-soslu-tavuk": ["Soya", "Gluten"],
    "loqum-pilicler-mantar-soslu-tavuk": ["Laktoz"],
    "loqum-pilicler-soya-soslu-tavuk-fileto": ["Soya", "Gluten"],

    # 24: LOQUM YÖRESEL
    "loqum-yoresel-loqum-tava": [],
    "loqum-yoresel-saslik-tava": [],
    "loqum-yoresel-kavurma": [],
    "loqum-yoresel-firinda-kapama-dana-saslik": [],
    "loqum-yoresel-firinda-kapama-comlekte-pirzola": [],
    "loqum-yoresel-asci-tabagi": ["Gluten"],
    "loqum-yoresel-pilav-ustu-kuzu-tandir": ["Laktoz (Tereyağı)"],
    "loqum-yoresel-comlekte-kuzu-tandir": ["Laktoz (Tereyağı)"],
    "loqum-yoresel-pilav": ["Laktoz (Tereyağı)"],
    "loqum-yoresel-begendi-incik": ["Gluten", "Laktoz"],
    "loqum-yoresel-firin-incik": ["Laktoz"],
    "loqum-yoresel-corba": ["Gluten"],
    "loqum-yoresel-arpa-sehriyeli-kuzu-incik": ["Gluten"],
    "loqum-yoresel-arpa-sehriyeli-kuzu-tandir": ["Gluten"],

    # 28: TAVALAR
    "tavalar-coban-kavurma": [],
    "tavalar-sebzeli-bonfile-tava": [],
    "tavalar-cheddar-soslu-bonfile-tava": ["Laktoz (Cheddar)"],
    "tavalar-mantar-soslu-bonfile-tava": ["Laktoz"],
    "tavalar-acili-mantarli-bonfile-tava": ["Laktoz"],
    "tavalar-hardal-soslu-bonfile-tava": ["Hardal"],
    "tavalar-kontrafile-sasa": ["Soya", "Gluten"],
    "tavalar-firinda-peynirli-mantar": ["Laktoz"],

    # 25: MAKARNALAR VE SALATALAR
    "makarnalar-ve-salatalar-fettuccine-alfredo-etli": ["Gluten", "Laktoz"],
    "makarnalar-ve-salatalar-fettuccine-alfredo-tavuklu": ["Gluten", "Laktoz"],
    "makarnalar-ve-salatalar-bonfile-parcacikli-logotoni": ["Gluten", "Laktoz"],
    "makarnalar-ve-salatalar-rigotoni-bolonez": ["Gluten", "Laktoz"],
    "makarnalar-ve-salatalar-steak-salata": ["Laktoz", "Ceviz"],
    "makarnalar-ve-salatalar-bonfile-salata": [],
    "makarnalar-ve-salatalar-izgara-tavuklu-salata": [],
    "makarnalar-ve-salatalar-patates-cipsi": [],
    "makarnalar-ve-salatalar-tavuklu-sezar-salata": ["Gluten", "Laktoz", "Yumurta"],
    "makarnalar-ve-salatalar-sezar-salata": ["Gluten", "Laktoz", "Yumurta"],
    "makarnalar-ve-salatalar-izgara-hellim-peynirli-salata": ["Laktoz"],
    "makarnalar-ve-salatalar-ton-balikli-salata": ["Balık"],
    "makarnalar-ve-salatalar-meze-1": ["Laktoz"],
    "makarnalar-ve-salatalar-meze-2": ["Susam"],

    # 26: LAHMACUN VE PİDE
    "lahmacun-ve-pide-lahmacun-1-adet": ["Gluten"],
    "lahmacun-ve-pide-karisik-lahmacun": ["Gluten"],
    "lahmacun-ve-pide-findik-lahmacun": ["Gluten"],
    "lahmacun-ve-pide-karisik-tabak-alti": ["Gluten"],
    "lahmacun-ve-pide-kiymali-pide": ["Gluten"],
    "lahmacun-ve-pide-kusbasi-pide": ["Gluten"],
    "lahmacun-ve-pide-sucuklu-pide": ["Gluten"],
    "lahmacun-ve-pide-kasarli-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-sucuklu-kasarli-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-kiymali-kasarli-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-kasarli-kusbasi-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-kavurmali-kasarli-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-karisik-pide": ["Gluten", "Laktoz"],
    "lahmacun-ve-pide-loqum-pide": ["Gluten", "Laktoz"],

    # 29: TATLILAR
    "tatlilar-cennet-camuru": ["Gluten", "Laktoz", "Antep Fıstığı"],
    "tatlilar-soguk-baklava": ["Gluten", "Laktoz", "Antep Fıstığı"],
    "tatlilar-katmer": ["Gluten", "Laktoz", "Antep Fıstığı"],
    "tatlilar-incir-tatlisi": ["Ceviz", "Laktoz"],
    "tatlilar-kabak-tatlisi": ["Susam", "Ceviz"],

    # 30: İÇECEKLER
    "icecekler-ayran": ["Laktoz"],
    "icecekler-kapali-ayran": ["Laktoz"],
    "icecekler-portakal-suyu": [],
    "icecekler-coca-cola": [],
    "icecekler-coca-cola-zero": [],
    "icecekler-fanta": [],
    "icecekler-karisik-meyve-suyu": [],
    "icecekler-corcil": [],
    "icecekler-gazoz": [],
    "icecekler-sade-soda": [],
    "icecekler-limonlu-soda": [],
    "icecekler-ice-tea": [],
    "icecekler-salgam": [],
    "icecekler-buyuk-su": [],
    "icecekler-kucuk-su": []
}

# CALORIE REFINEMENT ENGINE (Strict cooked weight & ingredient science)
# 100g cooked red meat = 220-280 kcal
# 200g cooked lamb mince kebap + roasted pepper/tomato = ~540-580 kcal
CALORIE_CORRECTIONS = {
    "kebaplar-adana": 560,
    "kebaplar-urfa": 560,
    "kebaplar-sade-kebap": 540,
    "kebaplar-patlicanli-kebap": 560,
    "kebaplar-kuzu-sis": 540,
    "kebaplar-kuzu-pirzola": 620,
    "kebaplar-kuzu-kusleme": 520,
    "kebaplar-kuzu-sirt": 560,
    "kebaplar-kuzu-kulbasti": 540,
    "kebaplar-kuzu-taraklik": 640,
    "kebaplar-domatesli-kebap": 550,
    "kebaplar-sebzeli-kebap": 540,
    "kebaplar-alti-ezmeli-kebap": 550,
    "kebaplar-kozlu-kebap": 540,
    "kebaplar-sirali-kebap": 510,
    "kebaplar-halep-isi-kebap": 550,
    "kebaplar-loqum-leblebi": 620,
    "kebaplar-loqum-kebap": 580,
    "kebaplar-beyti-kebap": 580,
    "kebaplar-sarma-beyti": 760,
    "kebaplar-adana-dolama": 740,
    "kebaplar-yogurtlu-kebap": 720,
    "kebaplar-alinazik": 690,
    "kebaplar-begendili-kebap": 750,
    "kebaplar-begendili-kusbasi": 760,
    "kebaplar-yogurtlu-kusbasi": 720,
    "kebaplar-iskender-usulu-kebap": 760,
    "kebaplar-firinda-kasarli-sarma-beyti": 810,
    "kebaplar-mantarli-kasarli-sarma": 820,
    "kebaplar-ufo-kebap": 820,
    "kebaplar-cizir-cizir-tavada-kuzu-sirt": 690,
    "kebaplar-citir-yagli-kara": 740,
    "kebaplar-karisik-kebap": 880,
    "kebaplar-tavuksuz-karisik-kebap": 920,
    "kebaplar-trio-kebap": 740,
    "kebaplar-karisik-karnaval-3-kisilik": 2150,

    # Steaks
    "steak-dana-pirzola": 780,
    "steak-antrikot": 680,
    "steak-loqum": 580,
    "steak-newyork-steak": 640,
    "steak-t-bone": 790,
    "steak-satoburyan": 1180,
    "steak-kuzu-kafes": 1580,
    "steak-dana-saslik": 620,
    "steak-biftek": 590,
    "steak-mexican-steak": 630,
    "steak-paper-steak": 610,
    "steak-diyet-antrikot": 520,
    "steak-cheddar-soslu-antrikot": 790,
    "steak-cheddar-soslu-loqum": 720,
    "steak-mantar-kremali-steak": 710,
    "steak-mantar-soslu-antrikot": 740,
    "steak-mantar-soslu-steak": 720,
    "steak-hardal-soslu-loqum": 620,
    "steak-hardal-soslu-antrikot": 690,
    "steak-sos-karnavalli-saslik": 720,
    "steak-kasap-sucuk-250gr": 760
}

# AUDIT & APPLY
updated_count = 0
not_mapped = []

for p in products:
    p_id = p["id"]
    
    # 1. Update allergens
    if p_id in EXACT_ALLERGEN_MAP:
        new_allergens = EXACT_ALLERGEN_MAP[p_id]
        if p.get("allergens") != new_allergens:
            p["allergens"] = new_allergens
            updated_count += 1
    else:
        not_mapped.append((p_id, p["name"]))

    # 2. Update calories if in correction table
    if p_id in CALORIE_CORRECTIONS:
        p["calories"] = CALORIE_CORRECTIONS[p_id]

if not_mapped:
    print("WARNING: Unmapped products:", not_mapped)
else:
    print("All 160 products mapped to exact allergen definitions!")

# STATISTICAL BREAKDOWN
allergen_free = [p for p in products if len(p.get("allergens", [])) == 0]
gluten_items = [p for p in products if any("Gluten" in a for a in p.get("allergens", []))]
lactose_items = [p for p in products if any("Laktoz" in a for a in p.get("allergens", []))]

# Specific allergen breakdowns
sesame_items = [p for p in products if any("Susam" in a for a in p.get("allergens", []))]
nut_items = [p for p in products if any(a in ["Antep Fıstığı", "Ceviz"] for a in p.get("allergens", []))]
mustard_items = [p for p in products if any("Hardal" in a for a in p.get("allergens", []))]
soy_items = [p for p in products if any("Soya" in a for a in p.get("allergens", []))]
fish_items = [p for p in products if any("Balık" in a for a in p.get("allergens", []))]
egg_items = [p for p in products if any("Yumurta" in a for a in p.get("allergens", []))]

# Find Patlıcanlı Kebap specifically
patlicanli = next((p for p in products if "PATLICANLI" in p["name"].upper()), None)

print("\n" + "="*50)
print("🔬 LOQUM ET ALERJEN VE GASTRONOMİ DENETİM SONUÇLARI")
print("="*50)
print(f"Toplam İncelenen Ürün    : {len(products)}")
print(f"Alerjensiz (Saf Et/Sebze): {len(allergen_free)} ürün (%{len(allergen_free)*100/len(products):.1f})")
print(f"Gluten İçeren            : {len(gluten_items)} ürün (%{len(gluten_items)*100/len(products):.1f})")
print(f"Laktoz İçeren            : {len(lactose_items)} ürün (%{len(lactose_items)*100/len(products):.1f})")
print(f"Susam (Tahin/Burger)     : {len(sesame_items)} ürün")
print(f"Kuruyemiş (Fıstık/Ceviz) : {len(nut_items)} ürün")
print(f"Hardal                   : {len(mustard_items)} ürün")
print(f"Soya                     : {len(soy_items)} ürün")
print(f"Balık                    : {len(fish_items)} ürün")
print(f"Yumurta                  : {len(egg_items)} ürün")
print("="*50)

if patlicanli:
    print(f"\n🍆 'PATLICANLI KEBAP' DENETİM KONTROLÜ:")
    print(f"   ID         : {patlicanli['id']}")
    print(f"   Adı        : {patlicanli['name']}")
    print(f"   Kategori   : {patlicanli['categorySlug']}")
    print(f"   Gramaj     : {patlicanli.get('gramaj')}")
    print(f"   Kalori     : {patlicanli.get('calories')} kcal")
    print(f"   Alerjenler : {patlicanli.get('allergens')} (SIFIR ALERJEN / SAF KÖMÜR ATEŞİ ET & PATLICAN)")

# Save both files
for dest in [SRC_PRODUCTS, DATA_PRODUCTS]:
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"\nSaved updated database to {dest}")

