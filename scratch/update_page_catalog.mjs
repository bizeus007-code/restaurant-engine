import fs from "fs";
import path from "path";

const pagePath = path.join(process.cwd(), "app", "page.tsx");
let content = fs.readFileSync(pagePath, "utf8");

// 1. Definition of MenuItem, CATEGORIES, CATEGORY_NAMES, DISHES
const newCatalogBlock = `export interface MenuItem {
  id: string;
  category: string;
  categorySlug: string;
  name: string;
  subtitle: string;
  frenchTitle?: string;
  price: string;
  priceNum: number;
  image: string;
  calories?: string;
  prepTime?: string;
  servingTemp?: string;
  temperature?: string;
  description: string;
  chefNote?: string;
  dishImage?: string;
  isTransparentPng?: boolean;
  isBluePlate?: boolean;
  portion?: string;
  courseNumber?: string;
  meatIngredient?: string;
  garnishIngredient?: string;
}

export const CATEGORIES = [
  { id: "yoresel", slug: "yoresel", label: "YÖRESEL BAŞYAPITLAR" },
  { id: "tas-firin", slug: "tas-firin", label: "TAŞ FIRIN & IZGARA" },
  { id: "tavuk", slug: "tavuk", label: "TAVUK ÇEŞİTLERİ" },
  { id: "corba-meze", slug: "corba-meze", label: "ÇORBA & MEZELER" },
  { id: "salata", slug: "salata", label: "GURME SALATALAR" },
  { id: "tatlilar", slug: "tatlilar", label: "TATLILAR" },
  { id: "icecekler", slug: "icecekler", label: "İÇECEKLER & SPESİYALLER" }
];

export type CategorySlug = string;

type Language = "TR" | "EN" | "AR";

const TRANSLATIONS = {
  TR: {
    garson: "Garson",
    hesap: "Hesap",
    degerlendir: "Değerlendir",
    tepsi: "TEPSİ",
    tekPorsiyon: "TEK PORSİYON",
    sipariseEkle: "+ SİPARİŞE EKLE",
    tukendi: "TÜKENDİ",
    tepsiBaslik: "CANLI MASA ADİSYONU",
    bosTepsi: "Tepsiniz henüz boş",
    bosTepsiAlt: "Menüdeki lezzetleri ekleyerek siparişinizi oluşturun.",
    toplam: "Toplam Tutar",
    siparisiGonder: "Siparişi Mutfağa İlet",
    iletiliyor: "Mutfağa İletiliyor...",
    sefinTavsiyesi: "Şefin Çapraz Önerisi",
    ayranOneri: "Sur Tava yanına taze Yayık Ayran eklemek ister misiniz?",
    tatliOneri: "Yemeğin üstüne sıcak Diyarbakır Burma Kadayıf?",
    birTiklaEkle: "+ Ekle",
    toastEklendi: "tepsiye eklendi ✓",
    toastIletildi: "Siparişiniz mutfağa iletildi!",
    toastCagri: "talebiniz kasaya iletildi ✓",
    nakitHesap: "💵 Nakit Hesap",
    kartHesap: "💳 Kart / POS",
    garsonCagri: "🔔 Garson",
  },
  EN: {
    garson: "Waiter",
    hesap: "Bill",
    degerlendir: "Review",
    tepsi: "TRAY",
    tekPorsiyon: "SINGLE PORTION",
    sipariseEkle: "+ ADD TO ORDER",
    tukendi: "SOLD OUT",
    tepsiBaslik: "LIVE TABLE BILL",
    bosTepsi: "Your tray is empty",
    bosTepsiAlt: "Add gourmet delicacies from the menu.",
    toplam: "Total Amount",
    siparisiGonder: "Send Order to Kitchen",
    iletiliyor: "Sending to Kitchen...",
    sefinTavsiyesi: "Chef's Recommendation",
    ayranOneri: "Would you like fresh frothy Ayran with your dish?",
    tatliOneri: "Complete your feast with hot Burma Kadayif?",
    birTiklaEkle: "+ Add",
    toastEklendi: "added to tray ✓",
    toastIletildi: "Your order was sent to the kitchen!",
    toastCagri: "request sent to reception ✓",
    nakitHesap: "💵 Cash Bill",
    kartHesap: "💳 Card / POS",
    garsonCagri: "🔔 Waiter",
  },
  AR: {
    garson: "نادل",
    hesap: "الحساب",
    degerlendir: "تقييم",
    tepsi: "الطلب",
    tekPorsiyon: "وجبة فردية",
    sipariseEkle: "+ أضف إلى الطلب",
    tukendi: "نفذت الكمية",
    tepsiBaslik: "فاتورة الطاولة الحية",
    bosTepsi: "قائمة طلباتك فارغة",
    bosTepsiAlt: "اختر أشهى المأكولات من القائمة للإضافة.",
    toplam: "المجموع الكلي",
    siparisiGonder: "إرسال الطلب إلى المطبخ",
    iletiliyor: "جاري الإرسال للمطبخ...",
    sefinTavsiyesi: "توصية الشيف الخاصة",
    ayranOneri: "هل ترغب في إضافة عيران طازج مع وجبتك؟",
    tatliOneri: "هل تود تحلية بقطايف ديار بكر بالفستق؟",
    birTiklaEkle: "+ إضافة",
    toastEklendi: "تمت الإضافة ✓",
    toastIletildi: "تم إرسال طلبك إلى المطبخ بنجاح!",
    toastCagri: "تم إرسال طلبك إلى الكاشير بنجاح ✓",
    nakitHesap: "💵 نقداً",
    kartHesap: "💳 بطاقة",
    garsonCagri: "🔔 نادل",
  },
};

const CATEGORY_NAMES: Record<Language, Record<string, string>> = {
  TR: {
    yoresel: "YÖRESEL BAŞYAPITLAR",
    "tas-firin": "TAŞ FIRIN & IZGARA",
    tavuk: "TAVUK ÇEŞİTLERİ",
    "corba-meze": "ÇORBA & MEZELER",
    salata: "GURME SALATALAR",
    tatlilar: "TATLILAR",
    icecekler: "İÇECEKLER & SPESİYALLER",
  },
  EN: {
    yoresel: "TRADITIONAL SPECIALS",
    "tas-firin": "STONE OVEN & GRILL",
    tavuk: "CHICKEN DELICACIES",
    "corba-meze": "SOUPS & MEZZE",
    salata: "GOURMET SALADS",
    tatlilar: "DESSERTS",
    icecekler: "BEVERAGES & SPECIALS",
  },
  AR: {
    yoresel: "أطباق تقليدية",
    "tas-firin": "فرن الحجر والمشاوي",
    tavuk: "أطباق الدجاج",
    "corba-meze": "شوربات ومقبلات",
    salata: "سلطات جورميه",
    tatlilar: "حلويات",
    icecekler: "مشروبات ومميزات",
  },
};

export const DISHES: MenuItem[] = [
  // 1. YÖRESEL LEZZETLER
  {
    id: "special-kuzu-sirt",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Beroş Special Kuzu Sırt",
    subtitle: "Özel Marine Kuzu Sırt • Firik Pilavı",
    frenchTitle: "Selle d'Agneau Rôtie Spéciale",
    price: "₺ 850",
    priceNum: 850,
    image: "/dishes/special-kuzu-sirt.png",
    dishImage: "/dish-blue-plate.png",
    isTransparentPng: true,
    isBluePlate: true,
    calories: "740 kcal",
    prepTime: "18 dk",
    servingTemp: "82 °C",
    temperature: "82 °C",
    description: "Özel baharatlarla marine edilmiş kuzu sırt eti, közlenmiş arpacık soğan ve tereyağlı firik pilavı ile sunulur.",
    chefNote: "Özel baharatlarla marine edilmiş kuzu sırt eti, közlenmiş arpacık soğan ve tereyağlı firik pilavı ile sunulur.",
    portion: "320g / Tek Kişilik"
  },
  {
    id: "ayvali-kavurma",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Diyarbakır Ayvalı Kavurma",
    subtitle: "Karamelize Ayva • Bakır Sahanda Demleme",
    frenchTitle: "Sauté d'Agneau Traditionnel aux Coings",
    price: "₺ 725",
    priceNum: 725,
    image: "/dishes/ayvali-kavurma.png",
    dishImage: "/dishes/ayvali-kavurma.png",
    calories: "610 kcal",
    prepTime: "14 dk",
    servingTemp: "76 °C",
    temperature: "76 °C",
    description: "Kuzu eti ve kış ayvalarının tatlı-ekşi dengesiyle bakır sahanda meşe közünde demlenen Diyarbakır saray klasiği.",
    chefNote: "Kuzu eti ve kış ayvalarının tatlı-ekşi dengesiyle bakır sahanda meşe közünde demlenen Diyarbakır saray klasiği.",
    portion: "300g"
  },
  {
    id: "sur-usulu-sac-tava",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Sur Usulü Hakiki Sac Tava",
    subtitle: "Kuyruk Yağı • Çift Kulplu Sacda Harlı Ateş",
    frenchTitle: "Poêlée Traditionnelle de Sur",
    price: "₺ 800",
    priceNum: 800,
    image: "/dishes/sur-usulu-sac-tava.png",
    dishImage: "/dishes/sur-usulu-sac-tava.png",
    calories: "680 kcal",
    prepTime: "12 dk",
    servingTemp: "88 °C",
    temperature: "88 °C",
    description: "Zırhla kıyılmış kuzu eti, kuyruk yağı, sivri biber ve taze domatesle sac üzerinde pişen efsanevi tava lezzeti.",
    chefNote: "Zırhla kıyılmış kuzu eti, kuyruk yağı, sivri biber ve taze domatesle sac üzerinde pişen efsanevi tava lezzeti.",
    portion: "400g"
  },
  {
    id: "kuzu-gerdan",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Kuzu Gerdan",
    subtitle: "Kemik Suyunda Ağır Demleme • Şefin İmzası",
    frenchTitle: "Collet d'Agneau Braisé au Bouillon",
    price: "₺ 670",
    priceNum: 670,
    image: "/dishes/kuzu-gerdan.png",
    dishImage: "/dishes/kuzu-gerdan.png",
    calories: "640 kcal",
    prepTime: "12 dk",
    servingTemp: "75 °C",
    temperature: "75 °C",
    description: "Lif lif ayrılan kuzu gerdan eti, geleneksel baharat harmanı ile bakır tencerede demlendirilmiştir.",
    chefNote: "Lif lif ayrılan kuzu gerdan eti, geleneksel baharat harmanı ile bakır tencerede demlendirilmiştir.",
    portion: "340g"
  },
  {
    id: "firinda-kuzu-incik",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Fırında Kuzu İncik",
    subtitle: "Köz Ateşinde Kemikli İncik • Şehriyeli Pilav",
    frenchTitle: "Souris d'Agneau Confite au Four",
    price: "₺ 690",
    priceNum: 690,
    image: "/dishes/firinda-kuzu-incik.png",
    dishImage: "/dishes/firinda-kuzu-incik.png",
    calories: "710 kcal",
    prepTime: "20 dk",
    servingTemp: "80 °C",
    temperature: "80 °C",
    description: "Kemik iliğinin lezzetiyle 6 saat ağır ağır pişen, lokum kıvamında fırınlanmış kuzu incik.",
    chefNote: "Kemik iliğinin lezzetiyle 6 saat ağır ağır pişen, lokum kıvamında fırınlanmış kuzu incik.",
    portion: "380g"
  },
  {
    id: "kuzu-haslama",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Kuzu Haşlama",
    subtitle: "Taze Kök Sebzeler • Şifalı İlikli Et Suyu",
    frenchTitle: "Pot-au-Feu d'Agneau aux Légumes",
    price: "₺ 670",
    priceNum: 670,
    image: "/dishes/kuzu-haslama.png",
    dishImage: "/dishes/kuzu-haslama.png",
    calories: "580 kcal",
    prepTime: "10 dk",
    servingTemp: "88 °C",
    temperature: "88 °C",
    description: "Taze patates, havuç ve arpacık soğan ile kısık ateşte demlenen asırlık konak reçetesi.",
    chefNote: "Taze patates, havuç ve arpacık soğan ile kısık ateşte demlenen asırlık konak reçetesi.",
    portion: "350g"
  },
  {
    id: "sur-kuzu-kol-dolmasi",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Sur Kuzu Kol Dolması",
    subtitle: "Baharatlı İç Pilav • Nar Gibi Fırın",
    frenchTitle: "Épaule d'Agneau Farcie Royale",
    price: "₺ 920",
    priceNum: 920,
    image: "/dishes/sur-kuzu-kol-dolmasi.png",
    dishImage: "/dishes/sur-kuzu-kol-dolmasi.png",
    calories: "820 kcal",
    prepTime: "22 dk",
    servingTemp: "84 °C",
    temperature: "84 °C",
    description: "Kuş üzümü, çam fıstığı ve özel baharatlarla hazırlanan iç pilavın kuzu kol içine doldurularak fırınlanması.",
    chefNote: "Kuş üzümü, çam fıstığı ve özel baharatlarla hazırlanan iç pilavın kuzu kol içine doldurularak fırınlanması.",
    portion: "650g"
  },
  {
    id: "firin-guvec",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Fırın Güveç",
    subtitle: "Toprak Kapta Kuzu Eti • Mevsim Sebzeleri",
    frenchTitle: "Ragoût d'Agneau en Terrine d'Argile",
    price: "₺ 480",
    priceNum: 480,
    image: "/dishes/firin-guvec.png",
    dishImage: "/dishes/firin-guvec.png",
    calories: "590 kcal",
    prepTime: "14 dk",
    servingTemp: "78 °C",
    temperature: "78 °C",
    description: "Toprak güveçte kuzu kuşbaşı, patlıcan, domates ve sarımsakla ağır ateşte demlenen eşsiz lezzet.",
    chefNote: "Toprak güveçte kuzu kuşbaşı, patlıcan, domates ve sarımsakla ağır ateşte demlenen eşsiz lezzet.",
    portion: "320g"
  },
  {
    id: "mumbar",
    category: "Yöresel Başyapıtlar",
    categorySlug: "yoresel",
    name: "Diyarbakır Mumbar Dolması",
    subtitle: "Özel Baharatlı Pirinç Harcı • Haşlama Kuzu Mumbar",
    frenchTitle: "Tripes Farcies Traditionnelles",
    price: "₺ 450",
    priceNum: 450,
    image: "/dishes/mumbar.png",
    dishImage: "/dishes/mumbar.png",
    calories: "620 kcal",
    prepTime: "10 dk",
    servingTemp: "85 °C",
    temperature: "85 °C",
    description: "Geleneksel usulle temizlenip baharatlı pirinç ile doldurulan ve bakır kapta demlenen kadim Diyarbakır lezzeti.",
    chefNote: "Geleneksel usulle temizlenip baharatlı pirinç ile doldurulan ve bakır kapta demlenen kadim Diyarbakır lezzeti.",
    portion: "300g"
  },

  // 2. TAŞ FIRIN & IZGARA
  {
    id: "karisik-izgara",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Beroş Karışık Izgara",
    subtitle: "Kuzu Şiş • Pirzola • Adana • Köz Garnitür",
    frenchTitle: "Grillade Mixte Royale Beroş",
    price: "₺ 950",
    priceNum: 950,
    image: "/dishes/karisik-izgara.png",
    dishImage: "/dishes/karisik-izgara.png",
    calories: "890 kcal",
    prepTime: "20 dk",
    servingTemp: "85 °C",
    temperature: "85 °C",
    description: "Kuzu pirzola, kuzu şiş, Adana kebap ve tavuk şişin közlenmiş biber ve sumaklı soğanla görkemli sunumu.",
    chefNote: "Kuzu pirzola, kuzu şiş, Adana kebap ve tavuk şişin közlenmiş biber ve sumaklı soğanla görkemli sunumu.",
    portion: "450g"
  },
  {
    id: "kuzu-sis",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Diyarbakır Kuzu Şiş",
    subtitle: "Özel Terbiyeli Kuzu Eti • Lavaş Pide",
    frenchTitle: "Brochettes d'Agneau Grillées",
    price: "₺ 680",
    priceNum: 680,
    image: "/dishes/kuzu-sis.png",
    dishImage: "/dishes/kuzu-sis.png",
    calories: "670 kcal",
    prepTime: "15 dk",
    servingTemp: "80 °C",
    temperature: "80 °C",
    description: "Kuzu but etinden marine edilmiş şişler, köz domates ve tırnak pide yatağında servis edilir.",
    chefNote: "Kuzu but etinden marine edilmiş şişler, köz domates ve tırnak pide yatağında servis edilir.",
    portion: "300g"
  },
  {
    id: "adana-kebap",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Zırh Kıyma Kebabı (Adana)",
    subtitle: "Közlenmiş Sebzeler • Sumaklı Lavaş",
    frenchTitle: "Kebab d'Agneau Haché au Couteau",
    price: "₺ 580",
    priceNum: 580,
    image: "/dishes/adana-kebap.png",
    dishImage: "/dishes/adana-kebap.png",
    calories: "650 kcal",
    prepTime: "14 dk",
    servingTemp: "82 °C",
    temperature: "82 °C",
    description: "Satır zırhla çekilmiş kuzu eti ve kuyruk yağı, köz biber ve özel sumaklı soğan salatası ile sunulur.",
    chefNote: "Satır zırhla çekilmiş kuzu eti ve kuyruk yağı, köz biber ve özel sumaklı soğan salatası ile sunulur.",
    portion: "280g"
  },
  {
    id: "kusbasi-kasarli-pide",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Kuşbaşılı Kaşarlı Taş Fırın Pide",
    subtitle: "Odun Ateşinde • Doğal Tereyağı",
    frenchTitle: "Pide au Bœuf et Fromage Fondu",
    price: "₺ 380",
    priceNum: 380,
    image: "/dishes/kusbasi-kasarli-pide.png",
    dishImage: "/dishes/kusbasi-kasarli-pide.png",
    calories: "590 kcal",
    prepTime: "12 dk",
    servingTemp: "85 °C",
    temperature: "85 °C",
    description: "Taş tabanlı fırında meşe odununda pişen, çıtır kenarlı ve tereyağlı pide klasiği.",
    chefNote: "Taş tabanlı fırında meşe odununda pişen, çıtır kenarlı ve tereyağlı pide klasiği.",
    portion: "350g"
  },
  {
    id: "kavurmali-pide",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Kavurmalı Kaşarlı Pide",
    subtitle: "Beroş Özel Kavurması • Erimiş Kaşar",
    frenchTitle: "Pide à la Viande Confite",
    price: "₺ 420",
    priceNum: 420,
    image: "/dishes/kavurmali-pide.png",
    dishImage: "/dishes/kavurmali-pide.png",
    calories: "680 kcal",
    prepTime: "12 dk",
    servingTemp: "86 °C",
    temperature: "86 °C",
    description: "Özel dinlendirilmiş dana kavurma ve bol yöresel kaşarın çıtır taş fırın hamuruyla buluşması.",
    chefNote: "Özel dinlendirilmiş dana kavurma ve bol yöresel kaşarın çıtır taş fırın hamuruyla buluşması.",
    portion: "360g"
  },
  {
    id: "lahmacun",
    category: "Taş Fırın & Izgara",
    categorySlug: "tas-firin",
    name: "Çıtır Diyarbakır Lahmacun",
    subtitle: "İnce Hamur • Zırh Kıyması • Taze Yeşillik",
    frenchTitle: "Lahmacun Traditionnel Croustillant",
    price: "₺ 160",
    priceNum: 160,
    image: "/dishes/lahmacun.png",
    dishImage: "/dishes/lahmacun.png",
    calories: "280 kcal",
    prepTime: "8 dk",
    servingTemp: "90 °C",
    temperature: "90 °C",
    description: "Taş fırından taptaze çıkan, bol baharatlı zırh kıymalı incecik çıtır lahmacun.",
    chefNote: "Taş fırından taptaze çıkan, bol baharatlı zırh kıymalı incecik çıtır lahmacun.",
    portion: "1 Adet"
  },

  // 3. TAVUK ÇEŞİTLERİ
  {
    id: "tavuk-sac-tava",
    category: "Tavuk Çeşitleri",
    categorySlug: "tavuk",
    name: "Tavuk Sac Tava",
    subtitle: "Doğranmış But Eti • Köy Biberi ve Domates",
    frenchTitle: "Sauté de Poulet sur Plat Traditionnel",
    price: "₺ 440",
    priceNum: 440,
    image: "/dishes/tavuk-sac-tava.png",
    dishImage: "/dishes/tavuk-sac-tava.png",
    calories: "510 kcal",
    prepTime: "12 dk",
    servingTemp: "84 °C",
    temperature: "84 °C",
    description: "Özel baharatlarla harmanlanan taze tavuk but parçaları, sac tavada harlı ateşte lezzetlendirilir.",
    chefNote: "Özel baharatlarla harmanlanan taze tavuk but parçaları, sac tavada harlı ateşte lezzetlendirilir.",
    portion: "350g"
  },
  {
    id: "krema-mantarli-tavuk",
    category: "Tavuk Çeşitleri",
    categorySlug: "tavuk",
    name: "Krema Mantarlı Tavuk",
    subtitle: "Kültür Mantarı • Fesleğenli Sos • Fırın Patates",
    frenchTitle: "Poulet à la Crème et Champignons",
    price: "₺ 460",
    priceNum: 460,
    image: "/dishes/krema-mantarli-tavuk.png",
    dishImage: "/dishes/krema-mantarli-tavuk.png",
    calories: "560 kcal",
    prepTime: "15 dk",
    servingTemp: "78 °C",
    temperature: "78 °C",
    description: "Taze sotelenmiş mantarlar ve nefis krema sosu ile hazırlanan yumuşacık tavuk göğsü.",
    chefNote: "Taze sotelenmiş mantarlar ve nefis krema sosu ile hazırlanan yumuşacık tavuk göğsü.",
    portion: "340g"
  },
  {
    id: "korili-tavuk",
    category: "Tavuk Çeşitleri",
    categorySlug: "tavuk",
    name: "Körili Tavuk Sote",
    subtitle: "Özel Köri Harmanı • Renkli Biberler",
    frenchTitle: "Poulet au Curry Traditionnel",
    price: "₺ 450",
    priceNum: 450,
    image: "/dishes/korili-tavuk.png",
    dishImage: "/dishes/korili-tavuk.png",
    calories: "530 kcal",
    prepTime: "14 dk",
    servingTemp: "78 °C",
    temperature: "78 °C",
    description: "Özel köri sosu, krema ve mevsim sebzeleri ile tavada lezzetlenen enfes tavuk parçaları.",
    chefNote: "Özel köri sosu, krema ve mevsim sebzeleri ile tavada lezzetlenen enfes tavuk parçaları.",
    portion: "340g"
  },
  {
    id: "tavuk-sis",
    category: "Tavuk Çeşitleri",
    categorySlug: "tavuk",
    name: "Tavuk Şiş Izgara",
    subtitle: "Yoğurtlu Özel Terbiye • Köz Garnitür",
    frenchTitle: "Brochettes de Poulet Marinées",
    price: "₺ 420",
    priceNum: 420,
    image: "/dishes/tavuk-sis.png",
    dishImage: "/dishes/tavuk-sis.png",
    calories: "490 kcal",
    prepTime: "14 dk",
    servingTemp: "80 °C",
    temperature: "80 °C",
    description: "Özel marinasyonla yumuşatılmış tavuk göğüs şişleri, tırnak pide üzerinde servis edilir.",
    chefNote: "Özel marinasyonla yumuşatılmış tavuk göğüs şişleri, tırnak pide üzerinde servis edilir.",
    portion: "300g"
  },

  // 4. ÇORBA & MEZELER
  {
    id: "kelle-paca",
    category: "Çorba & Mezeler",
    categorySlug: "corba-meze",
    name: "Geleneksel Kelle Paça",
    subtitle: "Sarımsaklı Sos • İlikli Kemik Suyu",
    frenchTitle: "Soupe de Pieds et Tête d'Agneau",
    price: "₺ 260",
    priceNum: 260,
    image: "/dishes/kelle-paca.png",
    dishImage: "/dishes/kelle-paca.png",
    calories: "450 kcal",
    prepTime: "6 dk",
    servingTemp: "90 °C",
    temperature: "90 °C",
    description: "Saatlerce kaynayan kemik suyu, sarımsak ve tereyağlı biber sosuyla tam bir şifa kaynağı.",
    chefNote: "Saatlerce kaynayan kemik suyu, sarımsak ve tereyağlı biber sosuyla tam bir şifa kaynağı.",
    portion: "350ml"
  },
  {
    id: "mercimek-corbasi",
    category: "Çorba & Mezeler",
    categorySlug: "corba-meze",
    name: "Süzme Mercimek Çorbası",
    subtitle: "Tereyağlı Nane Sosu • Çıtır Ekmek",
    frenchTitle: "Soupe de Lentilles Veloutée",
    price: "₺ 140",
    priceNum: 140,
    image: "/dishes/mercimek-corbasi.png",
    dishImage: "/dishes/mercimek-corbasi.png",
    calories: "220 kcal",
    prepTime: "5 dk",
    servingTemp: "85 °C",
    temperature: "85 °C",
    description: "Taze tereyağı ve nane gezdirilerek servis edilen ipeksi süzme mercimek çorbası.",
    chefNote: "Taze tereyağı ve nane gezdirilerek servis edilen ipeksi süzme mercimek çorbası.",
    portion: "300ml"
  },
  {
    id: "icli-kofte",
    category: "Çorba & Mezeler",
    categorySlug: "corba-meze",
    name: "Diyarbakır Haşlama İçli Köfte (2 Adet)",
    subtitle: "Cevizli Kıyma Harcı • İnce Bulgur Kabuğu",
    frenchTitle: "Boulettes de Boulgour Farcies",
    price: "₺ 190",
    priceNum: 190,
    image: "/dishes/icli-kofte.png",
    dishImage: "/dishes/icli-kofte.png",
    calories: "380 kcal",
    prepTime: "8 dk",
    servingTemp: "80 °C",
    temperature: "80 °C",
    description: "İncecik çekilmiş bulgur hamuru içerisine cevizli özel kuzu kıyması konularak haşlanmış iki adet içli köfte.",
    chefNote: "İncecik çekilmiş bulgur hamuru içerisine cevizli özel kuzu kıyması konularak haşlanmış iki adet içli köfte.",
    portion: "2 Adet"
  },
  {
    id: "meze-tabagi",
    category: "Çorba & Mezeler",
    categorySlug: "corba-meze",
    name: "Beroş Meze Tabağı (5 Çeşit)",
    subtitle: "Humus • Babagannuş • Haydari • Ezme • Şakşuka",
    frenchTitle: "Sélection de Mezzés Maison",
    price: "₺ 340",
    priceNum: 340,
    image: "/dishes/meze-tabagi.png",
    dishImage: "/dishes/meze-tabagi.png",
    calories: "410 kcal",
    prepTime: "6 dk",
    servingTemp: "14 °C",
    temperature: "14 °C",
    description: "Taze sızma zeytinyağı ile günlük hazırlanan 5 çeşit geleneksel meze seçkisi.",
    chefNote: "Taze sızma zeytinyağı ile günlük hazırlanan 5 çeşit geleneksel meze seçkisi.",
    portion: "350g"
  },
  {
    id: "kuru-dolma",
    category: "Çorba & Mezeler",
    categorySlug: "corba-meze",
    name: "Kuru Dolma Tabağı",
    subtitle: "Sumak Ekşili • Kuru Patlıcan ve Biber",
    frenchTitle: "Légumes Séchés Farcis à la Viande",
    price: "₺ 280",
    priceNum: 280,
    image: "/dishes/kuru-dolma.png",
    dishImage: "/dishes/kuru-dolma.png",
    calories: "430 kcal",
    prepTime: "8 dk",
    servingTemp: "75 °C",
    temperature: "75 °C",
    description: "Güneşte kurutulmuş patlıcan ve biberlerin sumak ekşili kuzu kıymalı harçla doldurulup demlenmesi.",
    chefNote: "Güneşte kurutulmuş patlıcan ve biberlerin sumak ekşili kuzu kıymalı harçla doldurulup demlenmesi.",
    portion: "4 Adet"
  },

  // 5. GURME SALATALAR
  {
    id: "bostana-salatasi",
    category: "Gurme Salatalar",
    categorySlug: "salata",
    name: "Diyarbakır Bostana Salatası",
    subtitle: "İnce Kıyım Sebzeler • Nar Ekşisi ve Ceviz",
    frenchTitle: "Salade Bostana aux Noix et Grenade",
    price: "₺ 190",
    priceNum: 190,
    image: "/dishes/bostana-salatasi.png",
    dishImage: "/dishes/bostana-salatasi.png",
    calories: "180 kcal",
    prepTime: "6 dk",
    servingTemp: "12 °C",
    temperature: "12 °C",
    description: "Buz gibi domates, salatalık, taze nane, hakiki nar ekşisi ve bol ceviz parçaları.",
    chefNote: "Buz gibi domates, salatalık, taze nane, hakiki nar ekşisi ve bol ceviz parçaları.",
    portion: "250g"
  },
  {
    id: "gavurdagi-salatasi",
    category: "Gurme Salatalar",
    categorySlug: "salata",
    name: "Köz Patlıcanlı Gavurdağı Salatası",
    subtitle: "Köz Patlıcan • Çeri Domates • Sızma Zeytinyağı",
    frenchTitle: "Salade Gavurdağı aux Aubergines Grillées",
    price: "₺ 220",
    priceNum: 220,
    image: "/dishes/gavurdagi-salatasi.png",
    dishImage: "/dishes/gavurdagi-salatasi.png",
    calories: "210 kcal",
    prepTime: "6 dk",
    servingTemp: "12 °C",
    temperature: "12 °C",
    description: "Közlenmiş patlıcan dokusu ve ceviz çıtırlığıyla kebapların yanına mükemmel eşlikçi.",
    chefNote: "Közlenmiş patlıcan dokusu ve ceviz çıtırlığıyla kebapların yanına mükemmel eşlikçi.",
    portion: "280g"
  },
  {
    id: "hellim-salata",
    category: "Gurme Salatalar",
    categorySlug: "salata",
    name: "Izgara Hellim Peynirli Salata",
    subtitle: "Akdeniz Yeşillikleri • Balzamik Sos",
    frenchTitle: "Salade au Halloumi Grillé",
    price: "₺ 260",
    priceNum: 260,
    image: "/dishes/hellim-salata.png",
    dishImage: "/dishes/hellim-salata.png",
    calories: "340 kcal",
    prepTime: "8 dk",
    servingTemp: "16 °C",
    temperature: "16 °C",
    description: "Izgarada kızarmış sıcak hellim dilimleri ve taptaze Akdeniz yeşillikleri.",
    chefNote: "Izgarada kızarmış sıcak hellim dilimleri ve taptaze Akdeniz yeşillikleri.",
    portion: "300g"
  },

  // 6. TATLILAR
  {
    id: "fistikli-kadayif",
    category: "Tatlılar",
    categorySlug: "tatlilar",
    name: "Diyarbakır Fıstıklı Burma Kadayıf",
    subtitle: "Sadeyağ ile Çıtır Kızartma • Bol Boz Fıstık",
    frenchTitle: "Kadaif Roulé aux Pistaches de Sur",
    price: "₺ 430",
    priceNum: 430,
    image: "/dishes/fistikli-kadayif.png",
    dishImage: "/dishes/fistikli-kadayif.png",
    calories: "520 kcal",
    prepTime: "6 dk",
    servingTemp: "65 °C",
    temperature: "65 °C",
    description: "Hakiki Urfa sadeyağı ile çıtır çıtır kızartılmış, bol fıstıklı sıcak Diyarbakır klasiği.",
    chefNote: "Hakiki Urfa sadeyağı ile çıtır çıtır kızartılmış, bol fıstıklı sıcak Diyarbakır klasiği.",
    portion: "190g"
  },
  {
    id: "fistikli-baklava",
    category: "Tatlılar",
    categorySlug: "tatlilar",
    name: "Özel Antep Fıstıklı Baklava",
    subtitle: "40 Kat İnce Yufka • Birinci Sınıf Antep Fıstığı",
    frenchTitle: "Baklava Royal aux Pistaches",
    price: "₺ 450",
    priceNum: 450,
    image: "/dishes/fistikli-baklava.png",
    dishImage: "/dishes/fistikli-baklava.png",
    calories: "540 kcal",
    prepTime: "5 dk",
    servingTemp: "22 °C",
    temperature: "22 °C",
    description: "Özel sadeyağlı şerbeti ve yoğun yeşil fıstığıyla damağı şenlendiren 4 dilim gurme baklava.",
    chefNote: "Özel sadeyağlı şerbeti ve yoğun yeşil fıstığıyla damağı şenlendiren 4 dilim gurme baklava.",
    portion: "180g"
  },
  {
    id: "kunefe",
    category: "Tatlılar",
    categorySlug: "tatlilar",
    name: "Hatay Usulü Sıcak Künefe",
    subtitle: "Özel Tuzsuz Peynir • Manda Kaymağı ile",
    frenchTitle: "Künefe Chaud au Fromage Fondant",
    price: "₺ 380",
    priceNum: 380,
    image: "/dishes/kunefe.png",
    dishImage: "/dishes/kunefe.png",
    calories: "560 kcal",
    prepTime: "10 dk",
    servingTemp: "75 °C",
    temperature: "75 °C",
    description: "Bakır sahanda ocakta taze pişen, uzayan sünme peynirli sıcacık künefe.",
    chefNote: "Bakır sahanda ocakta taze pişen, uzayan sünme peynirli sıcacık künefe.",
    portion: "200g"
  },
  {
    id: "firin-sutlac",
    category: "Tatlılar",
    categorySlug: "tatlilar",
    name: "Geleneksel Fırın Sütlaç",
    subtitle: "Karamelize Üst Yüzey • Dövülmüş Fındık",
    frenchTitle: "Riz au Lait Caramélisé au Four",
    price: "₺ 190",
    priceNum: 190,
    image: "/dishes/firin-sutlac.png",
    dishImage: "/dishes/firin-sutlac.png",
    calories: "320 kcal",
    prepTime: "4 dk",
    servingTemp: "10 °C",
    temperature: "10 °C",
    description: "Doğal manda ve inek sütüyle hazırlanan, fırında nar gibi kızartılmış enfes sütlaç.",
    chefNote: "Doğal manda ve inek sütüyle hazırlanan, fırında nar gibi kızartılmış enfes sütlaç.",
    portion: "220g"
  },

  // 7. İÇECEKLER & SPESİYALLER
  {
    id: "acik-ayran",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Hakiki Yayık Açık Ayran",
    subtitle: "Bol Köpüklü • Bakır Maşrapada Soğuk Sunum",
    frenchTitle: "Ayran Traditionnel Moussant",
    price: "₺ 75",
    priceNum: 75,
    image: "/dishes/acik-ayran.png",
    dishImage: "/dishes/acik-ayran.png",
    calories: "90 kcal",
    prepTime: "2 dk",
    servingTemp: "4 °C",
    temperature: "4 °C",
    description: "Köy yoğurdundan geleneksel yayıkta hazırlanan, buz gibi bol köpüklü açık ayran.",
    chefNote: "Köy yoğurdundan geleneksel yayıkta hazırlanan, buz gibi bol köpüklü açık ayran.",
    portion: "300ml"
  },
  {
    id: "meyan-serbeti",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Diyarbakır Meyan Kökü Şerbeti",
    subtitle: "Sur Klasiği • Şifalı ve Ferahlatıcı",
    frenchTitle: "Sirop de Réglisse Traditionnel",
    price: "₺ 90",
    priceNum: 90,
    image: "/dishes/meyan-serbeti.png",
    dishImage: "/dishes/meyan-serbeti.png",
    calories: "65 kcal",
    prepTime: "2 dk",
    servingTemp: "4 °C",
    temperature: "4 °C",
    description: "Tarihi Suriçi ustalarının özel demleme reçetesiyle hazırlanan buz gibi meyan kökü şerbeti.",
    chefNote: "Tarihi Suriçi ustalarının özel demleme reçetesiyle hazırlanan buz gibi meyan kökü şerbeti.",
    portion: "250ml"
  },
  {
    id: "reyhan-serbeti",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Osmanlı Reyhan Şerbeti",
    subtitle: "Taze Mor Reyhan • Karanfil ve Tarçın",
    frenchTitle: "Élixir Impérial au Basilic Pourpre",
    price: "₺ 90",
    priceNum: 90,
    image: "/dishes/reyhan-serbeti.png",
    dishImage: "/dishes/reyhan-serbeti.png",
    calories: "85 kcal",
    prepTime: "2 dk",
    servingTemp: "4 °C",
    temperature: "4 °C",
    description: "Mor reyhan yaprakları, karanfil ve tarçınla demlenen serinletici aromatik saray şerbeti.",
    chefNote: "Mor reyhan yaprakları, karanfil ve tarçınla demlenen serinletici aromatik saray şerbeti.",
    portion: "250ml"
  },
  {
    id: "turk-kahvesi",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Kumda Pişmiş Türk Kahvesi",
    subtitle: "Ağır Közde Köpük • Çifte Kavrulmuş Lokum",
    frenchTitle: "Café Turc Cuit sur Sable Chaud",
    price: "₺ 95",
    priceNum: 95,
    image: "/dishes/turk-kahvesi.png",
    dishImage: "/dishes/turk-kahvesi.png",
    calories: "15 kcal",
    prepTime: "5 dk",
    servingTemp: "85 °C",
    temperature: "85 °C",
    description: "Sıcak kumda yavaş yavaş kabartılan yoğun kıvamlı ve bol köpüklü geleneksel Türk kahvesi.",
    chefNote: "Sıcak kumda yavaş yavaş kabartılan yoğun kıvamlı ve bol köpüklü geleneksel Türk kahvesi.",
    portion: "1 Fincan"
  },
  {
    id: "menengic-kahvesi",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Süvari Menengiç Kahvesi",
    subtitle: "Yabani Fıstık Özü • Taze Sütle Demleme",
    frenchTitle: "Café de Pistache Sauvage au Lait",
    price: "₺ 110",
    priceNum: 110,
    image: "/dishes/menengic-kahvesi.png",
    dishImage: "/dishes/menengic-kahvesi.png",
    calories: "120 kcal",
    prepTime: "6 dk",
    servingTemp: "82 °C",
    temperature: "82 °C",
    description: "Doğal yabani antep fıstığı (çitlembik) tanelerinin süt ile pişirilmesiyle yapılan kafeinsiz şifa kahvesi.",
    chefNote: "Doğal yabani antep fıstığı (çitlembik) tanelerinin süt ile pişirilmesiyle yapılan kafeinsiz şifa kahvesi.",
    portion: "1 Fincan"
  },
  {
    id: "portakal-suyu",
    category: "İçecekler & Spesiyaller",
    categorySlug: "icecekler",
    name: "Taze Sıkma Portakal Suyu",
    subtitle: "%100 Doğal C Vitamini Deposu",
    frenchTitle: "Jus d'Orange Frais Pressé",
    price: "₺ 120",
    priceNum: 120,
    image: "/dishes/portakal-suyu.png",
    dishImage: "/dishes/portakal-suyu.png",
    calories: "110 kcal",
    prepTime: "3 dk",
    servingTemp: "5 °C",
    temperature: "5 °C",
    description: "Siparişiniz üzerine anında sıkılan katkısız, buz gibi taze Akdeniz portakal suyu.",
    chefNote: "Siparişiniz üzerine anında sıkılan katkısız, buz gibi taze Akdeniz portakal suyu.",
    portion: "300ml"
  }
];`;

