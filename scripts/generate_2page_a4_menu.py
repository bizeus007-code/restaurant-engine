# -*- coding: utf-8 -*-
"""
LOQUM ET STEAKHOUSE — BİTİŞİK A4 MASA MENÜSÜ (A3 LANDSCAPE • 420x297 MM)
- Tek parça geniş plaka (A3 Landscape: 420mm genişlik x 297mm yükseklik)
- Sol Kanat (210x297 mm • 3 Geniş Sütun) ve Sağ Kanat (210x297 mm • 3 Geniş Sütun)
- Tam ortada (210. mm hizasında) zarif, kılcal altın kesikli katlama ekseni (.crease-axis)
- 6 Geniş Sütun Mimarisi: Her sütunun net genişliği ~61-62 mm
- Jilet gibi 2 satırlı hizalama (İçecekler tek satırlı ultra kompakt):
    Satır 1: ÜRÜN ADI ............ [       ₺ ] (Sağa kilitli, asla alt satıra düşmez, ellipsis yok)
    Satır 2: 180 gr • 520 kcal      [Gluten, Süt] (İki uca yaslı)
- 0 Humus, 0 Haydari
- 158 / 158 ürünün tamamı eksiksiz
- Çıktı Dosyası: ~/Desktop/LOQUM_ET_BITISIK_A4_MASA_MENUSU.pdf (TAM 1 SAYFA)
"""

import json
import os
import subprocess

