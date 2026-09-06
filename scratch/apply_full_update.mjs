import fs from "fs";

const current = fs.readFileSync("app/page.tsx", "utf8");
const dishes = JSON.parse(fs.readFileSync("scratch/generated_dishes.json", "utf8"));

// 1. Replace MenuItem and DISHES
const startDishesIdx = current.indexOf("export interface MenuItem {");
const endDishesIdx = current.indexOf("const FACADE_CENTER = ");

if (startDishesIdx === -1 || endDishesIdx === -1) {
  console.error("Could not find MenuItem or FACADE_CENTER index!");
  process.exit(1);
}

const newDishesBlock = `export interface MenuItem {
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

export const CATEGORIES = [
  { slug: "yoresel", label: "YÖRESEL LEZZETLER" },
  { slug: "tas-firin", label: "TAŞ FIRIN & PİDE" },
  { slug: "sac-tava", label: "SAC TAVA" },
  { slug: "tavuk", label: "TAVUK ÇEŞİTLERİ" },
  { slug: "ara-sicak", label: "ARA SICAK & MEZE" },
  { slug: "tatli", label: "TATLILAR" },
  { slug: "icecek", label: "İÇECEKLER" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const DISHES: MenuItem[] = ${JSON.stringify(dishes, null, 2)};

`;

let updated = current.slice(0, startDishesIdx) + newDishesBlock + current.slice(endDishesIdx);

// 2. Add selectedCategory state in component
updated = updated.replace(
  `  const [activeDishIndex, setActiveDishIndex] = useState(0);`,
  `  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>("yoresel");\n  const [activeDishIndex, setActiveDishIndex] = useState(0);`
);

// 3. Replace currentDishes, activeDish and handlers
const oldHandlersTarget = `  const activeDish = DISHES[activeDishIndex];

  // Navigation handlers
  const handlePrevDish = () => {
    setActiveDishIndex((prev) => (prev > 0 ? prev - 1 : DISHES.length - 1));
  };

  const handleNextDish = () => {
    setActiveDishIndex((prev) => (prev < DISHES.length - 1 ? prev + 1 : 0));
  };

  const handleSelectDish = (idx: number) => {
    setActiveDishIndex(idx);
  };`;

const newHandlers = `  const currentDishes = useMemo(() => {
    return DISHES.filter((d) => d.categorySlug === selectedCategory);
  }, [selectedCategory]);

  const activeDish = currentDishes[activeDishIndex] || currentDishes[0] || DISHES[0];

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
  };`;

updated = updated.replace(oldHandlersTarget, newHandlers);

// 4. Update scroll progression to use currentDishes.length
updated = updated.replace(
  `        DISHES.length - 1,\n        Math.max(0, Math.floor(progress * DISHES.length))`,
  `        currentDishes.length - 1,\n        Math.max(0, Math.floor(progress * currentDishes.length))`
);

// 5. Update coverflowCards to use currentDishes
const oldCoverflowCalc = `  // Coverflow 3-card visible window calculation
  const coverflowCards = useMemo(() => {
    return DISHES.map((dish, idx) => {
      let diff = idx - activeDishIndex;
      if (diff < -Math.floor(DISHES.length / 2)) diff += DISHES.length;
      if (diff > Math.floor(DISHES.length / 2)) diff -= DISHES.length;
      return { dish, idx, diff };
    });
  }, [activeDishIndex]);`;

const newCoverflowCalc = `  // Coverflow 3-card visible window calculation
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
  }, [currentDishes, activeDishIndex]);`;

updated = updated.replace(oldCoverflowCalc, newCoverflowCalc);

// 6. Update Act 2 Top Bar with category selector and responsive course indicators
const oldTopBarTarget = `          {/* Menü Üst Barı: Kurs Sayacı & Hızlı Geçiş Noktaları */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#d4af37] uppercase">
                COURSE {activeDish.courseNumber} / 07
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono tracking-widest text-white/60 uppercase">
                {activeDish.category}
              </span>
            </div>

            {/* Kurs Noktaları */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {DISHES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectDish(idx)}
                  className={\`h-1.5 transition-all duration-300 rounded-full \${
                    idx === activeDishIndex
                      ? "w-7 sm:w-8 bg-[#d4af37]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }\`}
                  aria-label={\`Course \${idx + 1}\`}
                />
              ))}
            </div>

            {/* Önceki / Sonraki Oklar */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevDish}
                className="w-8 h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
                aria-label="Önceki Lezzet"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextDish}
                className="w-8 h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
                aria-label="Sonraki Lezzet"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>`;

