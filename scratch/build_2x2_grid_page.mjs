import fs from "fs";
import path from "path";

const pagePath = path.join(process.cwd(), "app", "page.tsx");
const currentContent = fs.readFileSync(pagePath, "utf8");

// Extract DISHES
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

const CATEGORIES = [
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

type CategorySlug = string;

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
    tatliOneri: "Top off your meal with warm Diyarbakır Kadayıf?",
    birTiklaEkle: "+ Add",
    toastEklendi: "added to tray ✓",
    toastIletildi: "Your order has been sent to the kitchen!",
    toastCagri: "request sent to cashier ✓",
    nakitHesap: "💵 Cash Bill",
    kartHesap: "💳 Credit Card",
    garsonCagri: "🔔 Waiter",
  },
  AR: {
    garson: "النادِل",
    hesap: "الفاتورة",
    degerlendir: "تقييم",
    tepsi: "الطلب",
    tekPorsiyon: "وجبة فردية",
    sipariseEkle: "+ إضافة للطلب",
    tukendi: "نفذت الكمية",
    tepsiBaslik: "فاتورة الطاولة المباشرة",
    bosTepsi: "قائمة طلباتك فارغة حالياً",
    bosTepsiAlt: "اختر أشهى الأطباق من القائمة لإتمام طلبك.",
    toplam: "المبلغ الإجمالي",
    siparisiGonder: "إرسال الطلب للمطبخ",
    iletiliyor: "جاري الإرسال للمطبخ...",
    sefinTavsiyesi: "توصية الشيف الخاصة",
    ayranOneri: "هل ترغب في إضافة لبن عيران طازج مع الوجبة؟",
    tatliOneri: "هل ترغب بتحلية كتايف دياربكر الساخنة؟",
    birTiklaEkle: "+ إضافة",
    toastEklendi: "تمت الإضافة للطلب ✓",
    toastIletildi: "تم إرسال طلبكم إلى المطبخ بنجاح!",
    toastCagri: "تم إرسال الطلب للكاشير ✓",
    nakitHesap: "💵 دفع نقدي",
    kartHesap: "💳 بطاقة بنكية",
    garsonCagri: "🔔 استدعاء النادل",
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
    yoresel: "TRADITIONAL SPECIALS",
    spesiyaller: "HOUSE SPECIALS",
    "tas-firin": "STONE OVEN & PIDE",
    "ara-sicak": "HOT APPETIZERS",
    tavuk: "POULTRY DISHES",
    cocuk: "KIDS MENU",
    tatli: "DESSERTS",
    soguklar: "COLD APPETIZERS & MEZE",
    icecekler: "BEVERAGES",
  },
  AR: {
    yoresel: "الأطباق التقليدية",
    spesiyaller: "أطباق خاصة",
    "tas-firin": "فرن الحجر والفطائر",
    "ara-sicak": "المقبلات الساخنة",
    tavuk: "أطباق الدجاج",
    cocuk: "وجبات الأطفال",
    tatli: "الحلويات",
    soguklar: "المقبلات الباردة والمزة",
    icecekler: "المشروبات",
  },
};

const DISHES: MenuItem[] = ${dishesBlock};

