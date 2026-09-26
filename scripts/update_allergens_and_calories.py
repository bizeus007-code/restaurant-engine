# -*- coding: utf-8 -*-
import json
import os
import sys

# 160 Ürünün Kesin Eşleşme Tablosu (Kalori, Alerjen)
MAPPING = {
    # SAYFA 1 — KAHVALTI
    "KAVURMA": (520, []),
    "OMLET": (300, ["Yumurta"]),
    "MENEMEN": (280, ["Yumurta"]),
    "ÇOCUK MENÜSÜ": (500, []),
    "SERPME KAHVALTI": (1100, []),
    # SAYFA 2 — MAKARNA, SALATA & BAŞLANGIÇ
    "FETTUCCİNE ALFREDO ETLİ": (760, ["Gluten"]),
    "FETTUCCİNE ALFREDO TAVUKLU": (680, ["Gluten"]),
    "BONFİLE PARÇACIKLI LOGOTONİ": (640, ["Gluten"]),
    "BONFİLE PARÇACIKLI RİGATONİ": (640, ["Gluten"]),
    "RİGOTONİ BOLONEZ": (600, ["Gluten"]),
    "BONFİLE SALATA": (450, []),
    "TAVUKLU SEZAR SALATA": (420, []),
    "STEAK SALATA": (470, []),
    "IZGARA TAVUKLU SALATA": (360, []),
    "IZGARA HELLİM PEYNİRLİ SALATA": (390, ["Süt"]),
    "HAYDARİ & YOĞURTLU MEZE": (160, ["Süt"]),
    "GELENEKSEL HUMUS": (240, ["Susam"]),
    "PATATES CİPSİ": (410, []),
    "SEZAR SALATA": (340, []),
    "TON BALIKLI SALATA": (380, ["Balık"]),
    # SAYFA 3 — TAŞ FIRIN KUZULAR
    "KUZU KOL": (1850, []),
    "KUZU GERDAN": (1750, []),
    # SAYFA 4 — DANA STEAKLER
    "DANA PİRZOLA": (850, []),
    "ANTRİKOT": (700, []),
    "LOQUM": (580, []),
    "NEWYORK STEAK": (650, []),
    "ŞATOBÜRYAN": (1150, []),
    "KUZU KAFES": (1600, []),
    "DANA ŞAŞLIK": (620, []),
    "HARDAL SOSLU LOQUM": (620, []),
    "BİFTEK": (590, []),
    "MEXİCAN STEAK": (630, []),
    "PAPER STEAK": (610, []),
    # SAYFA 5 — STEAK & SPESİYALLER
    "MANTAR KREMALI STEAK": (710, []),
    "KASAP SUCUK (250GR.)": (760, []),
    "KASAP SUCUK 250 GR": (760, []),
    "CHEDDAR SOSLU ANTRİKOT": (790, ["Süt"]),
    "MANTAR SOSLU ANTRİKOT": (740, []),
    "CHEDDAR SOSLU LOQUM": (720, ["Süt"]),
    "MANTAR SOSLU STEAK": (720, []),
    "HARDAL SOSLU ANTRİKOT": (690, []),
    "T-BONE": (850, []),
    "SOS KARNAVALLI ŞAŞLIK": (720, []),
    "DİYET ANTRİKOT": (520, []),
    # SAYFA 6 — FAJİTA & SAÇ TAVALARI
    "ET FAJİTA": (650, []),
    "TAVUK FAJİTA": (550, []),
    "CUMBO FAJİTA": (620, []),
    "ÇOBAN KAVURMA": (680, []),
    "CHEDDAR SOSLU BONFİLE TAVA": (720, ["Süt"]),
    "MANTAR SOSLU BONFİLE TAVA": (700, []),
    "HARDAL SOSLU BONFİLE TAVA": (660, []),
    "ACILI MANTARLI BONFİLE TAVA": (620, []),
    "KONTRAFİLE SASA": (620, ["Soya"]),
    "FIRINDA PEYNİRLİ MANTAR": (480, ["Süt"]),
    "SEBZELİ BONFİLE TAVA": (640, []),
    # SAYFA 7 — ZIRH KEBAPLARI
    "ÇITIR YAĞLI KARA": (700, []),
    "ADANA": (560, []),
    "SADE KEBAP": (540, []),
    "BEYTİ KEBAP": (580, []),
    "ADANA DOLAMA": (700, []),
    "DOMATESLİ KEBAP": (550, []),
    "YOĞURTLU KEBAP": (720, ["Süt"]),
    "URFA": (560, []),
    "SARMA BEYTİ": (700, []),
    "ALTI EZMELİ KEBAP": (550, []),
    "SEBZELİ KEBAP": (540, []),
    "BEĞENDİLİ KEBAP": (720, ["Süt"]),
    "PATLICANLI KEBAP": (560, []),
    "LOQUM KEBAP": (580, []),
    "YOĞURTLU KUŞBAŞI": (720, ["Süt"]),
    "KÖZLÜ KEBAP": (540, []),
    "FIRINDA KAŞARLI SARMA BEYTİ": (780, ["Süt"]),
    "BEĞENDİLİ KUŞBAŞI": (760, ["Süt"]),
    # SAYFA 8 — ÖZEL KEBAPLAR
    "KUZU SIRT": (560, []),
    "KUZU KÜLBASTI": (540, []),
    "HALEP İŞİ KEBAP": (550, []),
    "MANTARLI KAŞARLI SARMA": (790, ["Süt"]),
    "LOQUM LEBLEBİ": (620, []),
    "KUZU PİRZOLA": (620, []),
    "KUZU ŞİŞ": (540, []),
    "İSKENDER USULÜ KEBAP": (760, ["Süt"]),
    "UFO KEBAP": (800, ["Süt"]),
    "KUZU KÜŞLEME": (520, []),
    "KUZU TARAKLIK": (640, []),
    "KARIŞIK KEBAP": (880, []),
    "TAVUKSUZ KARIŞIK KEBAP": (920, []),
    "ALİNAZİK": (690, ["Süt"]),
    "SIRALI KEBAP": (510, []),
    "KARIŞIK KARNAVAL (3 KİŞİLİK)": (2150, []),
    "KARIŞIK KARNAVAL 3 KİŞİLİK": (2150, []),
    "TRİO KEBAP": (740, []),
    "CIZIR CIZIR TAVADA KUZU SIRT": (690, []),
    # SAYFA 9 — KÖFTE & YÖRESEL
    "KALKAN KÖFTE": (700, ["Süt"]),
    "BOHÇA KÖFTE": (700, ["Süt"]),
    "KASAP KOFTE": (620, []),
    "KASAP KÖFTE": (620, []),
    "BEĞENDİLİ IZGARA KÖFTE": (740, ["Süt"]),
    "YARIM KASAP KÖFTE (3 Adet)": (390, []),
    "YARIM KASAP KÖFTE": (390, []),
    "İÇLİ KÖFTE": (220, ["Gluten"]),
    "LOQUM TAVA": (750, []),
    "ŞAŞLIK TAVA": (780, []),
    "ASÇI TABAĞI": (850, []),
    "AŞÇI TABAĞI": (850, []),
    "PİLAV ÜSTÜ KUZU TANDIR": (820, []),
    "ÇÖMLEKTE KUZU TANDIR": (760, []),
    "BEĞENDİ İNCİK": (800, ["Süt"]),
    "FIRIN İNCİK": (780, ["Süt"]),
    "ÇORBA": (180, ["Gluten"]),
    "PİLAV": (280, []),
    "FIRINDA KAPAMA DANA ŞAŞLIK": (760, []),
    "ARPA ŞEHRİYELİ KUZU İNCİK": (820, ["Gluten"]),
    "FIRINDA KAPAMA ÇÖMLEKTE PİRZOLA": (720, []),
    "ARPA ŞEHRİYELİ KUZU TANDIR": (800, ["Gluten"]),
    # SAYFA 10 — PİDE & LAHMACUN
    "LAHMACUN (1 ADET)": (260, ["Gluten"]),
    "LAHMACUN": (260, ["Gluten"]),
    "KARIŞIK LAHMACUN": (290, ["Gluten"]),
    "KIYMALI PİDE": (580, ["Gluten"]),
    "KAŞARLI PİDE": (640, ["Gluten", "Süt"]),
    "KUŞBAŞI PİDE": (610, ["Gluten"]),
    "KARIŞIK PİDE": (710, ["Gluten", "Süt"]),
    "SUCUKLU PİDE": (590, ["Gluten"]),
    "SUCUKLU KAŞARLI PİDE": (680, ["Gluten", "Süt"]),
    "FINDIK LAHMACUN": (110, ["Gluten"]),
    "KAVURMALI KAŞARLI PİDE": (720, ["Gluten", "Süt"]),
    "KARIŞIK TABAK ALTI": (110, ["Gluten"]),
    "KIYMALI KAŞARLI PİDE": (660, ["Gluten", "Süt"]),
    "LOQUM PİDE": (740, ["Gluten", "Süt"]),
    "KAŞARLI KUŞBAŞI PİDE": (690, ["Gluten", "Süt"]),
    # SAYFA 11 — BURGER & TAVUK
    "LOQUM KLASİK BURGER": (720, ["Gluten"]),
    "LOQUM DOUBLE BURGER": (980, ["Gluten"]),
    "ENFES LOQUM BURGER": (820, ["Gluten"]),
    "LOQUM CHEESE BURGER": (780, ["Gluten", "Süt"]),
    "3'LÜ MİNİ BURGER": (740, ["Gluten"]),
    "3\\'LÜ MİNİ BURGER": (740, ["Gluten"]),
    "TAVUK BURGER": (610, ["Gluten"]),
    "KAPALI LOQUM BURGER": (810, ["Gluten", "Süt"]),
    "TAVUK ÇÖPŞİŞ": (510, []),
    "TAVUK ŞİŞ": (480, []),
    "TAVUK KANAT": (560, []),
    "SEBZELİ TAVUK": (490, []),
    "TAVUK KÜLBASTI": (470, []),
    "KÖRİ SOSLU TAVUK": (610, []),
    "SOYA SOSLU TAVUK": (520, ["Soya"]),
    "ACILI MANTARLI TAVUK": (510, []),
    "MANTAR SOSLU TAVUK": (590, []),
    "SOYA SOSLU TAVUK FİLETO": (530, ["Soya"]),
    # SAYFA 12 — TATLILAR
    "CENNET ÇAMURU": (540, ["Antep Fıstığı"]),
    "İNCİR TATLISI": (390, ["Ceviz"]),
    "SOĞUK BAKLAVA": (460, ["Gluten", "Antep Fıstığı"]),
    "KATMER": (560, ["Gluten", "Antep Fıstığı"]),
    "KABAK TATLISI": (380, []),
    # SAYFA 13 — İÇECEKLER
    "PORTAKAL SUYU": (145, []),
    "COCA COLA": (139, []),
    "COCA COLA ZERO": (1, []),
    "FANTA": (145, []),
    "KARIŞIK MEYVE SUYU": (150, []),
    "ÇORÇIL": (10, []),
    "GAZOZ": (110, []),
    "SADE SODA": (0, []),
    "LİMONLU SODA": (10, []),
    "ICE TEA": (90, []),
    "AYRAN": (95, ["Süt"]),
    "KAPALI AYRAN": (80, ["Süt"]),
    "ŞALGAM": (25, []),
    "BÜYÜK SU": (0, []),
    "KÜÇÜK SU": (0, [])
}

# 1. src/data/loqum-products.json dosyasını güncelle
json_path = 'src/data/loqum-products.json'
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

updated_count = 0
for p in products:
    name = p['name'].strip()
    clean_name = name.replace('\\', '')
    if name in MAPPING:
        cal, alg = MAPPING[name]
        p['calories'] = cal
        p['allergens'] = alg
        updated_count += 1
    elif clean_name in MAPPING:
        cal, alg = MAPPING[clean_name]
        p['calories'] = cal
        p['allergens'] = alg
        updated_count += 1
    else:
        print(f"UYARI: Eşleşmeyen ürün: {name}")

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"1. loqum-products.json güncellendi: {updated_count}/{len(products)} ürün senkronize edildi.")
