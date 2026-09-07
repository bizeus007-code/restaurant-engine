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
  Clock,
  ShieldAlert,
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

export interface MenuItem {
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
  desc?: string;
  chefNote?: string;
  dishImage?: string;
  isTransparentPng?: boolean;
  isBluePlate?: boolean;
  portion?: string;
  courseNumber?: string;
  meatIngredient?: string;
  garnishIngredient?: string;
  allergens?: string | string[];
}

const CATEGORIES = [
  { id: "yoresel", slug: "yoresel", label: "YÖRESEL" },
  { id: "spesiyaller", slug: "spesiyaller", label: "SPESİYALLER" },
  { id: "tas-firin", slug: "tas-firin", label: "TAŞ FIRIN & PİDE" },
  { id: "ara-sicak", slug: "ara-sicak", label: "ARA SICAKLAR" },
  { id: "tavuk", slug: "tavuk", label: "TAVUK ÇEŞİTLERİ" },
  { id: "cocuk", slug: "cocuk", label: "ÇOCUK MENÜSÜ" },
  { id: "tatli", slug: "tatli", label: "TATLILAR" },
  { id: "soguklar", slug: "soguklar", label: "SOĞUKLAR & MEZE" },
  { id: "icecekler", slug: "icecekler", label: "İÇECEKLER" },
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
    yoresel: "YÖRESEL LEZZETLER",
    spesiyaller: "SPESİYALLER",
    "tas-firin": "TAŞ FIRIN & PİDE",
    "ara-sicak": "ARA SICAKLAR",
    tavuk: "TAVUK ÇEŞİTLERİ",
    cocuk: "ÇOCUK MENÜSÜ",
    tatli: "TATLILAR",
    soguklar: "SOĞUKLAR & MEZE",
    icecekler: "İÇECEKLER",
  },
  EN: {
    yoresel: "TRADITIONAL",
    spesiyaller: "SPECIALS",
    "tas-firin": "STONE OVEN & PIDE",
    "ara-sicak": "WARM STARTERS",
    tavuk: "CHICKEN VARIETIES",
    cocuk: "KIDS MENU",
    tatli: "DESSERTS",
    soguklar: "COLD MEZZE",
    icecekler: "BEVERAGES",
  },
  AR: {
    yoresel: "أطباق تقليدية",
    spesiyaller: "المميزات",
    "tas-firin": "فرن الحجر والفطائر",
    "ara-sicak": "المقبلات الساخنة",
    tavuk: "أطباق الدجاج",
    cocuk: "قائمة الأطفال",
    tatli: "حلويات",
    soguklar: "المقبلات الباردة",
    icecekler: "مشروبات",
  },
};

