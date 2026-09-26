# -*- coding: utf-8 -*-
"""
Kesin gastronomi ve mutfak reçetesi analizlerine göre alerjenleri günceller:
- Sade Köfteler: ["Gluten", "Yumurta"]
- Peynirli/Soslu Köfteler: ["Gluten", "Yumurta", "Süt"]
- İçli Köfte: ["Gluten", "Yumurta", "Sert Kabuklu Meyveler"]
- Sade Kebaplar (Adana, Sade Kebap, Patlıcanlı, Domatesli): []
- Soslu/Yoğurtlu Kebaplar, Sarma Beyti, Adana Dolama, UFO Kebap: ["Gluten", "Süt"]
- Çıtır Yağlı Kara, Cızır Cızır Kuzu Sırt, Kuzu Külbastı, Kuzu Şiş, Loqum Leblebi, Alinazik: ["Süt"]
- Karışık Kebap, Karışık Karnaval, Trio Kebap: ["Gluten", "Süt"]
- Loqum Kebap: ["Sert Kabuklu Meyveler"]
- Tüm Piliçler: ["Süt"]
- Mantarlı Piliçler (Köri, Mantar Soslu, Acılı Mantarlı): ["Süt", "Mantar"]
- Soya Soslu Tavuk: ["Süt", "Soya", "Mantar"]
- Soya Soslu Tavuk Fileto: ["Gluten", "Süt", "Soya"]
- Tavalar & Kremalı: Lokum Tava, Çoban Kavurma, Cheddar Soslu vb.: ["Süt"]
- Mantarlı Steak & Tavalar: ["Süt", "Mantar"]
- Hardallı Steak & Tavalar: ["Hardal", "Süt"]
- Sos Karnavallı Şaşlık: ["Hardal", "Süt", "Mantar"]
- Kontrafile Sasa: ["Süt", "Soya"]
- Makarnalar & Salatalar: Fettuccine Alfredo Etli: ["Gluten", "Süt", "Mantar"], Fettuccine Alfredo Tavuklu, Rigatoni: ["Gluten", "Süt"], Salatalar: ["Süt"] veya ["Gluten", "Süt"]
- Kahvaltılar: Serpme: ["Süt", "Yumurta"], Omlet/Menemen: ["Yumurta", "Süt"], Çocuk Menüsü: ["Gluten", "Yumurta"]
- Tatlılar: Cennet Çamuru, Katmer, Soğuk Baklava: ["Gluten", "Süt", "Sert Kabuklu Meyveler"], İncir: ["Süt", "Sert Kabuklu Meyveler"], Kabak: ["Susam", "Sert Kabuklu Meyveler"]
- İçecekler: Ayran: ["Süt"]
"""

import json
import os