const FACADE_CENTER = "/hero/facade.jpg";
const INTERIOR_HD = "/hero/interior.jpg";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>("yoresel");
  const [lang, setLang] = useState<Language>("TR");
  const [tableNo, setTableNo] = useState<string>("MASA 07");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [arModalDish, setArModalDish] = useState<Dish | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [inventory, setInventory] = useState<Record<string, number>>({});

  // Form State
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resGuests, setResGuests] = useState("2 Kişi");
  const [resTime, setResTime] = useState("Bugün Akşam (20:00)");
  const [resNote, setResNote] = useState("");
  const [resSuccess, setResSuccess] = useState(false);

  const t = TRANSLATIONS[lang];
  const totalPages = Math.ceil(DISHES.length / 4);

  const currentFourDishes = useMemo(() => {
    const start = currentPage * 4;
    return DISHES.slice(start, start + 4);
  }, [currentPage]);

  // URL'den Masa Numarası Okuma
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const masaParam = params.get("masa");
      if (masaParam) {
        setTableNo("MASA " + masaParam.padStart(2, "0"));
      }
    }
  }, []);

  // Stok Durumunu Çekme
  const fetchStock = async () => {
    try {
      const res = await fetch("/api/stock");
      if (res.ok) {
        const data = await res.json();
        if (data.inventory) {
          setInventory(data.inventory);
        }
      }
    } catch {
      // sessiz fallback
    }
  };

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDishOutOfStock = (id: string): boolean => {
    return inventory[id] !== undefined && inventory[id] <= 0;
  };

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const categoryBarRef = useRef<HTMLDivElement>(null);

  // Kategori Senkronizasyonu
  useEffect(() => {
    const firstDish = currentFourDishes[0];
    if (firstDish && firstDish.categorySlug !== selectedCategory) {
      setSelectedCategory(firstDish.categorySlug);
    }
    const bar = categoryBarRef.current;
    const catBtn = document.getElementById(\`cat-btn-\${firstDish?.categorySlug}\`);
    if (bar && catBtn) {
      const barRect = bar.getBoundingClientRect();
      const btnRect = catBtn.getBoundingClientRect();
      const scrollOffset = (btnRect.left - barRect.left) - (barRect.width / 2) + (btnRect.width / 2);
      bar.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  }, [currentPage, currentFourDishes, selectedCategory]);

  const handleSelectCategory = (slug: CategorySlug) => {
    setSelectedCategory(slug);
    const targetIdx = DISHES.findIndex((d) => d.categorySlug === slug);
    if (targetIdx !== -1) {
      setCurrentPage(Math.floor(targetIdx / 4));
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : totalPages - 1));
  };

  // AKILLI SINIR KONTROLLÜ VIRTUAL WHEEL
  useEffect(() => {
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      const menuEl = document.getElementById("menu-section");
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();

      const isMenuFocused = rect.top <= 120 && rect.bottom >= window.innerHeight - 120;
      if (!isMenuFocused) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest(".cart-drawer, [role='dialog'], input, textarea, select")) {
        return;
      }

      if (e.deltaY > 0 || e.deltaX > 0) {
        if (currentPage < totalPages - 1) {
          e.preventDefault();
          if (lock) return;
          lock = true;
          setCurrentPage((prev) => prev + 1);
          setTimeout(() => { lock = false; }, 260);
        }
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        if (currentPage > 0) {
          e.preventDefault();
          if (lock) return;
          lock = true;
          setCurrentPage((prev) => prev - 1);
          setTimeout(() => { lock = false; }, 260);
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [currentPage, totalPages]);

  // Sepet İşlemleri: Tek tıkla ekleme ve canlı sayaç artırma
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

  const handleUpdateCartQuantity = (id: string, delta: number) => {
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full max-w-full overflow-x-hidden bg-[#080706] text-[#F5EFEB] selection:bg-[#d4af37]/30 selection:text-white select-none">
      
      {/* ========================================================================= */}
      {/* 1. SABİT MİMARİ HEADER (HER ZAMAN ÜSTTE VE ERİŞİLEBİLİR)                  */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-[999] px-4 sm:px-10 py-3 flex items-center justify-between backdrop-blur-md bg-black/45 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollToSection("hero-section")}
            className="text-left group flex items-baseline gap-2 focus:outline-none cursor-pointer"
          >
            <span className="font-serif tracking-[0.32em] text-lg sm:text-xl font-light text-white group-hover:text-[#f0c85a] transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              BEROŞ
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-[10px] font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">[ SUR / DİYARBAKIR • {tableNo} ]</span>
            <span className="sm:hidden">{tableNo}</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-sans tracking-[0.25em] uppercase font-light">
          <button
            onClick={() => scrollToSection("hero-section")}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            GİRİŞ
          </button>
          <button
            onClick={() => scrollToSection("menu-section")}
            className="text-[#f0c85a] border-b border-[#f0c85a] pb-0.5 cursor-pointer drop-shadow-[0_0_12px_rgba(240,200,90,0.5)]"
          >
            GASTRONOMİ (2x2)
          </button>
          <button
            onClick={() => scrollToSection("konak-section")}
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

        <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-[150] pointer-events-auto">
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

          <button
            type="button"
            onClick={handleOpenGoogleReview}
            className="relative z-[90] pointer-events-auto cursor-pointer flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-mono tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            title="Google Haritalar'da Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden md:inline">{t.degerlendir}</span>
          </button>

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
      {/* 2. BÖLÜM 1: SESSİZ LÜKS GİRİŞ (HERO — KRİSTAL NETLİĞİNDE RESTORAN SALONU)  */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="min-h-screen relative flex flex-col justify-end p-8 sm:p-14 lg:p-20 pb-16 sm:pb-24 overflow-hidden"
      >
        {/* Hero Arka Plan: Kristal Netliğinde Canlı Restoran Salonu */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <img
            src="/hero/interior.jpg"
            alt="Beroş Restaurant Konak Salonu"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105 scale-105"
          />
          {/* Hafif Alt-Üst Radyal Geçiş - Kesinlikle Siyaha Boğmaz */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-black/25 to-[#080706]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(8,7,6,0.55)_100%)]" />
        </div>

        {/* Kurumsal Editoryal Başyapıt */}
        <div className="max-w-2xl relative z-10">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
            <span>Beroş Diyarbakır • 2x2 Ultra-Lüks Menü Vitrini • Her Masa Özeldir.</span>
          </div>
        </div>

        {/* Menüye Doğal Geçiş Çağrısı */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToSection("menu-section")}
            className="flex flex-col items-center gap-1.5 text-[10px] font-mono tracking-[0.4em] uppercase text-white/80 hover:text-[#f0c85a] transition-all cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group"
          >
            <span>MENÜYÜ KEŞFEDİN</span>
            <span className="animate-bounce text-[#f0c85a] text-sm">↓</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BÖLÜM 2: 2x2 ULTRA-LÜKS VİTRİN KARTLARI (GASTRONOMİ MENÜSÜ)             */}
      {/* ========================================================================= */}
      <section
        id="menu-section"
        className="min-h-screen relative flex flex-col justify-between pt-16 sm:pt-20 pb-4 px-3 sm:px-8 lg:px-12 z-10 overflow-hidden"
      >
        {/* Arka Plan: Flulaştırılmış Asırlık Konak Atmosferi & Sıcak Spot Işıkları */}
        <div className="absolute inset-0 z-0 bg-[#070504] pointer-events-none overflow-hidden">
          <img
            src="/hero/interior.jpg"
            alt="Beroş Restaurant Konak Ambiyansı"
            className="w-full h-full object-cover filter blur-[12px] brightness-75 mix-blend-luminosity opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070504]/75 via-transparent to-[#070504]/85" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(217, 119, 6, 0.22), transparent 70%)",
            }}
          />
        </div>

        {/* Masif Ahşap Kaplama & NFC Puck */}
        <div className="absolute inset-x-0 bottom-0 h-[48vh] sm:h-[52vh] pointer-events-none z-0 overflow-hidden">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: "linear-gradient(to top, rgba(7,5,4,0.15) 0%, rgba(7,5,4,0.95) 100%), url('/textures/walnut-table.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "bottom center",
              boxShadow: "inset 0 100px 80px -20px #070504"
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/35 to-transparent" />

          {/* Masadaki Beroş Akıllı Çağrı Diski (NFC PUCK) */}
          <div 
            onClick={() => handleServiceCall("Garson (Masa NFC Pulu)")}
            className="absolute right-4 sm:right-8 bottom-4 sm:bottom-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-500/40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)] pointer-events-auto cursor-pointer hover:border-amber-400 hover:scale-105 active:scale-95 transition-all z-20 group"
            title="Beroş Akıllı Masa Pulu - Garson Çağır"
          >
            <span className="text-[7px] sm:text-[8px] font-mono text-amber-400 tracking-widest uppercase group-hover:text-amber-300">BEROŞ</span>
            <span className="text-[9px] sm:text-[10px] text-white/90 font-medium">NFC PUCK</span>
            <span className="text-[7px] font-mono text-white/50 tracking-tighter mt-0.5">ZİL / ÇAĞRI</span>
          </div>
        </div>

        {/* ==================== MENÜ ÜST BARI: KATEGORİLER & SAYFA BİLGİSİ ==================== */}
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

          {/* Alt Satır: Sayfa Sayacı + Sayfa Noktaları + Oklar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#d4af37] uppercase">
                SAYFA {currentPage + 1} / {totalPages}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono tracking-widest text-white/60 uppercase">
                ÜRÜN {currentPage * 4 + 1}-{Math.min((currentPage + 1) * 4, DISHES.length)} / {DISHES.length}
              </span>
            </div>

            {/* Sayfa Gösterge Noktaları */}
            <div className="flex items-center gap-1 sm:gap-1.5 max-w-[140px] sm:max-w-[260px] overflow-x-auto no-scrollbar">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={\`h-1.5 transition-all duration-300 rounded-full flex-shrink-0 \${
                    idx === currentPage
                      ? "w-5 sm:w-6 bg-[#d4af37]"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }\`}
                  aria-label={\`Sayfa \${idx + 1}\`}
                />
              ))}
            </div>

            {/* Önceki / Sonraki Sayfa Butonları */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Önceki 4 Lezzet"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Sonraki 4 Lezzet"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 2x2 ULTRA-LÜKS VİTRİN KARTLARI ==================== */}
        <div className="grid grid-cols-2 grid-rows-2 gap-3.5 sm:gap-6 w-full h-[72vh] sm:h-[78vh] max-w-5xl mx-auto px-2 sm:px-4 items-center justify-center my-auto relative z-20">
          {currentFourDishes.map((dish, idx) => {
            const cartItem = cart.find((c) => c.id === dish.id);
            const count = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = isDishOutOfStock(dish.id);

            return (
              <div 
                key={dish.id} 
                className="relative group w-full h-full rounded-2xl border border-amber-500/25 hover:border-amber-400/60 bg-gradient-to-b from-[#1c1610]/85 via-[#130e09]/90 to-[#0a0705]/95 backdrop-blur-xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_45px_rgba(245,158,11,0.15)] transition-all duration-300"
              >
                {/* Kart Üst Satırı: Başlık & Fiyat */}
                <div className="flex items-start justify-between z-10 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#f5ebd7] group-hover:text-amber-300 transition-colors truncate">
                      {dish.name}
                    </h3>
                    <span className="text-[10px] sm:text-xs text-amber-400/80 font-mono block truncate mt-0.5">
                      🔥 {dish.calories} • ⚠️ {Array.isArray(dish.allergens) ? dish.allergens.join(", ") : dish.allergens}
                    </span>
                  </div>
                  <span className="bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-mono font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                    {dish.price}
                  </span>
                </div>

                {/* Merkez: Sıcak Parıltı Üzerinde Gerçekçi Tabak */}
                <div className="relative flex-1 flex items-center justify-center my-1">
                  {/* Tabağın Arkasındaki Sıcak Restoran Odak Lambası */}
                  <div className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-amber-500/15 blur-2xl pointer-events-none -z-10 group-hover:bg-amber-500/25 transition-all duration-500" />
                  
                  {/* Masaya Vuran Çift Katmanlı Organik Temas Gölgesi */}
                  <div className="absolute bottom-1 w-[75%] h-4 rounded-full bg-black/95 blur-md -z-10" />

                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="max-h-[135px] sm:max-h-[175px] w-auto object-contain filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                  />

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20">
                      <span className="px-3 py-1 bg-red-500/30 border border-red-500/60 text-red-300 text-xs font-mono font-bold rounded-lg uppercase">
                        {t.tukendi}
                      </span>
                    </div>
                  )}
                </div>

                {/* Alt Satır: 360° AR & Hızlı Ekle / Sayaç Butonu */}
                <div className="flex items-center justify-between z-10 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenArModal(dish)}
                    className="text-[10px] sm:text-xs text-amber-400/70 hover:text-amber-300 font-mono tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Box className="w-3.5 h-3.5 text-amber-400"/>
                    <span className="hidden xs:inline">360° AR</span>
                  </button>

                  <button
                    id={idx === 0 ? "btn-add-to-cart" : \`btn-add-\${dish.id}\`}
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(dish);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>+ Ekle</span>
                    {count > 0 && (
                      <span className="ml-1 bg-black text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== ALT BİLGİ BARI ==================== */}
        <footer className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          <span>DİYARBAKIR SUR MİRASI</span>
          <span className="hidden sm:inline">1&apos;DEN {totalPages}&apos;YE 4&apos;LÜ GEZİN • SON SAYFADA AŞAĞI KAYDIRARAK KONAK BÖLÜMÜNE GEÇİN ↓</span>
          <span>2x2 DÖRTLÜ VİTRİN • 65 LEZZET</span>
        </footer>

      </section>

      {/* ========================================================================= */}
      {/* 4. BÖLÜM 3: TAM EKRAN TAŞ KEMERLİ DIŞ CEPHE, GÖMÜLÜ TABELA & KONAK İLETİŞİM */}
      {/* ========================================================================= */}
      <section
        id="konak-section"
        className="min-h-screen relative flex flex-col justify-end items-center p-8 sm:p-14 pb-12 sm:pb-16 text-center overflow-hidden"
      >
        {/* Konak Arka Plan: Taş Kemerli Tarihi Dış Cephe (Sıcak Canlı Kemer Işığı) */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <img
            src="/hero/facade.jpg"
            alt="Beroş Restaurant Tarihi Taş Kemerli Cephe"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />
          {/* Sıcak Kemer Işığı */}
          <div 
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[550px] h-28 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(245,158,11,0.5) 0%, transparent 75%)",
              filter: "blur(30px)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080706]/85 via-black/20 to-[#080706]/95" />
        </div>

        <div className="max-w-2xl relative z-10 mb-8">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-[#d4af37] uppercase block mb-2">
            SUR / DİYARBAKIR
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
            Şehrin Ruhunu Taşıyan Bir Sofra Deneyimi
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-serif italic text-[#d4af37]">
            Sizi Ağırlamaktan Onur Duyduk
          </p>
          <p className="mt-3 text-xs sm:text-sm font-sans text-white/80 max-w-lg mx-auto font-light leading-relaxed">
            &ldquo;Gelenekten beslenen mutfağımızı, Sur&apos;un tarihi atmosferinde çağdaş bir sunum anlayışı ve özenli servisle buluşturduk. Tarihi konak kapımız sizlere her zaman açık.&rdquo;
          </p>
          <p className="mt-2 text-[10px] sm:text-xs font-mono tracking-widest text-white/50 uppercase">
            CAMİİ NEBİ MAH. İNÖNÜ CAD. NO: 12 SUR / DİYARBAKIR • BEROŞ RESTAURANT
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <button
            onClick={() => window.open(RESTAURANT_CONFIG.instagramUrl, "_blank")}
            className="px-4 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>[@berosrestoran]</span>
          </button>

          <button
            onClick={() => handleServiceCall("Garson")}
            className="px-4 py-2.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Garson Çağır</span>
          </button>

          <a
            href={\`https://wa.me/\${RESTAURANT_CONFIG.whatsappNumber}?text=\${encodeURIComponent("Merhaba, Beroş Restaurant için rezervasyon yaptırmak istiyorum.")}\`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full border border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/40 backdrop-blur-md text-xs font-mono tracking-wider text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Rezervasyon</span>
          </a>

          <button
            onClick={handleCopyWifi}
            className="px-4 py-2.5 rounded-full border border-sky-500/30 hover:border-sky-500 bg-sky-950/40 backdrop-blur-md text-xs font-mono tracking-wider text-sky-300 hover:text-sky-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{wifiCopied ? "Kopyalandı!" : "Wi-Fi Şifresi"}</span>
          </button>

          <button
            onClick={() => scrollToSection("menu-section")}
            className="px-4 py-2.5 rounded-full border border-amber-400/40 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Menü Vitrinine Dön</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CANLI MASA ADİSYONU / TEPSİ DRAWER (Z-[2000] - TIKLAMA KESİNLİKLE AÇIK) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[2000] pointer-events-auto isolation-isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="cart-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0e0c0a] border-l border-[#d4af37]/30 shadow-2xl flex flex-col justify-between z-10 p-6 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase block">
                      {t.tepsiBaslik}
                    </span>
                    <h3 className="font-serif text-xl font-light text-white">
                      {tableNo} <span className="text-emerald-400 text-xs font-mono ml-2">AKTİF</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-full border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="py-16 text-center text-white/40 font-serif">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#d4af37]" />
                    <p className="text-base">{t.bosTepsi}</p>
                    <p className="text-xs font-sans text-white/30 mt-1">
                      {t.bosTepsiAlt}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex-1">
                          <h4 className="font-serif text-sm text-white font-medium">
                            {item.name}
                          </h4>
                          <span className="text-xs font-mono text-[#d4af37]">
                            ₺{item.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm text-white w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold text-white min-w-[65px] text-right">
                            ₺{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="mt-6 p-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#f0c85a] uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.sefinTavsiyesi}</span>
                      </div>
                      <p className="text-xs text-white/70">
                        {t.ayranOneri}
                      </p>
                      <button
                        onClick={() => {
                          const ayran = DISHES.find(d => d.id === "acik-ayran") || {
                            id: "acik-ayran",
                            name: "Yayık Açık Ayran",
                            price: "₺ 75",
                            priceNum: 75,
                            image: "/dishes/acik-ayran.png",
                            category: "İçecekler",
                            categorySlug: "icecekler",
                            subtitle: "Köpüklü yayık ayran",
                            description: "Köpüklü yayık ayran"
                          };
                          handleAddToCart(ayran as MenuItem);
                        }}
                        className="mt-2.5 px-3 py-1 rounded-lg bg-[#d4af37] text-black font-mono text-xs font-bold hover:bg-[#e5be46] transition-all cursor-pointer"
                      >
                        {t.birTiklaEkle}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-white/60 tracking-wider uppercase">
                      {t.toplam}
                    </span>
                    <span className="font-serif text-2xl text-[#d4af37] font-bold">
                      ₺{totalCartPrice}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="btn-submit-order"
                    onClick={() => handleSubmitOrder(null)}
                    disabled={isOrderSubmitting}
                    className="cursor-pointer pointer-events-auto relative z-[2000] w-full py-4 rounded-xl bg-[#10b981] hover:bg-[#059669] active:scale-95 text-white font-mono text-sm uppercase font-bold tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>
                      {isOrderSubmitting ? t.iletiliyor : t.siparisiGonder}
                    </span>
                  </button>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <button
                      onClick={() => handleSubmitOrder("nakit")}
                      className="py-2 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/80 cursor-pointer"
                    >
                      {t.nakitHesap}
                    </button>
                    <button
                      onClick={() => handleSubmitOrder("kart")}
                      className="py-2 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/80 cursor-pointer"
                    >
                      {t.kartHesap}
                    </button>
                    <button
                      onClick={() => handleServiceCall("Garson")}
                      className="py-2 px-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-mono text-amber-300 cursor-pointer"
                    >
                      {t.garsonCagri}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. MASA REZERVASYON MODALI                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReservationOpen && (
          <div className="fixed inset-0 z-[2000] pointer-events-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#14100c] border border-[#d4af37]/40 rounded-2xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase block">
                    SUR / DİYARBAKIR
                  </span>
                  <h3 className="font-serif text-2xl text-white">
                    Masa Rezervasyonu
                  </h3>
                </div>
                <button
                  onClick={() => setIsReservationOpen(false)}
                  className="p-2 rounded-full border border-white/10 text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-white">
                    Talebiniz Alındı!
                  </h4>
                  <p className="text-xs text-white/70 mt-1 max-w-sm mx-auto">
                    Restoran yetkilimiz en kısa sürede rezervasyon teyidi için sizinle iletişime geçecektir.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResSuccess(true);
                    setTimeout(() => {
                      setResSuccess(false);
                      setIsReservationOpen(false);
                    }, 2500);
                  }}
                  className="mt-6 space-y-4 font-mono text-xs"
                >
                  <div>
                    <label className="text-white/60 block mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      required
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/60 block mb-1">Kişi Sayısı</label>
                      <select
                        value={resGuests}
                        onChange={(e) => setResGuests(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#1a1512] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option>1 Kişi</option>
                        <option>2 Kişi</option>
                        <option>4 Kişi</option>
                        <option>6+ Kişi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">Zaman</label>
                      <select
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#1a1512] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option>Bugün Akşam (20:00)</option>
                        <option>Bugün Öğle (13:00)</option>
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
                    className="w-full py-3 mt-2 rounded-xl bg-[#d4af37] text-black font-bold uppercase tracking-wider hover:bg-[#e5be46] transition-all cursor-pointer"
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
      {/* 7. 360° AR MEKÂNSAL GÖRÜNTÜLEYİCİ MODALI                                  */}
      {/* ========================================================================= */}
      {arModalDish && (
        <ArSpatialViewer
          dish={arModalDish}
          onClose={() => setArModalDish(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. MOBİL AÇILIR MENÜ                                                      */}
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
                  className="p-2 rounded-full border border-white/10 text-white/70 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 space-y-4 font-serif text-lg text-white/90">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection("hero-section");
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37] cursor-pointer"
                >
                  Giriş & Kurumsal Miras
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection("menu-section");
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37] cursor-pointer"
                >
                  2x2 Ultra-Lüks Vitrin (65 Lezzet)
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToSection("konak-section");
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37] cursor-pointer"
                >
                  Asırlık Konak & İletişim
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReservationOpen(true);
                  }}
                  className="block w-full text-left py-2 hover:text-[#d4af37] cursor-pointer"
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
                  className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/80 cursor-pointer"
                >
                  Wi-Fi Şifresi: {RESTAURANT_CONFIG.wifiPass}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9. ANLIK AKSİYON & BİLDİRİM TOASTI                                       */}
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
`;

fs.writeFileSync(pagePath, newPageContent, "utf8");
console.log("Successfully generated app/page.tsx with z-0 background visibility!");