const DISHES: MenuItem[] = [
  {
    "id": "kol-dolmasi-2-kisilik",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Kol Dolması (2 Kişilik)",
    "subtitle": "12 saat kısık ateşte demlenen bütün kuzu kol dolması, bademli iç pilav ile bakır sahanda.",
    "description": "12 saat kısık ateşte demlenen bütün kuzu kol dolması, bademli iç pilav ile bakır sahanda.",
    "desc": "12 saat kısık ateşte demlenen bütün kuzu kol dolması, bademli iç pilav ile bakır sahanda.",
    "chefNote": "12 saat kısık ateşte demlenen bütün kuzu kol dolması, bademli iç pilav ile bakır sahanda.",
    "price": "₺ 1.300",
    "priceNum": 1300,
    "image": "/dishes/kol-dolmasi.png",
    "dishImage": "/dishes/kol-dolmasi.png",
    "calories": "1450 kcal",
    "prepTime": "35 dk",
    "allergens": "Kuruyemiş (Badem)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "asci-tabagi",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Aşçı Tabağı",
    "subtitle": "Tandır, kuzu incik, kol dolması ve pilavdan oluşan zengin konak seçkisi.",
    "description": "Tandır, kuzu incik, kol dolması ve pilavdan oluşan zengin konak seçkisi.",
    "desc": "Tandır, kuzu incik, kol dolması ve pilavdan oluşan zengin konak seçkisi.",
    "chefNote": "Tandır, kuzu incik, kol dolması ve pilavdan oluşan zengin konak seçkisi.",
    "price": "₺ 985",
    "priceNum": 985,
    "image": "/dishes/asci-tabagi.png",
    "dishImage": "/dishes/asci-tabagi.png",
    "calories": "1150 kcal",
    "prepTime": "20 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "keci-kavurmasi",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Keçi Kavurması",
    "subtitle": "Taş fırında ağır ateşte pişen yöresel keçi kavurması.",
    "description": "Taş fırında ağır ateşte pişen yöresel keçi kavurması.",
    "desc": "Taş fırında ağır ateşte pişen yöresel keçi kavurması.",
    "chefNote": "Taş fırında ağır ateşte pişen yöresel keçi kavurması.",
    "price": "₺ 720",
    "priceNum": 720,
    "image": "/dishes/keci-kavurmasi.png",
    "dishImage": "/dishes/keci-kavurmasi.png",
    "calories": "650 kcal",
    "prepTime": "20 dk",
    "allergens": "Doğal Et (Alerjensiz)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "pilav-ustu-kol-dolmasi",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Pilav Üstü Kuzu Kol Dolması",
    "subtitle": "Bademli iç pilav üzerinde servis edilen kuzu kol eti.",
    "description": "Bademli iç pilav üzerinde servis edilen kuzu kol eti.",
    "desc": "Bademli iç pilav üzerinde servis edilen kuzu kol eti.",
    "chefNote": "Bademli iç pilav üzerinde servis edilen kuzu kol eti.",
    "price": "₺ 690",
    "priceNum": 690,
    "image": "/dishes/pilav-ustu-kol-dolmasi.png",
    "dishImage": "/dishes/pilav-ustu-kol-dolmasi.png",
    "calories": "820 kcal",
    "prepTime": "15 dk",
    "allergens": "Kuruyemiş (Badem), Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "pilav-ustu-tandir",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Pilav Üstü Tandır",
    "subtitle": "Taş fırında pişen kuzu tandır eti, tane pirinç pilavı ile.",
    "description": "Taş fırında pişen kuzu tandır eti, tane pirinç pilavı ile.",
    "desc": "Taş fırında pişen kuzu tandır eti, tane pirinç pilavı ile.",
    "chefNote": "Taş fırında pişen kuzu tandır eti, tane pirinç pilavı ile.",
    "price": "₺ 685",
    "priceNum": 685,
    "image": "/dishes/pilav-ustu-tandir.png",
    "dishImage": "/dishes/pilav-ustu-tandir.png",
    "calories": "780 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "firinda-kuzu-incik",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Fırında Kuzu İncik",
    "subtitle": "Fırınlanmış kök sebzeler ve ilikli et sosu ile ağır pişirim.",
    "description": "Fırınlanmış kök sebzeler ve ilikli et sosu ile ağır pişirim.",
    "desc": "Fırınlanmış kök sebzeler ve ilikli et sosu ile ağır pişirim.",
    "chefNote": "Fırınlanmış kök sebzeler ve ilikli et sosu ile ağır pişirim.",
    "price": "₺ 680",
    "priceNum": 680,
    "image": "/dishes/firinda-kuzu-incik.png",
    "dishImage": "/dishes/firinda-kuzu-incik.png",
    "calories": "710 kcal",
    "prepTime": "20 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "firin-agzi",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Fırın Ağzı",
    "subtitle": "Kuzu eti, sarımsak ve biberle tepside nar gibi kızartılan Diyarbakır klasiği.",
    "description": "Kuzu eti, sarımsak ve biberle tepside nar gibi kızartılan Diyarbakır klasiği.",
    "desc": "Kuzu eti, sarımsak ve biberle tepside nar gibi kızartılan Diyarbakır klasiği.",
    "chefNote": "Kuzu eti, sarımsak ve biberle tepside nar gibi kızartılan Diyarbakır klasiği.",
    "price": "₺ 680",
    "priceNum": 680,
    "image": "/dishes/firin-agzi.png",
    "dishImage": "/dishes/firin-agzi.png",
    "calories": "740 kcal",
    "prepTime": "25 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "patlican-yataginda-incik",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Patlıcan Yatağında Kuzu İncik",
    "subtitle": "Közlenmiş patlıcan beğendi üzerinde yumuşacık kuzu incik.",
    "description": "Közlenmiş patlıcan beğendi üzerinde yumuşacık kuzu incik.",
    "desc": "Közlenmiş patlıcan beğendi üzerinde yumuşacık kuzu incik.",
    "chefNote": "Közlenmiş patlıcan beğendi üzerinde yumuşacık kuzu incik.",
    "price": "₺ 670",
    "priceNum": 670,
    "image": "/dishes/patlicanli-incik.png",
    "dishImage": "/dishes/patlicanli-incik.png",
    "calories": "680 kcal",
    "prepTime": "20 dk",
    "allergens": "Laktoz (Süt/Tereyağı)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "firinda-gerdan",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Fırında Gerdan",
    "subtitle": "Kemik suyunda lif lif ayrılan kuzu gerdan eti.",
    "description": "Kemik suyunda lif lif ayrılan kuzu gerdan eti.",
    "desc": "Kemik suyunda lif lif ayrılan kuzu gerdan eti.",
    "chefNote": "Kemik suyunda lif lif ayrılan kuzu gerdan eti.",
    "price": "₺ 670",
    "priceNum": 670,
    "image": "/dishes/firinda-gerdan.png",
    "dishImage": "/dishes/firinda-gerdan.png",
    "calories": "670 kcal",
    "prepTime": "18 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kuzu-gerdan",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Kuzu Gerdan",
    "subtitle": "Döküm tavada köz biber ve domates eşliğinde geleneksel gerdan.",
    "description": "Döküm tavada köz biber ve domates eşliğinde geleneksel gerdan.",
    "desc": "Döküm tavada köz biber ve domates eşliğinde geleneksel gerdan.",
    "chefNote": "Döküm tavada köz biber ve domates eşliğinde geleneksel gerdan.",
    "price": "₺ 670",
    "priceNum": 670,
    "image": "/dishes/kuzu-gerdan.png",
    "dishImage": "/dishes/kuzu-gerdan.png",
    "calories": "640 kcal",
    "prepTime": "15 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kuzu-haslama",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Kuzu Haşlama",
    "subtitle": "Şifalı ilikli et suyu, taze patates ve havuç ile haşlama.",
    "description": "Şifalı ilikli et suyu, taze patates ve havuç ile haşlama.",
    "desc": "Şifalı ilikli et suyu, taze patates ve havuç ile haşlama.",
    "chefNote": "Şifalı ilikli et suyu, taze patates ve havuç ile haşlama.",
    "price": "₺ 670",
    "priceNum": 670,
    "image": "/dishes/kuzu-haslama.png",
    "dishImage": "/dishes/kuzu-haslama.png",
    "calories": "580 kcal",
    "prepTime": "15 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kekikli-kuzu-budu",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Kekikli Kuzu Budu",
    "subtitle": "Dağ kekiği aromalı fırınlanmış kuzu budu.",
    "description": "Dağ kekiği aromalı fırınlanmış kuzu budu.",
    "desc": "Dağ kekiği aromalı fırınlanmış kuzu budu.",
    "chefNote": "Dağ kekiği aromalı fırınlanmış kuzu budu.",
    "price": "₺ 670",
    "priceNum": 670,
    "image": "/dishes/kekikli-kuzu-budu.png",
    "dishImage": "/dishes/kekikli-kuzu-budu.png",
    "calories": "670 kcal",
    "prepTime": "20 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kuzu-graten",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Kuzu Graten",
    "subtitle": "Fırınlanmış kaşar kabuklu kuzu eti dilimleri.",
    "description": "Fırınlanmış kaşar kabuklu kuzu eti dilimleri.",
    "desc": "Fırınlanmış kaşar kabuklu kuzu eti dilimleri.",
    "chefNote": "Fırınlanmış kaşar kabuklu kuzu eti dilimleri.",
    "price": "₺ 680",
    "priceNum": 680,
    "image": "/dishes/kuzu-graten.png",
    "dishImage": "/dishes/kuzu-graten.png",
    "calories": "730 kcal",
    "prepTime": "20 dk",
    "allergens": "Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "diyarbakir-kavurma",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Diyarbakır Kavurma",
    "subtitle": "Kendi yağında meşe közünde demlenen geleneksel kavurma.",
    "description": "Kendi yağında meşe közünde demlenen geleneksel kavurma.",
    "desc": "Kendi yağında meşe közünde demlenen geleneksel kavurma.",
    "chefNote": "Kendi yağında meşe közünde demlenen geleneksel kavurma.",
    "price": "₺ 660",
    "priceNum": 660,
    "image": "/dishes/diyarbakir-kavurma.png",
    "dishImage": "/dishes/diyarbakir-kavurma.png",
    "calories": "690 kcal",
    "prepTime": "15 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "sade-tandir",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Sade Tandır",
    "subtitle": "Kuyuda pişmiş tandır eti, tırnak pide ile.",
    "description": "Kuyuda pişmiş tandır eti, tırnak pide ile.",
    "desc": "Kuyuda pişmiş tandır eti, tırnak pide ile.",
    "chefNote": "Kuyuda pişmiş tandır eti, tırnak pide ile.",
    "price": "₺ 560",
    "priceNum": 560,
    "image": "/dishes/sade-tandir.png",
    "dishImage": "/dishes/sade-tandir.png",
    "calories": "620 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten (Pide)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "firin-guvec",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Fırın Güveç",
    "subtitle": "Toprak güveçte kuzu kuşbaşı, domates ve patlıcan uyumu.",
    "description": "Toprak güveçte kuzu kuşbaşı, domates ve patlıcan uyumu.",
    "desc": "Toprak güveçte kuzu kuşbaşı, domates ve patlıcan uyumu.",
    "chefNote": "Toprak güveçte kuzu kuşbaşı, domates ve patlıcan uyumu.",
    "price": "₺ 480",
    "priceNum": 480,
    "image": "/dishes/firin-guvec.png",
    "dishImage": "/dishes/firin-guvec.png",
    "calories": "520 kcal",
    "prepTime": "20 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "eksili-kofte",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Ekşili Köfte",
    "subtitle": "Sumaklı yöresel sos eşliğinde konak köftesi.",
    "description": "Sumaklı yöresel sos eşliğinde konak köftesi.",
    "desc": "Sumaklı yöresel sos eşliğinde konak köftesi.",
    "chefNote": "Sumaklı yöresel sos eşliğinde konak köftesi.",
    "price": "₺ 480",
    "priceNum": 480,
    "image": "/dishes/eksili-kofte.png",
    "dishImage": "/dishes/eksili-kofte.png",
    "calories": "510 kcal",
    "prepTime": "18 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "etsiz-sebze-yemegi",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Etsiz Sebze Yemeği",
    "subtitle": "Mevsim sebzeleriyle hazırlanan hafif güveç.",
    "description": "Mevsim sebzeleriyle hazırlanan hafif güveç.",
    "desc": "Mevsim sebzeleriyle hazırlanan hafif güveç.",
    "chefNote": "Mevsim sebzeleriyle hazırlanan hafif güveç.",
    "price": "₺ 475",
    "priceNum": 475,
    "image": "/dishes/sebze-yemegi.png",
    "dishImage": "/dishes/sebze-yemegi.png",
    "calories": "310 kcal",
    "prepTime": "15 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "az-kavurma",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Az Kavurma",
    "subtitle": "Tek kişilik porsiyon Diyarbakır kavurması.",
    "description": "Tek kişilik porsiyon Diyarbakır kavurması.",
    "desc": "Tek kişilik porsiyon Diyarbakır kavurması.",
    "chefNote": "Tek kişilik porsiyon Diyarbakır kavurması.",
    "price": "₺ 410",
    "priceNum": 410,
    "image": "/dishes/az-kavurma.png",
    "dishImage": "/dishes/az-kavurma.png",
    "calories": "420 kcal",
    "prepTime": "10 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "az-tandir",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Az Tandır",
    "subtitle": "Tek kişilik porsiyon taş fırın tandır eti.",
    "description": "Tek kişilik porsiyon taş fırın tandır eti.",
    "desc": "Tek kişilik porsiyon taş fırın tandır eti.",
    "chefNote": "Tek kişilik porsiyon taş fırın tandır eti.",
    "price": "₺ 410",
    "priceNum": 410,
    "image": "/dishes/az-tandir.png",
    "dishImage": "/dishes/az-tandir.png",
    "calories": "390 kcal",
    "prepTime": "10 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "az-guvec",
    "category": "Yöresel",
    "categorySlug": "yoresel",
    "name": "Az Güveç",
    "subtitle": "Küçük boy toprak kapta fırın güveç.",
    "description": "Küçük boy toprak kapta fırın güveç.",
    "desc": "Küçük boy toprak kapta fırın güveç.",
    "chefNote": "Küçük boy toprak kapta fırın güveç.",
    "price": "₺ 300",
    "priceNum": 300,
    "image": "/dishes/az-guvec.png",
    "dishImage": "/dishes/az-guvec.png",
    "calories": "310 kcal",
    "prepTime": "12 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "ozel-siparis-kaburga",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Özel Sipariş Kaburga",
    "subtitle": "Özel bakır tepside bademli iç pilavlı bütün kaburga ziyafeti.",
    "description": "Özel bakır tepside bademli iç pilavlı bütün kaburga ziyafeti.",
    "desc": "Özel bakır tepside bademli iç pilavlı bütün kaburga ziyafeti.",
    "chefNote": "Özel bakır tepside bademli iç pilavlı bütün kaburga ziyafeti.",
    "price": "₺ 1.650",
    "priceNum": 1650,
    "image": "/dishes/ozel-siparis-kaburga.png",
    "dishImage": "/dishes/ozel-siparis-kaburga.png",
    "calories": "2200 kcal",
    "prepTime": "45 dk",
    "allergens": "Kuruyemiş (Badem), Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "beros-usulu-loqum-bonfile",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Beroş Usulü Loqum Bonfile",
    "subtitle": "Özel peynir sosu ve sote mevsim sebzeleri ile servis edilir.",
    "description": "Özel peynir sosu ve sote mevsim sebzeleri ile servis edilir.",
    "desc": "Özel peynir sosu ve sote mevsim sebzeleri ile servis edilir.",
    "chefNote": "Özel peynir sosu ve sote mevsim sebzeleri ile servis edilir.",
    "price": "₺ 920",
    "priceNum": 920,
    "image": "/dishes/beros-usulu-loqum-bonfile.png",
    "dishImage": "/dishes/beros-usulu-loqum-bonfile.png",
    "calories": "780 kcal",
    "prepTime": "20 dk",
    "allergens": "Laktoz (Peynir)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "patates-yataginda-bonfile",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Patates Yatağında Bonfile",
    "subtitle": "İpeksi patates püresi üzerinde ızgara dana bonfile.",
    "description": "İpeksi patates püresi üzerinde ızgara dana bonfile.",
    "desc": "İpeksi patates püresi üzerinde ızgara dana bonfile.",
    "chefNote": "İpeksi patates püresi üzerinde ızgara dana bonfile.",
    "price": "₺ 910",
    "priceNum": 910,
    "image": "/dishes/patates-yataginda-bonfile.png",
    "dishImage": "/dishes/patates-yataginda-bonfile.png",
    "calories": "720 kcal",
    "prepTime": "20 dk",
    "allergens": "Laktoz (Süt/Tereyağı)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "beros-usulu-acili-bonfile",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Beroş Usulü Acılı Bonfile",
    "subtitle": "Diyarbakır köz acı biberi soslu marine bonfile.",
    "description": "Diyarbakır köz acı biberi soslu marine bonfile.",
    "desc": "Diyarbakır köz acı biberi soslu marine bonfile.",
    "chefNote": "Diyarbakır köz acı biberi soslu marine bonfile.",
    "price": "₺ 910",
    "priceNum": 910,
    "image": "/dishes/beros-usulu-acili-bonfile.png",
    "dishImage": "/dishes/beros-usulu-acili-bonfile.png",
    "calories": "690 kcal",
    "prepTime": "20 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "loqum-bonfile",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Loqum Bonfile",
    "subtitle": "Tereyağında mühürlenmiş lokum bonfile ve kızarmış ekmek.",
    "description": "Tereyağında mühürlenmiş lokum bonfile ve kızarmış ekmek.",
    "desc": "Tereyağında mühürlenmiş lokum bonfile ve kızarmış ekmek.",
    "chefNote": "Tereyağında mühürlenmiş lokum bonfile ve kızarmış ekmek.",
    "price": "₺ 900",
    "priceNum": 900,
    "image": "/dishes/loqum-bonfile.png",
    "dishImage": "/dishes/loqum-bonfile.png",
    "calories": "650 kcal",
    "prepTime": "18 dk",
    "allergens": "Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "cokertme",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Çökertme",
    "subtitle": "Çıtır kibrit patates, süzme yoğurt ve domates soslu dana bonfile.",
    "description": "Çıtır kibrit patates, süzme yoğurt ve domates soslu dana bonfile.",
    "desc": "Çıtır kibrit patates, süzme yoğurt ve domates soslu dana bonfile.",
    "chefNote": "Çıtır kibrit patates, süzme yoğurt ve domates soslu dana bonfile.",
    "price": "₺ 845",
    "priceNum": 845,
    "image": "/dishes/cokertme.png",
    "dishImage": "/dishes/cokertme.png",
    "calories": "820 kcal",
    "prepTime": "22 dk",
    "allergens": "Laktoz (Yoğurt), Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "beros-special-1",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Beroş Special 1",
    "subtitle": "Fırınlanmış kaşar erimesi, çıtır patates ve kuru meyveler ile.",
    "description": "Fırınlanmış kaşar erimesi, çıtır patates ve kuru meyveler ile.",
    "desc": "Fırınlanmış kaşar erimesi, çıtır patates ve kuru meyveler ile.",
    "chefNote": "Fırınlanmış kaşar erimesi, çıtır patates ve kuru meyveler ile.",
    "price": "₺ 845",
    "priceNum": 845,
    "image": "/dishes/beros-special-1.png",
    "dishImage": "/dishes/beros-special-1.png",
    "calories": "860 kcal",
    "prepTime": "25 dk",
    "allergens": "Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "special-kuzu-sirt",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Beroş Special Kuzu Sırt",
    "subtitle": "Lokum kıvamında marine edilmiş ızgara kuzu sırt dilimleri.",
    "description": "Lokum kıvamında marine edilmiş ızgara kuzu sırt dilimleri.",
    "desc": "Lokum kıvamında marine edilmiş ızgara kuzu sırt dilimleri.",
    "chefNote": "Lokum kıvamında marine edilmiş ızgara kuzu sırt dilimleri.",
    "price": "₺ 725",
    "priceNum": 725,
    "image": "/dishes/special-kuzu-sirt.png",
    "dishImage": "/dishes/special-kuzu-sirt.png",
    "calories": "690 kcal",
    "prepTime": "18 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "ayvali-kavurma",
    "category": "Spesiyaller",
    "categorySlug": "spesiyaller",
    "name": "Diyarbakır Ayvalı Kavurma",
    "subtitle": "Karamelize ayva dilimleri ve kuzu etinin bakır sahandaki lezzeti.",
    "description": "Karamelize ayva dilimleri ve kuzu etinin bakır sahandaki lezzeti.",
    "desc": "Karamelize ayva dilimleri ve kuzu etinin bakır sahandaki lezzeti.",
    "chefNote": "Karamelize ayva dilimleri ve kuzu etinin bakır sahandaki lezzeti.",
    "price": "₺ 725",
    "priceNum": 725,
    "image": "/dishes/ayvali-kavurma.png",
    "dishImage": "/dishes/ayvali-kavurma.png",
    "calories": "725 kcal",
    "prepTime": "20 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "sac-tava",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Sur Usulü Sac Tava",
    "subtitle": "Özel sac üzerinde domates, sarımsak ve biberle demlenen et ziyafeti.",
    "description": "Özel sac üzerinde domates, sarımsak ve biberle demlenen et ziyafeti.",
    "desc": "Özel sac üzerinde domates, sarımsak ve biberle demlenen et ziyafeti.",
    "chefNote": "Özel sac üzerinde domates, sarımsak ve biberle demlenen et ziyafeti.",
    "price": "₺ 800",
    "priceNum": 800,
    "image": "/dishes/sac-tava.png",
    "dishImage": "/dishes/sac-tava.png",
    "calories": "840 kcal",
    "prepTime": "18 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "pide-1-5-kusbasili",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "1,5 Porsiyon Kuşbaşılı Pide",
    "subtitle": "Taş fırında çıtır pişen bol etli 1.5 porsiyon pide.",
    "description": "Taş fırında çıtır pişen bol etli 1.5 porsiyon pide.",
    "desc": "Taş fırında çıtır pişen bol etli 1.5 porsiyon pide.",
    "chefNote": "Taş fırında çıtır pişen bol etli 1.5 porsiyon pide.",
    "price": "₺ 750",
    "priceNum": 750,
    "image": "/dishes/pide-1-5-kusbasili.png",
    "dishImage": "/dishes/pide-1-5-kusbasili.png",
    "calories": "980 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kusbasi-kasarli-pide",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Kuşbaşı Kaşarlı Pide",
    "subtitle": "Satır kuşbaşı eti ve erimiş kaşarın taş fırındaki uyumu.",
    "description": "Satır kuşbaşı eti ve erimiş kaşarın taş fırındaki uyumu.",
    "desc": "Satır kuşbaşı eti ve erimiş kaşarın taş fırındaki uyumu.",
    "chefNote": "Satır kuşbaşı eti ve erimiş kaşarın taş fırındaki uyumu.",
    "price": "₺ 595",
    "priceNum": 595,
    "image": "/dishes/kusbasi-kasarli-pide.png",
    "dishImage": "/dishes/kusbasi-kasarli-pide.png",
    "calories": "880 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kusbasi-pide",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Kuşbaşı Pide",
    "subtitle": "Geleneksel hamur ve zırh kuşbaşı harcı ile.",
    "description": "Geleneksel hamur ve zırh kuşbaşı harcı ile.",
    "desc": "Geleneksel hamur ve zırh kuşbaşı harcı ile.",
    "chefNote": "Geleneksel hamur ve zırh kuşbaşı harcı ile.",
    "price": "₺ 570",
    "priceNum": 570,
    "image": "/dishes/kusbasi-pide.png",
    "dishImage": "/dishes/kusbasi-pide.png",
    "calories": "760 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kasarli-pide",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Kaşarlı Pide",
    "subtitle": "Halhalı tereyağı ve yoğun kaşar peynirli fırın klasiği.",
    "description": "Halhalı tereyağı ve yoğun kaşar peynirli fırın klasiği.",
    "desc": "Halhalı tereyağı ve yoğun kaşar peynirli fırın klasiği.",
    "chefNote": "Halhalı tereyağı ve yoğun kaşar peynirli fırın klasiği.",
    "price": "₺ 560",
    "priceNum": 560,
    "image": "/dishes/kasarli-pide.png",
    "dishImage": "/dishes/kasarli-pide.png",
    "calories": "790 kcal",
    "prepTime": "12 dk",
    "allergens": "Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kiymali-yumurtali-pide",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Kıymalı Yumurtalı Pide",
    "subtitle": "Özel baharatlı kıyma harcı ve köy yumurtası ile.",
    "description": "Özel baharatlı kıyma harcı ve köy yumurtası ile.",
    "desc": "Özel baharatlı kıyma harcı ve köy yumurtası ile.",
    "chefNote": "Özel baharatlı kıyma harcı ve köy yumurtası ile.",
    "price": "₺ 535",
    "priceNum": 535,
    "image": "/dishes/kiymali-yumurtali-pide.png",
    "dishImage": "/dishes/kiymali-yumurtali-pide.png",
    "calories": "810 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten, Yumurta",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "findik-lahmacun",
    "category": "Taş Fırın & Pide",
    "categorySlug": "tas-firin",
    "name": "Fındık Lahmacun",
    "subtitle": "Çıtır hamurlu mini konak lahmacunu.",
    "description": "Çıtır hamurlu mini konak lahmacunu.",
    "desc": "Çıtır hamurlu mini konak lahmacunu.",
    "chefNote": "Çıtır hamurlu mini konak lahmacunu.",
    "price": "₺ 85",
    "priceNum": 85,
    "image": "/dishes/findik-lahmacun.png",
    "dishImage": "/dishes/findik-lahmacun.png",
    "calories": "160 kcal",
    "prepTime": "10 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "mumbar",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "Mumbar",
    "subtitle": "Döküm tencerede geleneksel baharatlı pirinç dolgulu mumbar.",
    "description": "Döküm tencerede geleneksel baharatlı pirinç dolgulu mumbar.",
    "desc": "Döküm tencerede geleneksel baharatlı pirinç dolgulu mumbar.",
    "chefNote": "Döküm tencerede geleneksel baharatlı pirinç dolgulu mumbar.",
    "price": "₺ 480",
    "priceNum": 480,
    "image": "/dishes/mumbar.png",
    "dishImage": "/dishes/mumbar.png",
    "calories": "620 kcal",
    "prepTime": "15 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "talas-boregi",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "Talaş Böreği",
    "subtitle": "Çıtır milföy içinde kuşbaşı et ve bezelyeli konak böreği.",
    "description": "Çıtır milföy içinde kuşbaşı et ve bezelyeli konak böreği.",
    "desc": "Çıtır milföy içinde kuşbaşı et ve bezelyeli konak böreği.",
    "chefNote": "Çıtır milföy içinde kuşbaşı et ve bezelyeli konak böreği.",
    "price": "₺ 220",
    "priceNum": 220,
    "image": "/dishes/talas-boregi.png",
    "dishImage": "/dishes/talas-boregi.png",
    "calories": "490 kcal",
    "prepTime": "12 dk",
    "allergens": "Gluten, Laktoz, Yumurta",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "icli-kofte",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "İçli Köfte",
    "subtitle": "Cevizli ve zırh kıymalı altın sarısı içli köfte.",
    "description": "Cevizli ve zırh kıymalı altın sarısı içli köfte.",
    "desc": "Cevizli ve zırh kıymalı altın sarısı içli köfte.",
    "chefNote": "Cevizli ve zırh kıymalı altın sarısı içli köfte.",
    "price": "₺ 80",
    "priceNum": 80,
    "image": "/dishes/icli-kofte.png",
    "dishImage": "/dishes/icli-kofte.png",
    "calories": "280 kcal",
    "prepTime": "10 dk",
    "allergens": "Gluten, Kuruyemiş (Ceviz)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "corba",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "Günün Çorbası",
    "subtitle": "Geleneksel tereyağlı süzme mercimek çorbası.",
    "description": "Geleneksel tereyağlı süzme mercimek çorbası.",
    "desc": "Geleneksel tereyağlı süzme mercimek çorbası.",
    "chefNote": "Geleneksel tereyağlı süzme mercimek çorbası.",
    "price": "₺ 150",
    "priceNum": 150,
    "image": "/dishes/corba.png",
    "dishImage": "/dishes/corba.png",
    "calories": "180 kcal",
    "prepTime": "5 dk",
    "allergens": "Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "patates-cips",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "Patates Cips",
    "subtitle": "Altın sarısı çıtır patates kızartması tabağı.",
    "description": "Altın sarısı çıtır patates kızartması tabağı.",
    "desc": "Altın sarısı çıtır patates kızartması tabağı.",
    "chefNote": "Altın sarısı çıtır patates kızartması tabağı.",
    "price": "₺ 220",
    "priceNum": 220,
    "image": "/dishes/patates-cips.png",
    "dishImage": "/dishes/patates-cips.png",
    "calories": "380 kcal",
    "prepTime": "8 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "sade-pilav",
    "category": "Ara Sıcaklar",
    "categorySlug": "ara-sicak",
    "name": "Sade Pirinç Pilavı",
    "subtitle": "Tereyağlı tane tane pirinç pilavı.",
    "description": "Tereyağlı tane tane pirinç pilavı.",
    "desc": "Tereyağlı tane tane pirinç pilavı.",
    "chefNote": "Tereyağlı tane tane pirinç pilavı.",
    "price": "₺ 130",
    "priceNum": 130,
    "image": "/dishes/sade-pilav.png",
    "dishImage": "/dishes/sade-pilav.png",
    "calories": "290 kcal",
    "prepTime": "5 dk",
    "allergens": "Laktoz (Tereyağı)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "beros-tavuk-special",
    "category": "Tavuk Çeşitleri",
    "categorySlug": "tavuk",
    "name": "Beroş Tavuk Special",
    "subtitle": "Özel baharatlı ızgara tavuk bonfile dilimleri.",
    "description": "Özel baharatlı ızgara tavuk bonfile dilimleri.",
    "desc": "Özel baharatlı ızgara tavuk bonfile dilimleri.",
    "chefNote": "Özel baharatlı ızgara tavuk bonfile dilimleri.",
    "price": "₺ 590",
    "priceNum": 590,
    "image": "/dishes/tavuk-special.png",
    "dishImage": "/dishes/tavuk-special.png",
    "calories": "590 kcal",
    "prepTime": "18 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "ispanak-yataginda-tavuk",
    "category": "Tavuk Çeşitleri",
    "categorySlug": "tavuk",
    "name": "Ispanak Yatağında Bonfile",
    "subtitle": "Kremalı sote ıspanak üzerinde ızgara tavuk bonfile.",
    "description": "Kremalı sote ıspanak üzerinde ızgara tavuk bonfile.",
    "desc": "Kremalı sote ıspanak üzerinde ızgara tavuk bonfile.",
    "chefNote": "Kremalı sote ıspanak üzerinde ızgara tavuk bonfile.",
    "price": "₺ 570",
    "priceNum": 570,
    "image": "/dishes/ispanakli-tavuk.png",
    "dishImage": "/dishes/ispanakli-tavuk.png",
    "calories": "520 kcal",
    "prepTime": "18 dk",
    "allergens": "Laktoz (Krema)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kori-soslu-tavuk",
    "category": "Tavuk Çeşitleri",
    "categorySlug": "tavuk",
    "name": "Köri Soslu Tavuk",
    "subtitle": "Mantar, renkli biberler ve köri kremalı jülyen tavuk.",
    "description": "Mantar, renkli biberler ve köri kremalı jülyen tavuk.",
    "desc": "Mantar, renkli biberler ve köri kremalı jülyen tavuk.",
    "chefNote": "Mantar, renkli biberler ve köri kremalı jülyen tavuk.",
    "price": "₺ 550",
    "priceNum": 550,
    "image": "/dishes/kori-soslu-tavuk.png",
    "dishImage": "/dishes/kori-soslu-tavuk.png",
    "calories": "580 kcal",
    "prepTime": "18 dk",
    "allergens": "Laktoz (Krema)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kremali-mantarli-tavuk",
    "category": "Tavuk Çeşitleri",
    "categorySlug": "tavuk",
    "name": "Kremalı Mantarlı Tavuk",
    "subtitle": "Taze kültür mantarları ve yoğun krema soslu tavuk.",
    "description": "Taze kültür mantarları ve yoğun krema soslu tavuk.",
    "desc": "Taze kültür mantarları ve yoğun krema soslu tavuk.",
    "chefNote": "Taze kültür mantarları ve yoğun krema soslu tavuk.",
    "price": "₺ 550",
    "priceNum": 550,
    "image": "/dishes/kremali-tavuk.png",
    "dishImage": "/dishes/kremali-tavuk.png",
    "calories": "610 kcal",
    "prepTime": "18 dk",
    "allergens": "Laktoz (Krema)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "beros-usulu-acili-tavuk",
    "category": "Tavuk Çeşitleri",
    "categorySlug": "tavuk",
    "name": "Beroş Usulü Acılı Tavuk",
    "subtitle": "Diyarbakır acı biberi harmanlı tava tavuk.",
    "description": "Diyarbakır acı biberi harmanlı tava tavuk.",
    "desc": "Diyarbakır acı biberi harmanlı tava tavuk.",
    "chefNote": "Diyarbakır acı biberi harmanlı tava tavuk.",
    "price": "₺ 540",
    "priceNum": 540,
    "image": "/dishes/acili-tavuk.png",
    "dishImage": "/dishes/acili-tavuk.png",
    "calories": "530 kcal",
    "prepTime": "16 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "izgara-kofte",
    "category": "Çocuk Menüsü",
    "categorySlug": "cocuk",
    "name": "Izgara Köfte",
    "subtitle": "Patates kızartması eşliğinde anne köftesi tabağı.",
    "description": "Patates kızartması eşliğinde anne köftesi tabağı.",
    "desc": "Patates kızartması eşliğinde anne köftesi tabağı.",
    "chefNote": "Patates kızartması eşliğinde anne köftesi tabağı.",
    "price": "₺ 550",
    "priceNum": 550,
    "image": "/dishes/izgara-kofte.png",
    "dishImage": "/dishes/izgara-kofte.png",
    "calories": "510 kcal",
    "prepTime": "15 dk",
    "allergens": "Gluten",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "tavuk-nugget",
    "category": "Çocuk Menüsü",
    "categorySlug": "cocuk",
    "name": "Tavuk Nugget",
    "subtitle": "Çıtır kaplamalı tavuk parçaları ve patates kızartması.",
    "description": "Çıtır kaplamalı tavuk parçaları ve patates kızartması.",
    "desc": "Çıtır kaplamalı tavuk parçaları ve patates kızartması.",
    "chefNote": "Çıtır kaplamalı tavuk parçaları ve patates kızartması.",
    "price": "₺ 510",
    "priceNum": 510,
    "image": "/dishes/tavuk-nugget.png",
    "dishImage": "/dishes/tavuk-nugget.png",
    "calories": "460 kcal",
    "prepTime": "12 dk",
    "allergens": "Gluten, Yumurta",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "fistik-sarma",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Fıstık Sarma",
    "subtitle": "Boz Antep fıstığından hazırlanan yoğun fıstık sarması.",
    "description": "Boz Antep fıstığından hazırlanan yoğun fıstık sarması.",
    "desc": "Boz Antep fıstığından hazırlanan yoğun fıstık sarması.",
    "chefNote": "Boz Antep fıstığından hazırlanan yoğun fıstık sarması.",
    "price": "₺ 490",
    "priceNum": 490,
    "image": "/dishes/fistik-sarma.png",
    "dishImage": "/dishes/fistik-sarma.png",
    "calories": "540 kcal",
    "prepTime": "5 dk",
    "allergens": "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "fistikli-baklava",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Fıstıklı Baklava",
    "subtitle": "Bol Antep fıstıklı, çıtır tereyağlı geleneksel baklava.",
    "description": "Bol Antep fıstıklı, çıtır tereyağlı geleneksel baklava.",
    "desc": "Bol Antep fıstıklı, çıtır tereyağlı geleneksel baklava.",
    "chefNote": "Bol Antep fıstıklı, çıtır tereyağlı geleneksel baklava.",
    "price": "₺ 450",
    "priceNum": 450,
    "image": "/dishes/fistikli-baklava.png",
    "dishImage": "/dishes/fistikli-baklava.png",
    "calories": "490 kcal",
    "prepTime": "5 dk",
    "allergens": "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "fistikli-kadayif",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Fıstıklı Burma Kadayıf",
    "subtitle": "Diyarbakır'ın tescilli çıtır burma kadayıfı.",
    "description": "Diyarbakır'ın tescilli çıtır burma kadayıfı.",
    "desc": "Diyarbakır'ın tescilli çıtır burma kadayıfı.",
    "chefNote": "Diyarbakır'ın tescilli çıtır burma kadayıfı.",
    "price": "₺ 430",
    "priceNum": 430,
    "image": "/dishes/fistikli-kadayif.png",
    "dishImage": "/dishes/fistikli-kadayif.png",
    "calories": "480 kcal",
    "prepTime": "5 dk",
    "allergens": "Kuruyemiş (Antep Fıstığı), Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "soguk-baklava",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Soğuk Baklava",
    "subtitle": "Sütlü şerbet, bol fıstık ve Belçika çikolatası rendesi ile.",
    "description": "Sütlü şerbet, bol fıstık ve Belçika çikolatası rendesi ile.",
    "desc": "Sütlü şerbet, bol fıstık ve Belçika çikolatası rendesi ile.",
    "chefNote": "Sütlü şerbet, bol fıstık ve Belçika çikolatası rendesi ile.",
    "price": "₺ 400",
    "priceNum": 400,
    "image": "/dishes/soguk-baklava.png",
    "dishImage": "/dishes/soguk-baklava.png",
    "calories": "460 kcal",
    "prepTime": "5 dk",
    "allergens": "Kuruyemiş (Fıstık), Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kunefe",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Künefe",
    "subtitle": "Sıcak peynirli şerbetli tel kadayıf tatlısı.",
    "description": "Sıcak peynirli şerbetli tel kadayıf tatlısı.",
    "desc": "Sıcak peynirli şerbetli tel kadayıf tatlısı.",
    "chefNote": "Sıcak peynirli şerbetli tel kadayıf tatlısı.",
    "price": "₺ 260",
    "priceNum": 260,
    "image": "/dishes/kunefe.png",
    "dishImage": "/dishes/kunefe.png",
    "calories": "520 kcal",
    "prepTime": "12 dk",
    "allergens": "Gluten, Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kabak-tatlisi",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Kabak Tatlısı",
    "subtitle": "Fırınlanmış bal kabağı, tahin ve iri ceviz taneleri ile.",
    "description": "Fırınlanmış bal kabağı, tahin ve iri ceviz taneleri ile.",
    "desc": "Fırınlanmış bal kabağı, tahin ve iri ceviz taneleri ile.",
    "chefNote": "Fırınlanmış bal kabağı, tahin ve iri ceviz taneleri ile.",
    "price": "₺ 240",
    "priceNum": 240,
    "image": "/dishes/kabak-tatlisi.png",
    "dishImage": "/dishes/kabak-tatlisi.png",
    "calories": "320 kcal",
    "prepTime": "5 dk",
    "allergens": "Susam (Tahin), Kuruyemiş (Ceviz)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "dondurma-top",
    "category": "Tatlılar",
    "categorySlug": "tatli",
    "name": "Dondurma (Top)",
    "subtitle": "Hakiki Maraş dövme dondurması.",
    "description": "Hakiki Maraş dövme dondurması.",
    "desc": "Hakiki Maraş dövme dondurması.",
    "chefNote": "Hakiki Maraş dövme dondurması.",
    "price": "₺ 60",
    "priceNum": 60,
    "image": "/dishes/dondurma-top.png",
    "dishImage": "/dishes/dondurma-top.png",
    "calories": "140 kcal",
    "prepTime": "3 dk",
    "allergens": "Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "serpme-kahvalti",
    "category": "Soğuklar",
    "categorySlug": "soguklar",
    "name": "Serpme Konak Kahvaltısı",
    "subtitle": "Yöresel peynirler, kavurmalı yumurta, bal-kaymak ziyafeti.",
    "description": "Yöresel peynirler, kavurmalı yumurta, bal-kaymak ziyafeti.",
    "desc": "Yöresel peynirler, kavurmalı yumurta, bal-kaymak ziyafeti.",
    "chefNote": "Yöresel peynirler, kavurmalı yumurta, bal-kaymak ziyafeti.",
    "price": "₺ 450",
    "priceNum": 450,
    "image": "/dishes/serpme-kahvalti.png",
    "dishImage": "/dishes/serpme-kahvalti.png",
    "calories": "1200 kcal",
    "prepTime": "10 dk",
    "allergens": "Gluten, Laktoz, Yumurta, Susam",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kahvalti-tabagi",
    "category": "Soğuklar",
    "categorySlug": "soguklar",
    "name": "Kahvaltı Tabağı",
    "subtitle": "Tek kişilik zengin kahvaltı tabağı.",
    "description": "Tek kişilik zengin kahvaltı tabağı.",
    "desc": "Tek kişilik zengin kahvaltı tabağı.",
    "chefNote": "Tek kişilik zengin kahvaltı tabağı.",
    "price": "₺ 350",
    "priceNum": 350,
    "image": "/dishes/kahvalti-tabagi.png",
    "dishImage": "/dishes/kahvalti-tabagi.png",
    "calories": "650 kcal",
    "prepTime": "10 dk",
    "allergens": "Gluten, Laktoz, Yumurta",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kasik-salatasi",
    "category": "Soğuklar",
    "categorySlug": "soguklar",
    "name": "Kaşık Salatası",
    "subtitle": "İnce kıyım domates, ceviz ve nar ekşisi soslu salata.",
    "description": "İnce kıyım domates, ceviz ve nar ekşisi soslu salata.",
    "desc": "İnce kıyım domates, ceviz ve nar ekşisi soslu salata.",
    "chefNote": "İnce kıyım domates, ceviz ve nar ekşisi soslu salata.",
    "price": "₺ 250",
    "priceNum": 250,
    "image": "/dishes/kasik-salatasi.png",
    "dishImage": "/dishes/kasik-salatasi.png",
    "calories": "190 kcal",
    "prepTime": "8 dk",
    "allergens": "Kuruyemiş (Ceviz)",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kase-yogurt",
    "category": "Soğuklar",
    "categorySlug": "soguklar",
    "name": "Kase Süzme Yoğurt",
    "subtitle": "Geleneksel köy sütü manda yoğurdu.",
    "description": "Geleneksel köy sütü manda yoğurdu.",
    "desc": "Geleneksel köy sütü manda yoğurdu.",
    "chefNote": "Geleneksel köy sütü manda yoğurdu.",
    "price": "₺ 220",
    "priceNum": 220,
    "image": "/dishes/kase-yogurt.png",
    "dishImage": "/dishes/kase-yogurt.png",
    "calories": "210 kcal",
    "prepTime": "3 dk",
    "allergens": "Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "acik-ayran",
    "category": "İçecekler",
    "categorySlug": "icecekler",
    "name": "Yayık Açık Ayran",
    "subtitle": "Bakır maşrapada bol köpüklü taze yayık ayranı.",
    "description": "Bakır maşrapada bol köpüklü taze yayık ayranı.",
    "desc": "Bakır maşrapada bol köpüklü taze yayık ayranı.",
    "chefNote": "Bakır maşrapada bol köpüklü taze yayık ayranı.",
    "price": "₺ 75",
    "priceNum": 75,
    "image": "/dishes/acik-ayran.png",
    "dishImage": "/dishes/acik-ayran.png",
    "calories": "95 kcal",
    "prepTime": "2 dk",
    "allergens": "Laktoz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "kutu-mesrubat",
    "category": "İçecekler",
    "categorySlug": "icecekler",
    "name": "Kutu Meşrubatlar",
    "subtitle": "Kola, Fanta, Sprite, Zero 330 ml kutu.",
    "description": "Kola, Fanta, Sprite, Zero 330 ml kutu.",
    "desc": "Kola, Fanta, Sprite, Zero 330 ml kutu.",
    "chefNote": "Kola, Fanta, Sprite, Zero 330 ml kutu.",
    "price": "₺ 80",
    "priceNum": 80,
    "image": "/dishes/kutu-mesrubat.png",
    "dishImage": "/dishes/kutu-mesrubat.png",
    "calories": "140 kcal",
    "prepTime": "2 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "salgam",
    "category": "İçecekler",
    "categorySlug": "icecekler",
    "name": "Adana Şalgam Suyu",
    "subtitle": "Cam şişede geleneksel acılı veya acısız şalgam.",
    "description": "Cam şişede geleneksel acılı veya acısız şalgam.",
    "desc": "Cam şişede geleneksel acılı veya acısız şalgam.",
    "chefNote": "Cam şişede geleneksel acılı veya acısız şalgam.",
    "price": "₺ 75",
    "priceNum": 75,
    "image": "/dishes/salgam.png",
    "dishImage": "/dishes/salgam.png",
    "calories": "25 kcal",
    "prepTime": "2 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
  },
  {
    "id": "limonata",
    "category": "İçecekler",
    "categorySlug": "icecekler",
    "name": "Taze Ev Yapımı Limonata",
    "subtitle": "Taze sıkılmış nane yapraklı ev yapımı limonata.",
    "description": "Taze sıkılmış nane yapraklı ev yapımı limonata.",
    "desc": "Taze sıkılmış nane yapraklı ev yapımı limonata.",
    "chefNote": "Taze sıkılmış nane yapraklı ev yapımı limonata.",
    "price": "₺ 90",
    "priceNum": 90,
    "image": "/dishes/limonata.png",
    "dishImage": "/dishes/limonata.png",
    "calories": "120 kcal",
    "prepTime": "3 dk",
    "allergens": "Alerjensiz",
    "temperature": "75°C",
    "servingTemp": "75°C"
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
      calories: dish.calories || "",
      portion: dish.portion || "",
      prepTime: dish.prepTime || "",
      temperature: dish.temperature || dish.servingTemp || "",
      chefNote: dish.chefNote || dish.description || "",
      allergens: ["Kuzu Eti", "Meşe Közü"],
      videoUrl: "",
      posterUrl: dish.dishImage || dish.image || "",
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
      <header className="fixed top-0 left-0 right-0 z-[999] px-4 sm:px-12 py-3.5 flex items-center justify-between backdrop-blur-md bg-black/35 border-b border-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Left: Refined Wordmark & Table Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollToSection(0)}
            className="text-left group flex items-baseline gap-2 focus:outline-none"
          >
            <span className="font-serif tracking-[0.32em] text-lg sm:text-xl font-light text-white group-hover:text-[#f0c85a] transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              BEROŞ
            </span>
          </button>

          {/* Dinamik Masa Rozeti */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-[10px] font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">[ SUR / DIYARBAKIR • {tableNo} ]</span>
            <span className="sm:hidden">{tableNo}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-sans tracking-[0.25em] uppercase font-light">
          <button
            onClick={() => scrollToSection(0.35)}
            className="text-white hover:text-[#f0c85a] transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            GASTRONOMİ
          </button>
          <button
            onClick={() => scrollToSection(0.0)}
            className="text-white/60 hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            ASIRLIK KONAK
          </button>
          <button
            onClick={() => setIsReservationOpen(true)}
            className="text-white/60 hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            REZERVASYON
          </button>
        </nav>

        {/* Right: Operasyonel Aksiyonlar & Turist Modu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-[150] pointer-events-auto">
          {/* 1. Turist Modu Dil Seçici (TR / EN / AR) */}
          <div className="flex items-center rounded-full border border-white/20 bg-black/40 p-0.5 text-[10px] font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {(["TR", "EN", "AR"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  lang === l
                    ? "bg-[#e2b34a] text-black font-bold shadow-[0_0_12px_rgba(226,179,74,0.5)]"
                    : "text-white/70 hover:text-white"
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
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-mono tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
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
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-mono tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            title="Hesap İste"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.hesap}</span>
          </button>

          {/* 4. Google Haritalar'da Değerlendir */}
          <button
            type="button"
            onClick={handleOpenGoogleReview}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-mono tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            title="Google Haritalar'da Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden md:inline">{t.degerlendir}</span>
          </button>

          {/* 5. Canlı Tepsi / Sepet Drawer Trigger */}
          <button
            id="btn-open-tray"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative z-[90] pointer-events-auto cursor-pointer px-3 sm:px-3.5 py-1.5 rounded-full border border-[#e2b34a]/60 bg-[#e2b34a]/20 hover:bg-[#e2b34a]/30 text-[#f0c85a] text-xs font-mono tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_20px_rgba(226,179,74,0.35)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.tepsi}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#e2b34a] text-[#080706] font-bold text-[10px]">
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
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src={INTERIOR_HD}
              alt="Beroş Restaurant Asırlık İç Salon"
              className="w-full h-full object-cover object-center filter brightness-105 contrast-105 saturate-110"
            />
            {/* Sıcak ve Ferah Sinematik Atmosfer Filtresi */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#070504]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,5,4,0.45)_100%)]" />

            {/* Sol Pencereden Sızan Doğal Gün Işığı (Window Glow Effect) */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-amber-50/10 via-transparent to-transparent pointer-events-none -z-10" />
          </div>

          {/* Sol Altta Resmi Kurumsal Editoryal Blok (berosrestaurant.com) */}
          <motion.div
            style={{ y: act1TextY }}
            className="relative z-10 w-full h-full flex flex-col justify-end p-8 sm:p-14 lg:p-20 pb-16 sm:pb-20"
          >
            <div className="max-w-2xl">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#f0c85a] uppercase block mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                SUR / DİYARBAKIR • M.Ö. 3000 • {tableNo}
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.0] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                MEZOPOTAMYA&apos;NIN <br />
                BİNLERCE YILLIK <br />
                <span className="text-[#f0c85a] drop-shadow-[0_0_30px_rgba(240,200,90,0.45)]">LEZZET MİRASI</span>
              </h1>
              <p className="mt-5 text-sm sm:text-base lg:text-lg font-serif italic text-white/90 font-light max-w-xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                &ldquo;Ateşin, baharatın ve ustalığın buluştuğu yerdeyiz. Gelenekten ilham alıyor, çağdaş bir sofrada modern sunum ve ustalıkla fark yaratıyoruz.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#f0c85a]/90 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f0c85a] animate-pulse" />
                <span>Beroş Diyarbakır • Her masa özeldir, her tabak bir imza taşır.</span>
              </div>
            </div>

            {/* Ortalanmış Zarif Scroll Cue */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
              <button
                onClick={() => scrollToSection(0.35)}
                className="flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] uppercase text-white/70 hover:text-[#f0c85a] transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
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
          {/* Masif Masaüstü Zemin, Derinlik Odaklı Restoran Arka Planı (Depth of Field) & Sıcak Kehribar Ambiyans */}
          <div className="absolute inset-0 -z-10 bg-[#070504] pointer-events-none overflow-hidden">
            {/* Derinlik Odaklı Restoran İç Mekan Arka Planı (Beroş Ambiyansı - Depth of Field Blur) */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
              <img
                src={INTERIOR_HD}
                alt="Beroş Restaurant Konak Interior Atmosphere"
                className="w-full h-full object-cover filter blur-[14px] brightness-70 mix-blend-luminosity opacity-25 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#070504]/75 via-transparent to-[#070504]/85" />
            </div>

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
            {/* Masayı Aydınlatan Yumuşak Kehribar Masaüstü Spot Işığı */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.14) 0%, rgba(212, 175, 55, 0.06) 35%, transparent 65%)",
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

              {/* Profesyonel Lüks Rozetler: Kalori, Hazırlık Süresi, Alerjen */}
              <div className="flex flex-wrap items-center gap-2 mt-4 font-mono text-[11px] select-none">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300">
                  🔥 {activeDish.calories}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-300">
                  ⏱️ {activeDish.prepTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  ⚠️ Alerjen: {Array.isArray(activeDish.allergens) ? activeDish.allergens.join(", ") : activeDish.allergens}
                </span>
              </div>
            </div>

            {/* ==================== DOĞAL RESTORAN MASASI SUNUMU (6 cols) ==================== */}
            <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[520px] flex items-center justify-center order-1 lg:order-2 select-none">
              
              {/* ==================== GERÇEK MASİF AHŞAP MASA SAHNESİ ==================== */}
              <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
                {/* Restoran Masif Masa Yüzeyi */}
                <div 
                  className="absolute bottom-[-15%] w-[1100px] h-[580px] rounded-[100%] shadow-[0_-30px_100px_rgba(0,0,0,0.95)]"
                  style={{
                    transform: "perspective(1000px) rotateX(60deg)",
                    backgroundImage: "url('/textures/walnut-table.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "inset 0 0 120px rgba(0,0,0,0.85), 0 -20px 60px rgba(0,0,0,0.9)"
                  }}
                >
                  {/* Ahşap Damarlarına Vuran Sıcak Konak Spot Işığı */}
                  <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.28)_0%,transparent_65%)] mix-blend-screen" />
                </div>
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
                  {/* Masaya Düşen Gerçekçi Temas Gölgesi */}
                  <div className="absolute bottom-3 sm:bottom-4 w-[300px] sm:w-[380px] h-[45px] rounded-full bg-black/90 blur-xl pointer-events-none -z-10" />

                  {/* Yemeğin Kendisi - Doğal Çerçevesiz Odak */}
                  <div 
                    className="relative w-[300px] sm:w-[420px] h-[270px] sm:h-[350px] flex items-center justify-center"
                    style={{
                      maskImage: "radial-gradient(circle closest-side, black 72%, transparent 98%)",
                      WebkitMaskImage: "radial-gradient(circle closest-side, black 72%, transparent 98%)"
                    }}
                  >
                    <img
                      src={filteredDishes[activeDishIndex]?.image || filteredDishes[activeDishIndex]?.dishImage || `/dishes/${filteredDishes[activeDishIndex]?.id}.png`}
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
                  className="cursor-pointer pointer-events-auto relative z-[150] w-full sm:w-64 py-4 px-8 rounded-2xl bg-[#d4af37] hover:bg-[#e5be46] active:scale-95 text-[#080706] font-mono text-xs uppercase font-bold transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-bold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.35)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer relative z-[2000] pointer-events-auto"
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
