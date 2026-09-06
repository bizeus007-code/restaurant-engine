"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react";
import {
  Plus,
  Bell,
  Utensils,
  Star,
  Wifi,
  Minus,
  Check,
  ShoppingBag,
  CreditCard,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  ArrowUp,
  Box,
  Menu,
  Flame,
  Sparkles,
  Layers,
  MapPin,
} from "lucide-react";
import SteamEffect from "@/components/steam-effect";
import { ArSpatialViewer, type Dish } from "@/components/ar-spatial-viewer";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GoldCorner({ className }: { className: string }) {
  return (
    <svg
      className={`w-4 h-4 text-[#d4af37]/60 pointer-events-none absolute ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 12V4a2 2 0 0 1 2-2h8M2 2l10 10" />
    </svg>
  );
}

const RESTAURANT_CONFIG = {
  name: "Beroş Restaurant",
  phone: "05386976353",
  whatsappNumber: "905386976353",
  googleMapsReviewUrl: "https://share.google/2P0mhAwLo4XOEs0uQ",
  instagramUrl: "https://instagram.com/berosrestoran",
  mapsDirectionUrl: "https://maps.google.com/?q=Bero%C5%9F+Restaurant+Sur+Diyarbak%C4%B1r",
  wifiName: "Beros_Misafir",
  wifiPass: "beros1982",
  address: "Camii Nebi Mah. İnönü Cad. No: 12 Sur / Diyarbakır"
};

interface MenuItem {
  id: string;
  category: string;
  categorySlug: "yoresel" | "tas-firin" | "sac-tava" | "tavuk" | "ara-sicak" | "tatli" | "icecek";
  name: string;
  subtitle: string;
  frenchTitle?: string;
  price: string;
  priceNum: number;
  calories: string;
  portion: string;
  prepTime: string;
  temperature: string;
  chefNote: string;
  dishImage: string;
  isTransparentPng?: boolean;
  isBluePlate?: boolean;
  courseNumber?: string;
  meatIngredient?: string;
  garnishIngredient?: string;
}

const CATEGORIES = [
  { slug: "yoresel", label: "YÖRESEL LEZZETLER" },
  { slug: "tas-firin", label: "TAŞ FIRIN & PİDE" },
  { slug: "sac-tava", label: "SAC TAVA" },
  { slug: "tavuk", label: "TAVUK ÇEŞİTLERİ" },
  { slug: "ara-sicak", label: "ARA SICAK & MEZE" },
  { slug: "tatli", label: "TATLILAR" },
  { slug: "icecek", label: "İÇECEKLER" },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]["slug"];

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
    yoresel: "YÖRESEL LEZZETLER",
    "tas-firin": "TAŞ FIRIN & PİDE",
    "sac-tava": "SAC TAVA",
    tavuk: "TAVUK ÇEŞİTLERİ",
    "ara-sicak": "ARA SICAK & MEZE",
    tatli: "TATLILAR",
    icecek: "İÇECEKLER",
  },
  EN: {
    yoresel: "TRADITIONAL SPECIALS",
    "tas-firin": "STONE OVEN & PIDA",
    "sac-tava": "IRON SHEET PAN",
    tavuk: "CHICKEN DELICACIES",
    "ara-sicak": "HOT STARTERS & MEZZE",
    tatli: "DESSERTS",
    icecek: "BEVERAGES",
  },
  AR: {
    yoresel: "أطباق تقليدية",
    "tas-firin": "فرن الحجر والفطائر",
    "sac-tava": "صاج مقلي",
    tavuk: "أطباق الدجاج",
    "ara-sicak": "مقبلات ومقبلات ساخنة",
    tatli: "حلويات",
    icecek: "مشروبات",
  },
};

const DISHES: MenuItem[] = [
  {
    "id": "special-kuzu-sirt",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Beroş Special Kuzu Sırt",
    "subtitle": "Mavi Sırlı Çini Tabakta • Meşe Odununda Pişirim • Dağ Kekiği",
    "frenchTitle": "Selle d'Agneau Rôtie au Four Traditionnel",
    "price": "₺ 725",
    "priceNum": 725,
    "calories": "690 kcal",
    "portion": "320g / Tek Kişilik",
    "prepTime": "15 dk",
    "temperature": "74°C",
    "chefNote": "Karacadağ meralarında beslenen körpe kuzunun sırt eti, taş fırında meşe közünde ağır ağır pişirilir. Sur kültürünün kobalt mavisi çini tabağında köz köy biberiyle servis edilir.",
    "dishImage": "/dish-blue-plate.png",
    "isTransparentPng": true,
    "isBluePlate": true,
    "courseNumber": "01",
    "meatIngredient": "Körpe Kuzu Sırt",
    "garnishIngredient": "Köz Biber & Kekik"
  },
  {
    "id": "sur-kuzu-kol-dolmasi",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Sur Kuzu Kol Dolması (2 Kişilik)",
    "subtitle": "Tarihi Konak Reçetesi • Bademli Kuş Üzümlü İç Pilav • 5 Saat Fırınlama",
    "frenchTitle": "Épaule d'Agneau Farcie à l'Ancienne",
    "price": "₺ 1.300",
    "priceNum": 1300,
    "calories": "920 kcal",
    "portion": "650g / Paylaşımlı",
    "prepTime": "20 dk",
    "temperature": "70°C",
    "chefNote": "Diyarbakır konaklarının asırlık baş tacı. Kuzu kolu özenle dikilerek içi kavrulmuş yerli badem, kuş üzümü ve taze Sur reyhanlı pirinçle doldurulur.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655062_48624_20230508013506.jpg",
    "courseNumber": "02",
    "meatIngredient": "Fırın Kuzu Kol",
    "garnishIngredient": "Bademli İç Pilav"
  },
  {
    "id": "ayvali-kavurma",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Diyarbakır Ayvalı Kavurma",
    "subtitle": "Karamelize Ayva Dilimleri • Bakır Sahanda Demleme",
    "frenchTitle": "Sauté d'Agneau Traditionnel aux Coings",
    "price": "₺ 725",
    "priceNum": 725,
    "calories": "610 kcal",
    "portion": "300g",
    "prepTime": "14 dk",
    "temperature": "76°C",
    "chefNote": "Kuzu eti ve kış ayvalarının tatlı-ekşi dengesiyle bakır sahanda meşe közünde demlenen Diyarbakır saray mutfağı klasiği.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655037_48624_20230508013654.jpg",
    "courseNumber": "03",
    "meatIngredient": "Kavrulmuş Kuzu",
    "garnishIngredient": "Karamelize Ayva"
  },
  {
    "id": "firinda-kuzu-incik",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Fırında Kuzu İncik",
    "subtitle": "Ağır Ateşte Kendi İlik Suyu ve Kök Sebzelerle Fırınlama",
    "frenchTitle": "Souris d'Agneau Confite au Four de Pierre",
    "price": "₺ 680",
    "priceNum": 680,
    "calories": "680 kcal",
    "portion": "380g",
    "prepTime": "15 dk",
    "temperature": "75°C",
    "chefNote": "Kuzu inciği taş fırında kendi ilik suyu ve taze kök sebzelerle 4 saat ağır ateşte lokum kıvamına getirilir.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655041_48624_20230508013618.jpg",
    "courseNumber": "04",
    "meatIngredient": "Kemikli İncik",
    "garnishIngredient": "Kök Sebzeler"
  },
  {
    "id": "kekikli-kuzu-budu",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Kekikli Kuzu Budu",
    "subtitle": "Karacadağ Dağ Kekiği • Meşe Fırınlama",
    "frenchTitle": "Gigot d'Agneau Rôti au Thym Sauvage",
    "price": "₺ 670",
    "priceNum": 670,
    "calories": "660 kcal",
    "portion": "350g",
    "prepTime": "15 dk",
    "temperature": "74°C",
    "chefNote": "Dağ kekiği ile marine edilmiş körpe kuzu but eti, tandır fırınında dinlendirilerek servis edilir.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655042_48624_20230508013747.jpg",
    "courseNumber": "05",
    "meatIngredient": "Tandır Kuzu But",
    "garnishIngredient": "Karacadağ Kekiği"
  },
  {
    "id": "kuzu-gerdan",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Kuzu Gerdan",
    "subtitle": "Kemik Suyunda Ağır Demleme • Şefin İmzası",
    "frenchTitle": "Collet d'Agneau Braisé au Bouillon d'Os",
    "price": "₺ 670",
    "priceNum": 670,
    "calories": "640 kcal",
    "portion": "340g",
    "prepTime": "12 dk",
    "temperature": "75°C",
    "chefNote": "Lif lif ayrılan kuzu gerdan eti, geleneksel baharat harmanı ile bakır tencerede demlendirilir.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655043_48624_20230508013815.jpg",
    "courseNumber": "06",
    "meatIngredient": "Demleme Gerdan",
    "garnishIngredient": "Şifalı Et Suyu"
  },
  {
    "id": "kuzu-greaten",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Kuzu Greaten",
    "subtitle": "Özel Fırın Sosu • Yöresel Karacadağ Peyniri",
    "frenchTitle": "Gratin d'Agneau au Fromage de Karacadağ",
    "price": "₺ 680",
    "priceNum": 680,
    "calories": "700 kcal",
    "portion": "330g",
    "prepTime": "15 dk",
    "temperature": "78°C",
    "chefNote": "Fırınlanmış kuzu eti dilimleri üzerine eritilmiş yöresel Karacadağ peyniri dokunuşu.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655047_48624_20230508013829.jpg",
    "courseNumber": "07",
    "meatIngredient": "Fırın Kuzu Eti",
    "garnishIngredient": "Eritme Peynir"
  },
  {
    "id": "kuzu-haslama",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Kuzu Haşlama",
    "subtitle": "Taze Kök Sebzeler • Şifalı İlikli Et Suyu",
    "frenchTitle": "Pot-au-Feu d'Agneau aux Légumes de Saison",
    "price": "₺ 670",
    "priceNum": 670,
    "calories": "580 kcal",
    "portion": "350g",
    "prepTime": "10 dk",
    "temperature": "80°C",
    "chefNote": "Taze patates, havuç ve arpacık soğan ile kısık ateşte demlenen asırlık konak reçetesi.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655048_48624_20230508013851.jpg",
    "courseNumber": "08",
    "meatIngredient": "İlikli Kuzu Eti",
    "garnishIngredient": "Taze Patates & Havuç"
  },
  {
    "id": "firin-agzi",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Fırın Ağzı",
    "subtitle": "Tepsi Kebabı Usulü • Sarımsaklı Köy Biberi Harcı",
    "frenchTitle": "Viande d'Agneau au Four de Braise",
    "price": "₺ 680",
    "priceNum": 680,
    "calories": "720 kcal",
    "portion": "360g",
    "prepTime": "16 dk",
    "temperature": "82°C",
    "chefNote": "Kuzu pirzola ve kaburga parçalarının sarımsak ve biberle tepside 450 derece fırın ağzında mühürlenmesi.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655059_48624_20230508014011.jpg",
    "courseNumber": "09",
    "meatIngredient": "Pirzola & Kaburga",
    "garnishIngredient": "Sarımsaklı Köy Biberi"
  },
  {
    "id": "diyarbakir-kavurma",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Diyarbakır Kavurma",
    "subtitle": "Kendi Yağında 6 Saat Kısık Ateş Kavurması",
    "frenchTitle": "Confit d'Agneau Traditionnel de Diyarbakır",
    "price": "₺ 660",
    "priceNum": 660,
    "calories": "690 kcal",
    "portion": "300g",
    "prepTime": "10 dk",
    "temperature": "76°C",
    "chefNote": "Katkısız, sadece kuzu eti ve kaya tuzu ile bakır kazanda pişirilen geleneksel Diyarbakır lezzeti.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655064_48624_20230511101208.jpg",
    "courseNumber": "10",
    "meatIngredient": "Kazan Kavurması",
    "garnishIngredient": "Kaya Tuzu & Biber"
  },
  {
    "id": "patlican-kuzu-incik",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Patlıcan Yatağında Kuzu İncik",
    "subtitle": "Köz Patlıcan Söğürmesi • Fırın Kuzu İncik",
    "frenchTitle": "Souris d'Agneau sur Lit d'Aubergines Fumées",
    "price": "₺ 670",
    "priceNum": 670,
    "calories": "670 kcal",
    "portion": "380g",
    "prepTime": "15 dk",
    "temperature": "74°C",
    "chefNote": "Sur bazaltında közlenmiş patlıcan yatağında lokum kıvamında kuzu incik sunumu.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655053_48624_20230508013718.jpg",
    "courseNumber": "11",
    "meatIngredient": "Kuzu İncik",
    "garnishIngredient": "Köz Patlıcan"
  },
  {
    "id": "firinda-gerdan",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Fırında Gerdan",
    "subtitle": "Meşe Fırınında Ağır Ateş Gerdan Kebabı",
    "frenchTitle": "Collet d'Agneau Rôti au Four à Bois",
    "price": "₺ 670",
    "priceNum": 670,
    "calories": "650 kcal",
    "portion": "350g",
    "prepTime": "15 dk",
    "temperature": "75°C",
    "chefNote": "Kuzu gerdanının taş fırında nar gibi kızartılarak suyunu içine hapsetmesiyle hazırlanır.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655054_48624_20230508013559.jpg",
    "courseNumber": "12",
    "meatIngredient": "Kızarmış Gerdan",
    "garnishIngredient": "Fırın Domatesi"
  },
  {
    "id": "firin-guvec",
    "category": "YÖRESEL LEZZETLER",
    "categorySlug": "yoresel",
    "name": "Fırın Güveç",
    "subtitle": "Toprak Kapta Mevsim Sebzeleri & Kuzu Eti",
    "frenchTitle": "Ragoût d'Agneau en Terrine d'Argile",
    "price": "₺ 480",
    "priceNum": 480,
    "calories": "590 kcal",
    "portion": "320g",
    "prepTime": "14 dk",
    "temperature": "78°C",
    "chefNote": "Toprak güveçte kuzu kuşbaşı, patlıcan, domates ve sarımsakla ağır ateşte demlenen eşsiz lezzet.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655063_48624_20230508013450.jpg",
    "courseNumber": "13",
    "meatIngredient": "Kuşbaşı Kuzu",
    "garnishIngredient": "Toprak Kap Sebzeleri"
  },
  {
    "id": "kusbasi-kasarli-pide",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "Kuşbaşı Kaşarlı Pide",
    "subtitle": "Taş Fırın Meşe Ateşi • Karacadağ Kaşarı • Kuzu Kuşbaşı",
    "frenchTitle": "Pide Artisanale à la Viande et Fromage",
    "price": "₺ 595",
    "priceNum": 595,
    "calories": "780 kcal",
    "portion": "350g",
    "prepTime": "12 dk",
    "temperature": "85°C",
    "chefNote": "Meşe odunuyla ısınan taş fırından çıkan çıtır hamur, bol kuzu kuşbaşı ve uzayan Karacadağ kaşarı.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4375359_48624_20231109122811.jpg",
    "courseNumber": "01",
    "meatIngredient": "Kuzu Kuşbaşı",
    "garnishIngredient": "Karacadağ Kaşarı"
  },
  {
    "id": "kusbasi-pide",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "Kuşbaşı Pide",
    "subtitle": "Hakiki Sur Fırın Hamuru • Marine Kuzu Kuşbaşı",
    "frenchTitle": "Pide Traditionnelle aux Dés d'Agneau",
    "price": "₺ 570",
    "priceNum": 570,
    "calories": "720 kcal",
    "portion": "340g",
    "prepTime": "12 dk",
    "temperature": "85°C",
    "chefNote": "İncecik açılmış çıtır konak hamuru üzerinde domates ve biberle marine edilmiş taze kuşbaşı eti.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4375357_48624_20231109122733.jpg",
    "courseNumber": "02",
    "meatIngredient": "Marine Kuşbaşı",
    "garnishIngredient": "Köy Biberi"
  },
  {
    "id": "kiymali-yumurtali-pide",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "Kıymalı Yumurtalı Pide",
    "subtitle": "Zırh Kıyma Harcı • Köy Yumurtası • Taş Fırın",
    "frenchTitle": "Pide à la Viande Hachée et Œuf Fermier",
    "price": "₺ 535",
    "priceNum": 535,
    "calories": "760 kcal",
    "portion": "360g",
    "prepTime": "12 dk",
    "temperature": "85°C",
    "chefNote": "Sur usulü baharatlı zırh kıyması ve fırından çıkmadan önce kırılan taze köy yumurtası.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4375365_48624_20231109122841.jpg",
    "courseNumber": "03",
    "meatIngredient": "Zırh Kıyma",
    "garnishIngredient": "Taze Köy Yumurtası"
  },
  {
    "id": "kasarli-pide",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "Kaşarlı Pide",
    "subtitle": "Eritilmiş Karacadağ Kaşarı • Tereyağlı Çıtır Kenar",
    "frenchTitle": "Pide Gratinée au Fromage de Karacadağ",
    "price": "₺ 560",
    "priceNum": 560,
    "calories": "710 kcal",
    "portion": "330g",
    "prepTime": "10 dk",
    "temperature": "85°C",
    "chefNote": "Karacadağ yaylalarının tam yağlı taze kaşarıyla fırınlanan, kenarları köy tereyağıyla yağlanmış pide.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4394392_48624_20231109122226.jpg",
    "courseNumber": "04",
    "meatIngredient": "Süt Kaşarı",
    "garnishIngredient": "Köy Tereyağı"
  },
  {
    "id": "findik-lahmacun",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "Fındık Lahmacun",
    "subtitle": "Çıtır Minik Hamur • Diyarbakır Usulü Zırh Harcı",
    "frenchTitle": "Mini Lahmacun Croustillant au Feu de Bois",
    "price": "₺ 85",
    "priceNum": 85,
    "calories": "160 kcal",
    "portion": "80g / Adet",
    "prepTime": "8 dk",
    "temperature": "90°C",
    "chefNote": "Odun ateşinde 90 saniyede pişen, incecik gevrek tabanlı ve bol baharatlı zırh kıymalı fındık lahmacun.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4391983_48624_20231109122251.jpg",
    "courseNumber": "05",
    "meatIngredient": "Zırh Kuzu Eti",
    "garnishIngredient": "Sur Maydanozu & Limon"
  },
  {
    "id": "kusbasili-1-5",
    "category": "TAŞ FIRIN & PİDE",
    "categorySlug": "tas-firin",
    "name": "1,5 Porsiyon Kuşbaşılı Pide",
    "subtitle": "Doyurucu Büyük Boy • Meşe Odununda Pişirim",
    "frenchTitle": "Grande Pide Généreuse à la Viande",
    "price": "₺ 750",
    "priceNum": 750,
    "calories": "980 kcal",
    "portion": "480g",
    "prepTime": "14 dk",
    "temperature": "85°C",
    "chefNote": "Taş fırının en sıcak köşesinde pişen ekstra büyük porsiyon meşe odunlu kuzu kuşbaşı pide.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4375663_48624_20231109123825.jpg",
    "courseNumber": "06",
    "meatIngredient": "Bol Kuşbaşı Eti",
    "garnishIngredient": "Köz Biber & Domates"
  },
  {
    "id": "sur-sac-tava",
    "category": "SAC TAVA",
    "categorySlug": "sac-tava",
    "name": "Sur Usulü Hakiki Sac Tava",
    "subtitle": "Kızgın Sac Üzerinde • Karacadağ Kuzu Eti • Taze Köy Biberi",
    "frenchTitle": "Sauté Traditionnel sur Plaque d'Acier",
    "price": "₺ 800",
    "priceNum": 800,
    "calories": "820 kcal",
    "portion": "400g / Tek Kişilik",
    "prepTime": "15 dk",
    "temperature": "88°C",
    "chefNote": "Sur usulü dövme demir sac üzerinde yüksek harlı meşe ateşinde kuzu eti, domates ve biberlerin dansı. Yanında sıcak lavaş ile servis edilir.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/4394416_48624_20231109122117.jpg",
    "courseNumber": "01",
    "meatIngredient": "Zırh Kuzu Eti",
    "garnishIngredient": "Köz Biber & Sarımsak"
  },
  {
    "id": "beros-tavuk-special",
    "category": "TAVUK ÇEŞİTLERİ",
    "categorySlug": "tavuk",
    "name": "Beroş Tavuk Special",
    "subtitle": "Özel Konak Sosu • Fırınlanmış Taze Sebzeler",
    "frenchTitle": "Volaille Spéciale Façon Beroş",
    "price": "₺ 590",
    "priceNum": 590,
    "calories": "580 kcal",
    "portion": "350g",
    "prepTime": "14 dk",
    "temperature": "76°C",
    "chefNote": "Beroş mutfağına özel aromatik baharatlarla 24 saat marine edilmiş körpe tavuk göğsü dilimleri.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655261_48624_20230508013419.jpg",
    "courseNumber": "01",
    "meatIngredient": "Marine Tavuk Fileto",
    "garnishIngredient": "Mevsim Fırın Sebzeleri"
  },
  {
    "id": "kori-soslu-tavuk",
    "category": "TAVUK ÇEŞİTLERİ",
    "categorySlug": "tavuk",
    "name": "Köri Soslu Tavuk",
    "subtitle": "Kremalı İpek Köri Sosu • Mantar Dilimleri",
    "frenchTitle": "Suprême de Volaille à la Crème de Curry",
    "price": "₺ 550",
    "priceNum": 550,
    "calories": "620 kcal",
    "portion": "340g",
    "prepTime": "12 dk",
    "temperature": "75°C",
    "chefNote": "Taze kültür mantarları ve özel harman köri baharatıyla kısık ateşte demlenen kremsi tavuk lezzeti.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655264_48624_20230508013326.jpg",
    "courseNumber": "02",
    "meatIngredient": "Tavuk Jülyen",
    "garnishIngredient": "Kremalı Mantar"
  },
  {
    "id": "ispanak-tavuk-bonfile",
    "category": "TAVUK ÇEŞİTLERİ",
    "categorySlug": "tavuk",
    "name": "Ispanak Yatağında Tavuk Bonfile",
    "subtitle": "Sote Taze Ispanak • Izgara Tavuk Bonfile",
    "frenchTitle": "Filet de Poulet Grillé sur Lit d'Épinards",
    "price": "₺ 570",
    "priceNum": 570,
    "calories": "510 kcal",
    "portion": "330g",
    "prepTime": "14 dk",
    "temperature": "74°C",
    "chefNote": "Köy tereyağında sarımsakla sotelenmiş dağ ıspanağı üzerinde dinlendirilmiş tavuk bonfile.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655269_48624_20230512063642.jpg",
    "courseNumber": "03",
    "meatIngredient": "Tavuk Bonfile",
    "garnishIngredient": "Sotelenmiş Dağ Ispanağı"
  },
  {
    "id": "sur-mumbar",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Sur Mumbar Dolması",
    "subtitle": "Hakiki Konak Usulü • İlikli Pirinç & Baharat Dolumu",
    "frenchTitle": "Tripes Farcies Traditionnelles de Sur",
    "price": "₺ 480",
    "priceNum": 480,
    "calories": "620 kcal",
    "portion": "300g / Porsiyon",
    "prepTime": "10 dk",
    "temperature": "80°C",
    "chefNote": "Diyarbakır mutfağının en meşakkatli ve sevilen lezzeti. Özenle temizlenen kuzu mumbarı baharatlı pirinçle doldurulup 4 saat haşlanır.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3654901_48624_20230508012419.jpg",
    "courseNumber": "01",
    "meatIngredient": "Kuzu Mumbar",
    "garnishIngredient": "İlikli Baharatlı Pirinç"
  },
  {
    "id": "icli-kofte",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Sur Usulü Haşlama İçli Köfte",
    "subtitle": "Cevizli Zırh Kıyma • İncecik Bulgur Kabuğu",
    "frenchTitle": "Kébét Farcie à la Viande et Noix",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "190 kcal",
    "portion": "1 Adet",
    "prepTime": "8 dk",
    "temperature": "78°C",
    "chefNote": "Zırhla çekilmiş kuzu kıyması, kavrulmuş Diyarbakır cevizi ve ince kabuğuyla konak usulü haşlama içli köfte.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3654902_48624_20230508012350.jpg",
    "courseNumber": "02",
    "meatIngredient": "Zırh Kıyma & Ceviz",
    "garnishIngredient": "Köy Tereyağı Sosu"
  },
  {
    "id": "talas-boregi",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Talaş Böreği",
    "subtitle": "Kuzu Etli Bezelyeli Milföy Bohçası • Altın Sarısı Fırınlama",
    "frenchTitle": "Feuilleté Croustillant à la Viande d'Agneau",
    "price": "₺ 220",
    "priceNum": 220,
    "calories": "450 kcal",
    "portion": "200g",
    "prepTime": "10 dk",
    "temperature": "75°C",
    "chefNote": "Kat kat açılan çıtır milföy hamurunun içinde lokum kuzu kuşbaşı ve taze bezelye harcı.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655031_48624_20230512061454.jpg",
    "courseNumber": "03",
    "meatIngredient": "Kuzu Kuşbaşı",
    "garnishIngredient": "Taze Bezelye & Havuç"
  },
  {
    "id": "kase-yogurt",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Kase Yoğurt",
    "subtitle": "Karacadağ Yayık Köy Yoğurdu • Doğal Mayalı",
    "frenchTitle": "Yaourt Fermier Artisanal en Terrine",
    "price": "₺ 220",
    "priceNum": 220,
    "calories": "180 kcal",
    "portion": "250g",
    "prepTime": "5 dk",
    "temperature": "6°C",
    "chefNote": "Karacadağ eteklerinde otlayan koyunların sütünden geleneksel taş çömleklerde mayalanan kıvamlı doğal yoğurt.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3658518_48624_20230510040855.jpg",
    "courseNumber": "04",
    "meatIngredient": "Koyun Sütü",
    "garnishIngredient": "Doğal Maya Kaymağı"
  },
  {
    "id": "sade-pilav",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Sade Pilav",
    "subtitle": "Hakiki Tereyağlı Karacadağ Pirinci • Tane Tane Demleme",
    "frenchTitle": "Riz Pilaf au Beurre Fermier",
    "price": "₺ 130",
    "priceNum": 130,
    "calories": "290 kcal",
    "portion": "200g",
    "prepTime": "5 dk",
    "temperature": "72°C",
    "chefNote": "Coğrafi işaretli Karacadağ pirincinin saf köy tereyağında ağır ağır demlenmesiyle hazırlanan tane tane pilav.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3658502_48624_20230512061622.jpg",
    "courseNumber": "05",
    "meatIngredient": "Karacadağ Pirinci",
    "garnishIngredient": "Hakiki Köy Tereyağı"
  },
  {
    "id": "patates-cips",
    "category": "ARA SICAK & MEZE",
    "categorySlug": "ara-sicak",
    "name": "Patates Cips",
    "subtitle": "El Kesimi Taze Patates Kızartması • Özel Baharat Harcı",
    "frenchTitle": "Pommes Frites Maison Croustillantes",
    "price": "₺ 220",
    "priceNum": 220,
    "calories": "380 kcal",
    "portion": "220g",
    "prepTime": "8 dk",
    "temperature": "80°C",
    "chefNote": "Günlük taze patateslerin ince dilimlenip çıtır kıvamda kızartılarak özel kaya tuzu ve kekikle harmanlanması.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3658505_48624_20230512061440.jpg",
    "courseNumber": "06",
    "meatIngredient": "Taze Patates",
    "garnishIngredient": "Dağ Kekiği & Toz Biber"
  },
  {
    "id": "fistikli-baklava",
    "category": "TATLILAR",
    "categorySlug": "tatli",
    "name": "Hakiki Sade Yağlı Fıstıklı Baklava",
    "subtitle": "Karacadağ Sade Yağı • Antep Boz Fıstık • 40 Kat Çıtır Yufka",
    "frenchTitle": "Baklava Impériale au Beurre Clarifié et Pistaches",
    "price": "₺ 450",
    "priceNum": 450,
    "calories": "520 kcal",
    "portion": "180g / 3 Dilim",
    "prepTime": "5 dk",
    "temperature": "22°C",
    "chefNote": "Meşe odunu fırınında altın sarısı pişen, Karacadağ eritilmiş sade yağı ve taze hasat Antep boz fıstığıyla taçlandırılmış saray klasiği.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3672485_48624_20230512061943.jpg",
    "courseNumber": "01",
    "meatIngredient": "Boz Antep Fıstığı",
    "garnishIngredient": "Karacadağ Sade Yağı"
  },
  {
    "id": "fistikli-kadayif",
    "category": "TATLILAR",
    "categorySlug": "tatli",
    "name": "Diyarbakır Burma Kadayıf",
    "subtitle": "Hakiki Burma Tel Kadayıf • Bol Fıstıklı • Odun Ateşinde Kızartma",
    "frenchTitle": "Kadaïf Roulé Traditionnel aux Pistaches",
    "price": "₺ 430",
    "priceNum": 430,
    "calories": "490 kcal",
    "portion": "190g",
    "prepTime": "5 dk",
    "temperature": "35°C",
    "chefNote": "Sur usulü incecik sarılmış tel kadayıfın meşe ateşinde çevrilerek nar gibi kızartılması ve ılık şerbetle buluşması.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3672488_48624_20230511113426.jpg",
    "courseNumber": "02",
    "meatIngredient": "Tel Kadayıf",
    "garnishIngredient": "Bol Antep Fıstığı"
  },
  {
    "id": "acik-ayran",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Açık Yayık Ayranı",
    "subtitle": "Bol Köpüklü Doğal Sur Yayık Ayranı • Bakır Maşrapada",
    "frenchTitle": "Ayran Fermier Frais Mousseux",
    "price": "₺ 75",
    "priceNum": 75,
    "calories": "90 kcal",
    "portion": "300ml",
    "prepTime": "2 dk",
    "temperature": "4°C",
    "chefNote": "Doğal köy yoğurdundan meşe yayıkta çalkalanarak hazırlanan, buz gibi soğuk ve bol köpüklü geleneksel içecek.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655682_48624_20230511101814.jpg",
    "courseNumber": "01",
    "meatIngredient": "Köy Yoğurdu",
    "garnishIngredient": "Doğal Yayık Köpüğü"
  },
  {
    "id": "sise-kola",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Şişe Coca-Cola",
    "subtitle": "Klasik Cam Şişe • Buz Gibi Servis",
    "frenchTitle": "Coca-Cola Bouteille en Verre",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "140 kcal",
    "portion": "250ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Buz ve limon dilimi eşliğinde kristal kadehte servis edilen orijinal tat.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655680_48624_20230511101941.jpg",
    "courseNumber": "02",
    "meatIngredient": "Cam Şişe İçecek",
    "garnishIngredient": "Buz & Limon"
  },
  {
    "id": "kutu-kola",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Kutu Coca-Cola",
    "subtitle": "Soğuk Meşrubat (330ml)",
    "frenchTitle": "Coca-Cola Canette Fraîche",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "140 kcal",
    "portion": "330ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Klasik soğuk meşrubat.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655679_48624_20230511102020.jpg",
    "courseNumber": "03",
    "meatIngredient": "Kutu İçecek",
    "garnishIngredient": "Buz"
  },
  {
    "id": "kutu-fanta",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Kutu Fanta",
    "subtitle": "Portakallı Gazoz (330ml)",
    "frenchTitle": "Fanta Orange Canette",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "135 kcal",
    "portion": "330ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Ferahlatıcı portakal aromalı meşrubat.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655670_48624_20230511102051.jpg",
    "courseNumber": "04",
    "meatIngredient": "Portakal Gazozu",
    "garnishIngredient": "Portakal Dilimi"
  },
  {
    "id": "sise-fanta",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Şişe Fanta",
    "subtitle": "Cam Şişe Portakallı Gazoz",
    "frenchTitle": "Fanta Orange Bouteille en Verre",
    "price": "₺ 75",
    "priceNum": 75,
    "calories": "110 kcal",
    "portion": "200ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Nostaljik cam şişede buz gibi portakal lezzeti.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3658215_48624_20230511102232.jpg",
    "courseNumber": "05",
    "meatIngredient": "Cam Şişe Gazoz",
    "garnishIngredient": "Buz"
  },
  {
    "id": "sprite",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Sprite",
    "subtitle": "Limon & Misket Limonu Gazozu (330ml)",
    "frenchTitle": "Sprite Citron-Lime Glacé",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "120 kcal",
    "portion": "330ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Yoğun ferahlatıcı misket limonu aroması.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655683_48624_20230511101732.jpg",
    "courseNumber": "06",
    "meatIngredient": "Limon Gazozu",
    "garnishIngredient": "Limon & Nane"
  },
  {
    "id": "cappy",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Cappy Meyve Suyu",
    "subtitle": "Meyve Nektarı Çeşitleri (330ml)",
    "frenchTitle": "Jus de Fruits Cappy Sélection",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "125 kcal",
    "portion": "330ml",
    "prepTime": "2 dk",
    "temperature": "4°C",
    "chefNote": "Karışık veya vişne meyve suyu seçeneği.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655690_48624_20230511112620.jpg",
    "courseNumber": "07",
    "meatIngredient": "Meyve Nektarı",
    "garnishIngredient": "Buz"
  },
  {
    "id": "fuse-tea",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Fuse Tea Soğuk Çay",
    "subtitle": "Şeftali & Limon Aromalı Soğuk Çay",
    "frenchTitle": "Thé Glacé aux Pêches",
    "price": "₺ 80",
    "priceNum": 80,
    "calories": "105 kcal",
    "portion": "330ml",
    "prepTime": "2 dk",
    "temperature": "4°C",
    "chefNote": "Doğal çay demi ve taze meyve aroması.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3656954_48624_20230511102121.jpg",
    "courseNumber": "08",
    "meatIngredient": "Soğuk Çay",
    "garnishIngredient": "Limon & Nane"
  },
  {
    "id": "sade-soda",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Doğal Maden Suyu (Sade Soda)",
    "subtitle": "Zengin Mineralli Doğal Kaynak Maden Suyu",
    "frenchTitle": "Eau Minérale Naturelle Gazeuse",
    "price": "₺ 75",
    "priceNum": 75,
    "calories": "0 kcal",
    "portion": "200ml",
    "prepTime": "2 dk",
    "temperature": "3°C",
    "chefNote": "Yemek sonrası hazmı kolaylaştıran doğal mineralli maden suyu.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3656955_48624_20230511112822.jpg",
    "courseNumber": "09",
    "meatIngredient": "Doğal Maden Suyu",
    "garnishIngredient": "Limon Dilimi"
  },
  {
    "id": "kucuk-su",
    "category": "İÇECEKLER",
    "categorySlug": "icecek",
    "name": "Küçük Su",
    "subtitle": "Cam Şişe Doğal Kaynak Suyu",
    "frenchTitle": "Eau de Source Naturelle",
    "price": "₺ 35",
    "priceNum": 35,
    "calories": "0 kcal",
    "portion": "330ml",
    "prepTime": "1 dk",
    "temperature": "4°C",
    "chefNote": "Karacadağ kaynaklarından gelen doğal yumuşak kaynak suyu.",
    "dishImage": "https://cdn.adisyo.com/mahrezphotos/3655687_48624_20230511112712.jpg",
    "courseNumber": "10",
    "meatIngredient": "Doğal Kaynak Suyu",
    "garnishIngredient": "Cam Şişe"
  }
];

const FACADE_CENTER = "/facade-center.jpg";
const INTERIOR_HD = "/interior-hd.jpg";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function VexmoKineticBerosPage() {
  // UI & Menü state
  const [lang, setLang] = useState<Language>("TR");
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>("yoresel");
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [revealStep, setRevealStep] = useState<"elevate" | "landed">("elevate");
  const [isMobile, setIsMobile] = useState(false);
  const [isSignLit, setIsSignLit] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [arModalDish, setArModalDish] = useState<Dish | null>(null);

  // Operasyonel Masa & İletişim State
  const [tableNo, setTableNo] = useState<string>("MASA 07");
  const [wifiCopied, setWifiCopied] = useState(false);

  // Canlı Stok & Operasyon State
  const [inventory, setInventory] = useState<Record<string, { count: number; isUnlimited: boolean; isLocked: boolean }>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);

  // Reservation form state
  const [resDate, setResDate] = useState("Bu Akşam (19:30)");
  const [resGuests, setResGuests] = useState("2 Kişi");
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resNote, setResNote] = useState("");
  const [resSuccess, setResSuccess] = useState(false);

  // Ensure reset to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener("resize", checkMobile);

      // Dinamik Masa Tespiti (?masa=05)
      const params = new URLSearchParams(window.location.search);
      const masaParam = params.get("masa");
      if (masaParam) {
        const formatted = `MASA ${masaParam.padStart(2, "0")}`;
        setTableNo(formatted);
        try {
          localStorage.setItem("beros_table_no", formatted);
        } catch {}
      } else {
        try {
          const saved = localStorage.getItem("beros_table_no");
          if (saved) setTableNo(saved);
        } catch {}
      }

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch("/api/stock");
        const data = await res.json();
        setInventory(data || {});
      } catch {}
    };
    fetchStock();
    const interval = setInterval(fetchStock, 3500);
    return () => clearInterval(interval);
  }, []);

  const isDishOutOfStock = (dishId?: string) => {
    if (!dishId) return false;
    const item = inventory[dishId];
    if (!item) return false;
    if (item.isUnlimited) return false;
    return item.count <= 0 || item.isLocked;
  };

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Scroll math for 350vh container
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Vexmo Ingredient Reveal Cycle:
  // 0ms - 400ms: Elevate & Separate (Layers orbit and lift)
  // 400ms+: Snap-Back Impact into Socket, Steam Explosion, Chiseled Gold Glow
  useEffect(() => {
    setRevealStep("elevate");
    const timer = setTimeout(() => {
      setRevealStep("landed");
    }, 400);
    return () => clearTimeout(timer);
  }, [activeDishIndex]);

  // Aşama 1: Hero (%0 - %25)
  const act1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const act1Scale = useTransform(scrollYProgress, [0, 0.25], [1.0, 1.06]);
  const act1TextY = useTransform(scrollYProgress, [0, 0.22], [0, -50]);

  // Aşama 2: 3D Canlı Menü (%25 - %75)
  const act2Opacity = useTransform(
    scrollYProgress,
    [0.22, 0.26, 0.72, 0.76],
    [0, 1, 1, 0]
  );
  const act2Scale = useTransform(scrollYProgress, [0.24, 0.74], [0.98, 1.0]);

  // Aşama 3: Dış Cephe & Doğal Tabela (%75 - %100)
  const act3Opacity = useTransform(scrollYProgress, [0.73, 0.77, 1.0], [0, 1, 1]);
  const act3Scale = useTransform(scrollYProgress, [0.75, 1.0], [1.03, 1.0]);

  // Dynamic pointer-events based on active stage
  const act1PointerEvents = useTransform(scrollYProgress, (v) => (v <= 0.24 ? "auto" : "none"));
  const act2PointerEvents = useTransform(scrollYProgress, (v) => (v > 0.22 && v < 0.75 ? "auto" : "none"));
  const act3PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.74 ? "auto" : "none"));

  // Scrub active dish based on scroll in Aşama 2
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Menu progression between 0.27 and 0.68
    if (latest >= 0.27 && latest <= 0.68) {
      const progress = (latest - 0.27) / (0.68 - 0.27);
      const index = Math.min(
        currentDishes.length - 1,
        Math.max(0, Math.floor(progress * currentDishes.length))
      );
      if (index !== activeDishIndex) {
        setActiveDishIndex(index);
      }
    }

    // Natural stone sign ambient illumination in Aşama 3
    if (latest >= 0.76) {
      if (!isSignLit) setIsSignLit(true);
    } else {
      if (isSignLit) setIsSignLit(false);
    }
  });

  const currentDishes = useMemo(() => {
    return DISHES.filter((d) => d.categorySlug === selectedCategory);
  }, [selectedCategory]);

  const filteredDishes = currentDishes;
  const activeDish = filteredDishes[activeDishIndex] || filteredDishes[0] || DISHES[0];

  const handleSelectCategory = (slug: CategorySlug) => {
    setSelectedCategory(slug);
    setActiveDishIndex(0);
  };

  // Navigation handlers
  const handlePrevDish = () => {
    setActiveDishIndex((prev) => (prev > 0 ? prev - 1 : currentDishes.length - 1));
  };

  const handleNextDish = () => {
    setActiveDishIndex((prev) => (prev < currentDishes.length - 1 ? prev + 1 : 0));
  };

  const handleSelectDish = (idx: number) => {
    setActiveDishIndex(idx);
  };

  // Sepet / Adisyon İşlemleri
  const handleAddToCart = (dish: MenuItem | { id: string; name: string; priceNum?: number }) => {
    if (!dish) return;
    if (isDishOutOfStock(dish.id)) {
      triggerToast(`Üzgünüz, ${dish.name} ${t.tukendi.toLowerCase()}.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { id: dish.id, name: dish.name, price: Number(dish.priceNum) || 725, quantity: 1 },
      ];
    });
    triggerToast(`${dish.name} ${t.toastEklendi}`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Garson & Hesap Servis Çağrısı (/api/calls)
  const handleServiceCall = async (
    serviceType: "Garson" | "Hesap İste (Nakit)" | "Hesap İste (Kredi Kartı)" | "Hesap (Nakit)" | "Hesap (Kredi Kartı)"
  ) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNo, serviceType }),
      });
      triggerToast(`${tableNo}: ${serviceType} ${t.toastCagri}`);
    } catch (err) {
      alert("Bağlantı hatası, lütfen tekrar deneyiniz.");
    }
  };

  // Kasa / Mutfak Sipariş İletimi (/api/orders) ve Stok Güncelleme
  const handleCheckoutInSystem = async () => {
    if (cart.length === 0 || isOrderSubmitting) return;
    setIsOrderSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo,
          items: cart,
          totalAmount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inventory) setInventory(data.inventory);
        setCart([]);
        setIsCartOpen(false);
        triggerToast(`${t.toastIletildi} (${tableNo})`);
      } else {
        alert("Sipariş gönderilemedi.");
      }
    } catch {
      alert("Bağlantı hatası.");
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  // Doğrudan Beroş Google Yorumlarını Aç (share.google linki)
  const handleOpenGoogleReview = () => {
    window.open(RESTAURANT_CONFIG.googleMapsReviewUrl, "_blank", "noopener,noreferrer");
  };

  // WiFi Şifresi Kopyalama
  const handleCopyWifi = () => {
    navigator.clipboard.writeText(RESTAURANT_CONFIG.wifiPass);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResSuccess(true);
    setTimeout(() => {
      setResSuccess(false);
      setIsReservationOpen(false);
    }, 3500);
  };

  const openArModalForDish = (dish: MenuItem) => {
    const spatialDish: Dish = {
      id: dish.id,
      name: dish.name,
      category: dish.category,
      subtitle: dish.subtitle,
      frenchTitle: dish.frenchTitle || dish.subtitle,
      price: dish.price,
      priceNum: dish.priceNum,
      calories: dish.calories,
      portion: dish.portion,
      prepTime: dish.prepTime,
      temperature: dish.temperature,
      chefNote: dish.chefNote,
      allergens: ["Kuzu Eti", "Meşe Közü"],
      videoUrl: "",
      posterUrl: dish.dishImage,
      ingredients: [
        dish.meatIngredient || "Kuzu Eti",
        dish.garnishIngredient || "Taze Baharatlar",
        "Meşe Odunu Közü",
        "Sur Kaya Tuzu",
        "Hakiki Sade Tereyağı",
      ],
      modelLayers: [
        {
          name: "Sırlı Çini Kaide",
          description: "Sur zanaatkarlarının kobalt mavisi pişmiş toprağı",
          color: "#1d4ed8",
          offsetY: -30,
        },
        {
          name: dish.meatIngredient || "Özel Pişirim",
          description: "450°C taş fırında 6 saat kemiğinden ayrılan et",
          color: "#b45309",
          offsetY: 0,
        },
        {
          name: dish.garnishIngredient || "Taze Garnitür",
          description: "Meşe közünde mühürlenmiş taze lezzet garnitürü",
          color: "#15803d",
          offsetY: 30,
        },
      ],
    };
    setArModalDish(spatialDish);
  };

  const scrollToSection = (scrollPercentage: number) => {
    if (typeof window !== "undefined") {
      const targetY =
        (document.documentElement.scrollHeight - window.innerHeight) *
        scrollPercentage;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  // Coverflow 3-card visible window calculation
  const coverflowCards = useMemo(() => {
    const len = currentDishes.length;
    return currentDishes.map((dish, idx) => {
      let diff = idx - activeDishIndex;
      if (len > 1) {
        if (diff < -Math.floor(len / 2)) diff += len;
        if (diff > Math.floor(len / 2)) diff -= len;
      }
      return { dish, idx, diff };
    });
  }, [currentDishes, activeDishIndex]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#080706] text-[#F5EFEB] selection:bg-[#d4af37]/30 selection:text-white"
      style={{ height: "350vh" }}
    >
      {/* Anlık Aksiyon & Servis Bildirim Toasti (Sayfa Altı) */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-5 py-2.5 rounded-full bg-[#16120e] border border-[#d4af37] text-[#d4af37] text-xs font-mono tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center gap-2 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. MINIMAL FIXED ARCHITECTURAL HEADER                                     */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-[999] px-4 sm:px-12 py-3.5 flex items-center justify-between backdrop-blur-md bg-[#080706]/85 border-b border-white/10 transition-all duration-300">
        {/* Left: Refined Wordmark & Table Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollToSection(0)}
            className="text-left group flex items-baseline gap-2 focus:outline-none"
          >
            <span className="font-serif tracking-[0.32em] text-lg sm:text-xl font-light text-white group-hover:text-[#d4af37] transition-colors">
              BEROŞ
            </span>
          </button>

          {/* Dinamik Masa Rozeti */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">[ SUR / DIYARBAKIR • {tableNo} ]</span>
            <span className="sm:hidden">{tableNo}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-sans tracking-[0.25em] uppercase font-light">
          <button
            onClick={() => scrollToSection(0.35)}
            className="text-white hover:text-[#d4af37] transition-colors"
          >
            GASTRONOMİ
          </button>
          <button
            onClick={() => scrollToSection(0.0)}
            className="text-white/40 hover:text-white transition-colors"
          >
            ASIRLIK KONAK
          </button>
          <button
            onClick={() => setIsReservationOpen(true)}
            className="text-white/40 hover:text-white transition-colors"
          >
            REZERVASYON
          </button>
        </nav>

        {/* Right: Operasyonel Aksiyonlar & Turist Modu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-[150] pointer-events-auto">
          {/* 1. Turist Modu Dil Seçici (TR / EN / AR) */}
          <div className="flex items-center rounded-full border border-white/15 bg-black/40 p-0.5 text-[10px] font-mono">
            {(["TR", "EN", "AR"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  lang === l
                    ? "bg-[#d4af37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 2. Garson Çağır Butonu */}
          <button
            id="btn-call-waiter"
            type="button"
            onClick={() => handleServiceCall("Garson")}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Garson Çağır"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.garson}</span>
          </button>

          {/* 3. Hesap İste Butonu */}
          <button
            id="btn-call-bill"
            type="button"
            onClick={() => handleServiceCall("Hesap İste (Kredi Kartı)")}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Hesap İste"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.hesap}</span>
          </button>

          {/* 4. Google Haritalar'da Değerlendir */}
          <button
            type="button"
            onClick={handleOpenGoogleReview}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Google Haritalar'da Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden md:inline">{t.degerlendir}</span>
          </button>

          {/* 5. Canlı Tepsi / Sepet Drawer Trigger */}
          <button
            id="btn-open-tray"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative z-[90] pointer-events-auto cursor-pointer px-3 sm:px-3.5 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-mono tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.tepsi}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#d4af37] text-[#080706] font-bold text-[10px]">
              {totalCartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 text-white/70 hover:text-white lg:hidden"
            aria-label="Menü"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THREE-STAGE CINEMATIC VIEWPORT (PINNED FULLSCREEN)                    */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* ======================================================================= */}
        {/* AŞAMA 1: SESSİZ LÜKS GİRİŞ (HERO — RESMİ KURUMSAL METİNLER)              */}
        {/* ======================================================================= */}
        <motion.div
          style={{ opacity: act1Opacity, scale: act1Scale, pointerEvents: act1PointerEvents }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Tam Ekran Kristal Netliğinde İç Mekan */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={INTERIOR_HD}
              alt="Beroş Restaurant Asırlık İç Salon"
              className="w-full h-full object-cover object-center"
            />
            {/* Sessiz Lüks Sinematik Gradyanlar */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-black/35 to-[#080706]/65" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,7,6,0.65)_100%)]" />
          </div>

          {/* Sol Altta Resmi Kurumsal Editoryal Blok (berosrestaurant.com) */}
          <motion.div
            style={{ y: act1TextY }}
            className="relative z-10 w-full h-full flex flex-col justify-end p-8 sm:p-14 lg:p-20 pb-16 sm:pb-20"
          >
            <div className="max-w-2xl">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-3">
                SUR / DİYARBAKIR • M.Ö. 3000 • MASA 07
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.0] uppercase">
                MEZOPOTAMYA&apos;NIN <br />
                BİNLERCE YILLIK <br />
                <span className="text-[#d4af37]">LEZZET MİRASI</span>
              </h1>
              <p className="mt-5 text-sm sm:text-base lg:text-lg font-serif italic text-white/75 font-light max-w-xl leading-relaxed">
                &ldquo;Ateşin, baharatın ve ustalığın buluştuğu yerdeyiz. Gelenekten ilham alıyor, çağdaş bir sofrada modern sunum ve ustalıkla fark yaratıyoruz.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#d4af37]/80 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span>Beroş Diyarbakır • Her masa özeldir, her tabak bir imza taşır.</span>
              </div>
            </div>

            {/* Ortalanmış Zarif Scroll Cue */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
              <button
                onClick={() => scrollToSection(0.35)}
                className="flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] uppercase text-white/60 hover:text-[#d4af37] transition-colors"
              >
                <span>AŞAĞI KAYDIRIN</span>
                <span className="animate-bounce">↓</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* ======================================================================= */}
        {/* AŞAMA 2: 3D VEXMO STYLE COVERFLOW & OTANTİK TEPSİ ESTETİĞİ (%25 - %75)   */}
        {/* ======================================================================= */}
        <motion.div
          style={{ opacity: act2Opacity, scale: act2Scale, pointerEvents: act2PointerEvents }}
          className="absolute inset-0 w-full h-full flex flex-col justify-between p-4 sm:p-10 lg:p-14 pt-20 sm:pt-24 bg-[#080706] touch-pan-y"
        >
          {/* Karanlık Volkanik Taş Zemin & Sıcak Kehribar ve Gün Işığı Ambiyansı */}
          <div className="absolute inset-0 -z-10 bg-[#070504] pointer-events-none overflow-hidden">
            {/* Tepe Merkez: Sarkıt Lamba Sıcak Kehribar Işık Huzmesi */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(217, 119, 6, 0.18), transparent 70%)",
              }}
            />
            {/* Sol Cephe Pencere Gün Işığı (Window Daylight Rim) */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 pointer-events-none -z-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, transparent 40%)",
              }}
            />
            {/* Merkez Odaklanmış Stüdyo Spotlight */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(212,175,55,0.09) 0%, rgba(255,255,255,0.02) 40%, transparent 75%)",
              }}
            />
          </div>

          {/* Menü Üst Barı: Kategori Filtreleri & Kurs Sayacı */}
          <div className="relative z-10 flex flex-col gap-2.5 border-b border-white/10 pb-3">
            {/* Üst Satır: Kategori Filtre Butonları (Yatay Kaydırılabilir) */}
            <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => {
                const isCatActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-mono text-[10px] sm:text-[11px] tracking-wider transition-all duration-300 flex-shrink-0 ${
                      isCatActive
                        ? "bg-[#e2b34a] text-[#080706] font-semibold shadow-[0_0_15px_rgba(226,179,74,0.45)]"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {CATEGORY_NAMES[lang]?.[cat.slug] || cat.label}
                  </button>
                );
              })}
            </div>

            {/* Alt Satır: Kurs Sayacı + Kurs Noktaları + Önceki / Sonraki Oklar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tracking-[0.3em] text-[#d4af37] uppercase">
                  COURSE {activeDishIndex + 1 < 10 ? "0" + (activeDishIndex + 1) : activeDishIndex + 1} / {currentDishes.length < 10 ? "0" + currentDishes.length : currentDishes.length}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono tracking-widest text-white/60 uppercase">
                  {CATEGORY_NAMES[lang]?.[activeDish.categorySlug] || activeDish.category}
                </span>
              </div>

              {/* Kurs Noktaları */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-w-[160px] sm:max-w-[280px] overflow-x-auto no-scrollbar">
                {currentDishes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectDish(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full flex-shrink-0 ${
                      idx === activeDishIndex
                        ? "w-6 sm:w-7 bg-[#d4af37]"
                        : "w-1.5 sm:w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Course ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Önceki / Sonraki Oklar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevDish}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
                  aria-label="Önceki Lezzet"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextDish}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
                  aria-label="Sonraki Lezzet"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Ana Sahne: Sol Tipografi + Merkez Otantik Tepsi Coverflow + Sağ Fiyat & Aksiyon */}
          <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center my-auto min-h-0">
            {/* Sol Sütun: Editoryal Tipografi (3.5 cols) */}
            <div className="lg:col-span-3 z-10 flex flex-col justify-center order-2 lg:order-1">
              <p className="text-xs font-serif italic text-[#d4af37]/80 tracking-wider">
                {activeDish.frenchTitle}
              </p>
              <h2
                className={`mt-1 font-serif text-xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight transition-all duration-500 ${
                  revealStep === "landed" ? "text-white" : "text-white/70"
                }`}
                style={{
                  textShadow:
                    revealStep === "landed"
                      ? "0 0 25px rgba(212,175,55,0.4)"
                      : "none",
                }}
              >
                {activeDish.name}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm font-sans text-white/50 tracking-wider font-light line-clamp-2">
                {activeDish.subtitle}
              </p>

              <div className="my-3 sm:my-4 border-l-2 border-[#d4af37]/40 pl-3 py-1">
                <p className="text-xs sm:text-sm font-serif italic text-white/70 font-light leading-relaxed">
                  &ldquo;{activeDish.chefNote}&rdquo;
                </p>
              </div>

              {/* Minimalist Teknik Metrikler */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono tracking-widest text-[#d4af37] py-1.5 border-y border-white/10">
                <span>[ {activeDish.calories} ]</span>
                <span className="text-white/20">•</span>
                <span>[ {activeDish.prepTime} ]</span>
                <span className="text-white/20">•</span>
                <span>[ {activeDish.temperature} ]</span>
              </div>
            </div>

            {/* Merkez: 3D OTANTİK TEPSİ COVERFLOW & INGREDIENT REVEAL (6 cols) */}
            <div
              className="lg:col-span-6 relative h-[400px] sm:h-[480px] lg:h-[530px] w-full flex items-center justify-center order-1 lg:order-2 select-none pointer-events-none"
              style={{
                perspective: "1400px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* 3D Tepsi Arkası (Aura Glow): Dönen tepsiyi öne çıkaran sıcak kehribar/altın arka ışık */}
              <div
                className="absolute inset-0 m-auto w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] pointer-events-none -z-10 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.12), transparent 60%)",
                }}
              />

              {/* Coverflow 3D Cards Stack */}
              <div
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-none"
                style={{ transformStyle: "preserve-3d" }}
              >
                {coverflowCards.map(({ dish, idx, diff }) => {
                  const isActive = diff === 0;
                  const isLeft = diff === -1;
                  const isRight = diff === 1;
                  const isFar = Math.abs(diff) > 1;

                  const stepX = isMobile ? 130 : 190;
                  const edgeX = isMobile ? 260 : 380;

                  return (
                    <motion.div
                      key={dish.id}
                      animate={{
                        x: isActive ? 0 : isLeft ? -stepX : isRight ? stepX : diff > 0 ? edgeX : -edgeX,
                        z: isActive ? 75 : isFar ? -160 : -80,
                        rotateY: isActive ? 0 : isLeft ? (isMobile ? 18 : 24) : isRight ? (isMobile ? -18 : -24) : diff > 0 ? -35 : 35,
                        scale: isActive ? 1.0 : isFar ? 0.65 : (isMobile ? 0.78 : 0.82),
                        opacity: isActive ? 1.0 : isFar ? 0 : (isMobile ? 0.35 : 0.45),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                        mass: 0.9,
                      }}
                      drag={isActive ? "x" : false}
                      dragDirectionLock={true}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.25}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -40) handleNextDish();
                        else if (info.offset.x > 40) handlePrevDish();
                      }}
                      onClick={() => {
                        if (isLeft) handlePrevDish();
                        if (isRight) handleNextDish();
                      }}
                      className={`absolute inset-0 m-auto w-full max-w-[340px] sm:max-w-xl md:max-w-2xl h-[380px] sm:h-[440px] rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between select-none shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#e2b34a]/40 ${
                        isActive
                          ? "ring-1 ring-[#e2b34a]/40 z-30 pointer-events-auto shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                          : isFar
                          ? "pointer-events-none z-0"
                          : "hover:border-[#e2b34a]/60 cursor-pointer z-10"
                      }`}
                      style={{
                        transformStyle: "preserve-3d",
                        width: "100%",
                        maxWidth: isMobile ? "340px" : "672px",
                      }}
                    >
                      {/* Gerçek Koyu Ceviz Ağacı Kaplaması */}
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[32px]">
                        <img
                          src="/wood-tray.jpg"
                          alt="Solid Dark Walnut Wood"
                          className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.2]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />
                        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]" />
                      </div>

                      {/* Dört Köşede Pirinç/Bronz Köşe Bağlama Süslemesi */}
                      <GoldCorner className="top-3 left-3 z-10" />
                      <GoldCorner className="top-3 right-3 rotate-90 z-10" />
                      <GoldCorner className="bottom-3 right-3 rotate-180 z-10" />
                      <GoldCorner className="bottom-3 left-3 -rotate-90 z-10" />

                      {/* Kart Üst Başlığı */}
                      <div className="w-full flex items-center justify-between border-b border-[#d4af37]/20 pb-2.5 z-10">
                        <span className="text-[9px] sm:text-[11px] font-mono tracking-widest text-[#d4af37] uppercase">
                          COURSE {dish.courseNumber || `0${idx + 1}`} • {dish.category}
                        </span>
                        {isActive && (
                          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono uppercase text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2.5 py-0.5 rounded-full">
                            <Layers className="w-2.5 h-2.5 text-[#d4af37]" />
                            <span>DOĞAL CEVİZ AĞACI TEPSİ</span>
                          </div>
                        )}
                      </div>

                      {/* Görseldeki Derin Havşa Oyuğu (Recessed Carved Socket) */}
                      <div
                        className="w-52 h-52 sm:w-64 sm:h-64 rounded-full flex items-center justify-center relative shadow-[inset_0_24px_48px_rgba(0,0,0,0.98),inset_0_2px_8px_rgba(212,175,55,0.4),0_0_35px_rgba(0,0,0,0.9)] border-2 border-[#d4af37]/35 z-10 my-auto"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 50%, #030202 0%, #0b0806 55%, #19120c 100%)",
                          boxShadow:
                            "inset 0 24px 48px rgba(0,0,0,1.0), inset 0 4px 10px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(212,175,55,0.3), 0 10px 30px rgba(0,0,0,0.85)",
                          border: "1.5px solid rgba(212,175,55,0.45)",
                        }}
                      >
                        {/* Oyuğun çevresinde ince altın işlemeli metal halka */}
                        <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-[#d4af37]/30 pointer-events-none" />
                        <div className="absolute inset-4 rounded-full border border-dashed border-[#d4af37]/20 pointer-events-none opacity-40" />

                        {/* Dinamik Zemin Kontak Gölgesi */}
                        <div
                          className="absolute bottom-1 inset-x-5 h-10 rounded-full pointer-events-none transition-all duration-500"
                          style={{
                            background:
                              "radial-gradient(ellipse at center, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.65) 50%, transparent 80%)",
                            filter: "blur(8px)",
                            transform:
                              isActive && revealStep === "landed"
                                ? "scale(1.05)"
                                : "scale(0.4)",
                            opacity:
                              isActive && revealStep === "landed" ? 0.95 : 0.2,
                          }}
                        />

                        {/* Yemek Tabağı Görseli - translateZ(75px) */}
                        <motion.div
                          animate={{
                            y:
                              isActive && revealStep === "elevate"
                                ? 14
                                : 0,
                            rotateY:
                              isActive && revealStep === "elevate"
                                ? -18
                                : 0,
                            scale:
                              isActive && revealStep === "elevate"
                                ? 0.95
                                : 1.0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 22,
                          }}
                          className="relative w-[85%] h-[85%] rounded-full overflow-hidden flex items-center justify-center pointer-events-none"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: "translateZ(75px)",
                          }}
                        >
                          <img
                            src={dish.dishImage}
                            alt={dish.name}
                            className={`w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                              dish.isBluePlate || dish.isTransparentPng
                                ? "object-contain p-1"
                                : "object-cover rounded-full"
                            }`}
                          />
                          {isDishOutOfStock(dish.id) && (
                            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center pointer-events-none z-30">
                              <span className="px-3 py-1 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 font-mono text-xs font-bold tracking-widest uppercase shadow-lg">
                                TÜKENDİ
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Canlı Buhar Patlaması */}
                        {isActive && revealStep === "landed" && !isDishOutOfStock(dish.id) && (
                          <SteamEffect
                            intensity="high"
                            className="-top-12 sm:-top-16"
                          />
                        )}

                        {/* Ingredient Reveal Uçuşan Katmanlar */}
                        {isActive && dish.meatIngredient && dish.garnishIngredient && !isDishOutOfStock(dish.id) && (
                          <>
                            <motion.div
                              initial={{ y: 20, scale: 0.85, opacity: 0 }}
                              animate={{
                                y: revealStep === "elevate" ? -24 : 0,
                                scale: revealStep === "elevate" ? 1.12 : 1.0,
                                rotate: revealStep === "elevate" ? -3 : 0,
                                opacity: revealStep === "elevate" ? 1 : 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 22,
                              }}
                              className="absolute -top-7 -left-3 sm:-left-6 z-40 pointer-events-none"
                            >
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/85 border border-[#d4af37]/60 shadow-[0_8px_20px_rgba(0,0,0,0.85)]">
                                <Flame className="w-3 h-3 text-[#d4af37]" />
                                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-[#F5EFEB]">
                                  {dish.meatIngredient}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ y: 20, scale: 0.85, opacity: 0 }}
                              animate={{
                                y: revealStep === "elevate" ? -34 : 0,
                                x: revealStep === "elevate" ? 16 : 0,
                                scale: revealStep === "elevate" ? 1.08 : 1.0,
                                rotate: revealStep === "elevate" ? 3 : 0,
                                opacity: revealStep === "elevate" ? 1 : 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 22,
                                delay: 0.03,
                              }}
                              className="absolute -top-9 -right-2 sm:-right-4 z-40 pointer-events-none"
                            >
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/85 border border-[#d4af37]/60 shadow-[0_8px_20px_rgba(0,0,0,0.85)]">
                                <Sparkles className="w-3 h-3 text-[#d4af37]" />
                                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-[#F5EFEB]">
                                  {dish.garnishIngredient}
                                </span>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </div>

                      {/* Kart Alt Çubuğu - Altın Varak Kazıma Lezzet Adı ve Fiyat Kabartması */}
                      <div className="w-full flex items-center justify-between border-t border-[#d4af37]/25 pt-2.5 text-xs font-mono z-10">
                        <span
                          className="text-white/80 font-serif text-sm sm:text-base font-light tracking-wide truncate max-w-[200px] sm:max-w-[320px]"
                          style={{ textShadow: "0 0 12px rgba(212,175,55,0.4)" }}
                        >
                          {dish.name}
                        </span>
                        {isDishOutOfStock(dish.id) ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-[10px] font-bold tracking-wider">
                            TÜKENDİ
                          </span>
                        ) : (
                          <span
                            className="text-[#e2b34a] font-serif text-base sm:text-xl font-medium tracking-tight"
                            style={{ textShadow: "0 0 15px rgba(226,179,74,0.6)" }}
                          >
                            {dish.price}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sağ Sütun: Altın Kakma Fiyat & Sipariş / AR Butonları (Stacking Context Isolation) */}
            <div className="lg:col-span-3 relative z-[999] pointer-events-auto isolation-isolate flex flex-col items-center lg:items-end justify-center gap-4 select-none order-3">
              <div className="text-center lg:text-right">
                <span className="text-[10px] font-mono text-white/40 tracking-[0.25em] uppercase block">
                  {t.tekPorsiyon}
                </span>
                <div
                  className={`font-serif text-4xl sm:text-5xl font-light tracking-tight transition-all duration-500 ${
                    isDishOutOfStock(activeDish?.id) ? "text-red-400/80" : "text-[#e2b34a]"
                  }`}
                  style={{
                    textShadow:
                      revealStep === "landed" && !isDishOutOfStock(activeDish?.id)
                        ? "0 0 25px rgba(226,179,74,0.75)"
                        : "none",
                  }}
                >
                  {isDishOutOfStock(activeDish?.id) ? t.tukendi : activeDish.price}
                </div>
              </div>

              <div className="w-full sm:w-auto flex flex-col items-center lg:items-end gap-3">
                {/* Sipariş Ekle Butonu (Stok Kontrollü) */}
                <button
                  type="button"
                  id="btn-add-to-cart"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dish = filteredDishes[activeDishIndex] || DISHES[0];
                    handleAddToCart(dish);
                    setIsCartOpen(true);
                  }}
                  disabled={isDishOutOfStock(filteredDishes[activeDishIndex]?.id || DISHES[0].id)}
                  className="cursor-pointer pointer-events-auto relative z-[1000] w-full sm:w-64 py-4 px-8 rounded-2xl bg-[#d4af37] hover:bg-[#e5be46] active:scale-95 text-[#080706] font-mono text-xs uppercase font-bold transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 text-[#080706]" />
                  <span>
                    {isDishOutOfStock(filteredDishes[activeDishIndex]?.id || DISHES[0].id)
                      ? t.tukendi
                      : t.sipariseEkle}
                  </span>
                </button>

                {/* 360° AR İncele Butonu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetDish = filteredDishes[activeDishIndex] || DISHES[0];
                    if (targetDish) openArModalForDish(targetDish);
                  }}
                  className="cursor-pointer pointer-events-auto relative z-[1000] w-full sm:w-64 py-3 px-6 rounded-2xl border border-white/20 hover:border-[#d4af37] bg-white/5 hover:bg-[#d4af37]/10 text-white hover:text-[#d4af37] font-mono text-xs tracking-wider uppercase font-light transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Box className="w-4 h-4 text-[#d4af37]" />
                  <span>360° AR İNCELE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alt Bar: Editoryal Dipnot */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-mono tracking-widest text-white/40 uppercase">
            <span>DİYARBAKIR SUR MİRASI</span>
            <span className="hidden sm:inline">KAYDIRARAK VEYA SAĞA/SOLA ÇEKEREK GEZİN ↓</span>
            <span>GASTRONOMİ KOLEKSİYONU</span>
          </div>
        </motion.div>

        {/* ======================================================================= */}
        {/* AŞAMA 3: TAM EKRAN DIŞ CEPHE VE GÖMÜLÜ TABELA (%75 - %100 SCROLL)      */}
        {/* ======================================================================= */}
        <motion.div
          style={{ opacity: act3Opacity, scale: act3Scale, pointerEvents: act3PointerEvents }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Tam Ekran Kesintisiz Geniş Açı Taş Cephe */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={FACADE_CENTER}
              alt="Beroş Restaurant Tarihi Taş Kemerli Cephe"
              className="w-full h-full object-cover object-top"
            />

            {/* Doğal Tabela Ateşlenmesi: Taş kabartmanın arkasından fışkıran kehribar & neon aurası */}
            {isSignLit && (
              <div
                className="absolute top-[18%] sm:top-[20%] left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-20 sm:h-24 pointer-events-none transition-all duration-1000"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(245,158,11,0.6) 0%, rgba(56,189,248,0.3) 45%, transparent 75%)",
                  filter: "blur(25px)",
                  mixBlendMode: "screen",
                }}
              />
            )}

            {/* Karartma Gradyanları (Alttaki konsiyerj için okunabilirlik) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#080706]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,7,6,0.65)_100%)]" />
          </div>

          {/* Veda Konsiyerji (Alt Merkezde Minimal ve Prestijli - Resmî Kurumsal Metinler) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-end items-center p-8 sm:p-14 pb-12 sm:pb-16 text-center pointer-events-none">
            <div className="max-w-2xl pointer-events-auto">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-2">
                SUR / DİYARBAKIR
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
                Şehrin Ruhunu Taşıyan Bir Sofra Deneyimi
              </h3>
              <p className="mt-2 text-xs sm:text-sm font-serif italic text-[#d4af37]">
                Sizi Ağırlamaktan Onur Duyduk
              </p>
              <p className="mt-3 text-xs sm:text-sm font-sans text-white/70 max-w-lg mx-auto font-light leading-relaxed">
                &ldquo;Gelenekten beslenen mutfağımızı, Sur&apos;un tarihi atmosferinde çağdaş bir sunum anlayışı ve özenli servisle buluşturduk. Tarihi konak kapımız sizlere her zaman açık.&rdquo;
              </p>
              <p className="mt-2 text-[10px] sm:text-xs font-mono tracking-widest text-white/40 uppercase">
                CAMİİ NEBİ MAH. İNÖNÜ CAD. NO: 12 SUR / DİYARBAKIR • BEROŞ RESTAURANT
              </p>
            </div>

            {/* Aksiyon Butonları Grubu */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pointer-events-auto">
              <button
                onClick={() => window.open(RESTAURANT_CONFIG.instagramUrl, "_blank")}
                className="px-4 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2 active:scale-95"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>[@berosrestoran]</span>
              </button>

              <button
                onClick={() => handleServiceCall("Garson")}
                className="px-4 py-2.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Garson Çağır</span>
              </button>

              <a
                href={`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=${encodeURIComponent("Merhaba, Beroş Restaurant için rezervasyon yaptırmak istiyorum.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full border border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/40 backdrop-blur-md text-xs font-mono tracking-wider text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Rezervasyon</span>
              </a>

              <a
                href={`tel:${RESTAURANT_CONFIG.phone}`}
                className="px-4 py-2.5 rounded-full border border-white/20 hover:border-white/40 bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 transition-all flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>0538 697 63 53</span>
              </a>

              <button
                onClick={() => window.open(RESTAURANT_CONFIG.mapsDirectionUrl, "_blank")}
                className="px-4 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2 active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Harita Yol Tarifi</span>
              </button>

              {/* WiFi Şifresi Kopyalama */}
              <button
                onClick={handleCopyWifi}
                className="px-4 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2 active:scale-95"
                title="WiFi Şifresini Kopyala"
              >
                <Wifi className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{wifiCopied ? "Şifre Kopyalandı!" : `WiFi: ${RESTAURANT_CONFIG.wifiPass}`}</span>
              </button>

              <button
                onClick={() => scrollToSection(0)}
                className="px-4 py-2.5 rounded-full bg-[#d4af37] hover:bg-[#e6c158] text-[#080706] text-xs font-mono tracking-wider font-semibold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Yukarı Çık ↑</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CANLI TEPSİ / SEPET WHATSAPP ADİSYON ÇEKMECESİ                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md h-full bg-[#100c09] border-l border-[#d4af37]/30 p-6 sm:p-8 flex flex-col justify-between text-white shadow-2xl z-10 overflow-hidden"
            >
              {/* Drawer Top */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase">
                      {t.tepsiBaslik}
                    </span>
                    <h3 className="font-serif text-2xl font-light text-white flex items-center gap-2 mt-0.5">
                      <span>{tableNo}</span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        AKTİF
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="mt-4 max-h-[48vh] overflow-y-auto no-scrollbar space-y-3">
                  {cart.length === 0 ? (
                    <div className="py-16 text-center text-white/40 space-y-2">
                      <ShoppingBag className="w-10 h-10 mx-auto text-[#d4af37]/30" />
                      <p className="font-serif text-lg text-white/70">{t.bosTepsi}</p>
                      <p className="text-xs font-mono">
                        {t.bosTepsiAlt}
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div className="flex-1 pr-2">
                          <h4 className="text-sm font-serif text-white">{item.name}</h4>
                          <span className="text-xs font-mono text-[#d4af37]">
                            ₺{item.price}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm w-5 text-center text-white font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-16 text-right font-mono text-xs text-white font-semibold pl-2">
                          ₺{item.price * item.quantity}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer Bottom Action & Checkout */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                {/* AKILLI ÇAPRAZ SATIŞ (UPSELLING) KARTI */}
                {cart.length > 0 && !cart.some((i) => i.id === "acik-ayran") && (
                  <div className="p-3 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[10px] font-mono uppercase text-[#d4af37] font-bold block">
                        ⚡ {t.sefinTavsiyesi}
                      </span>
                      <p className="text-xs text-white/80">{t.ayranOneri}</p>
                      <span className="text-xs font-mono text-[#d4af37] font-semibold">₺75</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart({
                          id: "acik-ayran",
                          name: "Yayık Açık Ayran",
                          priceNum: 75,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#e5be46] text-black font-mono text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      {t.birTiklaEkle}
                    </button>
                  </div>
                )}

                {cart.length > 0 && !cart.some((i) => i.id === "fistikli-kadayif") && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                        🍰 {t.sefinTavsiyesi}
                      </span>
                      <p className="text-xs text-white/80">{t.tatliOneri}</p>
                      <span className="text-xs font-mono text-amber-400 font-semibold">₺430</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart({
                          id: "fistikli-kadayif",
                          name: "Diyarbakır Burma Kadayıf",
                          priceNum: 430,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      {t.birTiklaEkle}
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-white/50">
                    <span>Servis / Kuver</span>
                    <span className="text-emerald-400 font-medium">Dahil</span>
                  </div>
                  <div className="flex justify-between text-base font-serif text-white pt-1 border-t border-white/5">
                    <span>{t.toplam}</span>
                    <span className="text-xl text-[#d4af37] font-mono font-bold">
                      ₺{totalAmount}
                    </span>
                  </div>
                </div>

                {/* Primary In-System Order Button */}
                <button
                  type="button"
                  id="btn-submit-order"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCheckoutInSystem();
                  }}
                  disabled={cart.length === 0 || isOrderSubmitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-bold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.35)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer relative z-[100] pointer-events-auto"
                >
                  <Utensils className="w-4 h-4" />
                  <span>
                    {isOrderSubmitting ? t.iletiliyor : t.siparisiGonder}
                  </span>
                </button>

                {/* Quick Service Buttons: Nakit / POS / Garson */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleServiceCall("Hesap İste (Nakit)")}
                    className="relative z-[90] pointer-events-auto cursor-pointer py-2 px-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    {t.nakitHesap}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleServiceCall("Hesap İste (Kredi Kartı)")}
                    className="relative z-[90] pointer-events-auto cursor-pointer py-2 px-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    {t.kartHesap}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleServiceCall("Garson")}
                    className="relative z-[90] pointer-events-auto cursor-pointer py-2 px-1 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    {t.garsonCagri}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      

      {/* ========================================================================= */}
      {/* 4. MASA REZERVASYONU MODAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReservationOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0c0a09] border border-white/15 rounded-2xl p-6 sm:p-8 text-white shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#d4af37] tracking-[0.3em] uppercase">
                    MICHELIN STANDARD CONCIERGE
                  </span>
                  <h3 className="font-serif text-2xl font-light mt-1">
                    Masa Rezervasyonu
                  </h3>
                </div>
                <button
                  onClick={() => setIsReservationOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-xl">
                    Talebiniz Alındı, Teşekkür Ederiz
                  </h4>
                  <p className="text-xs font-mono text-white/60 max-w-sm mx-auto">
                    Konak resepsiyonumuz {resPhone || "numaranız"} üzerinden en
                    kısa sürede konfirmasyon sağlayacaktır.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-white/50 tracking-wider uppercase block mb-1">
                        TARİH & SAAT
                      </label>
                      <select
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="Bu Akşam (19:30)" className="bg-[#0c0a09]">
                          Bu Akşam (19:30)
                        </option>
                        <option value="Bu Akşam (20:30)" className="bg-[#0c0a09]">
                          Bu Akşam (20:30)
                        </option>
                        <option value="Yarın Akşam (19:30)" className="bg-[#0c0a09]">
                          Yarın Akşam (19:30)
                        </option>
                        <option value="Yarın Akşam (20:30)" className="bg-[#0c0a09]">
                          Yarın Akşam (20:30)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-white/50 tracking-wider uppercase block mb-1">
                        KİŞİ SAYISI
                      </label>
                      <select
                        value={resGuests}
                        onChange={(e) => setResGuests(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="2 Kişi" className="bg-[#0c0a09]">
                          2 Kişi
                        </option>
                        <option value="4 Kişi" className="bg-[#0c0a09]">
                          4 Kişi
                        </option>
                        <option value="6 Kişi" className="bg-[#0c0a09]">
                          6 Kişi
                        </option>
                        <option value="8+ Kişi (Özel Loca)" className="bg-[#0c0a09]">
                          8+ Kişi (Özel Loca)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-white/50 tracking-wider uppercase block mb-1">
                      İSİM & SOYİSİM
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-white/50 tracking-wider uppercase block mb-1">
                      TELEFON NUMARASI
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="053X XXX XX XX"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-white/50 tracking-wider uppercase block mb-1">
                      ÖZEL TALEPLER (OPSİYONEL)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Kemer altı avlu masası, kutlama notu vb."
                      value={resNote}
                      onChange={(e) => setResNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 rounded-full bg-[#d4af37] hover:bg-[#e6c158] text-[#080706] font-mono text-xs tracking-[0.25em] uppercase font-semibold transition-all active:scale-95"
                  >
                    REZERVASYONU ONAYLA
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. FULL-BLEED OBSIDIAN GALLERY CURTAIN OVERLAY                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[1000] bg-[#080706]/98 backdrop-blur-3xl p-8 sm:p-16 flex flex-col justify-between text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="font-serif tracking-[0.3em] text-2xl font-light text-[#d4af37]">
                BEROŞ RESTAURANT
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto space-y-6 sm:space-y-8">
              <div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection(0);
                  }}
                  className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white/70 hover:text-white hover:translate-x-3 transition-all"
                >
                  01 / ASIRLIK KONAK
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection(0.35);
                  }}
                  className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#d4af37] hover:translate-x-3 transition-all"
                >
                  02 / GASTRONOMİ & MENÜ
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection(0.85);
                  }}
                  className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white/70 hover:text-white hover:translate-x-3 transition-all"
                >
                  03 / TARİHİ CEPHE & VEDA
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/50 tracking-widest">
              <div>SUR / DİYARBAKIR • M.Ö. 3000</div>
              <div>TEL: +90 538 697 63 53</div>
              <div>INSTAGRAM: @BEROSRESTORAN</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. AR SPATIAL VIEWER MODAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {arModalDish && (
          <ArSpatialViewer
            dish={arModalDish}
            onClose={() => setArModalDish(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
