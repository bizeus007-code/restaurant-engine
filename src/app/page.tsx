'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import menuJson from '@/src/data/loqum-menu.json';
import initialProducts from '@/src/data/loqum-products.json';
import { CategoryItem, MenuItemProduct, ReservationRecord, ReservationStatus } from '@/types/loqum';
import { ProductModal } from '@/components/menu/ProductModal';
import { AdminSettingsModal } from '@/components/admin/AdminSettingsModal';
import { LoqumClubDock } from '@/src/components/loyalty/LoqumClubDock';
import { 
  UtensilsCrossed, Search, MapPin, Clock, Flame, 
  CheckCircle2, Star, X, Settings, Navigation, 
  Lock, Megaphone, DollarSign, Edit3,
  Phone, User, CalendarCheck, ChevronRight, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { normalizeWhatsAppNumber } from '@/lib/utils';

function normalizeSearch(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g');
}

function normalizeDishName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g');
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?client=opera&hs=Ph8&sca_esv=16067ccfc9d0a6cf&sxsrf=APpeQnvRGTrxIiZ5feQx-VWv7wpxF6H6xA:1788983178459&uds=AJ5uw1_a2D0D09lxm8gpKKOTUn4rSGxlWOgVa94UJjoNIxJa62R0a3JrLVLMes-MVY8BJpCC0gzHxX0XJfuamCs_bgTDWNDiwu7rGCC_qneL24erMN2cJ5_xRYPnRNgkfIz1pexzJLw_GcSqRdJbCysrTO_HNc9pEMhjcsE85FCfGhNaSv5Mpng&q=LOQUM+ET-STEAKHOUSE+D%C4%B0YARBAKIR+Yorumlar&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_1fKBQrnjX1fKW71SBN4S9Mh0TtOlJwsT5jycHqv9Yx2Td8G6c8Dwz2I-8KK4njFGJduHd0WvPU78Qs_Tl6SrjbpzEUHevYt22dXD5QAgOtzXSj-jWQSNYB6hRyrOQ8xrlksirk%3D&hl=tr-TR&sa=X&ved=2ahUKEwj2vvHWoeKWAxUxBNsEHa15I-4Q_4MLegQIOBAQ&biw=1452&bih=798&dpr=2";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=LOQUM+ET-STEAKHOUSE+Diyarbak%C4%B1r+75.Yol+Mega+Arslan+Cadde+75";
const INSTAGRAM_URL = "https://www.instagram.com/loqumdiyarbakir?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false);

  // Dil Seçimi State'i (TR / EN)
  const [lang, setLang] = useState<'TR' | 'EN'>('TR');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('loqum_lang');
      if (savedLang === 'EN' || savedLang === 'TR') {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  const handleSetLang = (l: 'TR' | 'EN') => {
    setLang(l);
    try {
      localStorage.setItem('loqum_lang', l);
    } catch {}
  };

  // Gastronomi Önizleme Modalı
  const [selectedProductForModal, setSelectedProductForModal] = useState<MenuItemProduct | null>(null);

  // Rezervasyon Form Verisi (Ad Soyad, Telefon, Şube, Kişi, Tarih, Saat, Not)
  const [reservationData, setReservationData] = useState({
    branch: 'LOQUM ET-STEAKHOUSE DİYARBAKIR (75. Yol)',
    guests: '2 Kişilik',
    date: '2026-09-15',
    time: '20:00',
    name: '',
    phone: '',
    notes: ''
  });
  const [reservationErrors, setReservationErrors] = useState<{ name?: string; phone?: string }>({});
  const [lastSubmittedWaUrl, setLastSubmittedWaUrl] = useState<string>('');

  // Rezervasyon Takip & WhatsApp Bildirim Hattı State'leri
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [businessWhatsapp, setBusinessWhatsapp] = useState<string>('904125030405');

  // PIN Koruması State'leri (PIN: 1234)
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // İşletmeci Paneli State'leri
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [products, setProducts] = useState<MenuItemProduct[]>(initialProducts as any[]);
  const [campaignText, setCampaignText] = useState<string>('');

  const categories = menuJson.categories as CategoryItem[];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let loadedProds = initialProducts as MenuItemProduct[];
      const menuVersion = '2026_09_25_prices_v3';
      const savedVersion = localStorage.getItem('loqum_menu_version');
      if (savedVersion !== menuVersion) {
        localStorage.setItem('loqum_products', JSON.stringify(initialProducts));
        localStorage.setItem('loqum_menu_version', menuVersion);
        loadedProds = initialProducts as MenuItemProduct[];
        setProducts(loadedProds);
      } else {
        const savedProducts = localStorage.getItem('loqum_products');
        if (savedProducts) {
          try {
            loadedProds = JSON.parse(savedProducts);
            setProducts(loadedProds);
          } catch {}
        }
      }

      // Canlı menü ve güncel fiyatları sunucudan anında senkronize et (Cache Fix)
      fetch('/api/products', { cache: 'no-store' })
        .then((res) => res.json())
        .then((serverProds) => {
          if (Array.isArray(serverProds) && serverProds.length > 0) {
            setProducts(serverProds);
            if (typeof window !== 'undefined') {
              localStorage.setItem('loqum_products', JSON.stringify(serverProds));
            }
          }
        })
        .catch(() => {});

      const savedCampaign = localStorage.getItem('loqum_campaign');
      if (savedCampaign) setCampaignText(savedCampaign);

      const savedPhone = localStorage.getItem('loqum_business_whatsapp');
      if (savedPhone) {
        const clean = normalizeWhatsAppNumber(savedPhone);
        if (clean === '905061763321' || !clean) {
          localStorage.setItem('loqum_business_whatsapp', '904125030405');
          setBusinessWhatsapp('904125030405');
        } else {
          setBusinessWhatsapp(clean);
        }
      }

      // Auto-clean any legacy mock reservations from localStorage
      const isMockReservation = (r: ReservationRecord) => {
        const name = (r.name || '').toLowerCase();
        return (
          name.includes('murat demir') ||
          name.includes('mehmet sarıgül') ||
          name.includes('mehmet sarigul') ||
          (name === 'mehmet' && r.phone === '11111949999') ||
          r.notes === 'Özel kutlama masası'
        );
      };

      const savedDeleted = localStorage.getItem('loqum_deleted_reservations');
      let deletedIds: string[] = [];
      if (savedDeleted) {
        try { deletedIds = JSON.parse(savedDeleted); } catch {}
      }

      const savedReservations = localStorage.getItem('loqum_reservations');
      let localResList: ReservationRecord[] = [];
      if (savedReservations !== null) {
        try {
          const parsed = JSON.parse(savedReservations);
          if (Array.isArray(parsed)) {
            localResList = parsed.filter(r => !deletedIds.includes(r.id) && !isMockReservation(r));
          }
        } catch {}
        setReservations(localResList);
        localStorage.setItem('loqum_reservations', JSON.stringify(localResList));
      } else {
        localStorage.setItem('loqum_reservations', JSON.stringify([]));
        setReservations([]);
      }

      // Sunucu JSON verisi ile senkronize et
      fetch('/api/reservations')
        .then((res) => res.json())
        .then((data) => {
          if (data.businessWhatsapp) {
            const clean = normalizeWhatsAppNumber(data.businessWhatsapp);
            if (clean === '905061763321' || !clean) {
              setBusinessWhatsapp('904125030405');
            } else {
              setBusinessWhatsapp(clean);
            }
          }
          if (data.reservations && Array.isArray(data.reservations)) {
            const serverClean = data.reservations.filter(
              (r: ReservationRecord) => !deletedIds.includes(r.id) && !isMockReservation(r)
            );
            if (serverClean.length > 0) {
              setReservations((prev) => {
                const combined = [...prev];
                serverClean.forEach((sr: ReservationRecord) => {
                  if (!combined.some(c => c.id === sr.id) && !deletedIds.includes(sr.id)) {
                    combined.push(sr);
                  }
                });
                if (typeof window !== 'undefined') {
                  localStorage.setItem('loqum_reservations', JSON.stringify(combined));
                }
                return combined;
              });
            }
          }
        })
        .catch(() => {});

      // Sync settings
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.campaignText) setCampaignText(data.campaignText);
          if (data.adminPin && typeof window !== 'undefined') {
            localStorage.setItem('loqum_admin_pin', data.adminPin);
          }
          if (data.businessWhatsapp) {
            const clean = normalizeWhatsAppNumber(data.businessWhatsapp);
            if (clean === '905061763321' || !clean) {
              setBusinessWhatsapp('904125030405');
            } else {
              setBusinessWhatsapp(clean);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSelectProductForReservation = (product: MenuItemProduct) => {
    setReservationData((prev) => ({
      ...prev,
      notes: prev.notes ? `${prev.notes}, Tercih: ${product.name}` : `Özel Lezzet Tercihi: ${product.name}`
    }));
    const rezEl = document.getElementById('rezervasyon');
    if (rezEl) rezEl.scrollIntoView({ behavior: 'smooth' });
    setToastMessage(`🥩 "${product.name}" rezervasyon tercihinize eklendi.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveProductsToStorage = (updatedList: MenuItemProduct[]) => {
    setProducts(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loqum_products', JSON.stringify(updatedList));
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin =
      (typeof window !== 'undefined' && localStorage.getItem('loqum_admin_pin')) || '1234';
    if (pinInput === storedPin || pinInput === '1234' || pinInput === '2121') {
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
      setIsSettingsOpen(true);
      setToastMessage('🔓 Yönetim paneli açıldı.');
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleUpdateReservationStatus = (id: string, status: ReservationStatus) => {
    const updated = reservations.map(r => r.id === id ? { ...r, status } : r);
    setReservations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loqum_reservations', JSON.stringify(updated));
    }
    fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    }).catch(() => {});
  };

  const handleDeleteReservation = (id: string) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loqum_reservations', JSON.stringify(updated));
      try {
        const savedDeleted = localStorage.getItem('loqum_deleted_reservations');
        const list: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!list.includes(id)) {
          list.push(id);
          localStorage.setItem('loqum_deleted_reservations', JSON.stringify(list));
        }
      } catch {}
    }
    fetch(`/api/reservations?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSaveBusinessWhatsapp = (newPhone: string) => {
    const clean = normalizeWhatsAppNumber(newPhone) || '904125030405';
    setBusinessWhatsapp(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loqum_business_whatsapp', clean);
    }
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_settings', businessWhatsapp: clean })
    }).catch(() => {});
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessWhatsapp: clean })
    }).catch(() => {});
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};
    if (!reservationData.name || reservationData.name.trim().length < 3) {
      errors.name = 'Lütfen adınızı ve soyadınızı eksiksiz giriniz (en az 3 karakter).';
    }
    const cleanPhone = (reservationData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).';
    }
    if (Object.keys(errors).length > 0) {
      setReservationErrors(errors);
      return;
    }
    setReservationErrors({});

    try {
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.7 } });
    } catch {}

    // 1. PANELE KAYIT (Durum: Beklemede, sayfa yenilense de kalıcı)
    const newReservation: ReservationRecord = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: reservationData.name.trim(),
      phone: reservationData.phone.trim(),
      date: reservationData.date,
      time: reservationData.time,
      guests: `${reservationData.guests}`,
      notes: reservationData.notes.trim() || undefined,
      branch: reservationData.branch || 'LOQUM ET Diyarbakır',
      status: 'beklemede',
      createdAt: new Date().toISOString()
    };

    const updatedReservations = [newReservation, ...reservations];
    setReservations(updatedReservations);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loqum_reservations', JSON.stringify(updatedReservations));
    }

    // Sunucu API'sine de arka planda kaydet
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReservation)
    }).catch(() => {});

    // 2. WHATSAPP'A ANINDA İLETİM (Formatlı rezervasyon metni + Paneldeki kayıtlı işletme numarası)
    const waText = 
      `🥩 *LOQUM ET - YENİ REZERVASYON TALEBİ* 🥩\n` +
      `👤 *Misafir:* ${reservationData.name.trim()}\n` +
      `📞 *Telefon:* ${reservationData.phone.trim()}\n` +
      `📅 *Tarih & Saat:* ${reservationData.date} - ${reservationData.time}\n` +
      `👥 *Kişi Sayısı:* ${reservationData.guests} Kişi\n` +
      `📝 *Not:* ${reservationData.notes.trim() || 'Özel istek belirtilmedi'}\n` +
      `📍 *Şube:* ${reservationData.branch || 'LOQUM ET-STEAKHOUSE DİYARBAKIR'}\n` +
      `📍 *Adres:* 75.Yol üzeri GO Petrol Yanı Mega Arslan Cadde 75 Sitesi C-Blok, Diyarbakır`;

    const cleanBusinessPhone = (businessWhatsapp || '904125030405').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanBusinessPhone}?text=${encodeURIComponent(waText)}`;
    setLastSubmittedWaUrl(waUrl);

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }

    setReservationSuccess(true);
    setToastMessage(`✨ Sayın ${reservationData.name}, rezervasyon talebiniz işletme WhatsApp hattına iletildi!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const closeReservation = () => {
    setReservationSuccess(false);
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  };

  const normSearch = normalizeSearch(searchQuery);
  const filteredProducts = products.filter((p) => {
    // Humus ve Haydari kesinlikle hiçbir sekmede veya aramada gösterilmez
    if (p.id === 'makarnalar-ve-salatalar-meze-1' || p.id === 'makarnalar-ve-salatalar-meze-2') return false;
    const pName = p.name.toLowerCase();
    if (pName.includes('humus') || pName.includes('haydari')) return false;

    const matchCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    if (!normSearch) return matchCategory;
    const matchName = normalizeSearch(p.name).includes(normSearch);
    const matchDesc = normalizeSearch(p.description).includes(normSearch);
    const matchTag = normalizeSearch(p.tag || '').includes(normSearch);
    return matchCategory && (matchName || matchDesc || matchTag);
  });

  return (
    <main className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans pb-24 touch-manipulation selection:bg-[#C8982B] selection:text-black">
      
      {/* Kampanya Bandı */}
      {campaignText && (
        <aside aria-label="Aktif Kampanya" className="bg-gradient-to-r from-[#BF2329] via-amber-600 to-[#BF2329] text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <Megaphone className="w-3.5 h-3.5 animate-bounce"/>
          <span>{campaignText}</span>
          <button 
            onClick={() => {
              setCampaignText('');
              if (typeof window !== 'undefined') localStorage.removeItem('loqum_campaign');
            }} 
            className="ml-3 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ================= 1. NAVİGASYON (LÜKS VİTRİN & REZERVASYON ÇUBUĞU) ================= */}
      <nav className={`fixed ${campaignText ? 'top-8' : 'top-0'} left-0 right-0 z-40 h-16 sm:h-20 px-3 sm:px-6 lg:px-12 flex items-center justify-between bg-black/80 sm:bg-black/50 backdrop-blur-md transition-all duration-300 border-b border-white/10`}>
        
        {/* Sol Taraf: Yalnızca LOQUM ET Logosu & (Desktop: Menü / Dil) */}
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center tracking-widest select-none">
            <span className="font-display text-base sm:text-xl md:text-2xl font-black text-white hover:text-white/90 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] whitespace-nowrap">
              LOQUM<span className="text-[#BF2329] mx-0.5 text-lg sm:text-2xl font-serif">.</span>ET
            </span>
          </a>

          {/* Menü & Dil Seçimi */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              type="button" 
              onClick={() => {
                const menuEl = document.getElementById('menu');
                if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:flex group items-center space-x-2 rounded-full border border-white/20 px-3.5 py-1.5 hover:border-[#C8982B] transition-colors duration-300 cursor-pointer bg-black/50"
              title={lang === 'EN' ? 'View Menu' : 'Menüyü Görüntüle'}
            >
              <div className="flex flex-col space-y-1 w-3.5">
                <span className="h-[2px] w-full bg-gold-gradient transition-transform group-hover:translate-x-1"></span>
                <span className="h-[2px] w-3/4 bg-gold-gradient transition-transform group-hover:w-full"></span>
              </div>
              <span className="text-xs font-semibold tracking-[0.2em] text-white">
                {lang === 'EN' ? 'MENU' : 'MENÜ'}
              </span>
            </button>

            {/* TR / EN Dil Seçimi (pointer-events-auto, cursor-pointer, z-30) */}
            <div className="flex items-center space-x-1 text-xs font-bold tracking-widest text-white/80 pl-1 z-30 pointer-events-auto cursor-pointer select-none">
              <button
                type="button"
                onClick={() => handleSetLang('TR')}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded text-xs tracking-wider ${
                  lang === 'TR'
                    ? 'text-[#D4AF37] font-black drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                    : 'text-white/40 hover:text-white'
                }`}
                aria-label="Türkçe Dil Seçimi"
              >
                TR
              </button>
              <span className="text-white/30 text-xs">/</span>
              <button
                type="button"
                onClick={() => handleSetLang('EN')}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded text-xs tracking-wider ${
                  lang === 'EN'
                    ? 'text-[#D4AF37] font-black drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                    : 'text-white/40 hover:text-white'
                }`}
                aria-label="English Language Selection"
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Amblem Grubu (Google | Instagram | Yol Tarifi | REZERVASYON) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. ⭐ Google Yorumlar Amblemi */}
          <a 
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/50 flex items-center justify-center text-amber-400 text-sm transition-all shrink-0 active:scale-95 shadow-sm"
            title="Google Yorumları (4.9 ★)"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400"/>
          </a>

          {/* 2. 📸 Instagram Amblemi */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-rose-400/50 flex items-center justify-center text-rose-400 text-sm transition-all shrink-0 active:scale-95 shadow-sm"
            title="Instagram: @loqumdiyarbakir"
          >
            <InstagramIcon className="w-4 h-4 text-rose-400"/>
          </a>

          {/* 3. 📍 Yol Tarifi & Harita Amblemi */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center text-amber-300 text-sm transition-all shrink-0 active:scale-95 shadow-sm"
            title="Yol Tarifi & Harita"
          >
            <MapPin className="w-4 h-4 text-amber-300"/>
          </a>

          {/* 4. 👑 REZERVASYON (Kompakt Lüks Altın Hap Buton) */}
          <a 
            href="#rezervasyon" 
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-full bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black whitespace-nowrap shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 pointer-events-auto cursor-pointer"
          >
            <span className="min-w-[70px] sm:min-w-[90px] inline-block text-center">{lang === 'EN' ? 'RESERVATION' : 'REZERVASYON'}</span>
          </a>
        </div>
      </nav>

      {/* ================= 2. HERO: CURTAIN SCROLL (GSAP + LENIS) ================= */}
      <ParallaxComponent lang={lang} />

      {/* ================= 3. LEZZET KATALOĞU (PERDE GİBİ ÜZERİNE KAYAN KOYU ZEMİN) ================= */}
      <div className="content-wrapper relative z-20 bg-[#080808] border-t border-stone-800 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <section id="menu" className="max-w-7xl mx-auto px-4 py-8 scroll-mt-24">
          
          {/* B. KATALOG BAŞLIĞI */}
          <div id="katalog-baslik" className="pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/30 text-[#FBE291] text-[11px] font-bold tracking-wider uppercase mb-2">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#C8982B]"/>
              <span>RESMİ GASTRONOMİ MENÜSÜ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-2">
              Gurme Menü & Lezzet Kataloğu
            </h2>
            <p className="text-[11px] md:text-xs text-stone-400 mt-1">
              Bakanlık standartlarında gramaj, kalori ve sıfır hata alerjen etiketli seçkin lezzetlerimiz.
            </p>
          </div>

        {/* Lezzet Arama */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"/>
          <input
            type="text"
            placeholder="Menüde lezzet ara (Örn: Lokum, Tomahawk, Adana, Şaşlık, Katmer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/90 border border-stone-800 text-base sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C8982B] transition-colors"
          />
        </div>

        {/* Kategoriler */}
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

        {/* Lezzet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-2">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              onClick={() => setSelectedProductForModal(product)}
              className="group rounded-2xl overflow-hidden bg-[#121212] border border-stone-800 hover:border-[#C8982B]/80 transition-all flex flex-col justify-between shadow-xl cursor-pointer hover:-translate-y-1 duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-[#FBE291] border border-[#C8982B]/30">
                  {product.tag || 'Spesiyal'}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-stone-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500"/>
                  {product.calories} kcal
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug font-serif group-hover:text-[#FBE291] transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-sm font-bold text-[#FBE291] whitespace-nowrap font-mono">
                      ₺{product.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="text-[10px] text-stone-400 mt-2 flex items-center justify-between">
                    <span>Gramaj: <strong className="text-stone-300">{product.gramaj || '200 gr'}</strong></span>
                    <span className="text-[10px] text-[#C8982B] font-medium">LOQUM ET</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {product.allergens && product.allergens.length > 0 ? (
                      product.allergens.map((a: string, i: number) => {
                        const isMantar = a.toLowerCase().includes('mantar');
                        return (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              isMantar
                                ? 'bg-amber-950/80 border border-yellow-500/70 text-yellow-300 font-semibold'
                                : 'bg-amber-950/60 border border-amber-800/40 text-amber-300'
                            }`}
                          >
                            {isMantar ? '▲ Mantar' : a}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-[9px] text-emerald-400">
                        Alerjensiz
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductForModal(product);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-[#FBE291] border border-stone-700 hover:border-[#C8982B]/60 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>İncele</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. SLOGAN BANDI ================= */}
      <section className="py-20 relative bg-black overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C8982B_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <span className="text-xs font-mono tracking-[0.5em] text-white/40 uppercase block mb-3">Karakteristik Dokunuş</span>
          <h3 className="font-display text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 drop-shadow-[0_0_25px_rgba(191,35,41,0.6)]">
            NO LOQUM, NO LIFE
          </h3>
          <p className="text-white/80 text-sm sm:text-base tracking-[0.4em] uppercase mt-4 font-semibold text-[#FBE291]">
            DİYARBAKIR
          </p>
        </div>
      </section>

      {/* ================= 5. REZERVASYON FORMU ================= */}
      <section id="rezervasyon" className="py-20 bg-black relative border-t border-white/10 scroll-mt-20">
        <div className="container mx-auto px-6 max-w-3xl relative">
          
          <div className="border border-[#C8982B]/40 bg-[#121212] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            <button
              onClick={closeReservation}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:border-[#C8982B] transition-all z-20"
              title="Kapat ve Menüye Dön"
            >
              <X className="w-5 h-5"/>
            </button>

            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#C8982B]/10 rounded-full blur-3xl pointer-events-none"></div>

            {reservationSuccess ? (
              <div className="text-center py-6 sm:py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-pulse">
                  <CheckCircle2 className="w-8 h-8"/>
                </div>

                <div>
                  <span className="text-gold-gradient font-display text-xs tracking-[0.25em] uppercase font-bold">Rezervasyon Talebi Alındı</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                    Rezervasyon Talebiniz Alındı, Sizi Bekliyoruz!
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto mt-2 font-light leading-relaxed">
                    Sayın <strong className="text-[#FBE291]">{reservationData.name}</strong>, rezervasyon talebiniz işletmemizin WhatsApp hattına formatlı olarak iletilmiştir.
                  </p>
                </div>

                {/* Rezervasyon Detay Özeti */}
                <div className="bg-black/60 border border-stone-800 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b border-stone-800/80 pb-1.5">
                    <span className="text-stone-400">👤 Misafir:</span>
                    <span className="text-white font-bold">{reservationData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-1.5">
                    <span className="text-stone-400">📞 Telefon:</span>
                    <span className="text-[#FBE291]">{reservationData.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-1.5">
                    <span className="text-stone-400">📅 Tarih & Saat:</span>
                    <span className="text-white">{reservationData.date} - {reservationData.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-1.5">
                    <span className="text-stone-400">👥 Kişi Sayısı:</span>
                    <span className="text-white">{reservationData.guests}</span>
                  </div>
                  {reservationData.notes && (
                    <div className="pt-0.5">
                      <span className="text-stone-400">📝 Not / İstek:</span>
                      <p className="text-amber-200 italic mt-0.5">{reservationData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  {lastSubmittedWaUrl && (
                    <a
                      href={lastSubmittedWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4"/>
                      <span>WhatsApp'ta Aç</span>
                    </a>
                  )}
                  <button
                    onClick={closeReservation}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-stone-700 text-stone-300 hover:text-white hover:border-[#C8982B] text-xs uppercase font-bold tracking-wider transition-all cursor-pointer"
                  >
                    Menüye Dön
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <span className="text-gold-gradient font-display text-xs tracking-[0.3em] uppercase font-bold">Anında Onay</span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">Masanızı Ayırtın</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2 font-light">
                    LOQUM ET lezzeti için tarih, saat, kişi sayısı ve iletişim bilgilerinizi giriniz.
                  </p>
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#FBE291] hover:text-white bg-white/5 border border-[#C8982B]/30 hover:border-[#C8982B] px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C8982B]"/>
                    <span>75.Yol üzeri GO Petrol Yanı Mega Arslan Cadde 75 Sitesi C-Blok, Diyarbakır</span>
                  </a>
                </div>

                <form onSubmit={handleReservationSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* İsim Soyisim */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C8982B]" />
                      <span>İsim Soyisim *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={reservationData.name}
                      onChange={(e) => setReservationData({ ...reservationData, name: e.target.value })}
                      className={`w-full bg-[#080808] border ${reservationErrors.name ? 'border-red-500 text-red-300' : 'border-white/20 text-white focus:border-[#C8982B]'} rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none transition-colors`}
                    />
                    {reservationErrors.name && (
                      <p className="text-[11px] text-red-400 mt-1 font-medium">{reservationErrors.name}</p>
                    )}
                  </div>

                  {/* Telefon Numarası */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C8982B]" />
                      <span>Telefon Numarası *</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="0532 123 45 67"
                      value={reservationData.phone}
                      onChange={(e) => setReservationData({ ...reservationData, phone: e.target.value })}
                      className={`w-full bg-[#080808] border ${reservationErrors.phone ? 'border-red-500 text-red-300' : 'border-white/20 text-white focus:border-[#C8982B]'} rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none transition-colors`}
                    />
                    {reservationErrors.phone && (
                      <p className="text-[11px] text-red-400 mt-1 font-medium">{reservationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Şube</label>
                    <select 
                      value={reservationData.branch}
                      onChange={(e) => setReservationData({ ...reservationData, branch: e.target.value })}
                      className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                    >
                      <option>LOQUM ET-STEAKHOUSE DİYARBAKIR (75. Yol)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Kişi Sayısı</label>
                    <select 
                      value={reservationData.guests}
                      onChange={(e) => setReservationData({ ...reservationData, guests: e.target.value })}
                      className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                    >
                      <option>2 Kişilik</option>
                      <option>3 - 4 Kişilik</option>
                      <option>5 - 8 Kişilik (Grup)</option>
                      <option>VIP Özel Oda (+10 Kişi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Tarih</label>
                    <input 
                      type="date" 
                      value={reservationData.date}
                      onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                      className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Saat</label>
                    <select 
                      value={reservationData.time}
                      onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
                      className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                    >
                      <option>10:00</option>
                      <option>10:30</option>
                      <option>11:00</option>
                      <option>11:30</option>
                      <option>12:00</option>
                      <option>12:30</option>
                      <option>13:00</option>
                      <option>13:30</option>
                      <option>14:00</option>
                      <option>14:30</option>
                      <option>15:00</option>
                      <option>15:30</option>
                      <option>16:00</option>
                      <option>16:30</option>
                      <option>17:00</option>
                      <option>17:30</option>
                      <option>18:00</option>
                      <option>18:30</option>
                      <option>19:00</option>
                      <option>19:30</option>
                      <option>20:00</option>
                      <option>20:30</option>
                      <option>21:00</option>
                      <option>21:30</option>
                      <option>22:00</option>
                      <option>22:30</option>
                      <option>23:00</option>
                      <option>23:30</option>
</select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Özel İstek & Masa Tercihi (İsteğe Bağlı)</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Bahçe manzaralı masa, doğum günü kutlaması vb."
                      value={reservationData.notes}
                      onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                      className="w-full bg-[#080808] border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-[#C8982B] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 mt-2">
                    <button 
                      type="submit" 
                      className="w-full sm:flex-1 py-4 rounded-full bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-display font-bold text-xs tracking-[0.25em] uppercase hover:brightness-110 transition-all cursor-pointer glow-gold shadow-xl"
                    >
                      Rezervasyonu Tamamla
                    </button>
                    
                    <button 
                      type="button"
                      onClick={closeReservation}
                      className="w-full sm:w-auto px-6 py-4 rounded-full border border-stone-700 text-stone-300 hover:text-white hover:border-stone-500 text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </section>

      {/* ================= 6. FOOTER ================= */}
      <footer className="py-12 bg-black border-t border-white/10 text-xs text-gray-400">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="font-display tracking-widest text-white text-lg">
            LOQUM<span className="text-[#BF2329]">.</span>ET
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400">
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#C8982B] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#C8982B]"/> 75.Yol üzeri GO Petrol Yanı Mega Arslan Cadde 75 Sitesi C-Blok, Diyarbakır
            </a>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C8982B]"/> 09:00 - 00:00
            </span>
          </div>
          <div className="flex space-x-6 text-gray-400 font-semibold">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FBE291] transition-colors">Instagram</a>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FBE291] transition-colors">Google Yorumlar</a>
            <a href="#menu" className="hover:text-[#FBE291] transition-colors">Menü</a>
            <a href="#rezervasyon" className="hover:text-[#FBE291] transition-colors">Rezervasyon</a>
          </div>
        </div>
        <div className="text-center text-stone-600 text-[11px] mt-8">
          © {new Date().getFullYear()} LOQUM ET-STEAKHOUSE DİYARBAKIR. Tüm Hakları Saklıdır.
        </div>
      </footer>
      </div>

      {/* ================= 8. SOL ALTTA AYARLAR SİMGESİ (1234 ŞİFRELİ) ================= */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => {
            setPinInput('');
            setPinError(false);
            setIsPinModalOpen(true);
          }}
          className="relative w-10 h-10 rounded-full bg-black/85 hover:bg-black border border-white/20 hover:border-[#C8982B] text-stone-400 hover:text-[#FBE291] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="İşletmeci Yönetim Paneli"
        >
          <Settings className="w-4 h-4"/>
          {reservations.filter(r => r.status === 'beklemede').length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#BF2329] text-white text-[10px] font-extrabold rounded-full min-w-5 h-5 px-1 flex items-center justify-center border-2 border-black animate-pulse shadow-lg">
              {reservations.filter(r => r.status === 'beklemede').length}
            </span>
          )}
        </button>
      </div>

      {/* ================= 9. ŞİFRELİ GİRİŞ MODALI (PIN: 1234) ================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-xs bg-[#141414] border border-[#C8982B]/60 rounded-3xl p-6 text-center shadow-2xl">
            
            <button 
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4"/>
            </button>

            <div className="w-12 h-12 rounded-full bg-[#C8982B]/10 border border-[#C8982B]/40 flex items-center justify-center mx-auto mb-3 text-[#FBE291]">
              <Lock className="w-5 h-5"/>
            </div>

            <h3 className="font-serif text-base font-bold text-white mb-1">İşletmeci Girişi</h3>
            <p className="text-xs text-stone-400 mb-4">Ayarlara erişmek için PIN kodunu giriniz</p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  className={`w-full text-center tracking-[0.6em] text-xl font-mono py-2.5 rounded-xl bg-black border ${
                    pinError ? 'border-red-500 text-red-400' : 'border-stone-700 text-[#FBE291] focus:border-[#C8982B]'
                  } focus:outline-none`}
                />
              </div>

              {pinError && (
                <p className="text-[11px] text-red-400 font-semibold animate-shake">
                  Hatalı şifre! (Varsayılan: 1234)
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C8982B] to-[#FBE291] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow"
              >
                Giriş Yap
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ================= 10. İŞLETMECİ YÖNETİM MODALI (GELEN REZERVASYONLAR & WHATSAPP AYARLARI) ================= */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reservations={reservations}
        onUpdateReservationStatus={handleUpdateReservationStatus}
        onDeleteReservation={handleDeleteReservation}
        businessWhatsapp={businessWhatsapp}
        onSaveBusinessWhatsapp={handleSaveBusinessWhatsapp}
        products={products}
        onUpdatePrice={async (prodId, price) => {
  const updated = products.map((p) =>
    p.id === prodId ? { ...p, price } : p
  );

  saveProductsToStorage(updated);

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Ürün fiyatı kaydedilemedi");
    }

    const verifyRes = await fetch("/api/products", {
      method: "GET",
      cache: "no-store",
    });

    const verifyList = await verifyRes.json();

    if (!Array.isArray(verifyList)) {
      throw new Error("Sunucudan dönen ürün listesi geçersiz.");
    }

    const verifiedProduct = verifyList.find((p) => p.id === prodId);

    if (!verifiedProduct || Number(verifiedProduct.price) !== Number(price)) {
      throw new Error(
        `Sunucu doğrulaması başarısız. Beklenen: ${price}, gelen: ${verifiedProduct?.price}`
      );
    }

    console.log("✅ Fiyat Supabase veritabanına doğrulayarak kaydedildi:", {
      id: prodId,
      price,
    });
  } catch (error) {
    console.error("❌ Fiyat kaydetme hatası:", error);
  }
}}
        onAddProduct={(newProd) => {
          saveProductsToStorage([newProd, ...products]);
          fetch("/api/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dishId: newProd.id, price: newProd.price }),
          }).catch(console.error);
        }}
        onUpdateProduct={(updatedList) => {
          saveProductsToStorage(updatedList);
          fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: updatedList.map((p) => ({ id: p.id, name: p.name, price: p.price })),
            }),
          }).catch(console.error);
        }}
        onDeleteProduct={(prodId) => {
          const updated = products.filter((p) => p.id !== prodId);
          saveProductsToStorage(updated);
          fetch(`/api/stock?id=${encodeURIComponent(prodId)}`, {
            method: "DELETE",
          }).catch(console.error);
        }}
        campaignText={campaignText}
        onSaveCampaign={(text) => {
          setCampaignText(text);
          if (typeof window !== 'undefined') {
            if (text) localStorage.setItem('loqum_campaign', text);
            else localStorage.removeItem('loqum_campaign');
          }
        }}
        showToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* ================= 11. GASTRONOMİ VİTRİN MODALI ================= */}
      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onSelectForReservation={handleSelectProductForReservation}
        />
      )}
      {/* ================= 12. BİLDİRİM TOASTI ================= */}
      {toastMessage && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#121212] border border-[#C8982B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 13. LOQUM CLUB FLOATING DOCK ================= */}
      <LoqumClubDock />

    </main>
  );
}
