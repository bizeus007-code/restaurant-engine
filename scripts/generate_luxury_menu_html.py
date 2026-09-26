# -*- coding: utf-8 -*-
import json
import os
import io
import base64
from PIL import Image

def build_luxury_html(compile_pdf=True, hide_prices=None, price_mode=None, out_pdf_paths=None, out_html_path=None):
    # Resolve price_mode
    if price_mode is None:
        if hide_prices is True:
            price_mode = "none"
        elif hide_prices is False:
            price_mode = "printed"
        else:
            price_mode = "manual"

    json_path = '/Users/mesa/restaurant-engine/src/data/loqum-products.json'
    cover_img_path = '/Users/mesa/Downloads/ChatGPT Image 11 Eyl 2026 23_02_55.png'
    desktop_cover_path = os.path.expanduser('~/Desktop/LOQUM_KAPAK.png')

    if not os.path.exists(cover_img_path) and os.path.exists(desktop_cover_path):
        cover_img_path = desktop_cover_path

    if price_mode == "none":
        if out_html_path is None:
            out_html_path = '/Users/mesa/restaurant-engine/public/LOKUM_ET_TAM_MENU_FIYATSIZ.html'
        public_html_path = out_html_path
    elif price_mode == "manual":
        if out_html_path is None:
            out_html_path = '/Users/mesa/restaurant-engine/public/LOQUM_ET_16_SAYFA_LUK_KITAPCIK.html'
        public_html_path = out_html_path
    else:
        if out_html_path is None:
            out_html_path = '/Users/mesa/restaurant-engine/public/LOQUM_ET_LUKUS_MENU_BASKI.html'
        public_html_path = out_html_path

    # Encode cover image to base64
    with Image.open(cover_img_path) as im:
        buf = io.BytesIO()
        im.convert('RGB').save(buf, format='JPEG', quality=93, optimize=True)
        cover_base64 = base64.b64encode(buf.getvalue()).decode('ascii')
        cover_data_uri = f"data:image/jpeg;base64,{cover_base64}"

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Filter out Humus and Haydari if present
    products = [p for p in products if p['id'] not in {'makarnalar-ve-salatalar-meze-1', 'makarnalar-ve-salatalar-meze-2'}]

    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from update_allergens_exact import EXACT_ALLERGENS_BY_ID as ALLERGEN_OVERRIDES

    for p in products:
        if p.get('id') in ALLERGEN_OVERRIDES:
            p['allergens'] = ALLERGEN_OVERRIDES[p['id']]

    # 13 Category Pages Definitions with Custom Footers
    pages_config = [
        {
            'page_num': 3,
            'cat_num': 1,
            'title': 'SERPME KÖY KAHVALTISI & ÖZEL YUMURTALAR',
            'subtitle': 'Karacadağ ve bölgenin en seçkin doğal şarküteri lezzetleri',
            'filter': lambda p: p.get('categorySlug') == 'kahvalti',
            'columns': 1,
            'layout': 'cozy',
            'chef_note': '“Kahvaltılarımızda servis edilen tereyağı, petek bal ve reçeller Karacadağ yöresinden doğal olarak temin edilmektedir. Sıcak pişi ve taş fırın ekmeği ikramımızdır.”'
        },
        {
            'page_num': 4,
            'cat_num': 2,
            'title': 'MAKARNALAR & TAZE GURME SALATALAR',
            'subtitle': 'El yapımı İtalyan makarnaları ve günlük hasat Akdeniz bahçe yeşillikleri',
            'filter': lambda p: p.get('categorySlug') == 'makarnalar-ve-salatalar',
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Salatalarımızda Ayvalık soğuk sıkım sızma zeytinyağı, el yapımı nar ekşisi ve günlük hasat çıtır tarla yeşillikleri kullanılmaktadır.”'
        },
        {
            'page_num': 5,
            'cat_num': 3,
            'title': 'TAŞ FIRIN LEZZETLERİ & AĞIR PİŞEN KUZULAR',
            'subtitle': 'Odun ateşinde 6 saat ağır ağır demlenen Diyarbakır süt kuzusu şöleni',
            'filter': lambda p: p.get('categorySlug') == 'firin-etler',
            'columns': 1,
            'layout': 'hero',
            'chef_note': None
        },
        {
            'page_num': 6,
            'cat_num': 4,
            'title': 'DİNLENDİRİLMİŞ STEAKLER & DRY-AGED SPESİYALLER',
            'subtitle': 'Himalaya tuzu odasında 28 gün dinlendirilmiş kemikli ve kemiksiz dana et seçkisi',
            'filter': lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                'steak-newyork-steak', 'steak-dana-pirzola', 'steak-loqum', 'steak-satoburyan',
                'steak-kuzu-kafes', 'steak-dana-saslik', 'steak-hardal-soslu-loqum', 'steak-biftek',
                'steak-mexican-steak', 'steak-paper-steak', 'steak-diyet-antrikot'
            ],
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Steaklerimiz Himalaya kaya tuzu kaplı odalarda 28 gün dinlendirilerek meşe kömürü ızgarasında arzu ettiğiniz pişme derecesinde mühürlenir.”'
        },
        {
            'page_num': 7,
            'cat_num': 5,
            'title': 'GURME SOSLU STEAKLER & ÖZEL TAVALAR',
            'subtitle': 'Özel eritilmiş cheddar, taze mantar kreması ve hardal soslu imza sunumlar',
            'filter': lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                'steak-mantar-kremali-steak', 'steak-kasap-sucuk-250gr', 'steak-cheddar-soslu-antrikot',
                'steak-mantar-soslu-antrikot', 'steak-cheddar-soslu-loqum', 'steak-mantar-soslu-steak',
                'steak-hardal-soslu-antrikot', 'steak-t-bone', 'steak-sos-karnavalli-saslik', 'steak-antrikot'
            ],
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Özel gurme soslarımız günlük olarak taze mantar, Fransız hardalı ve halis çiftlik tereyağı ile tavada taze hazırlanmaktadır.”'
        },
        {
            'page_num': 8,
            'cat_num': 6,
            'title': 'CIZIRDAYAN FAJİTALAR & DİYARBAKIR SAÇ TAVALARI',
            'subtitle': 'Döküm tavada renkli sebzelerle cızırdayan fajitalar ve bakır tavada pişen güveçler',
            'filter': lambda p: p.get('categorySlug') in ['fajitalar', 'tavalar'],
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Fajitalarımız masanıza cızırdayan döküm tavada; sıcak taş fırın lavaşı, salsa, ekşi krema ve taze guacamole ile servis edilir.”'
        },
        {
            'page_num': 9,
            'cat_num': 7,
            'title': 'GELENEKSEL ZIRH KEBAPLARI (KLASİK & ŞİŞLER)',
            'subtitle': 'Katkısız süt kuzusu, satır zırh kıyması ve meşe odunu közünde kebap geleneği',
            'filter': lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                'kebaplar-citir-yagli-kara', 'kebaplar-adana', 'kebaplar-sade-kebap', 'kebaplar-beyti-kebap',
                'kebaplar-adana-dolama', 'kebaplar-domatesli-kebap', 'kebaplar-yogurtlu-kebap', 'kebaplar-urfa',
                'kebaplar-sarma-beyti', 'kebaplar-alti-ezmeli-kebap', 'kebaplar-sebzeli-kebap', 'kebaplar-begendili-kebap',
                'kebaplar-patlicanli-kebap', 'kebaplar-loqum-kebap', 'kebaplar-yogurtlu-kusbasi', 'kebaplar-kozlu-kebap',
                'kebaplar-firinda-kasarli-sarma-beyti', 'kebaplar-begendili-kusbasi'
            ],
            'columns': 2,
            'layout': 'dense',
            'chef_note': None
        },
        {
            'page_num': 10,
            'cat_num': 8,
            'title': 'GELENEKSEL ZIRH KEBAPLARI (SPESİYAL & KUZULAR)',
            'subtitle': 'Kuzu sırtı, külbastı, sarma spesiyaller ve fırında tereyağlı enfes sunumlar',
            'filter': lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                'kebaplar-kuzu-sirt', 'kebaplar-kuzu-kulbasti', 'kebaplar-halep-isi-kebap', 'kebaplar-mantarli-kasarli-sarma',
                'kebaplar-loqum-leblebi', 'kebaplar-kuzu-pirzola', 'kebaplar-kuzu-sis', 'kebaplar-iskender-usulu-kebap',
                'kebaplar-ufo-kebap', 'kebaplar-kuzu-kusleme', 'kebaplar-kuzu-taraklik', 'kebaplar-karisik-kebap',
                'kebaplar-tavuksuz-karisik-kebap', 'kebaplar-alinazik', 'kebaplar-sirali-kebap', 'kebaplar-karisik-karnaval-3-kisilik',
                'kebaplar-trio-kebap', 'kebaplar-cizir-cizir-tavada-kuzu-sirt'
            ],
            'columns': 2,
            'layout': 'dense',
            'chef_note': None
        },
        {
            'page_num': 11,
            'cat_num': 9,
            'title': 'ÖZEL KÖFTELER & LOQUM YÖRESEL GASTRONOMİ',
            'subtitle': 'Zırh köfteler, çömlek tandırlar, kuzu incikler ve kadim Diyarbakır tencereleri',
            'filter': lambda p: p.get('categorySlug') in ['kofteler', 'loqum-yoresel'],
            'columns': 2,
            'layout': 'dense',
            'chef_note': None
        },
        {
            'page_num': 12,
            'cat_num': 10,
            'title': 'ODUN ATEŞİNDE TAŞ TABANLI PİDELER & ÇITIR LAHMACUNLAR',
            'subtitle': 'Taş tabanlı fırında meşe ateşiyle pişen incecik çıtır lahmacunlar ve dolgun pideler',
            'filter': lambda p: p.get('categorySlug') == 'lahmacun-ve-pide',
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Taş tabanlı fırınımızda meşe odunu közüyle pişen lahmacun ve pidelerimiz; günlük mayalanan ince hamur ve zırh eti harcıyla hazırlanır.”'
        },
        {
            'page_num': 13,
            'cat_num': 11,
            'title': 'GURME BURGERLER & LOQUM PİLİÇ SEÇKİLERİ',
            'subtitle': 'Özel brioche ekmeğinde gurme burgerler ve marine edilmiş piliç ızgara spesiyalleri',
            'filter': lambda p: p.get('categorySlug') in ['burgerler', 'loqum-pilicler'],
            'columns': 2,
            'layout': 'dense',
            'chef_note': None
        },
        {
            'page_num': 14,
            'cat_num': 12,
            'title': 'GELENEKSEL GURME TATLILAR',
            'subtitle': 'Hakiki Antep fıstıklı sıcak katmer, çıtır cennet çamuru ve tatlı şöleni',
            'filter': lambda p: p.get('categorySlug') == 'tatlilar',
            'columns': 1,
            'layout': 'cozy',
            'chef_note': '“Tüm şerbetli ve sıcak tatlılarımız hakiki Maraş kesme dondurması ve taze çekilmiş Antep fıstığı ile servis edilir.”'
        },
        {
            'page_num': 15,
            'cat_num': 13,
            'title': 'SOĞUK MEŞRUBATLAR & DOĞAL İÇECEKLER',
            'subtitle': 'Taze sıkılmış meyve suları, ferahlatıcı yayık ayranı ve doğal kaynak suları',
            'filter': lambda p: p.get('categorySlug') == 'icecekler',
            'columns': 2,
            'layout': 'standard',
            'chef_note': '“Taze meyve sularımız sipariş anında sıkılmakta; ayranımız geleneksel yöntemle taze yayık yoğurdundan hazırlanmaktadır.”'
        }
    ]

    total_listed = 0

    # HTML Generator
    html_parts = []
    html_parts.append('''<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>LOQUM ET STEAKHOUSE — Resmî Gastronomi Menüsü (16 Sayfa Tam Katalog)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    /* CSS Reset & Base */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    body {
      font-family: 'Montserrat', sans-serif;
      color: #1A1A1A;
      background-color: #121214;
      -webkit-font-smoothing: antialiased;
    }

    /* Print Bar */
    .top-print-bar {
      position: fixed;
      top: 16px;
      right: 24px;
      z-index: 9999;
      background: rgba(14, 14, 16, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid #D4AF37;
      padding: 10px 20px;
      border-radius: 40px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.7);
    }
    .top-print-bar .info {
      color: #FAF8F5;
      font-size: 12px;
      font-weight: 500;
    }
    .top-print-bar .info strong {
      color: #D4AF37;
    }
    .top-print-bar button {
      background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
      color: #0A0A0B;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.5px;
      padding: 8px 18px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
      transition: all 0.2s ease;
    }
    .top-print-bar button:hover {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }

    .booklet-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 40px 0 80px 0;
    }

    /* A4 Page Styling */
    .page {
      width: 210mm;
      height: 297mm;
      position: relative;
      background-color: #FAF8F5;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      box-sizing: border-box;
      overflow: hidden;
    }

    /* Cover Page (Page 1) */
    .page-cover {
      background-color: #080808;
      padding: 0 !important;
    }
    .page-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Back Cover (Page 16) */
    .page-back-cover {
      background: radial-gradient(circle at center, #18181C 0%, #0A0A0C 100%);
      color: #FAF8F5;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 24mm 20mm;
      text-align: center;
    }

    /* Inner Pages Decorative Frame */
    .inner-frame {
      position: absolute;
      top: 8mm;
      bottom: 8mm;
      left: 8mm;
      right: 8mm;
      border: 1px solid #E5DEC9;
      pointer-events: none;
    }
    .inner-frame::after {
      content: '';
      position: absolute;
      top: 1.8mm;
      bottom: 1.8mm;
      left: 1.8mm;
      right: 1.8mm;
      border: 0.5px solid rgba(212, 175, 55, 0.45);
    }
    .corner-ornament {
      position: absolute;
      width: 6mm;
      height: 6mm;
      border-color: #D4AF37;
      border-style: solid;
      pointer-events: none;
    }
    .corner-tl { top: 8mm; left: 8mm; border-width: 2px 0 0 2px; }
    .corner-tr { top: 8mm; right: 8mm; border-width: 2px 2px 0 0; }
    .corner-bl { bottom: 8mm; left: 8mm; border-width: 0 0 2px 2px; }
    .corner-br { bottom: 8mm; right: 8mm; border-width: 0 2px 2px 0; }

    /* Page Content Wrapper (Takes Full Height) */
    .page-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 13mm 14mm 11mm 14mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Header */
    .page-header {
      text-align: center;
      margin-bottom: 3.5mm;
      flex-shrink: 0;
    }
    .header-crest {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #9E7D2B;
      margin-bottom: 1.5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .header-crest::before, .header-crest::after {
      content: '';
      display: inline-block;
      width: 24px;
      height: 1px;
      background: linear-gradient(to right, transparent, #D4AF37);
    }
    .header-crest::after {
      background: linear-gradient(to left, transparent, #D4AF37);
    }
    .header-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: #161616;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .header-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 1.8mm auto 1.2mm auto;
      max-width: 130mm;
    }
    .header-divider .line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.6), transparent);
    }
    .header-divider .diamond {
      width: 4.5px;
      height: 4.5px;
      background: #D4AF37;
      transform: rotate(45deg);
    }
    .header-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11.5px;
      font-style: italic;
      color: #6B6255;
    }

    /* Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 0.5px solid rgba(212, 175, 55, 0.3);
      padding-top: 2.2mm;
      margin-top: 2.5mm;
      font-size: 7.5px;
      letter-spacing: 1px;
      color: #8C8275;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .page-footer .left {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 9.5px;
      letter-spacing: 0.5px;
    }
    .page-footer .right {
      font-weight: 600;
      color: #9E7D2B;
    }

    /* Menu Grid Layouts (Full Height Vertical Distribution) */
    .menu-grid {
      display: grid;
      column-gap: 8mm;
      flex: 1;
      align-content: space-between;
      justify-content: space-between;
      min-height: 0;
    }
    .menu-grid.cols-1 {
      grid-template-columns: 1fr;
      max-width: 155mm;
      margin: 0 auto;
    }
    .menu-grid.cols-2 {
      grid-template-columns: 1fr 1fr;
    }
    .menu-grid.dense {
      align-content: space-between;
    }

    /* Menu Item Card */
    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      padding: 1.5mm 0;
    }
    .item-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
    }
    .item-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 10.5px;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: 0.15px;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .item-dots {
      flex: 1;
      border-bottom: 1px dotted rgba(160, 140, 110, 0.45);
      margin: 0 4px 3px 4px;
    }
    .item-price {
      font-family: 'Montserrat', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      color: #9E7D2B;
      font-feature-settings: "tnum";
      white-space: nowrap;
    }
    .manual-price-box {
      font-family: 'Montserrat', monospace, sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      color: #9E7D2B;
      letter-spacing: 1px;
      white-space: nowrap;
    }
    .item-desc {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.8px;
      color: #555047;
      line-height: 1.25;
      margin-top: 1.5px;
    }
    .item-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      font-size: 7px;
      color: #7A7265;
      font-weight: 500;
    }
    .meta-bullet {
      color: #D4AF37;
      font-size: 6px;
    }
    .meta-tag-allergen {
      color: #8C2525;
      font-weight: 600;
    }
    .meta-tag-clean {
      color: #2D6A4F;
      font-weight: 600;
    }

    /* Dense Variant for 17-20 Items */
    .menu-grid.dense .item-name {
      font-size: 9.5px;
      line-height: 1.15;
    }
    .menu-grid.dense .item-price {
      font-size: 10px;
    }
    .menu-grid.dense .manual-price-box {
      font-size: 9px;
    }
    .menu-grid.dense .item-desc {
      font-size: 6.8px;
      line-height: 1.2;
      margin-top: 1px;
    }
    .menu-grid.dense .item-meta {
      font-size: 6.2px;
      margin-top: 1px;
    }

    /* Standard Variant (10-15 Items) */
    .menu-grid.standard .item-name {
      font-size: 11px;
    }
    .menu-grid.standard .item-price {
      font-size: 11.5px;
    }
    .menu-grid.standard .item-desc {
      font-size: 7.8px;
      line-height: 1.25;
    }
    .menu-grid.standard .item-meta {
      font-size: 7px;
      margin-top: 2px;
    }

    /* Hero Layout (Page 5: Taş Fırın Kuzular - 2 Items) */
    .hero-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      gap: 6mm;
      margin-top: 2mm;
    }
    .hero-card {
      background: #F5EFE4;
      border: 1.5px solid #D4AF37;
      border-radius: 4px;
      padding: 9mm 12mm;
      position: relative;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
    }
    .hero-card::before {
      content: '✦ İMZA TAŞ FIRIN LEZZETİ ✦';
      position: absolute;
      top: -3.5mm;
      left: 50%;
      transform: translateX(-50%);
      background: #9E7D2B;
      color: #FAF8F5;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 2.5px 14px;
      border-radius: 20px;
    }
    .hero-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid rgba(212, 175, 55, 0.45);
      padding-bottom: 3.5mm;
      margin-bottom: 3.5mm;
    }
    .hero-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 700;
      color: #121212;
      letter-spacing: 1px;
    }
    .hero-price {
      font-family: 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #9E7D2B;
    }
    .hero-price-manual {
      font-family: 'Montserrat', monospace, sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #9E7D2B;
      letter-spacing: 2px;
      white-space: nowrap;
    }
    .hero-desc {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      color: #4A4237;
      line-height: 1.55;
      margin-bottom: 4mm;
    }
    .hero-meta-row {
      display: flex;
      gap: 20px;
      font-size: 9.5px;
      color: #6E6355;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Grand Slow-Cook Badge Box (Page 5 Bottom) */
    .slow-cook-badge-box {
      background: #EFE8DA;
      border: 1px dashed #D4AF37;
      border-radius: 4px;
      padding: 6mm 10mm;
      text-align: center;
      margin-top: 2mm;
    }
    .slow-cook-badge-box .badge-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #9E7D2B;
      text-transform: uppercase;
      margin-bottom: 2mm;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .slow-cook-badge-box p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13.5px;
      font-style: italic;
      color: #3D352B;
      line-height: 1.5;
    }

    /* Cozy Layout (Kahvaltı & Tatlılar - 5 items) */
    .cozy-list {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      max-width: 165mm;
      margin: 0 auto;
      width: 100%;
    }
    .cozy-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: 0.5px solid rgba(212, 175, 55, 0.3);
      padding: 3.5mm 0;
      flex: 1;
    }
    .cozy-item:last-child {
      border-bottom: none;
    }
    .cozy-item .item-name {
      font-size: 15px;
    }
    .cozy-item .item-price {
      font-size: 15.5px;
    }
    .cozy-item .item-desc {
      font-size: 9px;
      line-height: 1.35;
      margin-top: 2px;
    }
    .cozy-item .item-meta {
      font-size: 8px;
      margin-top: 3.5px;
    }

    /* Complementary Chef Note Card (Bottom Filler) */
    .chef-note-card {
      margin-top: 4mm;
      padding: 3.5mm 7mm;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.45);
      border-radius: 4px;
      text-align: center;
      flex-shrink: 0;
    }
    .chef-note-card .note-header {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #9E7D2B;
      text-transform: uppercase;
      margin-bottom: 1.5mm;
    }
    .chef-note-card p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11.5px;
      font-style: italic;
      color: #4A4237;
      line-height: 1.35;
    }

    /* Page 2: Gastronomi Manifestosu */
    .manifesto-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 1mm 1mm;
    }
    .manifesto-lead-box {
      border-top: 1.5px solid rgba(212, 175, 55, 0.4);
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.4);
      background: linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.01) 100%);
      padding: 6mm 14mm;
      text-align: center;
      border-radius: 4px;
    }
    .manifesto-lead-quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: 19px;
      font-style: italic;
      font-weight: 500;
      color: #4A3E31;
      line-height: 1.45;
      letter-spacing: 0.3px;
      margin: 0;
    }
    .manifesto-blocks-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4mm;
    }
    .manifesto-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 8mm;
      align-items: stretch;
    }
    .manifesto-card {
      background: #FFFFFF;
      border: 1.2px solid rgba(212, 175, 55, 0.42);
      border-radius: 6px;
      padding: 7mm 8mm;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      position: relative;
    }
    .manifesto-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1.5mm;
    }
    .manifesto-card .num-badge {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: 11px;
      color: #9E7D2B;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.5);
      padding: 2.5px 8.5px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .manifesto-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 700;
      color: #1F1B18;
      letter-spacing: 0.3px;
      margin: 0;
    }
    .manifesto-card .card-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.8px;
      font-weight: 700;
      letter-spacing: 1.4px;
      color: #9E7D2B;
      text-transform: uppercase;
      margin-bottom: 3.5mm;
      padding-left: 1px;
    }
    .manifesto-card p {
      font-family: 'Montserrat', sans-serif;
      font-size: 11.5px;
      color: #3E362D;
      line-height: 1.72;
      text-align: justify;
      margin: 0;
    }

    /* Ornamental Gold Divider between rows */
    .manifesto-divider-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5mm 0;
      position: relative;
    }
    .ornament-svg-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ornament-badge {
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.45);
      border-radius: 20px;
      padding: 3.5px 20px;
      margin-top: 2mm;
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #8A6A1C;
      text-transform: uppercase;
    }
    .ornament-badge .dot {
      color: #D4AF37;
    }

    .manifesto-seal {
      margin-top: 2mm;
      padding-top: 3.5mm;
      border-top: 1px solid rgba(212, 175, 55, 0.45);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .seal-left {
      max-width: 110mm;
    }
    .seal-left .seal-tag {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5px;
      font-weight: 700;
      color: #9E7D2B;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 1.5mm;
    }
    .seal-left .seal-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13px;
      color: #52473A;
      font-style: italic;
      letter-spacing: 0.2px;
      line-height: 1.4;
    }
    .seal-badge-box {
      border: 1.5px solid rgba(212, 175, 55, 0.55);
      border-radius: 4px;
      padding: 2.5mm 6mm;
      text-align: center;
      background: rgba(212, 175, 55, 0.05);
      flex-shrink: 0;
    }
    .seal-badge-box .seal-crest {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 800;
      color: #1A1715;
      letter-spacing: 2px;
    }
    .seal-badge-box .seal-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 700;
      color: #9E7D2B;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 0.5mm;
    }
    .seal-badge-box .seal-date {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5px;
      color: #6E6457;
      margin-top: 1mm;
    }

    /* Print Overrides */
    @media print {
      body {
        background-color: transparent !important;
        padding: 0 !important;
      }
      .top-print-bar {
        display: none !important;
      }
      .booklet-container {
        gap: 0 !important;
        padding: 0 !important;
      }
      .page {
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        width: 210mm !important;
        height: 297mm !important;
      }
      .page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Print Toolbar for Browser -->
  <div class="top-print-bar">
    <div class="info">
      <strong>LOQUM ET</strong> • 16 Sayfa Lüks Menü Kataloğu (160 Ürün)
    </div>
    <button onclick="window.print()">🖨️ PDF Olarak Yazdır (Cmd + P)</button>
  </div>

  <div class="booklet-container">
''')

    # ================= PAGE 1: ÖN KAPAK (COVER) =================
    html_parts.append(f'''
    <!-- SAYFA 1: ÖN KAPAK -->
    <section class="page page-cover">
      <img src="{cover_data_uri}" alt="LOQUM ET Kapak Görseli">
    </section>
''')

    # ================= PAGE 2: GİRİŞ & MANİFESTO =================
    html_parts.append('''
    <!-- SAYFA 2: MANİFESTO & DRY-AGED HİKÂYESİ -->
    <section class="page">
      <div class="inner-frame"></div>
      <div class="corner-ornament corner-tl"></div>
      <div class="corner-ornament corner-tr"></div>
      <div class="corner-ornament corner-bl"></div>
      <div class="corner-ornament corner-br"></div>

      <div class="page-content">
        <header class="page-header">
          <div class="header-crest">✦ GASTRONOMİ MANİFESTOSU ✦</div>
          <h1 class="header-title">Ateşin, Sabrın ve Ustalığın Hikâyesi</h1>
          <div class="header-divider"><div class="line"></div><div class="diamond"></div><div class="line"></div></div>
          <p class="header-subtitle">Diyarbakır Karacadağ yaylalarından Himalaya tuz odalarına uzanan lezzet felsefemiz</p>
        </header>

        <div class="manifesto-body">
          <div class="manifesto-lead-box">
            <p class="manifesto-lead-quote">
              "Et bir zanaat, pişirmek bir ayin, sofraya sunmak ise asırlık bir misafirperverlik borcudur."
            </p>
          </div>

          <div class="manifesto-blocks-container">
            <!-- Üst Blok (01 - 02) -->
            <div class="manifesto-row">
              <div class="manifesto-card">
                <div class="manifesto-card-header">
                  <span class="num-badge">01</span>
                  <h3>Karacadağ'ın Kadim Yaylaları</h3>
                </div>
                <div class="card-subtitle">DOĞAL BESİ & BAZALT TOPRAK COĞRAFYASI</div>
                <p>
                  Mutfağımıza giren her et; Diyarbakır Karacadağ'ın volkanik bazalt topraklarında, binbir çeşit kekik ve yabani dağ otlarıyla serbest otlayan yerli ırk süt kuzularından ve özenle yetiştirilen besili danalardan seçilir. Kadim Mezopotamya coğrafyasının saf aroması ve mineral zenginliği her lokmada hissedilir.
                </p>
              </div>

              <div class="manifesto-card">
                <div class="manifesto-card-header">
                  <span class="num-badge">02</span>
                  <h3>28 Günlük Himalaya Tuzu Mührü</h3>
                </div>
                <div class="card-subtitle">DRY-AGED DİNLENDİRME & MERMERSİ DOKU</div>
                <p>
                  Özel doğal Himalaya tuzu bloklarıyla kaplı dinlendirme odalarımızda, %80 bağıl nem ve 0-2°C sabit sıcaklıkta tam 28 gün kuru dinlendirilen (Dry-Aged) etlerimiz; enzimlerin doğal etkisiyle liflerini gevşeterek yoğun fındıksı aromasını, eşsiz mermersi yağ dokusunu ve ağızda dağılan yumuşaklığını kazanır.
                </p>
              </div>
            </div>

            <!-- Altın Varaklı Vektörel Ayraç (Gold Ornament Divider) -->
            <div class="manifesto-divider-section">
              <div class="ornament-svg-wrap">
                <svg width="520" height="28" viewBox="0 0 520 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Sol Kanat -->
                  <line x1="15" y1="14" x2="195" y2="14" stroke="#D4AF37" stroke-width="1.2" />
                  <line x1="55" y1="10" x2="185" y2="10" stroke="#AA7C11" stroke-width="0.75" stroke-dasharray="4 2" />
                  <line x1="55" y1="18" x2="185" y2="18" stroke="#AA7C11" stroke-width="0.75" stroke-dasharray="4 2" />
                  <circle cx="202" cy="14" r="2.5" fill="#AA7C11" stroke="#D4AF37" stroke-width="0.8" />
                  <circle cx="212" cy="14" r="1.5" fill="#D4AF37" />
                  <circle cx="220" cy="14" r="1" fill="#D4AF37" />

                  <!-- Orta Geometrik Madalyon -->
                  <g transform="translate(260, 14)">
                    <rect x="-10" y="-10" width="20" height="20" rx="2.5" transform="rotate(45)" fill="#FAF8F5" stroke="#D4AF37" stroke-width="1.6" />
                    <rect x="-5" y="-5" width="10" height="10" rx="1" transform="rotate(45)" fill="#9E7D2B" />
                    <circle cx="0" cy="0" r="1.8" fill="#FAF8F5" />
                    <circle cx="0" cy="-14" r="1.2" fill="#D4AF37" />
                    <circle cx="0" cy="14" r="1.2" fill="#D4AF37" />
                    <circle cx="-17" cy="0" r="1.3" fill="#D4AF37" />
                    <circle cx="17" cy="0" r="1.3" fill="#D4AF37" />
                  </g>

                  <!-- Sağ Kanat -->
                  <circle cx="300" cy="14" r="1" fill="#D4AF37" />
                  <circle cx="308" cy="14" r="1.5" fill="#D4AF37" />
                  <circle cx="318" cy="14" r="2.5" fill="#AA7C11" stroke="#D4AF37" stroke-width="0.8" />
                  <line x1="325" y1="14" x2="505" y2="14" stroke="#D4AF37" stroke-width="1.2" />
                  <line x1="335" y1="10" x2="465" y2="10" stroke="#AA7C11" stroke-width="0.75" stroke-dasharray="4 2" />
                  <line x1="335" y1="18" x2="465" y2="18" stroke="#AA7C11" stroke-width="0.75" stroke-dasharray="4 2" />
                </svg>
              </div>
              <div class="ornament-badge">
                <span class="dot">✦</span> KÖKLÜ GELENEK • SAF LEZZET • ZANAATKÂR RUHU <span class="dot">✦</span>
              </div>
            </div>

            <!-- Alt Blok (03 - 04) -->
            <div class="manifesto-row">
              <div class="manifesto-card">
                <div class="manifesto-card-header">
                  <span class="num-badge">03</span>
                  <h3>Asırlık Zırh & Meşe Közü</h3>
                </div>
                <div class="card-subtitle">GELENEKSEL EL İŞÇİLİĞİ & SAF İSLİ ATEŞ</div>
                <p>
                  Geleneksel kebaplarımızda kıyma makinesi asla kullanılmaz. Kuzu kaburga ve kuyruk yağı, usta ellerde çift satır zırh darbesiyle tane tane inceltilir. Yalnızca kaya tuzuyla harmanlanan kebaplarımız, yüksek meşe kömürünün isli közünde etin kendi saf suyu hapsedilerek sulu ve lezzetli pişirilir.
                </p>
              </div>

              <div class="manifesto-card">
                <div class="manifesto-card-header">
                  <span class="num-badge">04</span>
                  <h3>Taş Fırında Ağır Pişen Miras</h3>
                </div>
                <div class="card-subtitle">6 SAAT KEMİK SUYUNDA DEMLEME & LOKUM KIVAMI</div>
                <p>
                  Kuzu kol ve gerdanlarımız; taş tabanlı geleneksel fırınımızda, meşe odunu közüyle ve kendi kemik iliği buharında tam 6 saat boyunca ağır ağır demlenir. Çatal dokunduğunda kemiğinden kendiliğinden ayrılan, tel tel çözülen efsanevi lokum kıvamı ve yoğun lezzeti bu kadim sabrın eseridir.
                </p>
              </div>
            </div>
          </div>

          <div class="manifesto-seal">
            <div class="seal-left">
              <div class="seal-tag">✦ GURME STANDARDI & DOĞALLIK TAAHHÜDÜ</div>
              <div class="seal-text">
                "Sıfır katkı maddesi, sadece saf et, taze tarla mahsulleri ve kusursuz gastronomi standardı."
              </div>
            </div>
            <div class="seal-badge-box">
              <div class="seal-crest">LOQUM ET</div>
              <div class="seal-title">GURME KURULU</div>
              <div class="seal-date">Diyarbakır • 2026</div>
            </div>
          </div>
        </div>

        <footer class="page-footer">
          <span class="left">Loqum Et Steakhouse Diyarbakır</span>
          <span class="right">Sayfa 2 / 16</span>
        </footer>
      </div>
    </section>
''')

    # ================= PAGES 3 - 15: 13 KATEGORİ SAYFASI =================
    for cfg in pages_config:
        cat_prods = [p for p in products if cfg['filter'](p)]
        p_count = len(cat_prods)
        total_listed += p_count

        page_num = cfg['page_num']
        title = cfg['title']
        subtitle = cfg['subtitle']
        layout = cfg['layout']
        cols = cfg['columns']
        chef_note = cfg.get('chef_note')

        html_parts.append(f'''
    <!-- SAYFA {page_num}: {title} ({p_count} ÜRÜN) -->
    <section class="page">
      <div class="inner-frame"></div>
      <div class="corner-ornament corner-tl"></div>
      <div class="corner-ornament corner-tr"></div>
      <div class="corner-ornament corner-bl"></div>
      <div class="corner-ornament corner-br"></div>

      <div class="page-content">
        <header class="page-header">
          <div class="header-crest">✦ BÖLÜM {cfg['cat_num']:02d} • {p_count} İMZA SEÇKİ ✦</div>
          <h2 class="header-title">{title}</h2>
          <div class="header-divider"><div class="line"></div><div class="diamond"></div><div class="line"></div></div>
          <p class="header-subtitle">{subtitle}</p>
        </header>
''')

        # Layout Body
        if layout == 'hero':
            # Page 5: Taş Fırın Kuzular (2 items)
            html_parts.append('        <div class="hero-container">')
            for p in cat_prods:
                name = p['name'].strip()
                desc = p.get('description', '').strip()
                price = p.get('price', 0)
                gramaj = p.get('gramaj', '1200 gr')
                cal = f"{p.get('calories', 0)} kcal"
                algs = p.get('allergens', [])
                alg_str = ", ".join(algs) if algs else "Yok (Doğal Et)"
                alg_color = "#8C2525" if algs else "#2D6A4F"
                if price_mode == "manual":
                    price_html = '\n              <div class="hero-price-manual">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₺ ]</div>'
                elif price_mode == "printed":
                    price_html = f'\n              <div class="hero-price">₺{price:,}</div>'
                else:
                    price_html = ''

                html_parts.append(f'''
          <div class="hero-card">
            <div class="hero-title-row">
              <div class="hero-name">{name}</div>{price_html}
            </div>
            <p class="hero-desc">{desc}</p>
            <div class="hero-meta-row">
              <span>⚖️ Gramaj: <strong>{gramaj}</strong></span>
              <span>🔥 Kalori: <strong>{cal}</strong></span>
              <span>🛡️ Alerjen: <strong style="color: {alg_color};">{alg_str}</strong></span>
            </div>
          </div>
''')
            # Extra Grand Slow-Cook Badge Box for Page 5
            html_parts.append('''
          <div class="slow-cook-badge-box">
            <div class="badge-title">✦ 6 SAAT ODUN ATEŞİNDE AĞIR PİŞİRME MİRASI ✦</div>
            <p>
              “Karacadağ'ın kekik kokulu yaylalarında beslenen süt kuzuları; meşe odunu közüyle taş fırında, bakır kaplarda kendi buharı ve kemik iliği suyuyla 6 saat boyunca demlenir. Çatal değdiğinde tel tel ayrılan efsane lokum kıvamı bu kadim sabrın eseridir.”
            </p>
          </div>
''')
            html_parts.append('        </div>')

        elif layout == 'cozy':
            # 5 items (Kahvaltı & Tatlılar)
            html_parts.append('        <div class="cozy-list">')
            for p in cat_prods:
                name = p['name'].strip()
                desc = p.get('description', '').strip()
                price = p.get('price', 0)
                gramaj = p.get('gramaj', '1 Porsiyon')
                cal = f"{p.get('calories', 0)} kcal"
                algs = p.get('allergens', [])
                alg_str = ", ".join(algs) if algs else "Yok"
                alg_cls = "meta-tag-allergen" if algs else "meta-tag-clean"
                if price_mode == "manual":
                    price_part = '\n              <span class="item-dots"></span>\n              <span class="manual-price-box">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₺ ]</span>'
                elif price_mode == "printed":
                    price_part = f'\n              <span class="item-dots"></span>\n              <span class="item-price">₺{price:,}</span>'
                else:
                    price_part = ''

                html_parts.append(f'''
          <div class="cozy-item">
            <div class="item-top">
              <span class="item-name">{name}</span>{price_part}
            </div>
            <p class="item-desc">{desc}</p>
            <div class="item-meta">
              <span>{gramaj}</span>
              <span class="meta-bullet">•</span>
              <span>{cal}</span>
              <span class="meta-bullet">•</span>
              <span class="{alg_cls}">Alerjen: {alg_str}</span>
            </div>
          </div>
''')
            html_parts.append('        </div>')

            if chef_note:
                html_parts.append(f'''
        <div class="chef-note-card">
          <div class="note-header">✦ ŞEFİN LEZZET & İKRAM NOTU ✦</div>
          <p>{chef_note}</p>
        </div>
''')

        else:
            # Standard / Dense 2-column Grid
            grid_cls = "dense" if layout == 'dense' else "standard"
            html_parts.append(f'        <div class="menu-grid cols-{cols} {grid_cls}">')
            for p in cat_prods:
                name = p['name'].strip()
                desc = p.get('description', '').strip()
                price = p.get('price', 0)
                gramaj = p.get('gramaj', '250 gr')
                cal = f"{p.get('calories', 0)} kcal"
                algs = p.get('allergens', [])
                alg_str = ", ".join(algs) if algs else "Yok"
                alg_cls = "meta-tag-allergen" if algs else "meta-tag-clean"
                if price_mode == "manual":
                    price_part = '\n              <span class="item-dots"></span>\n              <span class="manual-price-box">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₺ ]</span>'
                elif price_mode == "printed":
                    price_part = f'\n              <span class="item-dots"></span>\n              <span class="item-price">₺{price:,}</span>'
                else:
                    price_part = ''

                html_parts.append(f'''
          <div class="menu-item">
            <div class="item-top">
              <span class="item-name" title="{name}">{name}</span>{price_part}
            </div>
            <p class="item-desc">{desc}</p>
            <div class="item-meta">
              <span>{gramaj}</span>
              <span class="meta-bullet">•</span>
              <span>{cal}</span>
              <span class="meta-bullet">•</span>
              <span class="{alg_cls}">Alerjen: {alg_str}</span>
            </div>
          </div>
''')
            html_parts.append('        </div>')

            if chef_note:
                html_parts.append(f'''
        <div class="chef-note-card">
          <div class="note-header">✦ ŞEFİN LEZZET & GARNİTÜR NOTU ✦</div>
          <p>{chef_note}</p>
        </div>
''')

        # Page Footer
        html_parts.append(f'''
        <footer class="page-footer">
          <span class="left">Loqum Et Steakhouse • Resmî Menü Kataloğu</span>
          <span class="right">Sayfa {page_num} / 16</span>
        </footer>
      </div>
    </section>
''')

    # ================= PAGE 16: ARKA KAPAK (BACK COVER) =================
    html_parts.append('''
    <!-- SAYFA 16: ARKA KAPAK -->
    <section class="page page-back-cover">
      <div class="inner-frame" style="border-color: rgba(212, 175, 55, 0.35);"></div>
      <div class="corner-ornament corner-tl" style="border-color: #D4AF37;"></div>
      <div class="corner-ornament corner-tr" style="border-color: #D4AF37;"></div>
      <div class="corner-ornament corner-bl" style="border-color: #D4AF37;"></div>
      <div class="corner-ornament corner-br" style="border-color: #D4AF37;"></div>

      <div style="margin-top: 15mm; text-align: center;">
        <div style="font-size: 24px; color: #D4AF37; margin-bottom: 4mm;">✦ ✦ ✦</div>
        <div style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #FAF8F5; margin-bottom: 2mm;">
          LOQUM ET
        </div>
        <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;">
          STEAKHOUSE & GASTRONOMİ
        </div>
        <div style="width: 40mm; height: 1px; background: linear-gradient(to right, transparent, #D4AF37, transparent); margin: 6mm auto;"></div>
        <p style="font-family: 'Cormorant Garamond', serif; font-size: 16px; font-style: italic; color: #C5BBAA; max-width: 120mm; margin: 0 auto; line-height: 1.4;">
          "Mezopotamya'nın bereketli topraklarında, ateşin ve etin kadim tutkusunu sofranıza taşıyoruz."
        </p>
      </div>

      <!-- Bilgiler & İletişim -->
      <div style="display: flex; flex-direction: column; gap: 8mm; max-width: 140mm; width: 100%; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 6px; padding: 10mm 12mm; background: rgba(255, 255, 255, 0.02); text-align: center;">
        
        <div>
          <div style="font-size: 9px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; margin-bottom: 2mm;">
            📍 ADRES & LOKASYON
          </div>
          <div style="font-size: 12px; color: #FAF8F5; font-weight: 500;">
            Diyarbakır • 75. Yol Ana Şube
          </div>
          <div style="font-size: 10px; color: #8F8778; margin-top: 1mm;">
            Kayapınar / Diyarbakır
          </div>
        </div>

        <div style="height: 1px; background: rgba(212, 175, 55, 0.2); width: 60%; margin: 0 auto;"></div>

        <div>
          <div style="font-size: 9px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; margin-bottom: 2mm;">
            📞 REZERVASYON & İLETİŞİM
          </div>
          <div style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #FAF8F5; letter-spacing: 1px;">
            +90 412 503 04 05
          </div>
          <div style="font-size: 10px; color: #D4AF37; margin-top: 1mm;">
            WhatsApp Rezervasyon Hattı Aktiftir
          </div>
        </div>

        <div style="height: 1px; background: rgba(212, 175, 55, 0.2); width: 60%; margin: 0 auto;"></div>

        <div style="display: flex; justify-content: space-around; font-size: 11px; color: #FAF8F5;">
          <div>
            <span style="color: #D4AF37; font-size: 10px;">📸 Instagram:</span><br>
            <strong>@loqumdiyarbakir</strong>
          </div>
          <div>
            <span style="color: #D4AF37; font-size: 10px;">🌐 Web Sitesi:</span><br>
            <strong>www.loqumet.com</strong>
          </div>
        </div>

      </div>

      <div style="margin-bottom: 8mm; text-align: center;">
        <div style="font-size: 8px; letter-spacing: 2px; color: #6E6659; text-transform: uppercase;">
          LOQUM ET STEAKHOUSE DİYARBAKIR © 2026. TÜM HAKLARI SAKLIDIR.
        </div>
        <div style="font-size: 7.5px; color: #524C42; margin-top: 1.5mm;">
          Bakanlık Gıda Kodeksi Uyumlu Gramaj, Kalori ve Saf Et Alerjen Standartları
        </div>
      </div>
    </section>
''')

    html_parts.append('''
  </div>
</body>
</html>
''')

    full_html = "".join(html_parts)
    with open(out_html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"BAŞARILI: Güncellenen 16 Sayfalık Lüks Menü Kitapçığı oluşturuldu -> {out_html_path}")

    # Also save a copy to project public folder
    try:
        os.makedirs(os.path.dirname(public_html_path), exist_ok=True)
        with open(public_html_path, 'w', encoding='utf-8') as f:
            f.write(full_html)
        print(f"Yedek HTML oluşturuldu -> {public_html_path}")
    except Exception as e:
        print(f"Yedek HTML uyarısı: {e}")

    print(f"Toplam listelenen ürün sayısı: {total_listed} / {len(products)}")
    assert total_listed == 158, f"Toplam ürün 158 olmalıdır, bulunan: {total_listed}"

    if compile_pdf:
        if out_pdf_paths is not None:
            pdf_targets = out_pdf_paths
        elif price_mode == "none":
            pdf_targets = [
                os.path.expanduser('~/Desktop/LOKUM_ET_TAM_MENU_FIYATSIZ.pdf'),
                '/Users/mesa/restaurant-engine/public/LOKUM_ET_TAM_MENU_FIYATSIZ.pdf'
            ]
        elif price_mode == "manual":
            pdf_targets = [
                os.path.expanduser('~/Desktop/LOQUM_ET_16_SAYFA_LUK_KITAPCIK.pdf'),
                '/Users/mesa/restaurant-engine/public/LOQUM_ET_16_SAYFA_LUK_KITAPCIK.pdf',
                '/Users/mesa/restaurant-engine/public/LOKUM_ET_KITAPCIK_MANUEL_FIYAT.pdf'
            ]
        else:
            pdf_targets = [
                os.path.expanduser('~/Desktop/LOQUM_ET_LUKUS_MENU_BASKI.pdf'),
                os.path.expanduser('~/Desktop/LOKUM_ET_TAM_MENU_BASKI.pdf'),
                '/Users/mesa/restaurant-engine/public/LOQUM_ET_LUKUS_MENU_BASKI.pdf'
            ]
        compile_pdf_with_chrome(out_html_path, pdf_targets)

