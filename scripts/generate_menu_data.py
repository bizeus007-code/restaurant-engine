import json
import os
import re
import shutil

# 1. Load site data
with open('/tmp/loqum_site_data.json') as f:
    items = json.load(f)

print(f"Loaded {len(items)} items from site data.")

CATEGORY_CONFIG = {
    17: {"slug": "burgerler", "name": "BURGERLER", "order": 4, "tag": "Gurme Burger"},
    18: {"slug": "fajitalar", "name": "FAJİTALAR", "order": 11, "tag": "Cızırdayan Döküm"},
    19: {"slug": "firin-etler", "name": "FIRIN ETLER", "order": 10, "tag": "Taş Fırın Ağır Ateş"},
    20: {"slug": "kahvalti", "name": "KAHVALTI", "order": 1, "tag": "Köy Kahvaltısı"},
    21: {"slug": "kebaplar", "name": "KEBAPLAR", "order": 2, "tag": "Kömür Ateşi & Zırh"},
    22: {"slug": "kofteler", "name": "KÖFTELER", "order": 6, "tag": "Özel Baharatlı"},
    23: {"slug": "loqum-pilicler", "name": "LOQUM PİLİÇLER", "order": 5, "tag": "Özel Marinasyon"},
    24: {"slug": "loqum-yoresel", "name": "LOQUM YÖRESEL", "order": 9, "tag": "Diyarbakır Yöresel"},
    25: {"slug": "makarnalar-ve-salatalar", "name": "MAKARNALAR VE SALATALAR", "order": 7, "tag": "Taze & Hafif"},
    26: {"slug": "lahmacun-ve-pide", "name": "LAHMACUN VE PİDE", "order": 3, "tag": "Çıtır Taş Fırın"},
    27: {"slug": "steak", "name": "STEAK", "order": 12, "tag": "Dry Aged & Izgara"},
    28: {"slug": "tavalar", "name": "TAVALAR", "order": 8, "tag": "Bakır Tava"},
    29: {"slug": "tatlilar", "name": "TATLILAR", "order": 13, "tag": "Geleneksel Tatlı"},
    30: {"slug": "icecekler", "name": "İÇECEKLER", "order": 14, "tag": "Soğuk İçecek"}
}

def slugify(text):
    tr_map = {
        'ı': 'i', 'I': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ö': 'o',
        'Ö': 'o', 'ç': 'c', 'Ç': 'c'
    }
    for k, v in tr_map.items():
        text = text.replace(k, v)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

print("Categories configured successfully.")
