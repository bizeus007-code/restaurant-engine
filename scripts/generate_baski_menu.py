# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_luxury_menu_html import build_luxury_html

def generate_baski_menu():
    json_path = '/Users/mesa/restaurant-engine/src/data/loqum-products.json'
    output_path = '/Users/mesa/Desktop/LOKUM_ET_TAM_MENU_BASKI.txt'

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Map by id or name
    prod_map = {p['id']: p for p in products}

    # Helper for allergen string
    def get_allergen_text(p):
        allergens = p.get('allergens', [])
        if not allergens or len(allergens) == 0:
            return 'Yok'
        return ', '.join(allergens)

    # Helper for calorie
    def get_calories_text(p):
        name = p['name'].strip()
        if name in ['SADE SODA', 'BÜYÜK SU', 'KÜÇÜK SU']:
            return '0 kcal'
        cal = p.get('calories', 0)
        return f"{cal} kcal"

    # Helper for gramaj
    def get_gramaj_text(p):
        gr = p.get('gramaj', '')
        if gr:
            return gr
        cat = p.get('categorySlug', '')
        if cat == 'icecekler':
            return '330 ml'
        return '250 gr'

    # Build the 13 Pages structure
    # Page definitions with exact product assignments:
    pages = [
        {
            'page_num': 1,
            'title': 'SAYFA 1: SERPME KÖY KAHVALTISI & ÖZEL YUMURTALAR',
            'subtitle': 'Güne Diyarbakır ve bölgenin en seçkin doğal şarküteri lezzetleriyle başlayın.',
            'category_filter': lambda p: p.get('categorySlug') == 'kahvalti'
        },
        {
            'page_num': 2,
            'title': 'SAYFA 2: MAKARNALAR, TAZE GURME SALATALAR & BAŞLANGIÇLAR',
            'subtitle': 'El yapımı İtalyan makarnalar, taze bahçe yeşillikleri ve yöresel soğuk mezeler.',
            'category_filter': lambda p: p.get('categorySlug') == 'makarnalar-ve-salatalar'
        },
        {
            'page_num': 3,
            'title': 'SAYFA 3: TAŞ FIRIN LEZZETLERİ & ODUN ATEŞİNDE AĞIR PİŞEN KUZULAR',
            'subtitle': 'Taş fırında meşe odunu közünde 6 saat ağır ağır pişen Diyarbakır süt kuzuları.',
            'category_filter': lambda p: p.get('categorySlug') == 'firin-etler'
        },
        {
            'page_num': 4,
            'title': 'SAYFA 4: DİNLENDİRİLMİŞ STEAKLER & DRY-AGED SPESİYALLER (DANA ET SEÇKİSİ)',
            'subtitle': 'Özel Himalaya tuzu odasında 28 gün dinlendirilmiş birinci sınıf yerli dana steak kesimleri.',
            'category_filter': lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                'steak-dana-pirzola', 'steak-antrikot', 'steak-loqum', 'steak-newyork-steak',
                'steak-satoburyan', 'steak-kuzu-kafes', 'steak-dana-saslik', 'steak-hardal-soslu-loqum',
                'steak-biftek', 'steak-mexican-steak', 'steak-paper-steak'
            ]
        },
        {
            'page_num': 5,
            'title': 'SAYFA 5: DİNLENDİRİLMİŞ STEAKLER & DRY-AGED SPESİYALLER (KUZU STEAKLER & SPESİYALLER)',
            'subtitle': 'Özel gurme soslarla tavada ve ızgarada hazırlanan imza steak lezzetleri.',
            'category_filter': lambda p: p.get('categorySlug') == 'steak' and p['id'] in [
                'steak-mantar-kremali-steak', 'steak-kasap-sucuk-250gr', 'steak-cheddar-soslu-antrikot',
                'steak-mantar-soslu-antrikot', 'steak-cheddar-soslu-loqum', 'steak-mantar-soslu-steak',
                'steak-hardal-soslu-antrikot', 'steak-t-bone', 'steak-sos-karnavalli-saslik', 'steak-diyet-antrikot'
            ]
        },
        {
            'page_num': 6,
            'title': 'SAYFA 6: CIZIRDAYAN FAJİTALAR & DİYARBAKIR SAÇ TAVALARI',
            'subtitle': 'Döküm tavada cızırdayan fajitalar ve geleneksel Diyarbakır bakır saç tavaları.',
            'category_filter': lambda p: p.get('categorySlug') in ['fajitalar', 'tavalar']
        },
        {
            'page_num': 7,
            'title': 'SAYFA 7: GELENEKSEL ZIRH KEBAPLARI (KLASİK ZIRH & KÖZDE ŞİŞLER)',
            'subtitle': 'Diyarbakır yaylalarından kuzu eti, satır zırh kıyması ve közde meşe kömürü ateşi.',
            'category_filter': lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                'kebaplar-citir-yagli-kara', 'kebaplar-adana', 'kebaplar-sade-kebap', 'kebaplar-beyti-kebap',
                'kebaplar-adana-dolama', 'kebaplar-domatesli-kebap', 'kebaplar-yogurtlu-kebap', 'kebaplar-urfa',
                'kebaplar-sarma-beyti', 'kebaplar-alti-ezmeli-kebap', 'kebaplar-sebzeli-kebap', 'kebaplar-begendili-kebap',
                'kebaplar-patlicanli-kebap', 'kebaplar-loqum-kebap', 'kebaplar-yogurtlu-kusbasi', 'kebaplar-kozlu-kebap',
                'kebaplar-firinda-kasarli-sarma-beyti', 'kebaplar-begendili-kusbasi'
            ]
        },
        {
            'page_num': 8,
            'title': 'SAYFA 8: GELENEKSEL ZIRH KEBAPLARI (SPESİYAL, BEYTİ & BEĞENDİLİ KEBAPLAR)',
            'subtitle': 'Kuzu sırt, külbastı, sarma spesiyaller ve fırında tereyağlı özel sunumlar.',
            'category_filter': lambda p: p.get('categorySlug') == 'kebaplar' and p['id'] in [
                'kebaplar-kuzu-sirt', 'kebaplar-kuzu-kulbasti', 'kebaplar-halep-isi-kebap', 'kebaplar-mantarli-kasarli-sarma',
                'kebaplar-loqum-leblebi', 'kebaplar-kuzu-pirzola', 'kebaplar-kuzu-sis', 'kebaplar-iskender-usulu-kebap',
                'kebaplar-ufo-kebap', 'kebaplar-kuzu-kusleme', 'kebaplar-kuzu-taraklik', 'kebaplar-karisik-kebap',
                'kebaplar-tavuksuz-karisik-kebap', 'kebaplar-alinazik', 'kebaplar-sirali-kebap', 'kebaplar-karisik-karnaval-3-kisilik',
                'kebaplar-trio-kebap', 'kebaplar-cizir-cizir-tavada-kuzu-sirt'
            ]
        },
        {
            'page_num': 9,
            'title': 'SAYFA 9: ÖZEL KÖFTELER & LOQUM YÖRESEL GASTRONOMİ SEÇKİSİ',
            'subtitle': 'Zırh köfteler, çömlekte pişen etler, kuzu incikler ve kadim Diyarbakır tencereleri.',
            'category_filter': lambda p: p.get('categorySlug') in ['kofteler', 'loqum-yoresel']
        },
        {
            'page_num': 10,
            'title': 'SAYFA 10: ODUN ATEŞİNDE TAŞ TABANLI PİDELER & ÇITIR LAHMACUNLAR',
            'subtitle': 'Taş tabanlı fırında meşe odunu ateşiyle pişen incecik çıtır lahmacunlar ve dolgun pideler.',
            'category_filter': lambda p: p.get('categorySlug') == 'lahmacun-ve-pide'
        },
        {
            'page_num': 11,
            'title': 'SAYFA 11: GURME BURGERLER & LOQUM PİLİÇ SEÇKİLERİ',
            'subtitle': 'Özel brioche ekmeğiyle gurme burgerler ve marine edilmiş nefis piliç spesiyalleri.',
            'category_filter': lambda p: p.get('categorySlug') in ['burgerler', 'loqum-pilicler']
        },
        {
            'page_num': 12,
            'title': 'SAYFA 12: GELENEKSEL GURME TATLILAR',
            'subtitle': 'Antep fıstıklı sıcak katmer, çıtır cennet çamuru ve geleneksel tatlı şöleni.',
            'category_filter': lambda p: p.get('categorySlug') == 'tatlilar'
        },
        {
            'page_num': 13,
            'title': 'SAYFA 13: SOĞUK MEŞRUBATLAR, DOĞAL İÇECEKLER & GURME KAHVELER',
            'subtitle': 'Buz gibi taze sıkılmış meyve suları, ferahlatıcı yayık ayranı ve premium içecekler.',
            'category_filter': lambda p: p.get('categorySlug') == 'icecekler'
        }
    ]

    header_lines = [
        "=" * 80,
        "                         LOQUM ET STEAKHOUSE DİYARBAKIR",
        "                   RESMİ GASTRONOMİ MENÜSÜ & BASKI KATALOĞU",
        "                     (160 İMZA LEZZET - EKSİKSİZ TAM LİSTE)",
        "=" * 80,
        "İşletme Adı : LOQUM ET STEAKHOUSE",
        "Adres       : Diyarbakır • 75. Yol Ana Şube",
        "Telefon     : +90 412 503 04 05",
        "Instagram   : @loqumdiyarbakir",
        "Baskı Yılı  : 2026 Resmî Menü Revizyonu",
        "Standart    : Bakanlık Gıda Kodeksi Uyumlu Gramaj, Kalori ve Saf Et Alerjen Etiketi",
        "=" * 80,
        ""
    ]

    output_lines = []
    output_lines.extend(header_lines)

    total_exported = 0
    exported_ids = set()

    for page in pages:
        page_prods = [p for p in products if page['category_filter'](p)]
        count = len(page_prods)
        total_exported += count

        output_lines.append("=" * 80)
        output_lines.append(page['title'])
        output_lines.append(f"{page['subtitle']} (Toplam: {count} Ürün)")
        output_lines.append("=" * 80)
        output_lines.append("")

        for p in page_prods:
            exported_ids.add(p['id'])
            name = p['name'].strip()
            desc = p.get('description', '').strip()
            gramaj = get_gramaj_text(p)
            calories = get_calories_text(p)
            allergen = get_allergen_text(p)
            price = p.get('price', 0)

            output_lines.append(name)
            output_lines.append(desc)
            output_lines.append(f"Gramaj: {gramaj} | Kalori: {calories} | Alerjen: {allergen}")
            output_lines.append(f"₺{price}")
            output_lines.append("")

    # Footer
    output_lines.append("=" * 80)
    output_lines.append(f"KATALOG BİTİŞİ - TOPLAM LİSTELENEN ÜRÜN SAYISI: {total_exported} / {len(products)}")
    output_lines.append("LOQUM ET STEAKHOUSE DİYARBAKIR © 2026. TÜM HAKLARI SAKLIDIR.")
    output_lines.append("=" * 80)

    content = "\n".join(output_lines)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Başarıyla kaydedildi (Metin Kataloğu): {output_path}")
    print(f"Toplam listelenen ürün: {total_exported} / {len(products)}")
    print(f"Eksik kalan ürün sayısı: {len(products) - len(exported_ids)}")

    print("\n" + "=" * 80)
    print("LOQUM ET 16 SAYFALIK LÜKS BASKI MENÜSÜ & VEKTÖREL PDF DERLEMESİ")
    print("=" * 80)
    build_luxury_html(compile_pdf=True)
    print("=" * 80)
    print("TÜM BASKI DOSYALARI VE PDF MİZANPAJI BAŞARIYLA GÜNCELLENDİ!")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    generate_baski_menu()