def generate_bitisik_menu():
    json_path = '/Users/mesa/restaurant-engine/src/data/loqum-products.json'
    out_html_path = '/Users/mesa/restaurant-engine/public/LOQUM_ET_BITISIK_A4_MASA_MENUSU.html'
    public_html_path = out_html_path
    pdf_paths = [
        os.path.expanduser('~/Desktop/LOQUM_ET_BITISIK_A4_MASA_MENUSU.pdf'),
        '/Users/mesa/restaurant-engine/public/LOQUM_ET_BITISIK_A4_MASA_MENUSU.pdf'
    ]

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Filter out Humus and Haydari
    products = [p for p in products if p['id'] not in {'makarnalar-ve-salatalar-meze-1', 'makarnalar-ve-salatalar-meze-2'} and 'humus' not in p.get('name', '').lower() and 'haydari' not in p.get('name', '').lower()]

    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from update_allergens_exact import EXACT_ALLERGENS_BY_ID as ALLERGEN_OVERRIDES

    for p in products:
        pid = p['id']
        if pid in ALLERGEN_OVERRIDES:
            p['allergens'] = ALLERGEN_OVERRIDES[pid]

    # SOL KANAT (210x297 mm • 3 Sütun) ve SAĞ KANAT (210x297 mm • 3 Sütun)
    # 6 GENİŞ SÜTUN MİMARİSİ (Her kanatta 3 sütun • Net genişlik ~61-62 mm)
    wings_structure = [
        {
            "wing_id": "left",
            "wing_badge": "SOL KANAT (ÖN PANEL • 210×297 MM)",
            "wing_title": "GELENEKSEL TAŞ FIRIN, KÖY KAHVALTISI & ZIRH KEBAPLARI",
            "wing_subtitle": "Doğal Şarküteri • İtalyan Makarnaları & Taze Salatalar • Taş Fırın Pideleri • Zırh Kıyma Kebapları",
            "columns": [
                # Sütun 1 (19 Ürün): Serpme Köy Kahvaltısı (5) + Makarnalar ve Taze Salatalar (12) + Taş Fırın Kuzular (2)
                [
                    {
                        "cat_name": "SERPME KÖY KAHVALTISI & YUMURTALAR",
                        "filter": lambda p: p.get('categorySlug') == 'kahvalti',
                        "is_drink": False
                    },
                    {
                        "cat_name": "MAKARNALAR & TAZE GURME SALATALAR",
                        "filter": lambda p: p.get('categorySlug') == 'makarnalar-ve-salatalar',
                        "is_drink": False
                    },
                    {
                        "cat_name": "TAŞ FIRIN KUZULAR (6 SAAT DEMLEME)",
                        "filter": lambda p: p.get('categorySlug') == 'firin-etler',
                        "is_drink": False
                    }
                ],
                # Sütun 2 (24 Ürün): Taş Tabanlı Pideler & Çıtır Lahmacunlar (14) + Geleneksel Zırh Kebapları - Klasik Şişler (ilk 10 ürün)
                [
                    {
                        "cat_name": "TAŞ TABANLI PİDELER & ÇITIR LAHMACUNLAR",
                        "filter": lambda p: p.get('categorySlug') == 'lahmacun-ve-pide',
                        "is_drink": False
                    },
                    {
                        "cat_name": "GELENEKSEL ZIRH KEBAPLARI (KLASİK ŞİŞLER)",
                        "filter": lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                            'kebaplar-citir-yagli-kara', 'kebaplar-adana', 'kebaplar-sade-kebap', 'kebaplar-beyti-kebap',
                            'kebaplar-adana-dolama', 'kebaplar-domatesli-kebap', 'kebaplar-yogurtlu-kebap', 'kebaplar-urfa',
                            'kebaplar-sarma-beyti', 'kebaplar-alti-ezmeli-kebap'
                        ],
                        "is_drink": False
                    }
                ],
                # Sütun 3 (26 Ürün): Geleneksel Zırh Kebapları - Kalan Klasik Şişler (8) + Geleneksel Zırh Kebapları - Spesiyal & Kuzular (18)
                [
                    {
                        "cat_name": "GELENEKSEL ZIRH KEBAPLARI (ŞİŞ DEVAMI)",
                        "filter": lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                            'kebaplar-sebzeli-kebap', 'kebaplar-begendili-kebap', 'kebaplar-patlicanli-kebap', 'kebaplar-loqum-kebap',
                            'kebaplar-yogurtlu-kusbasi', 'kebaplar-kozlu-kebap', 'kebaplar-firinda-kasarli-sarma-beyti', 'kebaplar-begendili-kusbasi'
                        ],
                        "is_drink": False
                    },
                    {
                        "cat_name": "ZIRH KEBAPLARI (SPESİYAL & KUZU)",
                        "filter": lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                            'kebaplar-kuzu-sirt', 'kebaplar-kuzu-kulbasti', 'kebaplar-halep-isi-kebap', 'kebaplar-mantarli-kasarli-sarma',
                            'kebaplar-loqum-leblebi', 'kebaplar-kuzu-pirzola', 'kebaplar-kuzu-sis', 'kebaplar-iskender-usulu-kebap',
                            'kebaplar-ufo-kebap', 'kebaplar-kuzu-kusleme', 'kebaplar-kuzu-taraklik', 'kebaplar-karisik-kebap',
                            'kebaplar-tavuksuz-karisik-kebap', 'kebaplar-alinazik', 'kebaplar-sirali-kebap', 'kebaplar-karisik-karnaval-3-kisilik',
                            'kebaplar-trio-kebap', 'kebaplar-cizir-cizir-tavada-kuzu-sirt'
                        ],
                        "is_drink": False
                    }
                ]
            ]
        },
        {
            "wing_id": "right",
            "wing_badge": "SAĞ KANAT (ARKA PANEL • 210×297 MM)",
            "wing_title": "DİNLENDİRİLMİŞ STEAKLER, SAÇ TAVALARI, TATLILAR VE İÇECEKLER",
            "wing_subtitle": "28 Gün Dry-Aged Spesiyalleri • Bakır Saç Tavaları • Gurme Burgerler • Kadim Tatlılar & Doğal İçecekler",
            "columns": [
                # Sütun 4 (28 Ürün): Dinlendirilmiş Dry-Aged Steakler (11) + Gurme Soslu Steakler (10) + Gurme Burgerler (7)
                [
                    {
                        "cat_name": "DİNLENDİRİLMİŞ DRY-AGED STEAKLER",
                        "filter": lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                            'steak-newyork-steak', 'steak-dana-pirzola', 'steak-loqum', 'steak-satoburyan',
                            'steak-kuzu-kafes', 'steak-dana-saslik', 'steak-hardal-soslu-loqum', 'steak-biftek',
                            'steak-mexican-steak', 'steak-paper-steak', 'steak-diyet-antrikot'
                        ],
                        "is_drink": False
                    },
                    {
                        "cat_name": "GURME SOSLU STEAKLER",
                        "filter": lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                            'steak-mantar-kremali-steak', 'steak-kasap-sucuk-250gr', 'steak-cheddar-soslu-antrikot',
                            'steak-mantar-soslu-antrikot', 'steak-cheddar-soslu-loqum', 'steak-mantar-soslu-steak',
                            'steak-hardal-soslu-antrikot', 'steak-t-bone', 'steak-sos-karnavalli-saslik', 'steak-antrikot'
                        ],
                        "is_drink": False
                    },
                    {
                        "cat_name": "GURME BURGERLER (ÖZEL BRİOCHE)",
                        "filter": lambda p: p.get('categorySlug') == 'burgerler',
                        "is_drink": False
                    }
                ],
                # Sütun 5 (26 Ürün): Saç Tavaları & Fajitalar (11) + Loqum Piliç Seçkileri (10) + Gurme Tatlılar (5)
                [
                    {
                        "cat_name": "CIZIRDAYAN FAJİTALAR & SAÇ TAVALARI",
                        "filter": lambda p: p.get('categorySlug') in ['fajitalar', 'tavalar'],
                        "is_drink": False
                    },
                    {
                        "cat_name": "LOQUM PİLİÇ SEÇKİLERİ",
                        "filter": lambda p: p.get('categorySlug') == 'loqum-pilicler',
                        "is_drink": False
                    },
                    {
                        "cat_name": "GELENEKSEL GURME TATLILAR",
                        "filter": lambda p: p.get('categorySlug') == 'tatlilar',
                        "is_drink": False
                    }
                ],
                # Sütun 6 (35 Ürün): Özel Köfteler & Yöresel Tencereler (20) + Soğuk Meşrubatlar & Doğal İçecekler (15)
                [
                    {
                        "cat_name": "ÖZEL KÖFTELER & YÖRESEL TENCERELER",
                        "filter": lambda p: p.get('categorySlug') in ['kofteler', 'loqum-yoresel'],
                        "is_drink": False
                    },
                    {
                        "cat_name": "SOĞUK MEŞRUBATLAR & DOĞAL İÇECEKLER",
                        "filter": lambda p: p.get('categorySlug') == 'icecekler',
                        "is_drink": True
                    }
                ]
            ]
        }
    ]

    total_rendered = 0

    html = '''<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>LOQUM ET — Bitişik A4 Masa Menüsü (A3 Landscape 420x297 mm • 6 Geniş Sütun • Manuel Fiyatlı Matbaa Baskı)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: 420mm 297mm;
      margin: 0;
    }

    html, body {
      width: 420mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background-color: #FAF8F5;
      font-family: 'Montserrat', sans-serif;
      color: #1A1A1A;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
    }

    /* A3 Landscape Spread Container (420 x 297 mm) */
    .master-sheet {
      width: 420mm;
      height: 297mm;
      max-width: 420mm;
      max-height: 297mm;
      display: flex;
      position: relative;
      background: #FAF8F5;
      overflow: hidden;
    }

    /* Background texture overlay */
    .master-sheet::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 25% 30%, rgba(255,255,255,0.7) 0%, transparent 60%),
                  radial-gradient(circle at 75% 70%, rgba(255,255,255,0.6) 0%, transparent 60%),
                  linear-gradient(180deg, rgba(122,92,40,0.015) 0%, rgba(122,92,40,0.035) 100%);
      pointer-events: none;
      z-index: 1;
    }

    /* Central Folding Axis Guide (Tam 210mm hizasında kılcal altın kesikli çizgi) */
    .crease-axis {
      position: absolute;
      left: 210mm;
      top: 6mm;
      bottom: 6mm;
      width: 0;
      border-left: 0.6px dashed rgba(122, 92, 40, 0.4);
      z-index: 40;
      pointer-events: none;
    }
    .crease-mark-top {
      position: absolute;
      left: 210mm;
      top: 1.5mm;
      transform: translateX(-50%);
      font-size: 5.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #7A5C28;
      text-transform: uppercase;
      z-index: 41;
      white-space: nowrap;
    }
    .crease-mark-bottom {
      position: absolute;
      left: 210mm;
      bottom: 1.5mm;
      transform: translateX(-50%);
      font-size: 5.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #7A5C28;
      text-transform: uppercase;
      z-index: 41;
      white-space: nowrap;
    }

    /* Individual Wings (210 x 297 mm each) */
    .wing {
      width: 210mm;
      height: 297mm;
      flex: 0 0 210mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      z-index: 2;
      box-sizing: border-box;
      overflow: hidden;
    }
    /* Sol Kanat: üst 9mm, sağ (katlama) 8mm, alt 8mm, sol (dış) 10mm */
    .left-wing {
      padding: 9mm 8mm 8mm 10mm;
    }
    /* Sağ Kanat: üst 9mm, sağ (dış) 10mm, alt 8mm, sol (katlama) 8mm */
    .right-wing {
      padding: 9mm 10mm 8mm 8mm;
    }

    /* Inner Framing Border for each Wing */
    .wing-frame {
      position: absolute;
      border: 0.5px solid rgba(122, 92, 40, 0.25);
      pointer-events: none;
      z-index: 3;
    }
    .left-wing .wing-frame {
      top: 3.5mm;
      bottom: 3.5mm;
      left: 3.5mm;
      right: 2.5mm;
    }
    .right-wing .wing-frame {
      top: 3.5mm;
      bottom: 3.5mm;
      left: 2.5mm;
      right: 3.5mm;
    }
    .wing-corner {
      position: absolute;
      color: #7A5C28;
      font-size: 6px;
      line-height: 1;
      z-index: 4;
    }
    .left-wing .corner-tl { top: 2.2mm; left: 2.2mm; }
    .left-wing .corner-tr { top: 2.2mm; right: 1.5mm; }
    .left-wing .corner-bl { bottom: 2.2mm; left: 2.2mm; }
    .left-wing .corner-br { bottom: 2.2mm; right: 1.5mm; }

    .right-wing .corner-tl { top: 2.2mm; left: 1.5mm; }
    .right-wing .corner-tr { top: 2.2mm; right: 2.2mm; }
    .right-wing .corner-bl { bottom: 2.2mm; left: 1.5mm; }
    .right-wing .corner-br { bottom: 2.2mm; right: 2.2mm; }

    /* Wing Header - Açık Zemin Üzerine Asil Bronz/Altın */
    .wing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 0.7px solid rgba(122, 92, 40, 0.4);
      padding-bottom: 1.4mm;
      margin-bottom: 2.0mm;
      position: relative;
      z-index: 5;
    }
    .brand-box {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.1px;
      color: #1A1A1A;
      line-height: 1.05;
    }
    .brand-title span {
      color: #7A5C28;
    }
    .brand-sub {
      font-size: 5.2px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #7A5C28;
      text-transform: uppercase;
      margin-top: 0.2px;
    }
    .header-center-info {
      text-align: center;
      flex: 1;
      padding: 0 4mm;
    }
    .badge-pill {
      display: inline-block;
      font-size: 5.0px;
      font-weight: 800;
      letter-spacing: 0.9px;
      color: #7A5C28;
      background: rgba(122, 92, 40, 0.08);
      border: 0.5px solid rgba(122, 92, 40, 0.35);
      border-radius: 8px;
      padding: 0.4px 5px;
      text-transform: uppercase;
      margin-bottom: 0.3px;
    }
    .header-main-title {
      font-family: 'Playfair Display', serif;
      font-size: 7.6px;
      font-weight: 700;
      color: #7A5C28;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .header-sub-desc {
      font-family: 'Cormorant Garamond', serif;
      font-size: 6.2px;
      font-style: italic;
      color: #554D40;
      margin-top: 0.2px;
      line-height: 1.05;
    }
    .header-meta-box {
      text-align: right;
      font-size: 5.0px;
      color: #5A5244;
      line-height: 1.3;
    }
    .header-meta-box strong {
      color: #1A1A1A;
      font-weight: 700;
    }

    /* 3-Column Grid inside Wing (Her Kanatta 3 Geniş Sütun • Net ~61-62 mm) */
    .columns-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr;
      column-gap: 4.0mm;
      flex: 1;
      min-height: 0;
      margin-top: 1.5mm;
      margin-bottom: 3.5mm;
      align-content: stretch;
      position: relative;
      z-index: 5;
    }
    .menu-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 0;
    }

    /* Category Blocks */
    .cat-block {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 0;
      margin-bottom: 2.0mm;
    }
    .cat-block:last-child {
      margin-bottom: 0;
    }
    .cat-heading {
      display: flex;
      align-items: center;
      gap: 4px;
      border-bottom: 0.6px solid rgba(122, 92, 40, 0.4);
      padding-bottom: 1.0px;
      margin-bottom: 1.2mm;
    }
    .cat-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 6.5px;
      font-weight: 800;
      color: #7A5C28;
      letter-spacing: 0.7px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .cat-line {
      flex: 1;
      height: 0.5px;
      background: linear-gradient(to right, rgba(122, 92, 40, 0.4), transparent);
    }

    /* Ürün Kartları - 2 Satırlı Modern Düzen ve Sağa Kilitleme (Ellipsis Yok) */
    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      margin: 0.35mm 0;
      min-height: 0;
      position: relative;
    }
    .item-row-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 3px;
      width: 100%;
    }
    .item-name {
      font-family: 'Playfair Display', serif;
      font-size: 7.4px;
      font-weight: 700;
      color: #1A1A1A;
      text-transform: uppercase;
      line-height: 1.15;
      max-width: calc(100% - 17mm);
      word-break: normal;
      overflow-wrap: break-word;
    }
    .item-dots {
      flex: 1;
      border-bottom: 0.6px dotted rgba(122, 92, 40, 0.35);
      margin: 0 3px 2px 3px;
      min-width: 4px;
    }
    .manual-price-box {
      font-family: 'Montserrat', monospace;
      font-size: 7.2px;
      font-weight: 700;
      color: #7A5C28;
      border: 0.6px solid rgba(122, 92, 40, 0.45);
      background: rgba(122, 92, 40, 0.04);
      border-radius: 2px;
      padding: 0.6px 3.5px;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: center;
      line-height: 1.0;
    }
    .item-row-sub {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.8px;
      font-size: 5.4px;
      width: 100%;
    }
    .item-specs {
      color: #665E50;
      font-size: 5.4px;
      font-weight: 500;
      white-space: nowrap;
    }
    .item-allergen {
      color: #8C2525;
      font-size: 5.2px;
      font-weight: 700;
      background: rgba(140, 37, 37, 0.06);
      border: 0.4px solid rgba(140, 37, 37, 0.25);
      border-radius: 2px;
      padding: 0.2px 2.5px;
      white-space: nowrap;
    }
    .item-no-allergen {
      visibility: hidden;
      font-size: 5.2px;
    }

    /* Ultra-Kompakt Tek Satırlı İçecekler */
    .menu-item-drink {
      margin: 0.22mm 0;
      flex: 0.6;
    }
    .menu-item-drink .item-name {
      font-size: 7.0px;
    }
    .drink-alg-tag {
      color: #8C2525;
      font-size: 5.2px;
      font-weight: 700;
      margin-left: 3px;
    }

    /* Wing Footer - Ürünlerden En Az 8mm Uzakta Tek Satır */
    .wing-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 0.6px solid rgba(122, 92, 40, 0.35);
      padding-top: 1.6mm;
      margin-top: 3.5mm;
      font-size: 5.2px;
      color: #635A4D;
      position: relative;
      z-index: 5;
    }
    .footer-left {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .footer-right {
      font-weight: 700;
      color: #7A5C28;
      letter-spacing: 0.4px;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="master-sheet">
    <!-- Central Crease Axis Guide (210 mm) -->
    <div class="crease-axis"></div>
    <div class="crease-mark-top">▲ KATLAMA ÇİZGİSİ (210 MM) ▲</div>
    <div class="crease-mark-bottom">▼ KATLAMA ÇİZGİSİ (210 MM) ▼</div>
'''

    # Build Left and Right Wings
    for wing in wings_structure:
        wing_id = wing['wing_id']
        badge = wing['wing_badge']
        title = wing['wing_title']
        sub = wing['wing_subtitle']
        cols = wing['columns']

        if wing_id == "left":
            brand_sub_text = "GELENEKSEL TAŞ FIRIN & ET RESTORANI"
            meta_box_text = "<strong>KURUMSAL MENÜ</strong><br>KAYAPINAR / DİYARBAKIR"
        else:
            brand_sub_text = "STEAKHOUSE & OCAKBAŞI"
            meta_box_text = "<strong>ÖZEL REÇETELER</strong><br>%100 DANA & KUZU ETİ"

        html += f'''
    <!-- {wing_id.upper()} WING (210 x 297 mm • 3 GENİŞ SÜTUN) -->
    <section class="wing {wing_id}-wing">
      <div class="wing-frame"></div>
      <div class="wing-corner corner-tl">✦</div>
      <div class="wing-corner corner-tr">✦</div>
      <div class="wing-corner corner-bl">✦</div>
      <div class="wing-corner corner-br">✦</div>

      <!-- Header (Açık Zemin Üzerine Asil Altın) -->
      <header class="wing-header">
        <div class="brand-box">
          <div class="brand-title">LOQUM <span>ET</span></div>
          <div class="brand-sub">{brand_sub_text}</div>
        </div>
        <div class="header-center-info">
          <div class="badge-pill">{badge}</div>
          <div class="header-main-title">{title}</div>
          <div class="header-sub-desc">{sub}</div>
        </div>
        <div class="header-meta-box">
          {meta_box_text}
        </div>
      </header>

      <!-- 3-Column Content Body (Geniş Sütunlu Flexbox Mimarisi) -->
      <main class="columns-grid">
'''

        for col_idx, col_cats in enumerate(cols):
            html += f'        <!-- Column {col_idx + 1} -->\n        <div class="menu-col">\n'
            for cat_def in col_cats:
                cat_name = cat_def['cat_name']
                cat_filter = cat_def['filter']
                is_drink = cat_def.get('is_drink', False)
                cat_prods = [p for p in products if cat_filter(p)]
                total_rendered += len(cat_prods)

                # Drinks take roughly half vertical space per item compared to food
                flex_weight = len(cat_prods) * 0.6 if is_drink else len(cat_prods)

                html += f'''          <div class="cat-block" style="flex: {flex_weight:.1f};">
            <div class="cat-heading">
              <span class="cat-title">{cat_name} ({len(cat_prods)})</span>
              <span class="cat-line"></span>
            </div>
'''
                for p in cat_prods:
                    name = p['name'].strip()
                    algs = p.get('allergens', [])

                    if is_drink:
                        alg_tag = f' <span class="drink-alg-tag">[{", ".join(algs)}]</span>' if algs else ''
                        html += f'''            <div class="menu-item menu-item-drink">
              <div class="item-row-top">
                <span class="item-name">{name}{alg_tag}</span>
                <span class="item-dots"></span>
                <span class="manual-price-box">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₺ ]</span>
              </div>
            </div>
'''
                    else:
                        gramaj = p.get('gramaj', '1 Porsiyon')
                        cal = f"{p.get('calories', 0)} kcal"
                        if algs:
                            alg_html = f'<span class="item-allergen">[{", ".join(algs)}]</span>'
                        else:
                            alg_html = '<span class="item-no-allergen"></span>'

                        html += f'''            <div class="menu-item">
              <div class="item-row-top">
                <span class="item-name">{name}</span>
                <span class="item-dots"></span>
                <span class="manual-price-box">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₺ ]</span>
              </div>
              <div class="item-row-sub">
                <span class="item-specs">{gramaj} • {cal}</span>
                {alg_html}
              </div>
            </div>
'''
                html += '          </div>\n'

            html += '        </div>\n'

        if wing_id == "left":
            footer_content = '''
        <div class="footer-left">
          <span>📍 75. Yol Ana Şube, Kayapınar / Diyarbakır</span>
          <span>•</span>
          <span>📞 +90 412 503 04 05</span>
          <span>•</span>
          <span>✓ Tarım ve Orman Bakanlığı 14 Alerjen Tebliği Uyumlu</span>
        </div>
        <div class="footer-right">
          SOL KANAT • SAYFA 1/2 (210×297 MM)
        </div>
'''
        else:
            footer_content = '''
        <div class="footer-left">
          <span>🌐 www.loqumet.com</span>
          <span>•</span>
          <span>📸 Instagram: @loqumdiyarbakir</span>
          <span>•</span>
          <span>✓ Fiyatlar et borsasına göre el ile yazılmaktadır</span>
        </div>
        <div class="footer-right">
          SAĞ KANAT • SAYFA 2/2 (210×297 MM)
        </div>
'''

        html += f'''      </main>

      <!-- Footer (Ürünlerden En Az 8mm Uzakta Tek Satır) -->
      <footer class="wing-footer">
{footer_content}
      </footer>
    </section>
'''

    html += '''  </div>
</body>
</html>
'''

    with open(out_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Bitişik A4 Menü (6 Geniş Sütun) HTML oluşturuldu: {out_html_path}")

    # Copy to public
    os.makedirs(os.path.dirname(public_html_path), exist_ok=True)
    with open(public_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Yedek HTML public klasörüne kopyalandı: {public_html_path}")

    print(f"Toplam render edilen ürün sayısı: {total_rendered} / {len(products)}")
    assert total_rendered == 158, f"HATA: Toplam ürün 158 olmalı, bulunan: {total_rendered}"

    # Compile with Chrome Headless
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(chrome_bin):
        primary_pdf = pdf_paths[0]
        cmd = [
            chrome_bin,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=5000",
            f"--print-to-pdf={primary_pdf}",
            out_html_path
        ]
        print(f"PDF derleniyor (Chrome Headless): {primary_pdf}...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(primary_pdf) and os.path.getsize(primary_pdf) > 1000:
            import shutil
            for extra_path in pdf_paths[1:]:
                try:
                    os.makedirs(os.path.dirname(os.path.abspath(extra_path)), exist_ok=True)
                    shutil.copy2(primary_pdf, extra_path)
                    print(f"Kopya oluşturuldu -> {extra_path}")
                except Exception as e:
                    print(f"Kopya uyarısı ({extra_path}): {e}")
            size_kb = os.path.getsize(primary_pdf) / 1024
            print(f"BAŞARILI: Bitişik A4 Masa Menüsü üretildi: {primary_pdf} ({size_kb:.1f} KB)")
        else:
            print(f"HATA: PDF üretilemedi! {res.stderr}")

if __name__ == '__main__':
    generate_bitisik_menu()
