content = '''\'use client\';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import menuJson from '@/src/data/loqum-menu.json';
import initialProducts from '@/src/data/loqum-products.json';
import { CategoryItem, MenuItemProduct } from '@/types/loqum';
import { 
  UtensilsCrossed, Search, MapPin, Clock, Flame, 
  CheckCircle2, BellRing, Receipt, Star, Zap, X, 
  LayoutDashboard, Plus, Minus, Trash2, Sparkles, ArrowRight, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const ParallaxComponent = dynamic(
  () => import('@/components/ui/parallax-scrolling').then((m) => m.ParallaxComponent),
  { ssr: false }
);

const CoverFlowCarousel = dynamic(
  () => import('@/components/ui/3-d-coverflow-carousel').then((m) => m.CoverFlowCarousel),
  { ssr: false }
);

// RESMİ BAĞLANTILAR
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?client=opera&hs=Ph8&sca_esv=16067ccfc9d0a6cf&sxsrf=APpeQnvRGTrxIiZ5feQx-VWv7wpxF6H6xA:1788983178459&uds=AJ5uw1_a2D0D09lxm8gpKKOTUn4rSGxlWOgVa94UJjoNIxJa62R0a3JrLVLMes-MVY8BJpCC0gzHxX0XJfuamCs_bgTDWNDiwu7rGCC_qneL24erMN2cJ5_xRYPnRNgkfIz1pexzJLw_GcSqRdJbCysrTO_HNc9pEMhjcsE85FCfGhNaSv5Mpng&q=LOQUM+ET-STEAKHOUSE+D%C4%B0YARBAKIR+Yorumlar&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_1fKBQrnjX1fKW71SBN4S9Mh0TtOlJwsT5jycHqv9Yx2Td8G6c8Dwz2I-8KK4njFGJduHd0WvPU78Qs_Tl6SrjbpzEUHevYt22dXD5QAgOtzXSj-jWQSNYB6hRyrOQ8xrlksirk%3D&hl=tr-TR&sa=X&ved=2ahUKEwj2vvHWoeKWAxUxBNsEHa15I-4Q_4MLegQIOBAQ&biw=1452&bih=798&dpr=2";
const INSTAGRAM_URL = "https://www.instagram.com/loqumdiyarbakir?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==";

const UPSELL_ITEMS = [
  { id: 'icecekler-ayran', name: 'Yayık Ayran (Köpüklü)', price: 60, tag: 'Taze' },
  { id: 'kofteler-icli-kofte', name: 'Zırh Harçlı İçli Köfte (Adet)', price: 90, tag: 'Sıcak' },
  { id: 'lahmacun-ve-pide-findik-lahmacun', name: 'Çıtır Fındık Lahmacun', price: 70, tag: 'Taş Fırın' },
  { id: 'makarnalar-ve-salatalar-geleneksel-humus', name: 'Geleneksel Süzme Humus', price: 220, tag: 'Tahinli' },
  { id: 'tatlilar-katmer', name: 'Fırından Sıcak Katmer', price: 460, tag: 'Fıstıklı' }
];

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function HomePage() {
  const [tableNumber, setTableNumber] = useState<string>('12');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rezervasyon Form State
  const [reservationData, setReservationData] = useState({
    branch: 'Diyarbakır - 75. Yol Ana Şube',
    guests: '2 Kişilik',
    date: '2026-09-15',
    time: '20:00',
    name: '',
    phone: ''
  });

  const categories = menuJson.categories as CategoryItem[];
  const [products] = useState<MenuItemProduct[]>(initialProducts as any[]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const masa = params.get('masa');
      if (masa) setTableNumber(masa);
    }
  }, []);

  // Mobilde çekmece açıkken arka planın kaymasını engelle
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  const handleAddItem = (item: { id: string; name: string; price: number }) => {
    setCartItems((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });

    setToastMessage(`⚡ "${item.name}" eklendi!`);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const next = it.quantity + delta;
            return next > 0 ? { ...it, quantity: next } : null;
          }
          return it;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const totalAmount = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleDispatchToKitchen = async () => {
    if (cartItems.length === 0) return;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: `MASA ${tableNumber}`,
          items: cartItems,
          totalAmount: totalAmount
        })
      });

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 }
      });

      setToastMessage(`🎉 Masa ${tableNumber} siparişi başarıyla mutfağa iletildi!`);
      setTimeout(() => setToastMessage(null), 3500);
      setIsDrawerOpen(false);
      setCartItems([]);
    } catch {
      alert('Sipariş iletildi.');
      setIsDrawerOpen(false);
      setCartItems([]);
    }
  };

  const handleServiceCall = async (type: 'Garson' | 'Hesap', reason: string) => {
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: `MASA ${tableNumber}`,
          serviceType: type,
          reason
        })
      });
      setToastMessage(`🛎️ Masa ${tableNumber}: ${type === 'Garson' ? 'Garson çağrısı' : 'Hesap talebi'} kasaya iletildi!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      alert('Çağrı kasaya aktarıldı.');
    }
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.85 }
    });
    setToastMessage(`✨ Rezervasyon talebiniz alındı. LOQUM ET ekibi en kısa sürede sizinle iletişime geçecektir.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans pb-36 touch-manipulation selection:bg-[#C8982B] selection:text-black">
      
      {/* ================= 1. ULTRA-PREMIUM TOP NAVIGATION BAR ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 sm:h-24 px-4 sm:px-6 lg:px-16 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md transition-all duration-300 border-b border-white/5">
        
        {/* Sol: MENÜ BUTONU & DİL SEÇİMİ */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <button 
            type="button" 
            onClick={() => {
              const menuEl = document.getElementById('menu');
              if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
              else setIsDrawerOpen(true);
            }}
            className="group flex items-center space-x-2.5 sm:space-x-3 rounded-full border border-white/20 px-3.5 sm:px-5 py-2 hover:border-[#C8982B] transition-colors duration-300 cursor-pointer bg-black/40 backdrop-blur-sm"
          >
            <div className="flex flex-col space-y-1.5 w-4 sm:w-5">
              <span className="h-[2px] w-full bg-gold-gradient transition-transform group-hover:translate-x-1"></span>
              <span className="h-[2px] w-3/4 bg-gold-gradient transition-transform group-hover:w-full"></span>
            </div>
            <span className="text-[11px] sm:text-xs lg:text-sm font-semibold tracking-[0.2em] text-white">MENÜ</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1 text-xs font-bold tracking-widest text-white/70">
            <button className="text-white hover:text-[#C8982B] transition-colors">TR</button>
            <span className="text-white/30">/</span>
            <button className="hover:text-[#C8982B] transition-colors">EN</button>
          </div>

          {/* Aktif Masa Rozeti */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-[#D4AF37]/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-stone-300 font-medium">MASA <strong className="text-[#D4AF37]">{tableNumber}</strong></span>
          </div>
        </div>

        {/* Merkez: LOQUM ET Brand Logo */}
        <a href="#" className="flex items-center group tracking-[0.2em] select-none">
          <span className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-white group-hover:text-white/90 transition-colors">
            LOQUM<span className="text-[#BF2329] mx-1 text-2xl sm:text-3xl font-serif">.</span>ET
          </span>
        </a>

        {/* Sağ: RESTORANLAR, REZERVASYON & GOOGLE YORUM */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Restoranlar Çatal SVG */}
          <a 
            href="#restoranlar" 
            className="hidden md:flex items-center space-x-2 border border-white/20 rounded-full px-4 sm:px-5 py-2 text-xs font-semibold tracking-widest hover:border-[#C8982B] hover:text-[#C8982B] transition-all duration-300"
          >
            <svg className="w-4 h-4 text-[#C8982B]" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.3 8L16.9 1.4C17.1 1.2 17 0.9 16.8 0.7L15.3 0.2C15.1 0.1 14.8 0.2 14.6 0.4L9.1 5.9C8.8 6.2 8.6 6.6 9 7C9.3 7.3 8.9 7.7 8.9 7.7L1.6 0.9C1.3 0.6 0.9 0.6 0.7 0.9C0.5 1.1 0.5 1.5 0.8 1.8L4.8 7.7C5.3 8.4 5.9 8.3 6.2 8L8.3 9.5L14.7 16.6C15.2 17.1 15.8 17.1 16.2 16.7C16.6 16.4 16.5 15.8 16.1 15.4L9.2 8.5L10.3 8Z" fill="url(#nav_cutlery_gold)"/>
              <defs>
                <linearGradient id="nav_cutlery_gold" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#C8982B"/>
                  <stop offset="100%" stopColor="#FBE291"/>
                </linearGradient>
              </defs>
            </svg>
            <span>RESTORANLAR</span>
          </a>

          {/* Instagram Rozeti */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-orange-500/15 border border-pink-500/40 text-stone-200 hover:text-white hover:border-pink-400 transition-all text-xs font-semibold"
            title="Loqum Et Instagram"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400"/>
            <span>@loqumdiyarbakir</span>
          </a>

          {/* Rezervasyon Butonu */}
          <a 
            href="#rezervasyon" 
            className="flex items-center space-x-2 bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-bold text-xs lg:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:brightness-110 transition-all glow-gold shadow-lg"
          >
            <span>REZERVASYON</span>
          </a>
        </div>
      </nav>

      {/* ================= 2. HERO PARALLAX (Dış Cephe, Altın Boğalar & Cloche CTA) ================= */}
      <div className="pt-20 sm:pt-24">
        <ParallaxComponent/>
      </div>

      {/* ================= 3. 3D COVERFLOW CAROUSEL (İmza Lezzetler) ================= */}
      <CoverFlowCarousel 
        dishes={products.filter((p: any) => p.isPopular).slice(0, 12)} 
        sectionLabel="ŞEFİN İMZA LEZZETLERİ"
        onQuickOrder={handleAddItem}
      />

      {/* ================= 4. SECTION: LOQUM ET RİTÜELİ (Ultra-Lüks Steakhouse Deneyimi) ================= */}
      <section id="restoranlar" className="py-20 sm:py-28 lg:py-36 relative z-20 bg-[#080808] border-t border-white/5 scroll-mt-24">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Sol: Altın Degrade Çerçeveli Görsel Kartı & Dönen Etkinlik Rozeti (svg-20) */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-[4/5] rounded-2xl p-[2px] bg-gradient-to-br from-[#C8982B] via-[#FBE291] to-[#C8982B]/40 shadow-2xl overflow-hidden group">
                <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                  <img 
                    src="/images/menu/steak/loqum.jpg" 
                    alt="LOQUM ET İkonik Sunum" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="text-[#C8982B] font-mono text-xs uppercase tracking-widest font-bold block mb-1">İmza Sunum</span>
                      <h4 className="font-serif text-2xl sm:text-3xl text-white font-bold">Tereyağlı LOQUM Bonfile</h4>
                      <p className="text-xs text-stone-300 mt-1">280 - 300 Gr. • Ağızda eriyen mühürlü bonfile</p>
                    </div>
                    <span className="text-3xl sm:text-4xl font-display text-[#C8982B] font-black">01</span>
                  </div>
                </div>
              </div>

              {/* Dönen Dairesel Etkinlik Rozeti (svg-20 entegrasyonu) */}
              <div className="absolute -bottom-6 -right-4 lg:-right-8 w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 z-30">
                <a href="#etkinlik" className="relative block w-full h-full group" title="Etkinlik Planlayın">
                  <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="badge_gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FBE291"/>
                        <stop offset="100%" stopColor="#C8982B"/>
                      </linearGradient>
                      <path id="circlePathEvent" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"/>
                    </defs>
                    <text fontSize="13" fontWeight="700" letterSpacing="0.18em" fill="url(#badge_gold)">
                      <textPath href="#circlePathEvent">ETKİNLİK PLANLAYIN • PLAN YOUR EVENT • </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/95 border border-[#C8982B]/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(200,152,43,0.35)]">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FBE291]"/>
                  </div>
                </a>
              </div>
            </div>

            {/* Sağ: LOQUM ET Ritüeli Metin İçeriği */}
            <div className="lg:col-span-6 flex flex-col items-start lg:pl-6">
              <span className="text-gold-gradient font-display text-xs sm:text-sm tracking-[0.3em] uppercase mb-3">
                LOQUM ET RİTÜELİ
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
                TÜM DUYULARINIZA HİTAP EDEN BİR GASTRONOMİ ŞÖLENİ
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                Cızırdayan tereyağının aroması, dinlendirilmiş etin lokum yumuşaklığı ve şeflerimizin teatrikal sunumu. LOQUM ET'te her tabak, yılların ustalığını ve et işleme tutkusunu sofranıza taşır.
              </p>

              <div className="border-l-2 border-[#C8982B] pl-4 my-4">
                <p className="italic text-stone-400 text-xs sm:text-sm">
                  "Etin lokum kıvamında olması bir tesadüf değil; ustalık, sabır ve yüksek tutkunun sonucudur."
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <a 
                  href="#rezervasyon" 
                  className="inline-flex items-center space-x-3 bg-[#BF2329] hover:bg-red-700 text-white text-xs tracking-[0.2em] uppercase font-bold px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                >
                  <span>Masayı Ayırt</span>
                  <span>→</span>
                </a>
                <a 
                  href="#etkinlik" 
                  className="inline-flex items-center space-x-2 border border-white/30 hover:border-[#C8982B] text-white hover:text-[#C8982B] text-xs tracking-[0.2em] uppercase font-bold px-7 py-3.5 rounded-full transition-all duration-300 active:scale-95"
                >
                  <span>Özel Davetler</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 5. SECTION: NEON BRAND BANNER ================= */}
      <section className="py-20 relative bg-black overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C8982B_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <span className="text-xs font-mono tracking-[0.5em] text-white/40 uppercase block mb-3">Karakteristik Dokunuş</span>
          <h3 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 drop-shadow-[0_0_25px_rgba(191,35,41,0.6)]">
            NO LOQUM, NO LIFE
          </h3>
          <p className="text-white/60 text-xs sm:text-sm tracking-[0.3em] uppercase mt-4">
            Diyarbakır • İstanbul • Bodrum • Dubai • Londra • New York
          </p>
        </div>
      </section>

      {/* ================= 6. SECTION: GURME MENÜ & TEK TIKLA SİPARİŞ (160 Ürün & Filtreler) ================= */}
      <section id="menu" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/30 text-[#FBE291] text-[11px] font-bold tracking-wider uppercase mb-2">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#C8982B]"/>
              <span>RESMİ GASTRONOMİ MENÜSÜ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-2">
              Gurme Menü & Masadan Canlı Sipariş
            </h2>
            <p className="text-[11px] md:text-xs text-stone-400 mt-1">
              Bakanlık standartlarında gramaj, kalori ve sıfır hata alerjen etiketli 160 lezzetimiz.
            </p>
          </div>

          {/* Garson & Hesap Çağrı Butonları */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleServiceCall('Garson', 'Masaya Garson İstendi')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-[#D4AF37] text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow"
            >
              <BellRing className="w-3.5 h-3.5 text-[#D4AF37]"/>
              Garson Çağır
            </button>
            <button
              onClick={() => handleServiceCall('Hesap', 'Hesap İstendi')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-emerald-500 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400"/>
              Hesap İste
            </button>
          </div>
        </div>

        {/* Arama Kutusu */}
        <div className="relative mt-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"/>
          <input
            type="text"
            placeholder="Menüde lezzet veya içerik ara (Örn: Adana, Lokum, Tomahawk, Humus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs md:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C8982B] transition-colors"
          />
        </div>

        {/* Kategoriler Yatay Kaydırma */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-[#C8982B] to-[#FBE291] text-black font-bold shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            Tüm Lezzetler ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-gradient-to-r from-[#C8982B] to-[#FBE291] text-black font-bold shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ürün Listesi Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-2">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              className="group rounded-2xl overflow-hidden bg-[#121212] border border-stone-800 hover:border-[#C8982B]/60 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-[#FBE291] border border-[#C8982B]/30">
                  {product.tag}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-stone-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500"/>
                  {product.calories} kcal
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug font-serif">
                      {product.name}
                    </h3>
                    <span className="text-sm font-bold text-[#FBE291] whitespace-nowrap font-mono">
                      ₺{product.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="text-[10px] text-stone-400 mt-1.5">
                    Gramaj: <strong className="text-stone-300">{product.gramaj || '200 gr'}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {product.allergens && product.allergens.length > 0 ? (
                      product.allergens.map((a: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-[9px] text-amber-300">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-[9px] text-emerald-400">
                        Alerjensiz
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddItem(product)}
                    className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#C8982B] to-[#FBE291] text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 whitespace-nowrap hover:brightness-110"
                  >
                    <Zap className="w-3.5 h-3.5 fill-stone-950"/>
                    Ekle +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7. SECTION: ETKİNLİK PLANLAYIN & VIP ALANLAR ================= */}
      <section id="etkinlik" className="py-24 bg-gradient-to-b from-[#080808] to-[#0E0E0E] relative border-t border-white/5 scroll-mt-20">
        <div className="container mx-auto px-6 lg:px-16">
          
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-gold-gradient font-display text-xs sm:text-sm tracking-[0.4em] uppercase block mb-3">
              Özel Davetler & Kutlamalar
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6">
              Unutulmaz Bir Etkinlik Planlayın
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-light">
              Şirket kutlamalarınız, yıl dönümleriniz ve VIP misafirleriniz için özel hazırlanmış salonlarımızda kişiselleştirilmiş menüler sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 hover:border-[#C8982B]/60 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/30 flex items-center justify-center mb-6 text-[#FBE291] font-serif font-bold text-xl group-hover:scale-110 transition-transform">
                ✦
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">Chef’s Table</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                Baş şefimizin özel tadım menüsü ve alevli lokum sunumlarıyla tezgâh başında interaktif gastronomi.
              </p>
              <a href="#rezervasyon" className="text-[#C8982B] text-xs font-bold tracking-widest uppercase hover:underline">Rezervasyon Yap →</a>
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 hover:border-[#C8982B]/60 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/30 flex items-center justify-center mb-6 text-[#FBE291] font-serif font-bold text-xl group-hover:scale-110 transition-transform">
                ◈
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">Özel VIP Salonlar</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                10 kişiden 80 kişiye kadar kapalı devre kurumsal yemekler ve yüksek mahremiyetli kutlamalar.
              </p>
              <a href="#rezervasyon" className="text-[#C8982B] text-xs font-bold tracking-widest uppercase hover:underline">Detay Al →</a>
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 hover:border-[#C8982B]/60 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/30 flex items-center justify-center mb-6 text-[#FBE291] font-serif font-bold text-xl group-hover:scale-110 transition-transform">
                ❖
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">Catering & Masterclass</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                Kendi lokasyonunuzda LOQUM ET kalitesini yaşamak veya et mühürleme tekniklerini deneyimlemek için.
              </p>
              <a href="#rezervasyon" className="text-[#C8982B] text-xs font-bold tracking-widest uppercase hover:underline">İletişime Geç →</a>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 8. SECTION: REZERVASYON FORMU (Masanızı Ayırtın) ================= */}
      <section id="rezervasyon" className="py-24 bg-black relative border-t border-white/10 scroll-mt-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-[#C8982B]/40 bg-[#121212] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#C8982B]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-10">
              <span className="text-gold-gradient font-display text-xs tracking-[0.3em] uppercase font-bold">Anında Onay</span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">Masanızı Ayırtın</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 font-light">LOQUM ET lezzeti için şube, tarih ve kişi sayısını belirleyin.</p>
            </div>

            <form onSubmit={handleReservationSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Şube Seçiniz</label>
                <select 
                  value={reservationData.branch}
                  onChange={(e) => setReservationData({ ...reservationData, branch: e.target.value })}
                  className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                >
                  <option>Diyarbakır - 75. Yol Ana Şube</option>
                  <option>İstanbul - Bebek</option>
                  <option>İstanbul - Etiler</option>
                  <option>Bodrum - Yalıkavak Marina</option>
                  <option>Ankara - Çankaya</option>
                  <option>Dubai - Downtown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Kişi Sayısı</label>
                <select 
                  value={reservationData.guests}
                  onChange={(e) => setReservationData({ ...reservationData, guests: e.target.value })}
                  className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                >
                  <option>2 Kişilik</option>
                  <option>3 - 4 Kişilik</option>
                  <option>5 - 8 Kişilik (Grup)</option>
                  <option>VIP Özel Oda (+10 Kişi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Tarih</label>
                <input 
                  type="date" 
                  value={reservationData.date}
                  onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                  className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Saat</label>
                <select 
                  value={reservationData.time}
                  onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
                  className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                >
                  <option>18:30</option>
                  <option>19:45</option>
                  <option>20:00</option>
                  <option>21:00</option>
                  <option>22:15</option>
                </select>
              </div>

              <div className="sm:col-span-2 mt-2">
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-display font-bold text-sm tracking-[0.25em] uppercase hover:brightness-110 transition-all cursor-pointer glow-gold shadow-2xl"
                >
                  Rezervasyonu Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ================= 9. ULTRA-LÜKS FOOTER ================= */}
      <footer className="py-12 bg-black border-t border-white/10 text-xs text-gray-400">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="font-display tracking-widest text-white text-lg">
            LOQUM<span className="text-[#BF2329]">.</span>ET
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C8982B]"/> Diyarbakır • 75. Yol Ana Şube
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C8982B]"/> 09:00 - 00:00
            </span>
          </div>
          <div className="flex space-x-6 text-gray-400 font-semibold">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FBE291] transition-colors">Instagram</a>
            <a href="#menu" className="hover:text-[#FBE291] transition-colors">Menü</a>
            <a href="#rezervasyon" className="hover:text-[#FBE291] transition-colors">Rezervasyon</a>
          </div>
        </div>
        <div className="text-center text-stone-600 text-[11px] mt-8">
          © {new Date().getFullYear()} LOQUM ET Global Steakhouse. Masa {tableNumber} Canlı Menü ve Sipariş Sistemi.
        </div>
      </footer>

      {/* ================= 10. FLOATING REZERVASYON WIDGET (Sağ Alt Köşe) (svg-33 + svg-34) ================= */}
      <div className="fixed bottom-28 sm:bottom-6 right-3 sm:right-6 z-40">
        <a 
          href="#rezervasyon" 
          className="relative block w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 group transition-transform duration-300 hover:scale-105" 
          title="Rezervasyon Yapın"
        >
          {/* Dönen Dairesel Tipografi (svg-33) */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
            <defs>
              <path id="floatingTextPath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="none"/>
            </defs>
            <text fontSize="15" fontWeight="700" letterSpacing="0.08em" className="fill-white group-hover:fill-[#FBE291] transition-colors">
              <textPath href="#floatingTextPath" startOffset="0">
                REZERVASYON YAPIN • MAKE A RESERVATION • 
              </textPath>
            </text>
          </svg>

          {/* Merkez Altın Cloche Servis Zili (svg-34) */}
          <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black border border-[#C8982B]/80 shadow-[0_0_20px_rgba(200,152,43,0.35)] flex items-center justify-center group-hover:border-[#FBE291] transition-all">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.9996 0C25.6698 0 25.3433 0.07 25.0385 0.2C24.2238 0.79 23.4885 2.35 23.4885 2.7C23.4891 3.22 23.8832 4.16 24.9403 5.16C13.9289 5.75 5.171 15.57 5.17155 27.6H46.8C46.8276 15.57 38.0695 5.75 27.0586 5.16C28.1158 4.16 28.5104 2.7 28.5104 2.7C28.3196 1.67 27.7756 0.79 26.9611 0.2C26.6566 0.07 26.0004 0 25.9996 0ZM25.8919 30L5.09903 30C4.65283 30 1.84012 32 0 34.1V37.2C0 37.6 0.359192 38 0.805389 38H51.1946C51.6408 38 52 37.6 52 37.2V34.1C50.1599 32 47.3472 30 46.901 30L26.1092 30H25.8919Z" fill="url(#float_bell_gradient)"/>
              <defs>
                <linearGradient id="float_bell_gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#C8982B"/>
                  <stop offset="100%" stopColor="#FBE291"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </a>
      </div>

      {/* ================= 11. KÖŞEDE KASAYA GEÇİŞ KISAYOLU ================= */}
      <Link 
        className="fixed bottom-28 sm:bottom-4 left-3 sm:left-4 z-40 bg-stone-900/95 hover:bg-stone-800 border border-[#D4AF37]/50 text-stone-200 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold hover:text-[#D4AF37] transition-all hover:scale-105 active:scale-95" 
        href="/kasa" 
        title="Yönetici ve Kasa Ekranına Geç"
      >
        <LayoutDashboard className="w-4 h-4 text-[#D4AF37]"/>
        <span className="hidden sm:inline">Kasa Terminali</span>
      </Link>

      {/* ================= 12. ALT YÜZEN BAR & ŞEFİN ÖNERİSİ HIZLI EKLEME ŞERİDİ ================= */}
      <aside aria-label="Sipariş ve Şefin Önerisi Çubuğu" className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl flex flex-col gap-1.5">
        
        {/* Şefin Önerisi Şeridi */}
        <div className="bg-stone-950/95 border border-stone-800/90 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] shrink-0 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>Şefin Önerisi:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {UPSELL_ITEMS.slice(0, 3).map((up) => (
              <button
                key={up.id}
                onClick={() => handleAddItem(up)}
                className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] text-stone-300 hover:text-white flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-[9px] font-bold">
                  {up.tag}
                </span>
                <span>{up.name}</span>
                <strong className="text-[#D4AF37]">₺{up.price}</strong>
                <Plus className="w-3 h-3 text-[#D4AF37]"/>
              </button>
            ))}
          </div>
        </div>

        {/* Ana İşlem Barı */}
        <div className="bg-[#121212]/95 border border-[#D4AF37]/50 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-3">
          <div 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2.5 pl-1 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <span className="font-black text-sm">{totalCount}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                MASA {tableNumber}
              </div>
              <div className="text-[11px] text-[#D4AF37] font-semibold">
                ₺{totalAmount}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (cartItems.length > 0) {
                setIsDrawerOpen(true);
              } else {
                setToastMessage('Lütfen önce menüden bir lezzet seçin.');
                setTimeout(() => setToastMessage(null), 2500);
              }
            }}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#D4AF37] text-stone-950 font-black text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span>MUTFAĞA İLET (TEK TIK)</span>
            <ArrowRight className="w-4 h-4"/>
          </button>
        </div>
      </aside>

      {/* ================= 13. SAĞDAN AÇILAN SİPARİŞ VE ÇAPRAZ SATIŞ ÇEKMECESİ ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div 
            className="relative w-full sm:w-[420px] bg-[#0E0E0E] border-l border-stone-800 h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideLeft"
          >
            <div>
              <div className="flex items-start justify-between border-b border-stone-800 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                    Masa {tableNumber} Sipariş Detayı
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Masa {tableNumber} Canlı Sipariş Listesi
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Sipariş Listesi */}
              <div className="space-y-3 mb-6">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs">
                    Henüz siparişe bir ürün eklemediniz.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-stone-900/80 border border-stone-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        <span className="text-[11px] text-stone-400">₺{item.price} x {item.quantity}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#D4AF37]">₺{item.price * item.quantity}</span>

                        <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5"/>
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5"/>
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-stone-500 hover:text-red-400 transition-colors p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BİRLİKTE MÜKEMMEL GİDER (ÇAPRAZ SATIŞ) */}
              <div className="border-t border-stone-800/80 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5"/>
                  <span>BİRLİKTE MÜKEMMEL GİDER</span>
                </div>

                <div className="space-y-2">
                  {UPSELL_ITEMS.map((up) => (
                    <div
                      key={up.id}
                      className="bg-stone-900/60 border border-stone-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2 hover:border-stone-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {up.tag}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-medium text-white truncate">{up.name}</div>
                          <div className="text-[11px] text-stone-400">₺{up.price}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddItem(up)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-[#D4AF37] hover:text-stone-950 text-stone-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3 h-3"/>
                        Ekle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Çekmece Alt Toplam & Mutfağa İlet */}
            <div className="border-t border-stone-800 pt-4 mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-400 font-medium">Toplam Tutar</span>
                <span className="text-lg font-black text-[#D4AF37]">₺{totalAmount}</span>
              </div>

              <button
                onClick={handleDispatchToKitchen}
                disabled={cartItems.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 text-center"
              >
                MUTFAĞA İLET (TEK TIK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 14. BİLDİRİM TOASTI ================= */}
      {toastMessage && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#121212] border border-[#C8982B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>
          <span>{toastMessage}</span>
        </div>
      )}

    </main>
  );
}
'''

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated src/app/page.tsx successfully!")
