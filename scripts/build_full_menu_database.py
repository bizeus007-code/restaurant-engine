import json
import os
import re
import shutil

# Load raw items
with open('/tmp/loqum_site_data.json') as f:
    raw_items = json.load(f)

# Helpers
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

def parse_price(raw):
    # e.g. "550&nbsp;₺" -> 550
    cleaned = raw.replace('&nbsp;', '').replace('₺', '').replace('.', '').strip()
    return int(cleaned)

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

DEST_IMG_BASE = '/Users/mesa/restaurant-engine/public/images/menu'
SRC_IMG_BASE = '/tmp/loqum_web_images'

# Detailed handcrafted data definitions for all 160 items
ITEM_DETAILS = {
    # 17: BURGERLER
    (17, "LOQUM KLASİK BURGER"): {
        "tag": "Gurme Burger", "gramaj": "180 gr",
        "desc": "180 gr özel kıyma burger köftesi, karamelize soğan, kornişon turşu, taze marul ve çıtır patates cipsi eşliğinde.",
        "cal": 720, "prep": "12-15 dk", "stock": 32, "allergens": ["Gluten", "Susam"], "popular": True
    },
    (17, "LOQUM DOUBLE BURGER"): {
        "tag": "Dev Porsiyon", "gramaj": "300 gr",
        "desc": "Çift katlı 300 gr dana burger köftesi, duble karamelize soğan, özel burger sosu ve baharatlı patates cipsi.",
        "cal": 980, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten", "Susam"], "popular": True
    },
    (17, "ENFES LOQUM BURGER"): {
        "tag": "Şefin İmzası", "gramaj": "200 gr Bonfile",
        "desc": "Özel marine edilmiş dana bonfile lokum dilimleri, karamelize soğan, eritilmiş cheddar peyniri ve patates cipsi.",
        "cal": 820, "prep": "15-18 dk", "stock": 22, "allergens": ["Gluten", "Laktoz (Cheddar)", "Susam"], "popular": True
    },
    (17, "LOQUM CHEESE BURGER"): {
        "tag": "Bol Peynirli", "gramaj": "180 gr",
        "desc": "180 gr burger köftesi, eritilmiş çift dilim cheddar peyniri, karamelize soğan ve çıtır patates cipsi.",
        "cal": 780, "prep": "12-15 dk", "stock": 35, "allergens": ["Gluten", "Laktoz (Cheddar)", "Susam"], "popular": False
    },
    (17, "3'LÜ MİNİ BURGER"): {
        "tag": "Tadım Menüsü", "gramaj": "3 x 60 gr",
        "desc": "3 adet nefis mini burger köftesi (toplam 180 gr), karamelize soğan, özel ev yapımı soslar ve patates cipsi.",
        "cal": 740, "prep": "15-18 dk", "stock": 28, "allergens": ["Gluten", "Susam"], "popular": False
    },
    (17, "TAVUK BURGER"): {
        "tag": "Tavuk Fileto", "gramaj": "180 gr",
        "desc": "Çıtır marine tavuk göğüs filetosu, taze domates dilimleri, gevrek marul, özel sos ve patates cipsi.",
        "cal": 610, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Yumurta", "Susam"], "popular": False
    },
    (17, "KAPALI LOQUM BURGER"): {
        "tag": "Taş Fırın Kapama", "gramaj": "200 gr",
        "desc": "Taş fırın hamuru içinde mühürlenmiş sulu burger köftesi, eritilmiş cheddar peyniri, kornişon turşu ve özel sos.",
        "cal": 810, "prep": "15-18 dk", "stock": 24, "allergens": ["Gluten", "Laktoz (Cheddar)", "Susam"], "popular": False
    },

    # 18: FAJİTALAR
    (18, "ET FAJİTA"): {
        "tag": "Cızırdayan Döküm", "gramaj": "250 gr",
        "desc": "Kızgın döküm tavada cızırdayan marine dana bonfile şeritleri, renkli biberler, karamelize soğan, salsa sos ve sıcak tortilla.",
        "cal": 720, "prep": "18-20 dk", "stock": 26, "allergens": ["Gluten"], "popular": True
    },
    (18, "TAVUK FAJİTA"): {
        "tag": "Cızırdayan Döküm", "gramaj": "250 gr",
        "desc": "Kızgın döküm tavada marine tavuk göğüs şeritleri, jülyen renkli biberler, soğan ve sıcak tortilla ekmekleri.",
        "cal": 580, "prep": "15-18 dk", "stock": 28, "allergens": ["Gluten"], "popular": False
    },
    (18, "CUMBO FAJİTA"): {
        "tag": "Kombinasyon", "gramaj": "300 gr",
        "desc": "Döküm tavada marine dana bonfile ve tavuk fileto kombinasyonu, renkli biberler, soğan ve sıcak tortilla ile.",
        "cal": 680, "prep": "18-20 dk", "stock": 22, "allergens": ["Gluten"], "popular": True
    },

    # 19: FIRIN ETLER
    (19, "KUZU KOL"): {
        "tag": "Odun Ateşinde 6 Saat", "gramaj": "1200 gr",
        "desc": "Taş fırında odun ateşinde 6 saat ağır ağır pişen kemikli kuzu kol, tel tel ayrılan lokum kıvamında; fırın patates ile.",
        "cal": 1850, "prep": "25-30 dk", "stock": 12, "allergens": [], "popular": True
    },
    (19, "KUZU GERDAN"): {
        "tag": "Taş Fırın Ağır Ateş", "gramaj": "1200 gr",
        "desc": "Taş fırında nar gibi kızarmış, yumuşacık sulu kuzu gerdan eti, fırınlanmış kök sebzeler ve taze kekik ile.",
        "cal": 1780, "prep": "25-30 dk", "stock": 10, "allergens": [], "popular": True
    },

    # 20: KAHVALTI
    (20, "SERPME KAHVALTI"): {
        "tag": "Serpme Ziyafet", "gramaj": "2 Kişilik",
        "desc": "Aşk reçeli, çilek reçeli, vişne reçeli, doğal petek bal, yayık tereyağı, kaymak, peynir çeşitleri, zeytinler, taş fırın pidesi ve sınırsız çay.",
        "cal": 1100, "prep": "10-15 dk", "stock": 35, "allergens": ["Gluten", "Laktoz", "Yumurta"], "popular": True
    },
    (20, "KAVURMA"): {
        "tag": "Geleneksel Kavurma", "gramaj": "180 gr",
        "desc": "Bakır tavada kendi doğal yağında ağır ateşte kavrulmuş geleneksel kuzu/dana kavurma, tırnak pide eşliğinde.",
        "cal": 580, "prep": "10-12 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },
    (20, "OMLET"): {
        "tag": "Köy Yumurtalı", "gramaj": "160 gr",
        "desc": "Taze çiftlik yumurtaları ve halis tereyağı ile tavada kabartılarak hazırlanan taptaze omlet, domates ve salatalık ile.",
        "cal": 320, "prep": "8-10 dk", "stock": 40, "allergens": ["Yumurta", "Laktoz (Tereyağı)"], "popular": False
    },
    (20, "MENEMEN"): {
        "tag": "Bakır Tavada", "gramaj": "200 gr",
        "desc": "Bakır tavada ince kıyılmış tatlı köy biberi, sulu tarla domatesi ve tereyağında pişirilen köy yumurtası ile geleneksel menemen.",
        "cal": 290, "prep": "8-10 dk", "stock": 40, "allergens": ["Yumurta", "Laktoz (Tereyağı)"], "popular": False
    },
    (20, "ÇOCUK MENÜSÜ"): {
        "tag": "Çocuklara Özel", "gramaj": "180 gr",
        "desc": "Çocuklar için özel hazırlanmış 3 adet mini ızgara kasap köfte, çıtır patates kızartması ve meyve suyu eşliğinde.",
        "cal": 480, "prep": "10-12 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },

    # 21: KEBAPLAR
    (21, "ADANA"): {
        "tag": "Zırh Kıyması", "gramaj": "200 gr",
        "desc": "Zırhta çekilmiş erkek kuzu kaburga eti, kuyruk yağı, taze kapya biberi ve kaya tuzu. Közlenmiş biber, sumaklı soğan ve lavaş ile.",
        "cal": 680, "prep": "15-18 dk", "stock": 38, "allergens": ["Gluten"], "popular": True
    },
    (21, "URFA"): {
        "tag": "Geleneksel Acısız", "gramaj": "200 gr",
        "desc": "Zırhta çekilmiş erkek kuzu eti, kuyruk yağı ve kaya tuzu ile hazırlanan acısız geleneksel kebap, köz sebzeler ve tırnak pide ile.",
        "cal": 680, "prep": "15-18 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },
    (21, "SADE KEBAP"): {
        "tag": "Kömür Ateşinde", "gramaj": "200 gr",
        "desc": "Saf zırh kuzu eti ve kuyruk yağı ile yoğrulmuş sade kömür ateşi kebabı; köz biber, sumaklı soğan ve sıcak lavaş ile.",
        "cal": 670, "prep": "15-18 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },
    (21, "BEYTİ KEBAP"): {
        "tag": "Sarımsaklı Lezzet", "gramaj": "200 gr",
        "desc": "Zırh kuzu kıyması, kapya biber ve sarımsak harmanı, kömür ızgarasında pişirilip közlenmiş domates ve biber ile servis edilir.",
        "cal": 690, "prep": "15-18 dk", "stock": 28, "allergens": ["Gluten"], "popular": False
    },
    (21, "SARMA BEYTİ"): {
        "tag": "Lavaş Sarma", "gramaj": "220 gr",
        "desc": "Çıtır tırnak lavaşa sarılmış zırh kuzu kebabı, üzerine özel domates sosu, közlenmiş biber ve süzme yoğurt eşliğinde.",
        "cal": 780, "prep": "18-20 dk", "stock": 28, "allergens": ["Gluten", "Laktoz"], "popular": True
    },
    (21, "ADANA DOLAMA"): {
        "tag": "Kızgın Tereyağlı", "gramaj": "220 gr",
        "desc": "İncecik lavaşa sarılarak odun kömüründe nar gibi kızartılan kuzu zırh kebabı, üzerine kızdırılmış köy tereyağı ve köz biber ile.",
        "cal": 790, "prep": "18-20 dk", "stock": 25, "allergens": ["Gluten", "Laktoz (Tereyağı)"], "popular": False
    },
    (21, "DOMATESLİ KEBAP"): {
        "tag": "Köz Domatesli", "gramaj": "220 gr",
        "desc": "Şişte sulu tarla domatesleri arasına dizilmiş zırh kuzu eti köfteleri, kömür ateşi lezzeti ve tırnak pide ile.",
        "cal": 650, "prep": "15-18 dk", "stock": 26, "allergens": ["Gluten"], "popular": False
    },
    (21, "YOĞURTLU KEBAP"): {
        "tag": "Yoğurt & Tereyağı", "gramaj": "240 gr",
        "desc": "Kızarmış tırnak pide yatağında zırh kuzu kebabı, çırpılmış süzme yoğurt ve kızgın tereyağlı domates sosu ile.",
        "cal": 820, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "ALTI EZMELİ KEBAP"): {
        "tag": "Köz Ezmeli", "gramaj": "220 gr",
        "desc": "Közlenmiş domates, sarımsak ve acı biber ezmesi yatağında kömür ateşinde pişmiş zırh kuzu kebabı.",
        "cal": 690, "prep": "15-18 dk", "stock": 26, "allergens": ["Gluten"], "popular": True
    },
    (21, "SEBZELİ KEBAP"): {
        "tag": "Taze Sebzeli", "gramaj": "200 gr",
        "desc": "Renkli taze biberler, sarımsak ve maydanoz ile zırhta harmanlanmış kuzu eti kebabı, köz domates ve lavaşla.",
        "cal": 640, "prep": "15-18 dk", "stock": 28, "allergens": ["Gluten"], "popular": False
    },
    (21, "BEĞENDİLİ KEBAP"): {
        "tag": "Hünkar Beğendi", "gramaj": "240 gr",
        "desc": "Köz patlıcan, süt ve kaşarla hazırlanan ipeksi hünkar beğendi yatağında zırh kuzu kebabı.",
        "cal": 810, "prep": "18-20 dk", "stock": 24, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "PATLICANLI KEBAP"): {
        "tag": "Köz Patlıcanlı", "gramaj": "220 gr",
        "desc": "Kömür ızgarasında dilim patlıcanlar arasına dizilmiş zırh kuzu köfteleri, tırnak pide ve sumaklı soğan ile.",
        "cal": 670, "prep": "18-20 dk", "stock": 25, "allergens": ["Gluten"], "popular": True
    },
    (21, "LOQUM KEBAP"): {
        "tag": "Şefin İmzası", "gramaj": "220 gr",
        "desc": "Kuzu kaburga ve zırh eti, renkli taze biberler ve şefin özel baharat karışımı ile mangalda mühürlenmiş özel lezzet.",
        "cal": 710, "prep": "15-18 dk", "stock": 30, "allergens": ["Gluten"], "popular": True
    },
    (21, "YOĞURTLU KUŞBAŞI"): {
        "tag": "Kuşbaşı Ziyafeti", "gramaj": "220 gr",
        "desc": "Pide üzerinde marine kuzu but kuşbaşı şiş etleri, tava tereyağı, domates sosu ve süzme yoğurt.",
        "cal": 790, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "KÖZLÜ KEBAP"): {
        "tag": "Köz Garnitürlü", "gramaj": "200 gr",
        "desc": "Közde pişmiş sarımsak, kapya biber ve arpacık soğan garnitürüyle sunulan zırh kuzu kebabı.",
        "cal": 660, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten"], "popular": False
    },
    (21, "FIRINDA KAŞARLI SARMA BEYTİ"): {
        "tag": "Taş Fırında Eritme", "gramaj": "250 gr",
        "desc": "Lavaş içinde zırh kebap, taş fırında eritilmiş bol kaşar peyniri ve tereyağlı domates sosu ile.",
        "cal": 860, "prep": "20-22 dk", "stock": 24, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "BEĞENDİLİ KUŞBAŞI"): {
        "tag": "Beğendi & Kuşbaşı", "gramaj": "240 gr",
        "desc": "Ağır ateşte sotelenmiş yumuşacık kuzu but kuşbaşı parçaları, ipeksi köz patlıcan beğendi yatağında.",
        "cal": 820, "prep": "18-20 dk", "stock": 24, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "KUZU SIRT"): {
        "tag": "Süt Kuzusu", "gramaj": "220 gr",
        "desc": "Süt kuzusunun en yumuşak sırt bölgesinden kömür ızgarasında mühürlenmiş lokum et dilimleri, köz biber ve lavaşla.",
        "cal": 620, "prep": "15-18 dk", "stock": 20, "allergens": ["Gluten"], "popular": True
    },
    (21, "KUZU KÜLBASTI"): {
        "tag": "Külbastı", "gramaj": "220 gr",
        "desc": "İnce dilimlenmiş marine süt kuzusu külbastı etleri, odun kömüründe hafif kızartılmış, sumaklı soğan ve domatesle.",
        "cal": 610, "prep": "15-18 dk", "stock": 20, "allergens": ["Gluten"], "popular": False
    },
    (21, "HALEP İŞİ KEBAP"): {
        "tag": "Geleneksel Halep", "gramaj": "200 gr",
        "desc": "Zırh kuzu eti, nar ekşisi sosu, taze kıyılmış nane ve arpacık soğan ezmesi eşliğinde Halep usulü sunum.",
        "cal": 680, "prep": "15-18 dk", "stock": 22, "allergens": ["Gluten"], "popular": False
    },
    (21, "MANTARLI KAŞARLI SARMA"): {
        "tag": "Mantarlı & Peynirli", "gramaj": "250 gr",
        "desc": "Lavaş sarılı zırh kuzu eti, sotelenmiş taze kültür mantarı, erimiş kaşar peyniri ve tereyağı dokunuşu.",
        "cal": 870, "prep": "20-22 dk", "stock": 22, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "LOQUM LEBLEBİ"): {
        "tag": "Özel Bonfile Şiş", "gramaj": "250 gr",
        "desc": "Marine dana bonfile lokum parçacıkları ve kuzu kuyruk yağı dokunuşu ile şişte közlenen minik gurme lezzet.",
        "cal": 740, "prep": "15-18 dk", "stock": 18, "allergens": ["Gluten"], "popular": True
    },
    (21, "KUZU PİRZOLA"): {
        "tag": "4 Kalem Süt Kuzusu", "gramaj": "250-280 gr",
        "desc": "Taze kekik ve zeytinyağı ile marine edilmiş 4 kalem süt kuzusu pirzola, kömür ızgarasında sulu sulu pişirilir.",
        "cal": 640, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten"], "popular": True
    },
    (21, "KUZU ŞİŞ"): {
        "tag": "Kömür Ateşinde", "gramaj": "200 gr",
        "desc": "Süt kuzusu but etinden terbiye edilmiş lokum gibi yumuşak kuşbaşı parçalar, köz domates ve sumaklı taze soğanla.",
        "cal": 610, "prep": "15-18 dk", "stock": 30, "allergens": ["Gluten"], "popular": True
    },
    (21, "İSKENDER USULÜ KEBAP"): {
        "tag": "Tereyağlı İskender Usulü", "gramaj": "240 gr",
        "desc": "Kızarmış tırnak pide üzerine zırh kebap dilimleri, domates sosu, kızdırılmış köy tereyağı ve süzme yoğurt.",
        "cal": 830, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "UFO KEBAP"): {
        "tag": "Taş Fırın Kapama", "gramaj": "250 gr",
        "desc": "İki kat çıtır lavaş arasına zırh kuzu eti, renkli biberler ve erimiş kaşar peyniri kapatılarak közde pişirilen ufo şeklinde özel kebap.",
        "cal": 840, "prep": "18-20 dk", "stock": 20, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "KUZU KÜŞLEME"): {
        "tag": "Kuzunun En Nadide Yeri", "gramaj": "200 gr",
        "desc": "Kuzunun omurga altından çıkan en yumuşak, yağsız ve lifsiz eti, kömür ateşinde hafif mühürlenerek sulu servis edilir.",
        "cal": 580, "prep": "12-15 dk", "stock": 18, "allergens": ["Gluten"], "popular": True
    },
    (21, "KUZU TARAKLIK"): {
        "tag": "Kemikli Tarak Kesim", "gramaj": "250 gr",
        "desc": "Kuzu kaburga sırtının özel tarak kesimi, kemikli ve hafif yağlı yapısıyla mangalda çıtır çıtır pişen gurme lezzet.",
        "cal": 690, "prep": "15-18 dk", "stock": 18, "allergens": ["Gluten"], "popular": False
    },
    (21, "KARIŞIK KEBAP"): {
        "tag": "Zengin Tabak", "gramaj": "380 gr",
        "desc": "Adana kebap, kuzu şiş, tavuk şiş, kuzu pirzola ve mini lahmacun kombinasyonu; köz biber, domates ve sumaklı soğanla.",
        "cal": 920, "prep": "18-22 dk", "stock": 25, "allergens": ["Gluten"], "popular": True
    },
    (21, "TAVUKSUZ KARIŞIK KEBAP"): {
        "tag": "Sadece Kırmızı Et", "gramaj": "400 gr",
        "desc": "Tamamen kırmızı et: Adana kebap, kuzu şiş, kuzu pirzola, kuzu külbastı ve fındık lahmacun.",
        "cal": 960, "prep": "18-22 dk", "stock": 25, "allergens": ["Gluten"], "popular": True
    },
    (21, "ALİNAZİK"): {
        "tag": "Yoğurtlu Köz Patlıcan", "gramaj": "240 gr",
        "desc": "Közlenmiş sarımsaklı süzme yoğurtlu patlıcan yatağında kömürde pişmiş zırh kıyma kebabı ve kızgın tereyağı sosu.",
        "cal": 760, "prep": "15-18 dk", "stock": 24, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (21, "SIRALI KEBAP"): {
        "tag": "Özel Şiş", "gramaj": "180 gr",
        "desc": "Şiş üzerinde zırh kıyma, kuzu et parçası ve köz sebzelerin ardışık sıralandığı özel porsiyonluk kebap.",
        "cal": 590, "prep": "15 dk", "stock": 25, "allergens": ["Gluten"], "popular": False
    },
    (21, "KARIŞIK KARNAVAL (3 KİŞİLİK)"): {
        "tag": "3 Kişilik Ziyafet Tahtası", "gramaj": "950 gr",
        "desc": "3 kişilik devasa sunum tahtasında Adana kebap, kuzu pirzola, kuzu şiş, tavuk kanat, kuzu külbastı, lahmacunlar ve köz sebzeler.",
        "cal": 2400, "prep": "25-30 dk", "stock": 15, "allergens": ["Gluten"], "popular": True
    },
    (21, "TRİO KEBAP"): {
        "tag": "3'lü Kombinasyon", "gramaj": "300 gr",
        "desc": "Adana kebap, kuzu şiş ve tavuk şiş üçlüsünün tek tabakta sıcak lavaş ve köz garnitürlerle buluşması.",
        "cal": 790, "prep": "18-20 dk", "stock": 25, "allergens": ["Gluten"], "popular": False
    },
    (21, "CIZIR CIZIR TAVADA KUZU SIRT"): {
        "tag": "Cızırdayan Döküm Tava", "gramaj": "220-270 gr",
        "desc": "Sıcak döküm tavada tereyağı ve kekikle cızırdayarak masanıza gelen lokum kıvamında süt kuzusu sırt dilimleri.",
        "cal": 710, "prep": "15-18 dk", "stock": 20, "allergens": ["Laktoz (Tereyağı)"], "popular": True
    },
    (21, "ÇITIR YAĞLI KARA"): {
        "tag": "Çıtır Kuzu Sırtı", "gramaj": "280-300 gr",
        "desc": "280-300 gr kuzu sırtının yağlı çıtır kısmı kömürde nar gibi kızartılır, hafif yoğurt sos, mantar sos ve taze domates ile.",
        "cal": 890, "prep": "18-20 dk", "stock": 18, "allergens": ["Laktoz"], "popular": False
    },

    # 22: KÖFTELER
    (22, "KASAP KOFTE"): {
        "tag": "Izgara Köfte", "gramaj": "220 gr",
        "desc": "Dana kıyma ve taze baharatlarla yoğrulmuş ızgara kasap köftesi, patates kızartması ve köz biberle.",
        "cal": 620, "prep": "12-15 dk", "stock": 35, "allergens": ["Gluten"], "popular": True
    },
    (22, "YARIM KASAP KÖFTE (3 Adet)"): {
        "tag": "Hafif Porsiyon", "gramaj": "130 gr",
        "desc": "3 adet ızgara kasap köfte, patates cipsi ve köz sebzeler ile hafif porsiyon.",
        "cal": 390, "prep": "10-12 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },
    (22, "KALKAN KÖFTE"): {
        "tag": "Cheddar Dolgulu", "gramaj": "240 gr",
        "desc": "Renkli biberler ve eritilmiş cheddar peyniri dolgulu kalkan şeklinde ızgara köfte.",
        "cal": 740, "prep": "15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz (Cheddar)"], "popular": False
    },
    (22, "BOHÇA KÖFTE"): {
        "tag": "Kaşar Dolgulu", "gramaj": "240 gr",
        "desc": "İçi erimiş kaşar peyniriyle doldurulup bohça şeklinde kapatılan sulu ızgara dana köfte.",
        "cal": 730, "prep": "15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (22, "BEĞENDİLİ IZGARA KÖFTE"): {
        "tag": "Hünkar Beğendi", "gramaj": "240 gr",
        "desc": "İpeksi köz patlıcanlı hünkar beğendi üzerinde kömürde pişmiş ızgara kasap köfteleri ve tereyağlı sos.",
        "cal": 760, "prep": "15-18 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (22, "İÇLİ KÖFTE"): {
        "tag": "Diyarbakır Usulü", "gramaj": "80 gr (1 Adet)",
        "desc": "İncecik çıtır bulgur kabuğu içerisinde baharatlı cevizli dana kıyma harcı ile haşlama veya kızartma içli köfte.",
        "cal": 220, "prep": "8-10 dk", "stock": 50, "allergens": ["Gluten", "Ceviz"], "popular": True
    },

    # 23: LOQUM PİLİÇLER
    (23, "TAVUK ŞİŞ"): {
        "tag": "Kömür Ateşinde", "gramaj": "220 gr",
        "desc": "Özel zeytinyağı ve baharat sosunda dinlendirilmiş tavuk göğsü şişleri, köz biber, basmati pilav ve lavaşla.",
        "cal": 480, "prep": "15 dk", "stock": 30, "allergens": [], "popular": True
    },
    (23, "TAVUK KANAT"): {
        "tag": "Çıtır Kanat", "gramaj": "250 gr",
        "desc": "Çıtır nar gibi kızarmış marine tavuk kanatları, köz domates ve biber eşliğinde.",
        "cal": 560, "prep": "15-18 dk", "stock": 30, "allergens": [], "popular": True
    },
    (23, "TAVUK ÇÖPŞİŞ"): {
        "tag": "Basmati & Salata", "gramaj": "220 gr",
        "desc": "Küçük tahta şişlerde nar gibi kızarmış terbiyeli tavuk parçaları, basmati pirinç pilavı ve pancar salatası ile.",
        "cal": 510, "prep": "12-15 dk", "stock": 28, "allergens": [], "popular": False
    },
    (23, "SEBZELİ TAVUK"): {
        "tag": "Sebzeli & Hafif", "gramaj": "240 gr",
        "desc": "Renkli biberler ve taze sebzelerle sotelenmiş tavuk göğüs filetosu, basmati pirinç ve pancar salatası ile.",
        "cal": 490, "prep": "15 dk", "stock": 25, "allergens": [], "popular": False
    },
    (23, "TAVUK KÜLBASTI"): {
        "tag": "Izgara Külbastı", "gramaj": "220 gr",
        "desc": "İnce dövülmüş marine tavuk but külbastı ızgarası, közlenmiş sebzelerle.",
        "cal": 470, "prep": "12-15 dk", "stock": 25, "allergens": [], "popular": False
    },
    (23, "KÖRİ SOSLU TAVUK"): {
        "tag": "Kremalı Köri", "gramaj": "240 gr",
        "desc": "Jülyen tavuk fileto, kültür mantarı, taze krema ve özel Hint köri baharatı sosu ile.",
        "cal": 610, "prep": "15 dk", "stock": 25, "allergens": ["Laktoz"], "popular": False
    },
    (23, "SOYA SOSLU TAVUK"): {
        "tag": "Wok Lezzeti", "gramaj": "240 gr",
        "desc": "Wok tavada sotelenmiş tavuk fileto, kültür mantarı, renkli biberler ve taze soya sosu.",
        "cal": 520, "prep": "15 dk", "stock": 25, "allergens": ["Soya", "Gluten"], "popular": False
    },
    (23, "ACILI MANTARLI TAVUK"): {
        "tag": "Acılı & Mantarlı", "gramaj": "240 gr",
        "desc": "Sotelenmiş tavuk şeritleri, taze mantar ve acı biber sosu harmanı.",
        "cal": 510, "prep": "15 dk", "stock": 25, "allergens": [], "popular": False
    },
    (23, "MANTAR SOSLU TAVUK"): {
        "tag": "Kremalı Mantarlı", "gramaj": "240 gr",
        "desc": "Tavuk göğüs filetosu, taze mantarlar ve ipeksi beyaz krema sosu ile.",
        "cal": 590, "prep": "15 dk", "stock": 25, "allergens": ["Laktoz"], "popular": False
    },
    (23, "SOYA SOSLU TAVUK FİLETO"): {
        "tag": "Fit Menü", "gramaj": "250 gr",
        "desc": "Soya sosuyla dinlendirilmiş tavuk göğüs filetosu, tam buğday makarna ve sote sebzeler ile.",
        "cal": 530, "prep": "15 dk", "stock": 25, "allergens": ["Soya", "Gluten"], "popular": False
    },

    # 24: LOQUM YÖRESEL
    (24, "LOQUM TAVA"): {
        "tag": "Diyarbakır Efsanesi", "gramaj": "280 gr",
        "desc": "Geleneksel Diyarbakır fırın tavası; zırh kuzu but eti, kuyruk yağı, tarla domatesi, sivri biber ve sarımsak ile taş fırında fokurdayarak pişer.",
        "cal": 790, "prep": "20-25 dk", "stock": 25, "allergens": [], "popular": True
    },
    (24, "ŞAŞLIK TAVA"): {
        "tag": "Gurme Şaşlık", "gramaj": "300 gr",
        "desc": "Marine dana kontrfile dilimleri ve ince arpacık soğan katmanlarının bakır tavada harmanlanması.",
        "cal": 820, "prep": "20-25 dk", "stock": 20, "allergens": [], "popular": True
    },
    (24, "ASÇI TABAĞI"): {
        "tag": "Günün Özel Seçkisi", "gramaj": "350 gr",
        "desc": "Loqum Et şefinin günlük hazırladığı yöresel tandır, tava ve tencere yemeklerinden oluşan seçme ziyafet tabağı.",
        "cal": 860, "prep": "15-20 dk", "stock": 18, "allergens": ["Gluten"], "popular": False
    },
    (24, "PİLAV ÜSTÜ KUZU TANDIR"): {
        "tag": "İçli Pilavlı Tandır", "gramaj": "280 gr",
        "desc": "Taş fırında saatlerce pişerek tel tel ayrılan kuzu kol eti, geleneksel içli pilav üzerinde sıcak servis edilir.",
        "cal": 880, "prep": "15-18 dk", "stock": 22, "allergens": ["Laktoz (Tereyağı)"], "popular": True
    },
    (24, "ÇÖMLEKTE KUZU TANDIR"): {
        "tag": "Toprak Çömlekte", "gramaj": "260 gr",
        "desc": "Toprak çömlek içerisinde kuzu but eti, halis köy tereyağı ve doğal yayla baharatları ile taş fırında ağır ağır demlendirilir.",
        "cal": 790, "prep": "20-25 dk", "stock": 20, "allergens": ["Laktoz (Tereyağı)"], "popular": True
    },
    (24, "BEĞENDİ İNCİK"): {
        "tag": "Hünkar Beğendi", "gramaj": "320 gr",
        "desc": "Fırında lokum gibi pişen kuzu incik, közlenmiş patlıcanlı, un ve sütle bağlanan nefis hünkar beğendi üzerinde.",
        "cal": 840, "prep": "20-22 dk", "stock": 20, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (24, "FIRIN İNCİK"): {
        "tag": "Kaşarlı Fırın", "gramaj": "320 gr",
        "desc": "Taş fırında nar gibi kızarmış kuzu incik, eritilmiş kaşar peyniri, domates ve biber sosu ile fırınlanarak servis edilir.",
        "cal": 820, "prep": "20-22 dk", "stock": 20, "allergens": ["Laktoz"], "popular": False
    },
    (24, "ÇORBA"): {
        "tag": "Günün Çorbası", "gramaj": "250 ml",
        "desc": "Günün taze hazırlanan geleneksel mercimek veya ezogelin çorbası, tereyağlı pul biber sosu ve limon dilimi ile.",
        "cal": 180, "prep": "5 dk", "stock": 50, "allergens": ["Gluten"], "popular": False
    },
    (24, "PİLAV"): {
        "tag": "Tereyağlı Pilav", "gramaj": "180 gr",
        "desc": "Tane tane dökülen tereyağlı geleneksel pirinç pilavı.",
        "cal": 280, "prep": "5 dk", "stock": 40, "allergens": ["Laktoz (Tereyağı)"], "popular": False
    },
    (24, "FIRINDA KAPAMA DANA ŞAŞLIK"): {
        "tag": "Taş Fırın Kapama", "gramaj": "300 gr",
        "desc": "Taş fırında güveç kabında soğan ve baharatlarla kapatılarak kendi buharında pişen marine dana şaşlık.",
        "cal": 780, "prep": "20-25 dk", "stock": 18, "allergens": [], "popular": False
    },
    (24, "ARPA ŞEHRİYELİ KUZU İNCİK"): {
        "tag": "Fırın Şehriyeli", "gramaj": "350 gr",
        "desc": "Taş fırında et suyuyla demlenmiş fırın arpa şehriyesi yatağında lokum gibi yumuşacık kuzu incik.",
        "cal": 850, "prep": "20-25 dk", "stock": 20, "allergens": ["Gluten"], "popular": False
    },
    (24, "FIRINDA KAPAMA ÇÖMLEKTE PİRZOLA"): {
        "tag": "Toprak Çömlek", "gramaj": "280 gr",
        "desc": "Toprak çömlek içerisinde kuzu pirzola, sarımsak, arpacık soğan ve taze domatesle taş fırında kapama usulü.",
        "cal": 720, "prep": "20-25 dk", "stock": 18, "allergens": [], "popular": False
    },
    (24, "ARPA ŞEHRİYELİ KUZU TANDIR"): {
        "tag": "Şehriye & Tandır", "gramaj": "300 gr",
        "desc": "Fırında et suyuyla pişirilmiş arpa şehriye pilavı üzerinde tel tel ayrılan kuzu tandır eti.",
        "cal": 830, "prep": "18-22 dk", "stock": 20, "allergens": ["Gluten"], "popular": False
    },
    (24, "KAVURMA"): {
        "tag": "Geleneksel Kavurma", "gramaj": "200 gr",
        "desc": "Diyarbakır yayla kuzusunun kendi yağıyla ağır ateşte kavrulmasıyla hazırlanan geleneksel lokum kavurma.",
        "cal": 680, "prep": "10-12 dk", "stock": 25, "allergens": [], "popular": False
    },

    # 25: MAKARNALAR VE SALATALAR
    (25, "FETTUCCİNE ALFREDO ETLİ"): {
        "tag": "Bonfileli Makarna", "gramaj": "300 gr",
        "desc": "İtalyan fettuccine makarna, jülyen dana bonfile şeritleri, taze mantar, krema sosu ve toz parmesan.",
        "cal": 740, "prep": "15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": True
    },
    (25, "FETTUCCİNE ALFREDO TAVUKLU"): {
        "tag": "Kremalı Tavuklu", "gramaj": "300 gr",
        "desc": "Fettuccine makarna, ızgara tavuk fileto parçaları, mantar, sarımsaklı krema sosu ve parmesan peyniri.",
        "cal": 660, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (25, "BONFİLE PARÇACIKLI LOGOTONİ"): {
        "tag": "Bonfile & Domates Sos", "gramaj": "280 gr",
        "desc": "Rigatoni boru makarna, sotelenmiş dana bonfile parçaları, fesleğenli domates sosu ve parmesan.",
        "cal": 620, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (25, "RİGOTONİ BOLONEZ"): {
        "tag": "Kıymalı Bolonez", "gramaj": "280 gr",
        "desc": "Rigatoni makarna, geleneksel ağır ateşte pişen dana kıymalı bolonez sos ve parmesan peyniri.",
        "cal": 590, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (25, "STEAK SALATA"): {
        "tag": "Protein Deposu", "gramaj": "280 gr",
        "desc": "Akdeniz yeşillikleri, çeri domates, taze roka, ceviz, parmesan pulları ve ızgara dilim dana steak parçaları.",
        "cal": 460, "prep": "10 dk", "stock": 30, "allergens": ["Laktoz", "Ceviz"], "popular": True
    },
    (25, "BONFİLE SALATA"): {
        "tag": "Ilık Bonfile", "gramaj": "280 gr",
        "desc": "Taze roka, kuzu kulağı, nar ekşisi, sızma zeytinyağı sosu ve sıcak ızgara bonfile dilimleri.",
        "cal": 440, "prep": "10 dk", "stock": 30, "allergens": [], "popular": False
    },
    (25, "TAVUKLU SEZAR SALATA"): {
        "tag": "Klasik Sezar", "gramaj": "260 gr",
        "desc": "Gevrek marul yaprakları, ızgara tavuk göğsü, fırınlanmış kruton ekmek, parmesan ve orijinal Sezar sosu.",
        "cal": 420, "prep": "10 dk", "stock": 30, "allergens": ["Gluten", "Laktoz", "Yumurta"], "popular": False
    },
    (25, "SEZAR SALATA"): {
        "tag": "Hafif & Çıtır", "gramaj": "220 gr",
        "desc": "Taze marul, çıtır kruton ekmekler, Sezar sos ve rende parmesan peyniri.",
        "cal": 340, "prep": "8-10 dk", "stock": 30, "allergens": ["Gluten", "Laktoz", "Yumurta"], "popular": False
    },
    (25, "IZGARA TAVUKLU SALATA"): {
        "tag": "Fit & Taze", "gramaj": "260 gr",
        "desc": "Mevsim yeşillikleri, çeri domates, taze roka, salatalık ve ızgara marine tavuk dilimleri, zeytinyağı limon ile.",
        "cal": 360, "prep": "8-10 dk", "stock": 30, "allergens": [], "popular": False
    },
    (25, "IZGARA HELLİM PEYNİRLİ SALATA"): {
        "tag": "Hellimli Salata", "gramaj": "240 gr",
        "desc": "Izgarada hafif kızartılmış Kıbrıs hellim peyniri dilimleri, Akdeniz yeşillikleri, çeri domates ve balzamik sos.",
        "cal": 390, "prep": "8-10 dk", "stock": 30, "allergens": ["Laktoz"], "popular": False
    },
    (25, "TON BALIKLI SALATA"): {
        "tag": "Denizden", "gramaj": "250 gr",
        "desc": "Taze Akdeniz yeşillikleri, tane mısır, çeri domates, zeytin, kapari ve lezzetli ton balığı parçaları.",
        "cal": 380, "prep": "8-10 dk", "stock": 30, "allergens": ["Balık"], "popular": False
    },
    (25, "MEZE 1"): {
        "name": "HAYDARİ & YOĞURTLU MEZE",
        "tag": "Taze Meze", "gramaj": "150 gr",
        "desc": "Süzme köy yoğurdu, taze nane, sarımsak ve sızma zeytinyağı ile hazırlanan ferahlatıcı geleneksel meze.",
        "cal": 160, "prep": "5 dk", "stock": 40, "allergens": ["Laktoz"], "popular": False
    },
    (25, "MEZE 2"): {
        "name": "GELENEKSEL HUMUS",
        "tag": "Tahinli Humus", "gramaj": "150 gr",
        "desc": "Haşlanmış nohut, kaliteli tahin, taze limon suyu, sarımsak ve sızma zeytinyağı ile hazırlanan ipeksi humus.",
        "cal": 240, "prep": "5 dk", "stock": 40, "allergens": ["Susam"], "popular": True
    },
    (25, "PATATES CİPSİ"): {
        "tag": "Çıtır Patates", "gramaj": "200 gr",
        "desc": "Altın sarısı çıtır patates kızartması, özel baharat çeşnisi ile.",
        "cal": 410, "prep": "8 dk", "stock": 40, "allergens": [], "popular": False
    },

    # 26: LAHMACUN VE PİDE
    (26, "LAHMACUN (1 ADET)"): {
        "tag": "Çıtır Taş Fırın", "gramaj": "1 Adet (120 gr)",
        "desc": "İncecik çıtır taş fırın hamuru üzerine zırhta çekilmiş dana/kuzu kıyma, kapya biber, maydanoz, domates ve özel baharatlar.",
        "cal": 260, "prep": "10 dk", "stock": 50, "allergens": ["Gluten"], "popular": True
    },
    (26, "KARIŞIK LAHMACUN"): {
        "tag": "Bol Malzemeli", "gramaj": "1 Adet (140 gr)",
        "desc": "Özel zırh kıyması, ekstra baharatlar ve sarımsak dokunuşuyla hazırlanan bol malzemeli lahmacun.",
        "cal": 290, "prep": "10 dk", "stock": 40, "allergens": ["Gluten"], "popular": False
    },
    (26, "FINDIK LAHMACUN"): {
        "tag": "Minik Fındık", "gramaj": "1 Adet (50 gr)",
        "desc": "Atıştırmalık ve kebap öncesi için taş fırında çıtır pişirilen minik fındık lahmacun (1 adet).",
        "cal": 110, "prep": "8 dk", "stock": 60, "allergens": ["Gluten"], "popular": False
    },
    (26, "KARIŞIK TABAK ALTI"): {
        "tag": "Kebap Yanı", "gramaj": "50 gr",
        "desc": "Kebapların altına serilen fındık lahmacun ve minik çıtır lavaş tabağı.",
        "cal": 110, "prep": "5 dk", "stock": 60, "allergens": ["Gluten"], "popular": False
    },
    (26, "KIYMALI PİDE"): {
        "tag": "Taş Fırın Pide", "gramaj": "1 Porsiyon",
        "desc": "Taş fırında uzatılmış çıtır mayalı hamur, zırh dana kıyma, soğan, biber ve taze domates harcı.",
        "cal": 580, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten"], "popular": False
    },
    (26, "KAŞARLI PİDE"): {
        "tag": "Bol Kaşarlı", "gramaj": "1 Porsiyon",
        "desc": "Taş fırında uzatılmış çıtır pide hamuru üzerinde nar gibi erimiş bol yağlı kaşar peyniri ve tereyağı kenarlar.",
        "cal": 640, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (26, "KUŞBAŞI PİDE"): {
        "tag": "Bıçak Arası", "gramaj": "1 Porsiyon",
        "desc": "Bıçak arası doğranmış marine dana but eti parçaları, yeşil biber, domates ve baharatlar ile taş fırında pişen pide.",
        "cal": 610, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten"], "popular": True
    },
    (26, "KAŞARLI KUŞBAŞI PİDE"): {
        "tag": "Et & Kaşar", "gramaj": "1 Porsiyon",
        "desc": "Bıçak arası dana eti parçaları ve üzerinde erimiş bol kaşar peynirinin taş fırında mükemmel buluşması.",
        "cal": 690, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Laktoz"], "popular": True
    },
    (26, "KIYMALI KAŞARLI PİDE"): {
        "tag": "Kıyma & Kaşar", "gramaj": "1 Porsiyon",
        "desc": "Zırh dana kıyma harcı ve üzerinde uzayan eritilmiş kaşar peyniri.",
        "cal": 660, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (26, "SUCUKLU PİDE"): {
        "tag": "Kasap Sucuklu", "gramaj": "1 Porsiyon",
        "desc": "Dilimlenmiş yerli kasap sucuğu ile fırınlanan çıtır pide.",
        "cal": 590, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten"], "popular": False
    },
    (26, "SUCUKLU KAŞARLI PİDE"): {
        "tag": "Sucuk & Kaşar", "gramaj": "1 Porsiyon",
        "desc": "Yerli kasap sucuğu dilimleri ve erimiş bol kaşar peynirinin fırından sıcak lezzeti.",
        "cal": 680, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Laktoz"], "popular": False
    },
    (26, "KAVURMALI KAŞARLI PİDE"): {
        "tag": "Kavurmalı & Kaşarlı", "gramaj": "1 Porsiyon",
        "desc": "Geleneksel kuzu/dana kavurma parçaları ve bol erimiş kaşar peyniri ile taş fırında pişen efsane lezzet.",
        "cal": 720, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": True
    },
    (26, "KARIŞIK PİDE"): {
        "tag": "Tam Karışık", "gramaj": "1 Porsiyon",
        "desc": "Kıymalı, kuşbaşılı ve bol kaşarlı harçların tek pidede buluştuğu zengin taş fırın pidesi.",
        "cal": 710, "prep": "12-15 dk", "stock": 30, "allergens": ["Gluten", "Laktoz"], "popular": True
    },
    (26, "LOQUM PİDE"): {
        "tag": "Şefin İmzası Pide", "gramaj": "1 Porsiyon",
        "desc": "Dana kuşbaşı, kavurma, eritilmiş kaşar peyniri, renkli biberler ve şefin özel baharatlarıyla hazırlanan imza pide.",
        "cal": 740, "prep": "12-15 dk", "stock": 25, "allergens": ["Gluten", "Laktoz"], "popular": True
    },

    # 27: STEAK
    (27, "DANA PİRZOLA"): {
        "tag": "Dry Aged 28 Gün", "gramaj": "400 - 450 gr",
        "desc": "Özel 28 gün kuru dinlendirilmiş kemikli dana pirzola, döküm ızgarada mühürlenmiş, deniz tuzu ve taze biberiye ile.",
        "cal": 780, "prep": "20-25 dk", "stock": 20, "allergens": [], "popular": True
    },
    (27, "ANTRİKOT"): {
        "tag": "Mermersi Doku", "gramaj": "280 - 300 gr",
        "desc": "Mermersi yağ dokusu mükemmel dana antrikot kesimi, odun kömüründe sulu sulu mühürlenir.",
        "cal": 680, "prep": "18-20 dk", "stock": 25, "allergens": [], "popular": True
    },
    (27, "LOQUM"): {
        "tag": "İmza Lezzet", "gramaj": "280 - 300 gr",
        "desc": "Dana bonfilenin en yumuşak orta göbeğinden kesilen, ağızda eriyen mühürlenmiş bonfile lokum dilimleri.",
        "cal": 580, "prep": "15-18 dk", "stock": 30, "allergens": [], "popular": True
    },
    (27, "NEWYORK STEAK"): {
        "tag": "Dry Aged", "gramaj": "280 - 300 gr",
        "desc": "Kemiksiz dana kontrfile kesimi, kenarındaki ince yağ şeridiyle döküm ızgarada karamelize edilerek pişirilir.",
        "cal": 640, "prep": "18-20 dk", "stock": 22, "allergens": [], "popular": True
    },
    (27, "ŞATOBÜRYAN"): {
        "tag": "2 Kişilik Ziyafet", "gramaj": "550 - 600 gr",
        "desc": "2 kişilik servis: Dana bonfilenin en kalın baş kısmından hazırlanan, masada tereyağında cızırdayarak dilimlenen efsanevi steak.",
        "cal": 1200, "prep": "25-30 dk", "stock": 15, "allergens": ["Laktoz (Tereyağı)"], "popular": True
    },
    (27, "KUZU KAFES"): {
        "tag": "2 Kişilik Şölen", "gramaj": "1100 - 1400 gr",
        "desc": "2 kişilik servis: Bütün kuzu kaburga ve pirzolalarının fırında ve ızgarada nar gibi kızartılmasıyla masaya gelen görkemli sunum.",
        "cal": 1650, "prep": "25-30 dk", "stock": 12, "allergens": [], "popular": True
    },
    (27, "DANA ŞAŞLIK"): {
        "tag": "Marine Bonfile", "gramaj": "280 - 300 gr",
        "desc": "İnce dilimlenmiş dana bonfile ve taze soğan halkalarının özel terbiye ile şişte közlenmesi.",
        "cal": 620, "prep": "18-20 dk", "stock": 25, "allergens": [], "popular": False
    },
    (27, "HARDAL SOSLU LOQUM"): {
        "tag": "Dijon Hardallı", "gramaj": "280 - 300 gr",
        "desc": "Yumuşacık dana bonfile lokum dilimleri, özel Fransız tane hardalı sosu ile marine edilerek servis edilir.",
        "cal": 640, "prep": "18-20 dk", "stock": 20, "allergens": ["Hardal"], "popular": False
    },
    (27, "BİFTEK"): {
        "tag": "Izgara Biftek", "gramaj": "280 - 300 gr",
        "desc": "Özel dinlendirilmiş dana biftek kesimi, döküm ızgarada mühürlenerek taze çekilmiş tane karabiberle tatlandırılır.",
        "cal": 590, "prep": "18-20 dk", "stock": 20, "allergens": [], "popular": False
    },
    (27, "MEXİCAN STEAK"): {
        "tag": "Acılı & Baharatlı", "gramaj": "280 - 300 gr",
        "desc": "Marine dana steak, acı jalapeno biberleri, mısır ve taze baharatlı özel salsa sosu ile.",
        "cal": 650, "prep": "18-20 dk", "stock": 20, "allergens": [], "popular": False
    },
    (27, "PAPER STEAK"): {
        "tag": "Tane Biberli", "gramaj": "280 - 300 gr",
        "desc": "Taze çekilmiş yeşil ve siyah tane biberlerle kaplanarak döküm tavada mühürlenen dana steak.",
        "cal": 630, "prep": "18-20 dk", "stock": 20, "allergens": [], "popular": False
    },
    (27, "MANTAR KREMALI STEAK"): {
        "tag": "Kremalı Mantarlı", "gramaj": "280 - 300 gr",
        "desc": "Izgara dana bonfile steak dilimleri, taze kültür mantarı ve ipeksi beyaz krema sosu eşliğinde.",
        "cal": 720, "prep": "18-20 dk", "stock": 20, "allergens": ["Laktoz"], "popular": False
    },
    (27, "KASAP SUCUK (250GR.)"): {
        "tag": "%100 Dana", "gramaj": "250 gr",
        "desc": "Loqum Et'in kendi imalatı %100 dana eti ve özel baharatlarla doldurulan ızgara kasap sucuk halkaları.",
        "cal": 780, "prep": "12-15 dk", "stock": 30, "allergens": [], "popular": False
    },
    (27, "CHEDDAR SOSLU ANTRİKOT"): {
        "tag": "Sıcak Cheddar", "gramaj": "280 - 300 gr",
        "desc": "Mermersi yağ dokulu dana antrikot, üzerine eritilmiş sıcak akışkan cheddar peyniri sosu ile.",
        "cal": 810, "prep": "18-20 dk", "stock": 22, "allergens": ["Laktoz (Cheddar)"], "popular": False
    },
    (27, "MANTAR SOSLU ANTRİKOT"): {
        "tag": "Kremalı Mantarlı", "gramaj": "280 - 300 gr",
        "desc": "Izgara dana antrikot, sotelenmiş taze mantarlar ve kremalı sos dokunuşu ile.",
        "cal": 760, "prep": "18-20 dk", "stock": 22, "allergens": ["Laktoz"], "popular": False
    },
    (27, "CHEDDAR SOSLU LOQUM"): {
        "tag": "Cheddarlı Bonfile", "gramaj": "280 - 300 gr",
        "desc": "Ağızda eriyen dana bonfile lokum dilimleri ve üzerinde sıcak eritilmiş cheddar peyniri şelalesi.",
        "cal": 740, "prep": "18-20 dk", "stock": 22, "allergens": ["Laktoz (Cheddar)"], "popular": False
    },
    (27, "MANTAR SOSLU STEAK"): {
        "tag": "Mantar Soslu", "gramaj": "280 - 300 gr",
        "desc": "Odun kömüründe mühürlenmiş dana steak eti, tereyağında sotelenmiş mantarlar ve krema sosu.",
        "cal": 730, "prep": "18-20 dk", "stock": 20, "allergens": ["Laktoz"], "popular": False
    },
    (27, "HARDAL SOSLU ANTRİKOT"): {
        "tag": "Hardallı", "gramaj": "280 - 300 gr",
        "desc": "Yağ dokusu dengeli dana antrikot, özel tane hardal ve bal sosu eşliğinde.",
        "cal": 710, "prep": "18-20 dk", "stock": 20, "allergens": ["Hardal"], "popular": False
    },
    (27, "T-BONE"): {
        "tag": "Dry Aged 28 Gün", "gramaj": "400 - 450 gr",
        "desc": "Bir tarafı yumuşak bonfile, diğer tarafı lezzetli kontrfileden oluşan T kemikli 28 gün dinlendirilmiş efsane kesim.",
        "cal": 790, "prep": "20-25 dk", "stock": 20, "allergens": [], "popular": True
    },
    (27, "SOS KARNAVALLI ŞAŞLIK"): {
        "tag": "Sos Karnavalı", "gramaj": "280 - 300 gr",
        "desc": "Marine dana bonfile dilimleri, hardal, mantar ve barbekü sos kombinasyonu ile zenginleştirilmiş gurme şaşlık.",
        "cal": 730, "prep": "18-20 dk", "stock": 20, "allergens": ["Hardal", "Laktoz"], "popular": False
    },
    (27, "DİYET ANTRİKOT"): {
        "tag": "Fit & Sağlıklı", "gramaj": "250 gr",
        "desc": "Yağsız ızgara dana antrikot, yağsız haşlanmış basmati pirinci, fırın patates ve pancar salatası ile sağlıklı protein menüsü.",
        "cal": 520, "prep": "15-18 dk", "stock": 25, "allergens": [], "popular": False
    },

    # 28: TAVALAR
    (28, "ÇOBAN KAVURMA"): {
        "tag": "Kuzu But", "gramaj": "280 gr",
        "desc": "Bakır tavada süt kuzu but eti, arpacık soğan, yeşil köy biberi, domates ve sarımsak ile ağır ateşte pişen kavurma.",
        "cal": 740, "prep": "18-20 dk", "stock": 25, "allergens": [], "popular": True
    },
    (28, "CHEDDAR SOSLU BONFİLE TAVA"): {
        "tag": "Cheddarlı Bonfile", "gramaj": "260 gr",
        "desc": "Bakır tavada sotelenmiş lokum dana bonfile parçaları, akışkan eritilmiş sıcak cheddar peyniri sosu ile.",
        "cal": 790, "prep": "18-20 dk", "stock": 22, "allergens": ["Laktoz (Cheddar)"], "popular": False
    },
    (28, "MANTAR SOSLU BONFİLE TAVA"): {
        "tag": "Kremalı Mantarlı", "gramaj": "260 gr",
        "desc": "Bakır tavada sotelenmiş dana bonfile eti, taze kültür mantarları ve leziz krema sosu ile.",
        "cal": 760, "prep": "18-20 dk", "stock": 22, "allergens": ["Laktoz"], "popular": False
    },
    (28, "HARDAL SOSLU BONFİLE TAVA"): {
        "tag": "Ballı Hardallı", "gramaj": "260 gr",
        "desc": "Dana bonfile dilimleri, bakır tavada ballı hardal sosu ve taze baharatlarla sotelenir.",
        "cal": 720, "prep": "18-20 dk", "stock": 20, "allergens": ["Hardal"], "popular": False
    },
    (28, "ACILI MANTARLI BONFİLE TAVA"): {
        "tag": "Acılı Peper Sos", "gramaj": "260 gr",
        "desc": "Dana bonfile eti, taze mantarlar ve biberiye taneli acı peper sosu ile sıcak bakır tavada.",
        "cal": 710, "prep": "18-20 dk", "stock": 20, "allergens": ["Laktoz"], "popular": False
    },
    (28, "KONTRAFİLE SASA"): {
        "tag": "Jülyen Kontrafile", "gramaj": "260 gr",
        "desc": "İnce jülyen doğranmış marine dana kontrfile, renkli biberler, soğan ve soya dokunuşuyla wok tava lezzeti.",
        "cal": 680, "prep": "18-20 dk", "stock": 20, "allergens": ["Soya"], "popular": False
    },
    (28, "FIRINDA PEYNİRLİ MANTAR"): {
        "tag": "Sıcak Güveç", "gramaj": "200 gr",
        "desc": "Güveçte taze mantarlar, köy tereyağı, eritilmiş cheddar ve kaşar peyniri harmanı ile nar gibi fırınlanır.",
        "cal": 480, "prep": "15 dk", "stock": 30, "allergens": ["Laktoz"], "popular": False
    },
    (28, "SEBZELİ BONFİLE TAVA"): {
        "tag": "Sebzeli Denge", "gramaj": "260 gr",
        "desc": "Sotelenmiş dana bonfile dilimleri, basmati pirinç pilavı, fırın patates ve pancar salatası eşliğinde.",
        "cal": 640, "prep": "18-20 dk", "stock": 25, "allergens": [], "popular": False
    },

    # 29: TATLILAR
    (29, "CENNET ÇAMURU"): {
        "tag": "Bol Fıstıklı & Kaymaklı", "gramaj": "180 gr",
        "desc": "İnce tel kadayıf, bol Antep fıstığı, özel şerbet ve üzerinde hakiki manda sütü kaymağı ile efsanevi geleneksel tatlı.",
        "cal": 540, "prep": "8-10 dk", "stock": 30, "allergens": ["Gluten", "Laktoz", "Antep Fıstığı"], "popular": True
    },
    (29, "İNCİR TATLISI"): {
        "tag": "Cevizli & Kaymaklı", "gramaj": "160 gr",
        "desc": "Ağır ateşte cevizle doldurularak pişirilmiş doğal dağ incirleri, yanında taze kaymak ile.",
        "cal": 390, "prep": "5-8 dk", "stock": 30, "allergens": ["Ceviz", "Laktoz"], "popular": False
    },
    (29, "SOĞUK BAKLAVA"): {
        "tag": "Sütlü & Çikolatalı", "gramaj": "180 gr",
        "desc": "İncecik çıtır baklava yufkaları arasında bol Antep fıstığı, soğuk sütlü hafif şerbet ve üzerinde rendelenmiş Belçika çikolatası.",
        "cal": 460, "prep": "5 dk", "stock": 35, "allergens": ["Gluten", "Laktoz", "Antep Fıstığı"], "popular": True
    },
    (29, "KATMER"): {
        "tag": "Fırından Sıcak", "gramaj": "180 gr",
        "desc": "Taş fırında çıtırdayan el açması incecik yufka, halis süt kaymağı ve bol zümrüt yeşili Antep fıstığı ile sıcak servis edilir.",
        "cal": 560, "prep": "10 dk", "stock": 30, "allergens": ["Gluten", "Laktoz", "Antep Fıstığı"], "popular": True
    },
    (29, "KABAK TATLISI"): {
        "tag": "Tahinli & Cevizli", "gramaj": "180 gr",
        "desc": "Fırında karamelize edilen Hatay bal kabağı dilimleri, üzerinde süzme tahin ve kıyılmış taze ceviz ile.",
        "cal": 380, "prep": "5 dk", "stock": 30, "allergens": ["Susam", "Ceviz"], "popular": False
    },

    # 30: İÇECEKLER
    (30, "PORTAKAL SUYU"): {
        "tag": "Taze Sıkma", "gramaj": "330 ml",
        "desc": "Günlük taze sıkılmış %100 doğal portakal suyu.",
        "cal": 135, "prep": "3 dk", "stock": 50, "allergens": [], "popular": False
    },
    (30, "COCA COLA"): {
        "tag": "Kutu 330ml", "gramaj": "330 ml",
        "desc": "Orijinal kutu kola, buz ve limon dilimi ile.",
        "cal": 140, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "COCA COLA ZERO"): {
        "tag": "Şekersiz 330ml", "gramaj": "330 ml",
        "desc": "Şekersiz ve kalorisiz kutu kola.",
        "cal": 0, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "FANTA"): {
        "tag": "Kutu 330ml", "gramaj": "330 ml",
        "desc": "Kutu portakallı gazoz.",
        "cal": 130, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "KARIŞIK MEYVE SUYU"): {
        "tag": "Kutu 330ml", "gramaj": "330 ml",
        "desc": "Kutu karışık meyve nektarı.",
        "cal": 120, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "ÇORÇIL"): {
        "tag": "Doğal & Ferah", "gramaj": "250 ml",
        "desc": "Doğal maden suyu, taze sıkılmış limon suyu ve kaya tuzu ile hazırlanan ferahlatıcı klasik kokteyl.",
        "cal": 10, "prep": "3 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "GAZOZ"): {
        "tag": "Cam Şişe", "gramaj": "250 ml",
        "desc": "Geleneksel cam şişe gazoz.",
        "cal": 110, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "SADE SODA"): {
        "tag": "Maden Suyu", "gramaj": "200 ml",
        "desc": "Doğal zengin mineralli kaynak suyu maden sodası.",
        "cal": 0, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "LİMONLU SODA"): {
        "tag": "Meyveli Soda", "gramaj": "200 ml",
        "desc": "Taze limon aromalı mineralli maden suyu.",
        "cal": 45, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "ICE TEA"): {
        "tag": "Kutu 330ml", "gramaj": "330 ml",
        "desc": "Şeftali veya limon aromalı soğuk çay.",
        "cal": 90, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "AYRAN"): {
        "tag": "Taze Yayık", "gramaj": "300 ml",
        "desc": "Geleneksel köpüklü taze yayık ayranı.",
        "cal": 95, "prep": "2 dk", "stock": 60, "allergens": ["Laktoz"], "popular": True
    },
    (30, "KAPALI AYRAN"): {
        "tag": "Kutu 250ml", "gramaj": "250 ml",
        "desc": "Ambalajlı bardak yayık ayranı.",
        "cal": 80, "prep": "2 dk", "stock": 60, "allergens": ["Laktoz"], "popular": False
    },
    (30, "ŞALGAM"): {
        "tag": "Geleneksel Şalgam", "gramaj": "330 ml",
        "desc": "Adana usulü acılı veya acısız geleneksel fermente mor havuç şalgam suyu.",
        "cal": 25, "prep": "2 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "BÜYÜK SU"): {
        "tag": "Cam Şişe", "gramaj": "750 ml",
        "desc": "Doğal kaynak suyu cam şişe.",
        "cal": 0, "prep": "1 dk", "stock": 60, "allergens": [], "popular": False
    },
    (30, "KÜÇÜK SU"): {
        "tag": "Şişe 330ml", "gramaj": "330 ml",
        "desc": "Doğal kaynak suyu.",
        "cal": 0, "prep": "1 dk", "stock": 60, "allergens": [], "popular": False
    }
}

final_products = []
missing_details = []
image_copy_count = 0

seen_ids = set()

for raw in raw_items:
    cat_id = raw["cat_id"]
    cat_cfg = CATEGORY_CONFIG[cat_id]
    cat_slug = cat_cfg["slug"]
    name = raw["name"].strip()
    price = parse_price(raw["price_raw"])
    src_img_filename = os.path.basename(raw["image_rel"])
    src_img_path = os.path.join(SRC_IMG_BASE, src_img_filename)
    
    # Generate unique product slug
    item_slug = slugify(name)
    prod_id = f"{cat_slug}-{item_slug}"
    
    # Avoid duplicate id collision
    counter = 1
    base_id = prod_id
    while prod_id in seen_ids:
        counter += 1
        prod_id = f"{base_id}-{counter}"
    seen_ids.add(prod_id)
    
    # Destination image
    dest_img_filename = f"{item_slug}.jpg"
    dest_img_path = os.path.join(DEST_IMG_BASE, cat_slug, dest_img_filename)
    public_img_url = f"/images/menu/{cat_slug}/{dest_img_filename}"
    
    # Copy image
    if os.path.exists(src_img_path):
        shutil.copyfile(src_img_path, dest_img_path)
        image_copy_count += 1
    else:
        print(f"WARNING: Source image not found for {name}: {src_img_path}")

    # Fetch handcrafted details
    clean_name = name.replace("\\'", "'")
    details = ITEM_DETAILS.get((cat_id, name)) or ITEM_DETAILS.get((cat_id, clean_name))
    if not details:
        missing_details.append((cat_id, name))
        tag = cat_cfg["name"]
        gramaj = "Porsiyon"
        desc = raw["desc"].strip() or f"Loqum Et'in taze ve özel sunumuyla hazırlanan nefis {name.lower()}."
        cal = 500
        prep = "15 dk"
        stock = 25
        allergens = []
        popular = False
        display_name = name
    else:
        display_name = details.get("name", name)
        tag = details["tag"]
        gramaj = details["gramaj"]
        desc = details["desc"]
        cal = details["cal"]
        prep = details["prep"]
        stock = details["stock"]
        allergens = details["allergens"]
        popular = details.get("popular", False)
        
    product_obj = {
        "id": prod_id,
        "categoryId": cat_id,
        "categorySlug": cat_slug,
        "name": display_name,
        "tag": tag,
        "gramaj": gramaj,
        "description": desc,
        "price": price,
        "calories": cal,
        "prepTime": prep,
        "stock": stock,
        "allergens": allergens,
        "image": public_img_url,
        "isPopular": popular
    }
    final_products.append(product_obj)

print(f"Total processed products: {len(final_products)}")
print(f"Total images copied to public/images/menu: {image_copy_count}")
print(f"Missing details count: {len(missing_details)}")
if missing_details:
    print("Missing details:", missing_details)

# Write to target files
target_files = [
    '/Users/mesa/restaurant-engine/src/data/loqum-products.json',
    '/Users/mesa/restaurant-engine/data/loqum-products.json'
]

for tf in target_files:
    with open(tf, 'w', encoding='utf-8') as f:
        json.dump(final_products, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(final_products)} products to {tf}")

