import json
import os
import re
import shutil

with open('/tmp/loqum_site_data.json') as f:
    raw_items = json.load(f)

# Ensure public images directory exists
images_base = '/Users/mesa/restaurant-engine/public/images/menu'
os.makedirs(images_base, exist_ok=True)

# Helper for slugifying
def slugify(text):
    tr_map = {
        'ı': 'i', 'I': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ö': 'o',
        'Ö': 'o', 'ç': 'c', 'Ç': 'c', '&': 've', '+': 'arti',
        "'": '', '"': '', '.': '', '(': '', ')': ''
    }
    for k, v in tr_map.items():
        text = text.replace(k, v)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

CATEGORY_CONFIG = {
    17: {"slug": "burgerler", "name": "BURGERLER", "order": 4},
    18: {"slug": "fajitalar", "name": "FAJİTALAR", "order": 11},
    19: {"slug": "firin-etler", "name": "FIRIN ETLER", "order": 10},
    20: {"slug": "kahvalti", "name": "KAHVALTI", "order": 1},
    21: {"slug": "kebaplar", "name": "KEBAPLAR", "order": 2},
    22: {"slug": "kofteler", "name": "KÖFTELER", "order": 6},
    23: {"slug": "loqum-pilicler", "name": "LOQUM PİLİÇLER", "order": 5},
    24: {"slug": "loqum-yoresel", "name": "LOQUM YÖRESEL", "order": 9},
    25: {"slug": "makarnalar-ve-salatalar", "name": "MAKARNALAR VE SALATALAR", "order": 7},
    26: {"slug": "lahmacun-ve-pide", "name": "LAHMACUN VE PİDE", "order": 3},
    27: {"slug": "steak", "name": "STEAK", "order": 12},
    28: {"slug": "tavalar", "name": "TAVALAR", "order": 8},
    29: {"slug": "tatlilar", "name": "TATLILAR", "order": 13},
    30: {"slug": "icecekler", "name": "İÇECEKLER", "order": 14}
}

# Ensure category subdirectories exist
for cat in CATEGORY_CONFIG.values():
    os.makedirs(os.path.join(images_base, cat["slug"]), exist_ok=True)

print("Categories and directories ready.")