def compile_pdf_with_chrome(html_path, output_pdf_paths):
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not os.path.exists(chrome_bin):
        print(f"UYARI: Google Chrome bulunamadı: {chrome_bin}")
        return False
    
    primary_pdf = output_pdf_paths[0]
    os.makedirs(os.path.dirname(os.path.abspath(primary_pdf)), exist_ok=True)
    import subprocess
    cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={primary_pdf}",
        html_path
    ]
    print(f"PDF derleniyor (Chrome Headless): {primary_pdf}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(primary_pdf) and os.path.getsize(primary_pdf) > 1000:
        import shutil
        for extra_path in output_pdf_paths[1:]:
            try:
                os.makedirs(os.path.dirname(os.path.abspath(extra_path)), exist_ok=True)
                shutil.copy2(primary_pdf, extra_path)
                print(f"Kopya oluşturuldu -> {extra_path}")
            except Exception as e:
                print(f"Kopya uyarısı ({extra_path}): {e}")
        file_size_mb = os.path.getsize(primary_pdf) / (1024 * 1024)
        print(f"BAŞARILI: Matbaa baskıya hazır PDF üretildi: {primary_pdf} ({file_size_mb:.2f} MB)")
        return True
    else:
        print(f"HATA: PDF üretilemedi! Kod: {res.returncode}, Çıktı: {res.stderr}")
        return False

if __name__ == '__main__':
    import sys
    if '--fiyatsiz' in sys.argv or '-f' in sys.argv:
        p_mode = "none"
    elif '--printed' in sys.argv or '-p' in sys.argv:
        p_mode = "printed"
    else:
        p_mode = "manual"
    build_luxury_html(compile_pdf=True, price_mode=p_mode)
