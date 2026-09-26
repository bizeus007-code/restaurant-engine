'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export interface DishItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  calories?: number;
  gramaj?: string;
  allergens?: string[];
  tag?: string;
  prepTime?: string;
  categoryId?: number;
  categorySlug?: string;
}

export const SIGNATURE_DISHES: DishItem[] = [
  {
    id: 'sig-kuzu-gerdan',
    name: 'Kuzu Gerdan',
    price: 2300,
    tag: 'Taş Fırın Ağır Ateş',
    calories: 1750,
    gramaj: '1200 gr',
    allergens: [],
    description: 'Taş fırında ağır ateşte saatlerce pişen, kemiğinden ayrılan lokum kıvamında kuzu gerdan.',
    image: '/images/menu/firin-etler/kuzu-gerdan.jpg',
    prepTime: '25-30 dk',
    categoryId: 19,
    categorySlug: 'firin-etler',
  },
  {
    id: 'sig-kuzu-kol',
    name: 'Kuzu Kol',
    price: 2300,
    tag: 'Odun Ateşinde 6 Saat',
    calories: 1850,
    gramaj: '1100 gr',
    allergens: [],
    description: 'Odun fırınında 6 saat kendi buharında demlenen, nar gibi kızarmış kuzu kol.',
    image: '/images/menu/firin-etler/kuzu-kol.jpg',
    prepTime: '25-30 dk',
    categoryId: 19,
    categorySlug: 'firin-etler',
  },
  {
    id: 'sig-t-bone',
    name: 'T-Bone Steak (Dry Aged)',
    price: 1740,
    tag: 'Dry Aged 28 Gün',
    calories: 850,
    gramaj: '400 - 450 gr',
    allergens: [],
    description: 'Bir tarafı yumuşak bonfile, diğer tarafı lezzetli kontrfileden oluşan T kemikli 28 gün dinlendirilmiş efsane kesim.',
    image: '/images/menu/steak/t-bone.jpg',
    prepTime: '20-25 dk',
    categoryId: 27,
    categorySlug: 'steak',
  },
  {
    id: 'sig-dana-antrikot',
    name: 'Dana Antrikot',
    price: 1590,
    tag: 'Kömür Izgara Mermer Dokusu',
    calories: 700,
    gramaj: '280 - 300 gr',
    allergens: [],
    description: 'Mermersi yağ dokusu mükemmel dana antrikot kesimi, odun kömüründe sulu sulu mühürlenir.',
    image: '/images/menu/steak/antrikot.jpg',
    prepTime: '18-20 dk',
    categoryId: 27,
    categorySlug: 'steak',
  },
  {
    id: 'sig-loqum-bonfile',
    name: 'Loqum Bonfile',
    price: 1740,
    tag: 'Özel Mühürleme',
    calories: 580,
    gramaj: '280 - 300 gr',
    allergens: [],
    description: 'Dana bonfilenin en yumuşak orta göbeğinden kesilen, ağızda eriyen mühürlenmiş bonfile lokum dilimleri.',
    image: '/images/menu/steak/loqum.jpg',
    prepTime: '15-18 dk',
    categoryId: 27,
    categorySlug: 'steak',
  },
  {
    id: 'sig-kuzu-kafes',
    name: 'Kuzu Kafes Pirzola',
    price: 3400,
    tag: 'Özel Kuzu Kafes',
    calories: 1600,
    gramaj: '1100 - 1400 gr (2 Kişilik)',
    allergens: [],
    description: 'Bütün kuzu kaburga ve pirzolalarının fırında ve ızgarada nar gibi kızartılmasıyla masaya gelen görkemli sunum.',
    image: '/images/menu/steak/kuzu-kafes.jpg',
    prepTime: '25-30 dk',
    categoryId: 27,
    categorySlug: 'steak',
  },
  {
    id: 'sig-adana-kebap',
    name: 'ADANA (Özel Zırh Kıyma)',
    price: 550,
    tag: 'Özel Zırh Kıyma',
    calories: 560,
    gramaj: '200 gr',
    allergens: [],
    description: 'Zırhta çekilmiş kuzu kaburga eti, kuyruk yağı, taze kapya biberi ve kaya tuzu. Közlenmiş biber, sumaklı soğan ve lavaş ile.',
    image: '/images/menu/kebaplar/adana.jpg',
    prepTime: '15-18 dk',
    categoryId: 21,
    categorySlug: 'kebaplar',
  },
  {
    id: 'sig-cumbo-fajita',
    name: 'Cumbo Et Fajita',
    price: 990,
    tag: 'Cızırdayan Döküm Tava',
    calories: 620,
    gramaj: '300 gr',
    allergens: [],
    description: 'Kızgın döküm tavada renkli biberler, karamelize soğan ve baharat harmanı ile.',
    image: '/images/menu/fajitalar/cumbo-fajita.jpg',
    prepTime: '15-18 dk',
    categoryId: 18,
    categorySlug: 'fajitalar',
  },
  {
    id: 'sig-koy-kahvaltisi',
    name: 'Serpme Köy Kahvaltısı',
    price: 950,
    tag: 'Doğal Diyarbakır Şarküteri',
    calories: 1100,
    gramaj: '2 Kişilik',
    allergens: [],
    description: 'Yöresel örgü peyniri, petek bal, manda kaymağı, kavurmalı yumurta ve sıcak ekmek çeşitleri.',
    image: '/images/menu/kahvalti/serpme-kahvalti.jpg',
    prepTime: '15-20 dk',
    categoryId: 20,
    categorySlug: 'kahvalti',
  },
  {
    id: 'sig-katmer',
    name: 'KATMER',
    price: 460,
    tag: 'Fırından Sıcak',
    calories: 560,
    gramaj: '180 gr',
    allergens: ['Gluten', 'Antep Fıstığı', 'Laktoz / Süt'],
    description: 'Taş fırında çıtırdayan el açması incecik yufka, halis süt kaymağı ve bol zümrüt yeşili Antep fıstığı ile.',
    image: '/images/menu/tatlilar/katmer.jpg',
    prepTime: '10-15 dk',
    categoryId: 29,
    categorySlug: 'tatlilar',
  },
];

