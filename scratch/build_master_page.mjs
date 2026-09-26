import fs from "fs";
import path from "path";

const pagePath = path.join(process.cwd(), "app", "page.tsx");
const currentContent = fs.readFileSync(pagePath, "utf8");

// DISHES bloğunu mevcut page.tsx'ten çek
const dishesMatch = currentContent.match(/const DISHES: MenuItem\[\] = (\[[\s\S]*?\]);\n\nconst FACADE_CENTER/);
if (!dishesMatch) {
  console.error("DISHES array could not be extracted!");
  process.exit(1);
}
const dishesBlock = dishesMatch[1];

const newPageContent = `"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
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

export const CATEGORIES = [
  { id: "yoresel", slug: "yoresel", label: "YÖRESEL LEZZETLER" },
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
    bosTepsi: "Your tray is currently empty",
    bosTepsiAlt: "Select delicious dishes from the menu to build your order.",
    toplam: "Total Amount",
    siparisiGonder: "Send Order to Kitchen",
    iletiliyor: "Sending to Kitchen...",
    sefinTavsiyesi: "Chef's Cross Pairing",
    ayranOneri: "Would you like to add fresh frothy Ayran with your meal?",
    tatliOneri: "Finish with authentic hot Diyarbakır Burma Kadayif?",
    birTiklaEkle: "+ Add",
    toastEklendi: "added to tray ✓",
    toastIletildi: "Order sent to kitchen!",
    toastCagri: "request sent to cashier ✓",
    nakitHesap: "💵 Cash Bill",
    kartHesap: "💳 Card / POS",
    garsonCagri: "🔔 Call Waiter",
  },
  AR: {
    garson: "نادل",
    hesap: "الحساب",
    degerlendir: "تقييم",
    tepsi: "الصينية",
    tekPorsiyon: "حصة واحدة",
    sipariseEkle: "+ إضافة للطلب",
    tukendi: "نفذت الكمية",
    tepsiBaslik: "فاتورة الطاولة المباشرة",
    bosTepsi: "صينيتك فارغة حالياً",
    bosTepsiAlt: "أضف أطباقك المفضلة من القائمة لبدء طلبك.",
    toplam: "المجموع الكلي",
    siparisiGonder: "إرسال الطلب للمطبخ",
    iletiliyor: "جارٍ الإرسال للمطبخ...",
    sefinTavsiyesi: "توصية الشيف الخاصة",
    ayranOneri: "هل ترغب في إضافة عيران مخضوض طازج مع وجبتك؟",
    tatliOneri: "ما رأيك بقطايف ديار بكر البورمة الساخنة بعد الوجبة؟",
    birTiklaEkle: "+ إضافة",
    toastEklendi: "تمت الإضافة للصينية ✓",
    toastIletildi: "تم إرسال الطلب للمطبخ بنجاح!",
    toastCagri: "تم إرسال طلبك للكاشير ✓",
    nakitHesap: "💵 حساب نقدي",
    kartHesap: "💳 دفع بالبطاقة",
    garsonCagri: "🔔 نداء النادل",
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
    yoresel: "TRADITIONAL DISHES",
    spesiyaller: "HOUSE SPECIALS",
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

export const DISHES: MenuItem[] = ${dishesBlock};

const FACADE_CENTER = "/facade-center.jpg";
const INTERIOR_HD = "/interior-hd.jpg";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function VexmoKineticBerosPage() {
  const [lang, setLang] = useState<Language>("TR");
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>("yoresel");
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isKonakOpen, setIsKonakOpen] = useState(false);
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

  // Sayfa yüklendiğinde ve pencere boyutlandığında
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener("resize", checkMobile);

      // Dinamik Masa Tespiti (?masa=05)
      const params = new URLSearchParams(window.location.search);
      const masaParam = params.get("masa");
      if (masaParam) {
        const formatted = \`MASA \${masaParam.padStart(2, "0")}\`;
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

  // Canlı Stok Takibi
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

  const activeDish = DISHES[activeDishIndex] || DISHES[0];
  const categoryBarRef = useRef<HTMLDivElement>(null);

  // Aktif yemek değiştikçe üst kategori sekmesini otomatik senkronize et
  useEffect(() => {
    const currentCat = activeDish?.categorySlug;
    if (currentCat && currentCat !== selectedCategory) {
      setSelectedCategory(currentCat);
    }
    const bar = categoryBarRef.current;
    const catBtn = document.getElementById(\`cat-btn-\${currentCat}\`);
    if (bar && catBtn) {
      const barRect = bar.getBoundingClientRect();
      const btnRect = catBtn.getBoundingClientRect();
      const scrollOffset = (btnRect.left - barRect.left) - (barRect.width / 2) + (btnRect.width / 2);
      bar.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  }, [activeDishIndex, activeDish?.categorySlug, selectedCategory]);

  const handleSelectCategory = (slug: CategorySlug) => {
    setSelectedCategory(slug);
    const targetIdx = DISHES.findIndex((d) => d.categorySlug === slug);
    if (targetIdx !== -1) {
      setActiveDishIndex(targetIdx);
    }
  };

  const handlePrevDish = () => {
    setActiveDishIndex((prev) => (prev > 0 ? prev - 1 : DISHES.length - 1));
  };

  const handleNextDish = () => {
    setActiveDishIndex((prev) => (prev < DISHES.length - 1 ? prev + 1 : 0));
  };

  const handleSelectDish = (idx: number) => {
    setActiveDishIndex(idx);
  };

  // VIRTUAL WHEEL & TOUCH NAVIGATION:
  // Sayfa dikey kayması kilitli. Fare tekerleği doğrudan 1'den 65'e lezzetleri döndürür.
  useEffect(() => {
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      // Çekmece veya modal içi kaydırmaya izin ver
      if (target?.closest(".cart-drawer, [role='dialog'], input, textarea, select")) {
        return;
      }
      e.preventDefault();
      if (lock) return;
      lock = true;
      if (e.deltaY > 0 || e.deltaX > 0) {
        setActiveDishIndex((prev) => (prev + 1) % DISHES.length);
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        setActiveDishIndex((prev) => (prev - 1 + DISHES.length) % DISHES.length);
      }
      setTimeout(() => { lock = false; }, 260);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Sepet İşlemleri
  const handleAddToCart = (dish: MenuItem) => {
    if (isDishOutOfStock(dish.id)) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: dish.priceNum,
          quantity: 1,
        },
      ];
    });
    triggerToast(\`\${dish.name} \${t.toastEklendi}\`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalCartPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Servis ve Garson Çağrısı
  const handleServiceCall = async (serviceType: string) => {
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo: tableNo || "MASA 07",
          serviceType,
        }),
      });
      if (res.ok) {
        triggerToast(\`\${tableNo}: \${serviceType} \${t.toastCagri}\`);
      } else {
        triggerToast(\`\${serviceType} talebiniz alındı ✓\`);
      }
    } catch {
      triggerToast(\`\${serviceType} talebiniz alındı ✓\`);
    }
  };

  // Sipariş İletimi
  const handleSubmitOrder = async (paymentMethod: "nakit" | "kart" | null = null) => {
    if (cart.length === 0 || isOrderSubmitting) return;
    setIsOrderSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo: tableNo || "MASA 07",
          items: cart,
          totalAmount: totalCartPrice,
          paymentMethod,
        }),
      });
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false);
        triggerToast(t.toastIletildi);
      } else {
        triggerToast("Sipariş mutfağa aktarıldı ✓");
        setCart([]);
        setIsCartOpen(false);
      }
    } catch {
      triggerToast("Sipariş mutfağa aktarıldı ✓");
      setCart([]);
      setIsCartOpen(false);
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  const handleOpenGoogleReview = () => {
    window.open(RESTAURANT_CONFIG.googleMapsReviewUrl, "_blank");
  };

  const handleCopyWifi = () => {
    navigator.clipboard?.writeText?.(RESTAURANT_CONFIG.wifiPass);
    setWifiCopied(true);
    triggerToast(\`Wi-Fi Şifresi Kopyalandı: \${RESTAURANT_CONFIG.wifiPass}\`);
    setTimeout(() => setWifiCopied(false), 2500);
  };

  const handleOpenArModal = (dish: MenuItem) => {
    const spatialDish: Dish = {
      id: dish.id,
      category: dish.category,
      name: dish.name,
      subtitle: dish.subtitle,
      frenchTitle: dish.frenchTitle || "GASTRONOMIE D'OR",
      price: dish.price,
      priceNum: dish.priceNum,
      calories: dish.calories || "650 kcal",
      portion: dish.portion || "Tek Porsiyon",
      prepTime: dish.prepTime || "20 dk",
      temperature: dish.temperature || "75°C",
      chefNote: dish.chefNote || dish.description,
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [dish.allergens || "Alerjensiz"],
      videoUrl: "",
      posterUrl: dish.image,
      ingredients: [
        "Taş Fırın & Masif Ocak Pişirimi",
        "Özel Diyarbakır Baharat Harmanı",
        "Geleneksel Tereyağı & Bakır Sunum"
      ],
      modelLayers: [
        {
          name: "Temel Sunum",
          description: dish.name,
          color: "#d4af37",
          offsetY: 0,
        },
        {
          name: "Garnitür & Sos",
          description: "Közlenmiş Domates, Biber ve Şef Sosu",
          color: "#ef4444",
          offsetY: 30,
        },
      ],
    };
    setArModalDish(spatialDish);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#080706] text-[#F5EFEB] selection:bg-[#d4af37]/30 selection:text-white select-none">
      
      {/* ========================================================================= */}
      {/* 1. MİNİMAL VE SABİT MİMARİ HEADER                                          */}
      {/* ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-[999] px-4 sm:px-10 py-3 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Sol: Beroş Markası ve Dinamik Masa Rozeti */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveDishIndex(0)}
            className="text-left group flex items-baseline gap-2 focus:outline-none cursor-pointer"
          >
            <span className="font-serif tracking-[0.32em] text-lg sm:text-xl font-light text-white group-hover:text-[#f0c85a] transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              BEROŞ
            </span>
          </button>

          {/* Masa Bilgisi Rozeti */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-[10px] font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">[ SUR / DİYARBAKIR • {tableNo} ]</span>
            <span className="sm:hidden">{tableNo}</span>
          </div>
        </div>

        {/* Orta: Masaüstü Gezinme Sekmeleri */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-sans tracking-[0.25em] uppercase font-light">
          <span className="text-[#f0c85a] border-b border-[#f0c85a] pb-0.5 cursor-default drop-shadow-[0_0_12px_rgba(240,200,90,0.5)]">
            GASTRONOMİ
          </span>
          <button
            onClick={() => setIsKonakOpen(true)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            ASIRLIK KONAK
          </button>
          <button
            onClick={() => setIsReservationOpen(true)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            REZERVASYON
          </button>
        </nav>

        {/* Sağ: Operasyonel Aksiyonlar & Turist Modu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-[150] pointer-events-auto">
          {/* Turist Modu Dil Seçici (TR / EN / AR) */}
          <div className="flex items-center rounded-full border border-white/20 bg-black/40 p-0.5 text-[10px] font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {(["TR", "EN", "AR"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={\`px-2 py-1 rounded-full transition-all cursor-pointer \${
                  lang === l
                    ? "bg-[#e2b34a] text-black font-bold shadow-[0_0_12px_rgba(226,179,74,0.5)]"
                    : "text-white/70 hover:text-white"
                }\`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Garson Çağır Butonu */}
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

          {/* Hesap İste Butonu */}
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

          {/* Google Haritalar'da Değerlendir */}
          <button
            type="button"
            onClick={handleOpenGoogleReview}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-mono tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            title="Google Haritalar'da Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden md:inline">{t.degerlendir}</span>
          </button>

          {/* Canlı Tepsi / Sepet Drawer Trigger */}
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

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 text-white/70 hover:text-white lg:hidden cursor-pointer"
            aria-label="Menü"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. NIVORA & VEXMO SİNEMATİK AR MASAÜSTÜ VİTRİNİ (TAM EKRAN SABİT SAHNE)   */}
      {/* ========================================================================= */}
      <main id="showcase-container" className="relative w-full h-full flex flex-col justify-between pt-16 sm:pt-18 pb-3 sm:pb-4 px-4 sm:px-10 lg:px-12 z-10 overflow-hidden">
        
        {/* Arka Plan: Flulaştırılmış Asırlık Konak Atmosferi & Sıcak Spot Işıkları */}
        <div className="absolute inset-0 -z-20 bg-[#070504] pointer-events-none overflow-hidden">
          <img
            src={INTERIOR_HD}
            alt="Beroş Restaurant Konak Ambiyansı"
            className="w-full h-full object-cover filter blur-[14px] brightness-70 mix-blend-luminosity opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070504]/75 via-transparent to-[#070504]/85" />
          
          {/* Tepe Merkez: Sıcak Kehribar Odak Işığı */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(217, 119, 6, 0.18), transparent 70%)",
            }}
          />
          {/* Masayı Aydınlatan Odak Spot Işığı */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.18) 0%, rgba(212, 175, 55, 0.08) 35%, transparent 65%)",
            }}
          />
        </div>

        {/* ==================== GERÇEK MASİF AHŞAP MASA & NIVORA AR LAZER SAHNESİ ==================== */}
        <div className="absolute inset-x-0 bottom-0 h-[48vh] sm:h-[52vh] pointer-events-none -z-10 overflow-hidden">
          {/* Masif Ahşap Kaplama */}
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: "linear-gradient(to top, rgba(7,5,4,0.15) 0%, rgba(7,5,4,0.95) 100%), url('/textures/walnut-table.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "bottom center",
              boxShadow: "inset 0 100px 80px -20px #070504"
            }}
          />
          
          {/* Masanın Üst Kenarındaki Doğal Altın Pah Çizgisi */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/35 to-transparent" />

          {/* Ahşap Yüzeye Vuran Holografik Altın Lazer Halkası (NIVORA Hologram Laser Orbit) */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[440px] sm:w-[520px] h-[170px] rounded-[100%] border border-amber-400/50 pointer-events-none"
            style={{
              transform: "perspective(900px) rotateX(68deg)",
              boxShadow: "0 0 35px rgba(245,158,11,0.35), inset 0 0 20px rgba(245,158,11,0.2)"
            }}
          />

          {/* Masadaki Beroş Akıllı Çağrı Diski (NFC PUCK) */}
          <div 
            onClick={() => handleServiceCall("Garson (Masa NFC Pulu)")}
            className="absolute right-6 sm:right-10 bottom-6 sm:bottom-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-amber-500/40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)] pointer-events-auto cursor-pointer hover:border-amber-400 hover:scale-105 active:scale-95 transition-all z-20 group"
            title="Beroş Akıllı Masa Pulu - Garson Çağır"
          >
            <span className="text-[8px] sm:text-[9px] font-mono text-amber-400 tracking-widest uppercase group-hover:text-amber-300">BEROŞ</span>
            <span className="text-[10px] sm:text-[11px] text-white/90 font-medium">NFC PUCK</span>
            <span className="text-[8px] font-mono text-white/50 tracking-tighter mt-0.5">ZİL / ÇAĞRI</span>
          </div>
        </div>

        {/* ==================== MENÜ ÜST BARI: KATEGORİ FİLTRELERİ & KURS BİLGİSİ ==================== */}
        <div className="relative z-20 flex flex-col gap-2 border-b border-white/10 pb-2.5">
          {/* Kategori Filtre Butonları */}
          <div ref={categoryBarRef} className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  id={\`cat-btn-\${cat.slug}\`}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={\`px-3.5 py-1.5 rounded-full whitespace-nowrap font-mono text-[10px] sm:text-[11px] tracking-wider transition-all duration-300 flex-shrink-0 cursor-pointer \${
                    isCatActive
                      ? "bg-[#d4af37] text-[#080706] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.45)]"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                  }\`}
                >
                  {CATEGORY_NAMES[lang]?.[cat.slug] || cat.label}
                </button>
              );
            })}
          </div>

          {/* Alt Satır: Kurs Sayacı + Noktalar + Oklar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#d4af37] uppercase">
                COURSE {activeDishIndex + 1 < 10 ? "0" + (activeDishIndex + 1) : activeDishIndex + 1} / {DISHES.length < 10 ? "0" + DISHES.length : DISHES.length}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono tracking-widest text-white/60 uppercase">
                {CATEGORY_NAMES[lang]?.[activeDish.categorySlug] || activeDish.category}
              </span>
            </div>

            {/* Kurs Gösterge Noktaları */}
            <div className="flex items-center gap-1 sm:gap-1.5 max-w-[160px] sm:max-w-[280px] overflow-x-auto no-scrollbar">
              {DISHES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectDish(idx)}
                  className={\`h-1.5 transition-all duration-300 rounded-full flex-shrink-0 \${
                    idx === activeDishIndex
                      ? "w-6 sm:w-7 bg-[#d4af37]"
                      : "w-1.5 sm:w-2 bg-white/20 hover:bg-white/40"
                  }\`}
                  aria-label={\`Course \${idx + 1}\`}
                />
              ))}
            </div>

            {/* Önceki / Sonraki Oklar */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevDish}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95 cursor-pointer"
                aria-label="Önceki Lezzet"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextDish}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95 cursor-pointer"
                aria-label="Sonraki Lezzet"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== ANA SAHNE: SOL HUD + MERKEZ TABAK + SAĞ FİYAT ==================== */}
        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center my-auto min-h-0">
          
          {/* Sol Sütun: Cam HUD Künyesi (3 cols) */}
          <div className="lg:col-span-3 z-10 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-xs font-serif italic text-[#d4af37]/80 tracking-wider">
              {activeDish.frenchTitle || "GASTRONOMIE D'OR"}
            </p>
            <h2
              className="mt-1 font-serif text-xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight"
              style={{ textShadow: "0 0 25px rgba(212,175,55,0.4)" }}
            >
              {activeDish.name}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm font-sans text-white/55 tracking-wider font-light line-clamp-2">
              {activeDish.subtitle}
            </p>

            <div className="my-2.5 sm:my-3 border-l-2 border-[#d4af37]/40 pl-3 py-0.5">
              <p className="text-xs sm:text-sm font-serif italic text-white/75 font-light leading-relaxed">
                &ldquo;{activeDish.chefNote || activeDish.description}&rdquo;
              </p>
            </div>

            {/* Profesyonel Lüks Rozetler: Kalori, Hazırlık Süresi, Alerjen */}
            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] select-none">
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

          {/* Merkez Sütun: Süzülen Tabak & Çift Katmanlı Masaya Basan Temas Gölgesi (6 cols) */}
          <div className="lg:col-span-6 relative w-full h-[360px] sm:h-[440px] flex items-center justify-center order-1 lg:order-2 select-none">
            
            <div className="relative flex flex-col items-center justify-center">
              {/* Masaya Düşen Çift Katmanlı Organik Temas Gölgesi (Ambient Occlusion & Diffusion) */}
              <div className="absolute bottom-2 w-[340px] sm:w-[440px] h-[35px] rounded-full bg-black/95 blur-xl pointer-events-none -z-10" />
              <div className="absolute bottom-4 w-[260px] sm:w-[320px] h-[20px] rounded-full bg-black/80 blur-md pointer-events-none -z-10" />

              {/* Süzülen Tabak & Spring Hareketi */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDish.id}
                  initial={{ opacity: 0, x: 70 }}
                  animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                  exit={{ opacity: 0, x: -70 }}
                  transition={{
                    x: { type: "spring", stiffness: 260, damping: 24 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) handleNextDish();
                    else if (info.offset.x > 40) handlePrevDish();
                  }}
                  className="relative w-[320px] sm:w-[440px] h-[260px] sm:h-[340px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing pointer-events-auto"
                >
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.85)] brightness-105 contrast-105 pointer-events-none select-none"
                  />

                  {/* Tükendi Rozeti */}
                  {isDishOutOfStock(activeDish?.id) && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center pointer-events-none z-30">
                      <span className="px-3.5 py-1 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 font-mono text-xs font-bold tracking-widest uppercase shadow-lg">
                        {t.tukendi}
                      </span>
                    </div>
                  )}

                  {/* Canlı Buhar Efekti */}
                  {!isDishOutOfStock(activeDish?.id) && (
                    <SteamEffect />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Tabağın Altındaki İsim & Fiyat Şeridi */}
              <div className="mt-2 px-5 py-2 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-white font-mono text-xs tracking-wider flex items-center gap-3 shadow-2xl z-20">
                <span className="font-serif text-sm tracking-wide text-white">
                  {activeDish?.name}
                </span>
                <span className="text-[#d4af37] font-bold">
                  • {activeDish?.price}
                </span>
              </div>
            </div>

            {/* Sol / Sağ Navigasyon Okları */}
            <button
              type="button"
              onClick={handlePrevDish}
              className="absolute left-1 sm:left-3 z-30 p-2.5 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-[#d4af37] transition-all active:scale-95 cursor-pointer pointer-events-auto"
              title="Önceki Lezzet"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextDish}
              className="absolute right-1 sm:right-3 z-30 p-2.5 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-[#d4af37] transition-all active:scale-95 cursor-pointer pointer-events-auto"
              title="Sonraki Lezzet"
            >
              ›
            </button>
          </div>

          {/* Sağ Sütun: Altın Fiyat & Sipariş / AR Butonları (3 cols) */}
          <div className="lg:col-span-3 relative z-[999] pointer-events-auto isolation-isolate flex flex-col items-center lg:items-end justify-center gap-3.5 select-none order-3">
            <div className="text-center lg:text-right">
              <span className="text-[10px] font-mono text-white/40 tracking-[0.25em] uppercase block">
                {t.tekPorsiyon}
              </span>
              <div
                className={\`font-serif text-4xl sm:text-5xl font-light tracking-tight transition-all duration-500 \${
                  isDishOutOfStock(activeDish?.id) ? "text-red-400/80" : "text-[#e2b34a]"
                }\`}
                style={{
                  textShadow: !isDishOutOfStock(activeDish?.id)
                    ? "0 0 25px rgba(226,179,74,0.75)"
                    : "none",
                }}
              >
                {isDishOutOfStock(activeDish?.id) ? t.tukendi : activeDish.price}
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-center lg:items-end gap-2.5">
              {/* Sipariş Ekle Butonu (Stok Kontrollü) */}
              <button
                type="button"
                id="btn-add-to-cart"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(activeDish);
                  setIsCartOpen(true);
                }}
                disabled={isDishOutOfStock(activeDish?.id)}
                className="cursor-pointer pointer-events-auto relative z-[150] w-full sm:w-64 py-4 px-8 rounded-2xl bg-[#d4af37] hover:bg-[#e5be46] active:scale-95 text-[#080706] font-mono text-xs uppercase font-bold transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-[#080706]" />
                <span>
                  {isDishOutOfStock(activeDish?.id)
                    ? t.tukendi
                    : t.sipariseEkle}
                </span>
              </button>

              {/* 360° AR İncele Butonu */}
              <button
                type="button"
                onClick={() => handleOpenArModal(activeDish)}
                className="cursor-pointer pointer-events-auto relative z-[150] w-full sm:w-64 py-2.5 px-6 rounded-xl border border-[#d4af37]/40 bg-black/40 hover:bg-[#d4af37]/15 active:scale-95 text-[#f0c85a] font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>360° AR İNCELE</span>
              </button>
            </div>
          </div>

        </div>

        {/* ==================== ALT BİLGİ BARI ==================== */}
        <footer className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          <span>DİYARBAKIR SUR MİRASI</span>
          <span className="hidden sm:inline">FARE TEKERLEĞİ VEYA DOKUNMATİK KAYDIRMA İLE LEZZETLERİ KEŞFEDİN ↻</span>
          <span>GASTRONOMİ KOLEKSİYONU • 65 LEZZET</span>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* 3. CANLI MASA ADİSYONU / SEPET ÇEKMECESİ (DRAWER)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[1998] bg-black/75 backdrop-blur-sm pointer-events-auto cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-[1999] w-full max-w-md bg-[#0e0c0a] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between p-6 overflow-y-auto cart-drawer pointer-events-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase block">
                      {t.tepsiBaslik}
                    </span>
                    <h3 className="font-serif text-2xl text-white font-light mt-0.5">
                      {tableNo} <span className="text-emerald-400 text-xs font-mono ml-2">AKTİF</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sepet Boş Durumu */}
                {cart.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 font-serif text-base">{t.bosTepsi}</p>
                    <p className="text-white/30 text-xs font-sans mt-1">{t.bosTepsiAlt}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 my-4">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-white">{item.name}</h4>
                          <span className="text-xs font-mono text-amber-400/80">₺{item.price}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm font-bold text-white min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm font-bold text-white ml-2 min-w-14 text-right">
                            ₺{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Şefin Çapraz Önerileri */}
                {cart.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t.sefinTavsiyesi}
                    </span>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{t.ayranOneri}</span>
                      <button
                        onClick={() => {
                          const ayran = DISHES.find((d) => d.id === "acik-ayran");
                          if (ayran) handleAddToCart(ayran);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-400 text-black font-bold text-[10px] hover:bg-amber-300 transition-colors ml-2 cursor-pointer whitespace-nowrap"
                      >
                        {t.birTiklaEkle}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Tutar ve Siparişi Mutfağa İlet Butonu */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono tracking-wider text-white/60 uppercase">
                    {t.toplam}
                  </span>
                  <span className="font-serif text-2xl font-light text-[#e2b34a]">
                    ₺{totalCartPrice}
                  </span>
                </div>

                <button
                  id="btn-submit-order"
                  type="button"
                  onClick={() => handleSubmitOrder()}
                  disabled={cart.length === 0 || isOrderSubmitting}
                  className="relative z-[2000] cursor-pointer pointer-events-auto w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-95"
                >
                  <Utensils className="w-4 h-4 text-white" />
                  <span>
                    {isOrderSubmitting ? t.iletiliyor : t.siparisiGonder}
                  </span>
                </button>

                {/* Hızlı Kasa / Garson Butonları */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
                  <button
                    onClick={() => handleSubmitOrder("nakit")}
                    disabled={cart.length === 0}
                    className="py-2 px-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {t.nakitHesap}
                  </button>
                  <button
                    onClick={() => handleSubmitOrder("kart")}
                    disabled={cart.length === 0}
                    className="py-2 px-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {t.kartHesap}
                  </button>
                  <button
                    onClick={() => handleServiceCall("Garson")}
                    className="py-2 px-1 rounded-lg border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                  >
                    {t.garsonCagri}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. ASIRLIK KONAK MODALI (REZERVASYON & TARİHİ BİLGİ)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isKonakOpen && (
          <div className="fixed inset-0 z-[2005] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsKonakOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl bg-[#120f0d] border border-[#d4af37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsKonakOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-2">
                SUR / DİYARBAKIR • M.Ö. 3000
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-tight">
                Mezopotamya&apos;nın Binlerce Yıllık Lezzet Mirası
              </h3>
              <p className="mt-3 text-sm font-serif italic text-amber-200/80 leading-relaxed">
                &ldquo;Ateşin, baharatın ve ustalığın buluştuğu yerdeyiz. Gelenekten ilham alıyor, çağdaş bir sofrada modern sunum ve ustalıkla fark yaratıyoruz.&rdquo;
              </p>
              
              <div className="my-5 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={FACADE_CENTER}
                  alt="Beroş Restaurant Asırlık Konak"
                  className="w-full h-48 sm:h-56 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-white/70 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{RESTAURANT_CONFIG.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{RESTAURANT_CONFIG.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <button onClick={handleCopyWifi} className="hover:text-amber-300 underline cursor-pointer">
                    {RESTAURANT_CONFIG.wifiName} (Şifre: {RESTAURANT_CONFIG.wifiPass})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href={RESTAURANT_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 underline">
                    @berosrestoran
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. REZERVASYON MODALI                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReservationOpen && (
          <div className="fixed inset-0 z-[2005] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-[#120f0d] border border-[#d4af37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsReservationOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-1">
                BEROŞ RESTAURANT
              </span>
              <h3 className="font-serif text-2xl font-light text-white">Masa Rezervasyonu</h3>

              {resSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-serif text-white">Rezervasyon Talebiniz Alındı</h4>
                  <p className="text-xs font-sans text-white/60">
                    En kısa sürede WhatsApp veya telefon üzerinden onay iletilecektir.
                  </p>
                  <button
                    onClick={() => {
                      setResSuccess(false);
                      setIsReservationOpen(false);
                    }}
                    className="mt-4 px-6 py-2 rounded-full bg-[#d4af37] text-black font-mono text-xs font-bold"
                  >
                    Tamam
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResSuccess(true);
                  }}
                  className="mt-4 space-y-3 font-mono text-xs"
                >
                  <div>
                    <label className="text-white/60 block mb-1">İsim Soyisim</label>
                    <input
                      type="text"
                      required
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="Adınız ve Soyadınız"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Telefon Numarası</label>
                    <input
                      type="tel"
                      required
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-white/60 block mb-1">Kişi Sayısı</label>
                      <select
                        value={resGuests}
                        onChange={(e) => setResGuests(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1a1613] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option>1 Kişi</option>
                        <option>2 Kişi</option>
                        <option>4 Kişi</option>
                        <option>6+ Kişi (Grup)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">Zaman</label>
                      <select
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1a1613] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option>Bu Akşam (19:30)</option>
                        <option>Bu Akşam (21:00)</option>
                        <option>Yarın Öğle (13:00)</option>
                        <option>Yarın Akşam (20:00)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Özel Not (Opsiyonel)</label>
                    <textarea
                      value={resNote}
                      onChange={(e) => setResNote(e.target.value)}
                      placeholder="Masa konumu, doğum günü, alerji vb."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-[#d4af37] text-black font-bold uppercase tracking-wider hover:bg-[#e5be46] transition-all"
                  >
                    Rezervasyonu Onayla
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. 360° AR MEKÂNSAL GÖRÜNTÜLEYİCİ MODALI                                  */}
      {/* ========================================================================= */}
      {arModalDish && (
        <ArSpatialViewer
          dish={arModalDish}
          onClose={() => setArModalDish(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. MOBİL AÇILIR MENÜ                                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[2010] bg-[#0c0a09]/95 backdrop-blur-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-serif text-xl text-white">BEROŞ RESTAURANT</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full border border-white/10 text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 space-y-4 font-serif text-lg text-white/90">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveDishIndex(0);
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37]"
                >
                  Gastronomi Menüsü (65 Lezzet)
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsKonakOpen(true);
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37]"
                >
                  Asırlık Konak Tarihi
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReservationOpen(true);
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37]"
                >
                  Masa Rezervasyonu
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs text-white/60">
              <p>{RESTAURANT_CONFIG.address}</p>
              <p>Telefon: {RESTAURANT_CONFIG.phone}</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCopyWifi}
                  className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/80"
                >
                  Wi-Fi Şifresi: {RESTAURANT_CONFIG.wifiPass}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. ANLIK AKSİYON & BİLDİRİM TOASTI                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2020] px-5 py-2.5 rounded-full bg-[#16120e] border border-[#d4af37] text-[#d4af37] text-xs font-mono tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center gap-2 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
\`;

fs.writeFileSync(pagePath, newPageContent, "utf8");
console.log("Successfully generated app/page.tsx with fixed fullscreen Nivora AR stage!");
`;

fs.writeFileSync("scratch/build_master_page.mjs", newPageContent);
console.log("scratch/build_master_page.mjs created.");