// Replace MenuItem to DISHES end
const startIndex = content.indexOf("interface MenuItem {");
const endIndex = content.indexOf("const FACADE_CENTER = ");
if (startIndex === -1 || endIndex === -1) {
  throw new Error("Could not find delimiters for catalog replacement");
}

content = content.slice(0, startIndex) + newCatalogBlock + "\n\n" + content.slice(endIndex);

// 2. Replace Center Stage with Doğal Restoran Masası Sunumu (Step 3)
const stageStartMarker = "{/* ==================== MERKEZ: MASİF AHŞAP MASAÜSTÜ SAHNESİ (6 cols) ==================== */}";
const stageEndMarker = "{/* Sağ Sütun: Altın Kakma Fiyat & Sipariş / AR Butonları (Stacking Context Isolation) */}";

const stageStartIndex = content.indexOf(stageStartMarker);
const stageEndIndex = content.indexOf(stageEndMarker);

if (stageStartIndex === -1 || stageEndIndex === -1) {
  throw new Error("Could not find delimiters for center stage replacement");
}

const newStageBlock = `{/* ==================== DOĞAL RESTORAN MASASI SUNUMU (6 cols) ==================== */}
            <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[520px] flex items-center justify-center order-1 lg:order-2 select-none">
              
              {/* MASİF CEVİZ MASAÜSTÜ ZEMİNİ & SICAK ORTAM IŞIĞI */}
              <div className="absolute inset-0 pointer-events-none -z-20 flex items-center justify-center">
                {/* Tavandan Vuran Yumuşak Sıcak Avize Işığı */}
                <div className="w-[580px] h-[340px] rounded-full bg-gradient-to-b from-amber-500/12 via-amber-950/5 to-transparent blur-3xl" />
                
                {/* Doğal Ahşap Masa Yüzeyi Dokusu */}
                <div 
                  className="absolute bottom-0 w-[95%] h-[240px] rounded-t-[50px] opacity-40 bg-cover bg-center border-t border-amber-900/30"
                  style={{
                    backgroundImage: "radial-gradient(ellipse at 50% 10%, rgba(212,175,55,0.15), transparent 70%), url('/textures/wood-grain.jpg')",
                    boxShadow: "inset 0 4px 30px rgba(0,0,0,0.8)"
                  }}
                />
              </div>

              {/* TABAK: DOĞAL MASAÜSTÜ VE AKICI GEÇİŞ (SLIDE/SPRING) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={filteredDishes[activeDishIndex]?.id || "dish"}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) handleNextDish();
                    else if (info.offset.x > 40) handlePrevDish();
                  }}
                  className="relative z-10 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto"
                >
                  {/* Masaya Düşen Gerçekçi Temas Gölgesi (Contact Shadow) */}
                  <div className="absolute bottom-4 sm:bottom-6 w-[280px] sm:w-[380px] h-[40px] rounded-full bg-black/85 blur-xl pointer-events-none -z-10" />

                  {/* Tabak Görseli - Yuvarlak maske veya kartpostal yok, doğrudan tabak */}
                  <div className="relative w-[300px] sm:w-[400px] h-[280px] sm:h-[360px] flex items-center justify-center">
                    <img
                      src={filteredDishes[activeDishIndex]?.dishImage || filteredDishes[activeDishIndex]?.image || \`/dishes/\${filteredDishes[activeDishIndex]?.id}.png\`}
                      alt={filteredDishes[activeDishIndex]?.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_22px_28px_rgba(0,0,0,0.85)] brightness-105 contrast-105 pointer-events-none"
                    />

                    {/* Tükendi Rozeti */}
                    {isDishOutOfStock(filteredDishes[activeDishIndex]?.id) && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center pointer-events-none z-30">
                        <span className="px-3.5 py-1 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 font-mono text-xs font-bold tracking-widest uppercase shadow-lg">
                          {t.tukendi}
                        </span>
                      </div>
                    )}

                    {/* Canlı Buhar Efekti */}
                    {!isDishOutOfStock(filteredDishes[activeDishIndex]?.id) && (
                      <SteamEffect />
                    )}
                  </div>

                  {/* Tabağın Altındaki Doğal İsim & Fiyat Şeridi */}
                  <div className="mt-3 px-5 py-2 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-white font-mono text-xs tracking-wider flex items-center gap-3 shadow-2xl">
                    <span className="font-serif text-sm tracking-wide text-white">
                      {filteredDishes[activeDishIndex]?.name}
                    </span>
                    <span className="text-[#d4af37] font-bold">
                      • {filteredDishes[activeDishIndex]?.price}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Sol / Sağ Doğal Navigasyon Butonları */}
              <button
                type="button"
                onClick={() => setActiveDishIndex((prev) => (prev > 0 ? prev - 1 : filteredDishes.length - 1))}
                className="absolute left-2 sm:left-4 z-30 p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-[#d4af37] transition-all active:scale-95 cursor-pointer pointer-events-auto"
                title="Önceki Lezzet"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setActiveDishIndex((prev) => (prev < filteredDishes.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 z-30 p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-[#d4af37] transition-all active:scale-95 cursor-pointer pointer-events-auto"
                title="Sonraki Lezzet"
              >
                ›
              </button>
            </div>\n\n            `;

content = content.slice(0, stageStartIndex) + newStageBlock + content.slice(stageEndIndex);

fs.writeFileSync(pagePath, content, "utf8");
console.log("Successfully updated app/page.tsx with 37 dishes and natural wooden tabletop stage!");