interface CoverFlowCarouselProps {
  dishes?: DishItem[];
  sectionLabel?: string;
  onQuickOrder?: (item: any) => void;
}

export function CoverFlowCarousel({
  dishes = SIGNATURE_DISHES,
  sectionLabel = 'ŞEFİN İMZA LEZZETLERİ',
  onQuickOrder
}: CoverFlowCarouselProps) {
  const currentDishes = dishes && dishes.length > 0 ? dishes : SIGNATURE_DISHES;
  const [activeIndex, setActiveIndex] = useState(2);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isHorizontalSwipe = useRef(false);

  // AUTOPLAY & DOKUNMATİK DURAKLATMA / DEVAM STATE'LERİ
  const [isInView, setIsInView] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnimatedOnScroll = useRef(false);

  const pauseAutoplay = () => {
    setIsUserInteracting(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const resumeAutoplayAfterDelay = (delay = 4000) => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, delay);
  };

  const handlePrev = () => {
    pauseAutoplay();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : currentDishes.length - 1));
    resumeAutoplayAfterDelay(4000);
  };

  const handleNext = () => {
    pauseAutoplay();
    setActiveIndex((prev) => (prev < currentDishes.length - 1 ? prev + 1 : 0));
    resumeAutoplayAfterDelay(4000);
  };

  // MOUSE DRAG
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoplay();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 30) {
      if (diff < 0) handleNext();
      else handlePrev();
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    resumeAutoplayAfterDelay(4000);
  };

  // TOUCH SWIPE WITH INERTIA & DAMPING
  const handleTouchStart = (e: React.TouchEvent) => {
    pauseAutoplay();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = false;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (!isHorizontalSwipe.current) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      }
    }

    if (isHorizontalSwipe.current) {
      const damped = diffX * 0.45;
      setDragOffset(Math.max(-65, Math.min(65, damped)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaTime = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = Math.abs(diffX) / deltaTime;

    setDragOffset(0);

    if (isHorizontalSwipe.current || Math.abs(diffX) > 25) {
      if ((velocity > 0.22 && Math.abs(diffX) > 15) || Math.abs(diffX) > 35) {
        if (diffX < 0) handleNext();
        else handlePrev();
      }
    }
    isHorizontalSwipe.current = false;
    resumeAutoplayAfterDelay(4000);
  };

  // FARE TEKERLEĞİ & YATAY AKIŞ
  const lastWheelTime = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 12 && now - lastWheelTime.current > 180) {
      lastWheelTime.current = now;
      pauseAutoplay();
      if (delta > 0) handleNext();
      else handlePrev();
      resumeAutoplayAfterDelay(4000);
    }
  };

  // 1. GÖRÜNÜRLÜK (INTERSECTION OBSERVER) & İLK GİRİŞTE YUMUŞAK KAYMA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        setIsInView(isVisible);

        // Sayfa aşağı kaydırılıp 3D menü alanına girildiği anda kullanıcı beklemeden ilk kayma hareketi yumuşakça başlasın
        if (isVisible && !hasAnimatedOnScroll.current) {
          hasAnimatedOnScroll.current = true;
          const initialTimer = setTimeout(() => {
            setActiveIndex((prev) => (prev < currentDishes.length - 1 ? prev + 1 : 0));
          }, 500);
          return () => clearTimeout(initialTimer);
        }
      },
      { threshold: 0.25 }
    );

    if (carouselContainerRef.current) {
      observer.observe(carouselContainerRef.current);
    }
    return () => observer.disconnect();
  }, [currentDishes.length]);

  // 2. OTOMATİK AKIŞ (AUTOPLAY): Ekranda göründüğünde her 3 saniyede bir sonraki lezzete kay
  useEffect(() => {
    if (!isInView || isUserInteracting) return;

    const autoplayTimer = setInterval(() => {
      setActiveIndex((prev) => (prev < currentDishes.length - 1 ? prev + 1 : 0));
    }, 3000);

    return () => clearInterval(autoplayTimer);
  }, [isInView, isUserInteracting, currentDishes.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3D COVERFLOW DÖNÜŞÜM HESAPLAMASI (Aktif merkez: scale 1, rotate 0; Yanlar: scale 0.85, rotate ±26deg, kademeli opaklık)
  const getCardStyle = (offset: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const baseSpacing = isMobile ? 128 : 210;

    if (offset === 0) {
      return {
        transform: `translateX(${dragOffset}px) scale(1) rotateY(${dragOffset * -0.1}deg) translateZ(40px)`,
        zIndex: 40,
        opacity: 1,
        filter: 'brightness(1)',
      };
    }

    const isLeft = offset < 0;
    const abs = Math.abs(offset);
    const rotateY = isLeft ? 26 : -26;
    const scale = isMobile ? 0.82 : 0.86;
    
    // Kademeli opaklık: En yakın yan kartlar 0.60, sonrakiler 0.35 ve 0.12
    const opacity = abs === 1 ? 0.60 : abs === 2 ? 0.35 : 0.12;
    const zIndex = Math.max(1, 30 - abs * 8);

    // Dinamik basamaklı mesafe
    const extra = (abs - 1) * (baseSpacing * 0.72);
    const x = (isLeft ? -1 : 1) * (baseSpacing + extra) + dragOffset * 0.65;

    return {
      transform: `translateX(${x}px) scale(${scale}) rotateY(${rotateY}deg) translateZ(-${abs * 35}px)`,
      zIndex,
      opacity,
      filter: `brightness(${Math.max(0.65, 1 - abs * 0.15)})`,
    };
  };

  return (
    <div 
      data-lenis-prevent="true"
      onWheel={handleWheel}
      className="relative pt-4 pb-8 overflow-visible select-none bg-gradient-to-b from-black/20 via-black/10 to-black/30 rounded-3xl touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-[#C8982B]/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center mb-6 relative z-10 px-4">
        <div className="inline-block backdrop-blur-[2px] bg-black/30 border border-white/5 rounded-2xl py-3 px-6 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8982B]/15 border border-[#C8982B]/40 text-[#FBE291] text-[10px] font-bold tracking-widest uppercase mb-1.5 shadow-lg">
            <span>{sectionLabel}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)]">
            Diyarbakır'ın Zirve Lezzetleri
          </h2>
          <p className="text-xs text-stone-300 mt-1 font-light [text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
            Sürükleyerek inceleyin • Alerjen ve kalori etiketli seçkin lezzetler
          </p>
        </div>
      </div>

      <div 
        ref={carouselContainerRef}
        data-lenis-prevent="true"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative max-w-5xl mx-auto h-[390px] sm:h-[420px] flex items-center justify-center px-4 [perspective:1200px] touch-pan-y transform-gpu will-change-transform ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-2 sm:left-6 z-40 p-2.5 sm:p-3 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-[#C8982B] text-white transition-all shadow-2xl active:scale-95 cursor-pointer"
          aria-label="Önceki"
        >
          <ChevronLeft className="w-5 h-5"/>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-2 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-[#C8982B] text-white transition-all shadow-2xl active:scale-95 cursor-pointer"
          aria-label="Sonraki"
        >
          <ChevronRight className="w-5 h-5"/>
        </button>

        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {currentDishes.map((dish, index) => {
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const isVisible = Math.abs(offset) <= 3;

            if (!isVisible) return null;

            const cardStyle = getCardStyle(offset);

            return (
              <div
                key={dish.id}
                onClick={() => {
                  if (isActive && onQuickOrder) {
                    onQuickOrder(dish);
                  } else {
                    pauseAutoplay();
                    setActiveIndex(index);
                    resumeAutoplayAfterDelay(4000);
                  }
                }}
                className={`absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none rounded-2xl overflow-hidden border cursor-pointer transform-gpu will-change-transform ${
                  isActive
                    ? 'bg-neutral-950/95 sm:backdrop-blur-md border-[#C8982B] shadow-[0_16px_50px_rgba(200,152,43,0.35)] w-[275px] sm:w-[320px]'
                    : 'bg-neutral-950/90 sm:backdrop-blur-sm border-white/10 hover:opacity-85 w-[240px] sm:w-[280px]'
                }`}
                style={cardStyle}
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-black/60">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/90 sm:backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-[#FBE291] border border-[#C8982B]/40">
                    {dish.tag || 'Spesiyal'}
                  </div>

                  {/* Kalori & Gramaj Rozeti (Üst Sağ) */}
                  {(dish.calories || dish.gramaj) && (
                    <div className="absolute top-2 right-2 bg-black/90 sm:backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-medium text-stone-300 flex items-center gap-1.5 border border-white/10 shadow-md">
                      {dish.gramaj && (
                        <span className="text-[#FBE291] font-mono font-bold">{dish.gramaj}</span>
                      )}
                      {dish.gramaj && dish.calories && <span className="text-white/30">•</span>}
                      {dish.calories && (
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-amber-500"/>
                          {dish.calories} kcal
                        </span>
                      )}
                    </div>
                  )}

                  {/* Alerjen Bildirimi (Lüks Cam Hap Rozet - Alt Sol) */}
                  {dish.allergens && dish.allergens.length > 0 ? (
                    <div className="absolute bottom-2 left-2 max-w-[92%] bg-black/85 sm:backdrop-blur-md border border-amber-500/40 text-amber-200 text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg truncate">
                      <span className="shrink-0 text-amber-400 text-xs">⚠️</span>
                      <span className="truncate">Alerjen: {dish.allergens.join(', ')}</span>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 left-2 max-w-[92%] bg-black/85 sm:backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg truncate">
                      <span className="shrink-0 text-emerald-400 text-xs">✓</span>
                      <span className="truncate">Alerjen: Yok</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white font-serif leading-snug truncate">
                        {dish.name}
                      </h3>
                      <span className="text-xs font-bold text-[#FBE291] whitespace-nowrap font-mono">
                        ₺{dish.price}
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                      {dish.description || 'Şefin özel dinlendirilmiş sunumu.'}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px]">
                    <span className="text-stone-400">
                      Gramaj: <strong className="text-stone-200">{dish.gramaj || '250 gr'}</strong>
                    </span>
                    <span className="text-[#C8982B] font-semibold uppercase tracking-wider">
                      LOQUM ET
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {currentDishes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              pauseAutoplay();
              setActiveIndex(i);
              resumeAutoplayAfterDelay(4000);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i ? 'w-6 bg-[#C8982B]' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Lezzet ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