EXACT_ALLERGENS_BY_ID = {
    # 1. KÖFTELER
    'kofteler-kasap-kofte': ['Gluten', 'Yumurta'],
    'kofteler-yarim-kasap-kofte-3-adet': ['Gluten', 'Yumurta'],
    'kofteler-bohca-kofte': ['Gluten', 'Yumurta', 'Süt'],
    'kofteler-kalkan-kofte': ['Gluten', 'Yumurta', 'Süt'],
    'kofteler-begendili-izgara-kofte': ['Gluten', 'Yumurta', 'Süt'],
    'kofteler-icli-kofte': ['Gluten', 'Yumurta', 'Sert Kabuklu Meyveler'],

    # 2. KEBAPLAR
    'kebaplar-adana': [],
    'kebaplar-sade-kebap': [],
    'kebaplar-patlicanli-kebap': [],
    'kebaplar-domatesli-kebap': [],
    'kebaplar-adana-dolama': ['Gluten', 'Süt'],
    'kebaplar-sarma-beyti': ['Gluten', 'Süt'],
    'kebaplar-yogurtlu-kebap': ['Gluten', 'Süt'],
    'kebaplar-yogurtlu-kusbasi': ['Gluten', 'Süt'],
    'kebaplar-iskender-usulu-kebap': ['Gluten', 'Süt'],
    'kebaplar-begendili-kebap': ['Gluten', 'Süt'],
    'kebaplar-begendili-kusbasi': ['Gluten', 'Süt'],
    'kebaplar-firinda-kasarli-sarma-beyti': ['Gluten', 'Süt'],
    'kebaplar-mantarli-kasarli-sarma': ['Gluten', 'Süt'],
    'kebaplar-ufo-kebap': ['Gluten', 'Süt'],
    'kebaplar-citir-yagli-kara': ['Süt'],
    'kebaplar-cizir-cizir-tavada-kuzu-sirt': ['Süt'],
    'kebaplar-kuzu-kulbasti': ['Süt'],
    'kebaplar-kuzu-sis': ['Süt'],
    'kebaplar-loqum-leblebi': ['Süt'],
    'kebaplar-alinazik': ['Süt'],
    'kebaplar-karisik-kebap': ['Gluten', 'Süt'],
    'kebaplar-tavuksuz-karisik-kebap': ['Gluten', 'Süt'],
    'kebaplar-karisik-karnaval-3-kisilik': ['Gluten', 'Süt'],
    'kebaplar-trio-kebap': ['Gluten', 'Süt'],
    'kebaplar-loqum-kebap': ['Sert Kabuklu Meyveler'],

    # 3. PİLİÇLER & TAVUKLAR
    'loqum-pilicler-tavuk-copsis': ['Süt'],
    'loqum-pilicler-tavuk-sis': ['Süt'],
    'loqum-pilicler-tavuk-kanat': ['Süt'],
    'loqum-pilicler-sebzeli-tavuk': ['Süt'],
    'loqum-pilicler-tavuk-kulbasti': ['Süt'],
    'loqum-pilicler-kori-soslu-tavuk': ['Süt', 'Mantar'],
    'loqum-pilicler-acili-mantarli-tavuk': ['Süt', 'Mantar'],
    'loqum-pilicler-mantar-soslu-tavuk': ['Süt', 'Mantar'],
    'loqum-pilicler-soya-soslu-tavuk': ['Süt', 'Soya', 'Mantar'],
    'loqum-pilicler-soya-soslu-tavuk-fileto': ['Gluten', 'Süt', 'Soya'],

    # 4. FAJİTALAR
    'fajitalar-et-fajita': ['Süt'],
    'fajitalar-tavuk-fajita': ['Süt'],
    'fajitalar-cumbo-fajita': ['Süt'],

    # 5. STEAKLER, TAVALAR, GÜVEÇLER
    'steak-mantar-kremali-steak': ['Süt', 'Mantar'],
    'steak-mantar-soslu-antrikot': ['Süt', 'Mantar'],
    'steak-mantar-soslu-steak': ['Süt', 'Mantar'],
    'tavalar-mantar-soslu-bonfile-tava': ['Süt', 'Mantar'],
    'tavalar-acili-mantarli-bonfile-tava': ['Süt', 'Mantar'],
    'tavalar-firinda-peynirli-mantar': ['Süt', 'Mantar'],
    'steak-hardal-soslu-loqum': ['Hardal', 'Süt'],
    'steak-hardal-soslu-antrikot': ['Hardal', 'Süt'],
    'tavalar-hardal-soslu-bonfile-tava': ['Hardal', 'Süt'],
    'steak-sos-karnavalli-saslik': ['Hardal', 'Süt', 'Mantar'],
    'steak-cheddar-soslu-antrikot': ['Süt'],
    'steak-cheddar-soslu-loqum': ['Süt'],
    'tavalar-cheddar-soslu-bonfile-tava': ['Süt'],
    'tavalar-kontrafile-sasa': ['Süt', 'Soya'],
    'loqum-yoresel-loqum-tava': ['Süt'],
    'tavalar-coban-kavurma': ['Süt'],
    'tavalar-sebzeli-bonfile-tava': ['Süt'],
    'loqum-yoresel-saslik-tava': ['Süt'],
    'loqum-yoresel-asci-tabagi': ['Süt'],
    'loqum-yoresel-comlekte-kuzu-tandir': ['Süt'],
    'loqum-yoresel-firinda-kapama-dana-saslik': ['Süt'],
    'loqum-yoresel-pilav': ['Gluten', 'Süt'],
    'loqum-yoresel-pilav-ustu-kuzu-tandir': ['Gluten', 'Süt'],
    'loqum-yoresel-begendi-incik': ['Gluten', 'Süt'],
    'loqum-yoresel-firin-incik': ['Süt'],
    'loqum-yoresel-corba': ['Gluten', 'Süt'],
    'steak-satoburyan': ['Süt'],

    # 6. MAKARNALAR & SALATALAR
    'makarnalar-ve-salatalar-fettuccine-alfredo-etli': ['Gluten', 'Süt', 'Mantar'],
    'makarnalar-ve-salatalar-fettuccine-alfredo-tavuklu': ['Gluten', 'Süt'],
    'makarnalar-ve-salatalar-bonfile-parcacikli-logotoni': ['Gluten', 'Süt'],
    'makarnalar-ve-salatalar-rigotoni-bolonez': ['Gluten', 'Süt'],
    'makarnalar-ve-salatalar-bonfile-salata': ['Süt'],
    'makarnalar-ve-salatalar-tavuklu-sezar-salata': ['Süt'],
    'makarnalar-ve-salatalar-steak-salata': ['Süt'],
    'makarnalar-ve-salatalar-izgara-tavuklu-salata': ['Süt'],
    'makarnalar-ve-salatalar-sezar-salata': ['Gluten', 'Süt'],

    # 7. KAHVALTILAR
    'kahvalti-serpme-kahvalti': ['Süt', 'Yumurta'],
    'kahvalti-omlet': ['Yumurta', 'Süt'],
    'kahvalti-menemen': ['Yumurta', 'Süt'],
    'kahvalti-cocuk-menusu': ['Gluten', 'Yumurta'],

    # 8. TATLILAR
    'tatlilar-cennet-camuru': ['Gluten', 'Süt', 'Sert Kabuklu Meyveler'],
    'tatlilar-katmer': ['Gluten', 'Süt', 'Sert Kabuklu Meyveler'],
    'tatlilar-soguk-baklava': ['Gluten', 'Süt', 'Sert Kabuklu Meyveler'],
    'tatlilar-incir-tatlisi': ['Süt', 'Sert Kabuklu Meyveler'],
    'tatlilar-kabak-tatlisi': ['Susam', 'Sert Kabuklu Meyveler'],

    # 9. İÇECEKLER
    'icecekler-ayran': ['Süt'],
    'icecekler-kapali-ayran': ['Süt'],
}