const newTopBar = `          {/* Menü Üst Barı: Kategori Filtreleri & Kurs Sayacı */}
          <div className="relative z-10 flex flex-col gap-2.5 border-b border-white/10 pb-3">
            {/* Üst Satır: Kategori Filtre Butonları (Yatay Kaydırılabilir) */}
            <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => {
                const isCatActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={\`px-3.5 py-1.5 rounded-full whitespace-nowrap font-mono text-[10px] sm:text-[11px] tracking-wider transition-all duration-300 flex-shrink-0 \${
                      isCatActive
                        ? "bg-[#d4af37] text-[#080706] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                    }\`}
                  >
                    {cat.label}
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
                  {activeDish.category}
                </span>
              </div>

              {/* Kurs Noktaları */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-w-[160px] sm:max-w-[280px] overflow-x-auto no-scrollbar">
                {currentDishes.map((_, idx) => (
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
          </div>`;

updated = updated.replace(oldTopBarTarget, newTopBar);

// 7. Update wood tray style and recessed socket
const oldCardStyleTarget = `                      className={\`absolute inset-0 m-auto w-full max-w-[340px] sm:max-w-xl md:max-w-2xl h-[380px] sm:h-[440px] rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between select-none shadow-[0_30px_90px_rgba(0,0,0,0.98)] bg-gradient-to-b from-[#2a1d17] via-[#1a120e] to-[#0c0806] border-2 border-[#d4af37]/35 \${
                        isActive
                          ? "ring-1 ring-[#d4af37]/30 z-30 pointer-events-auto"
                          : isFar
                          ? "pointer-events-none z-0"
                          : "hover:border-[#d4af37]/60 cursor-pointer z-10"
                      }\`}
                      style={{
                        transformStyle: "preserve-3d",
                        width: "100%",
                        maxWidth: isMobile ? "340px" : "672px",
                      }}`;

const newCardStyle = `                      className={\`absolute inset-0 m-auto w-full max-w-[340px] sm:max-w-xl md:max-w-2xl h-[380px] sm:h-[440px] rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between select-none shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#d4af37]/40 \${
                        isActive
                          ? "ring-1 ring-[#d4af37]/35 z-30 pointer-events-auto"
                          : isFar
                          ? "pointer-events-none z-0"
                          : "hover:border-[#d4af37]/60 cursor-pointer z-10"
                      }\`}
                      style={{
                        transformStyle: "preserve-3d",
                        width: "100%",
                        maxWidth: isMobile ? "340px" : "672px",
                        backgroundImage: "linear-gradient(to bottom, rgba(18, 13, 9, 0.45), rgba(7, 5, 4, 0.78)), url('/wood-tray.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}`;

updated = updated.replace(oldCardStyleTarget, newCardStyle);

// 8. Update badge to "DOĞAL CEVİZ AĞACI TEPSİ"
updated = updated.replace("OTANTİK EL OYMASI TEPSİ", "DOĞAL CEVİZ AĞACI TEPSİ");

// 9. Update recessed socket depth
const oldSocketTarget = `                      {/* Görseldeki Derin Oyuk (Recessed Socket) */}
                      <div
                        className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center my-auto"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 50%, #050403 0%, #0d0a08 60%, #1c1410 100%)",
                          boxShadow:
                            "inset 0 20px 40px rgba(0,0,0,0.98), inset 0 2px 6px rgba(212,175,55,0.3), 0 0 30px rgba(0,0,0,0.8)",
                          border: "1px solid rgba(212,175,55,0.4)",
                        }}
                      >`;

const newSocket = `                      {/* Görseldeki Derin Havşa Oyuğu (Recessed Carved Socket) */}
                      <div
                        className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center my-auto"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 50%, #030202 0%, #0b0806 55%, #19120c 100%)",
                          boxShadow:
                            "inset 0 24px 48px rgba(0,0,0,1.0), inset 0 4px 10px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(212,175,55,0.3), 0 10px 30px rgba(0,0,0,0.85)",
                          border: "1.5px solid rgba(212,175,55,0.45)",
                        }}
                      >`;

updated = updated.replace(oldSocketTarget, newSocket);

fs.writeFileSync("app/page.tsx", updated, "utf8");
console.log("Updated app/page.tsx successfully! New length:", updated.length);