def update_json_array(file_path):
    print(f"Güncelleniyor: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Filter out Humus and Haydari if present
    before_len = len(products)
    products = [p for p in products if p['id'] not in {'makarnalar-ve-salatalar-meze-1', 'makarnalar-ve-salatalar-meze-2'} and 'humus' not in p.get('name', '').lower() and 'haydari' not in p.get('name', '').lower()]
    after_len = len(products)
    if before_len != after_len:
        print(f"  -> Humus/Haydari filtresi uygulandı: {before_len} -> {after_len}")

    updated_count = 0
    for p in products:
        pid = p['id']
        if pid in EXACT_ALLERGENS_BY_ID:
            p['allergens'] = list(EXACT_ALLERGENS_BY_ID[pid])
            updated_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"Tamamlandı: {file_path} ({len(products)} ürün, {updated_count} alerjen eşitlendi)")

def update_live_restaurant(file_path):
    print(f"Güncelleniyor: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        db = json.load(f)

    inv = db.get('inventory', {})
    # Remove Humus and Haydari
    keys_to_remove = [k for k, v in inv.items() if k in {'makarnalar-ve-salatalar-meze-1', 'makarnalar-ve-salatalar-meze-2'} or 'humus' in v.get('name', '').lower() or 'haydari' in v.get('name', '').lower()]
    for k in keys_to_remove:
        del inv[k]
        print(f"  -> {k} veritabanından silindi.")

    updated_count = 0
    for pid, p in inv.items():
        if pid in EXACT_ALLERGENS_BY_ID:
            p['allergens'] = list(EXACT_ALLERGENS_BY_ID[pid])
            updated_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print(f"Tamamlandı: {file_path} ({len(inv)} ürün, {updated_count} alerjen eşitlendi)")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    update_json_array(os.path.join(base_dir, 'src/data/loqum-products.json'))
    update_json_array(os.path.join(base_dir, 'data/loqum-products.json'))
    update_live_restaurant(os.path.join(base_dir, 'data/live_restaurant.json'))
