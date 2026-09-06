import fs from "fs";

let code = fs.readFileSync("app/page.tsx", "utf8");

// 1. Ensure CartItem interface matches
code = code.replace(
  `interface CartItem {\n  dishId: string;\n  quantity: number;\n}`,
  `interface CartItem {\n  id: string;\n  name: string;\n  price: number;\n  quantity: number;\n}`
);

// 2. Update state inside VexmoKineticBerosPage
const oldStateBlock = `  // UI state
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
  const [orderSent, setOrderSent] = useState(false);`;

const newStateBlock = `  // Operasyonel Masa & İletişim State
  const [tableNo, setTableNo] = useState<string>("MASA 07");
  const [wifiCopied, setWifiCopied] = useState(false);

  // Akıllı Google İtibar Filtresi State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState<number | null>(null);
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [isFeedbackSent, setIsFeedbackSent] = useState(false);

  // UI & Menü state
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
  const [orderSent, setOrderSent] = useState(false);`;

code = code.replace(oldStateBlock, newStateBlock);

// 3. Update mount effect with dynamic table number detection
const oldMountEffect = `  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);`;

const newMountEffect = `  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
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
  }, []);`;

code = code.replace(oldMountEffect, newMountEffect);

// 4. Update cart handlers and service call functions
const oldCartOpsTarget = `  // Cart operations
  const addToCart = (dishId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dishId);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dishId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.dishId === dishId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
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

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const dish = DISHES.find((d) => d.id === item.dishId);
      return sum + (dish ? dish.priceNum * item.quantity : 0);
    }, 0);
  }, [cart]);

  const handleSendOrder = () => {
    setOrderSent(true);
    setTimeout(() => {
      setCart([]);
      setOrderSent(false);
      setIsCartOpen(false);
    }, 3500);
  };`;

const newCartOps = `  // Sepet / Adisyon İşlemleri
  const handleAddToCart = (dish: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { id: dish.id, name: dish.name, price: dish.priceNum, quantity: 1 },
      ];
    });
    setIsCartOpen(true);
  };

  const addToCart = (dishId: string) => {
    const dish = DISHES.find((d) => d.id === dishId);
    if (dish) handleAddToCart(dish);
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

  // Garson & Hesap Servis Çağrısı (WhatsApp)
  const handleServiceCall = (
    serviceType: "Garson" | "Hesap (Nakit)" | "Hesap (Kredi Kartı)"
  ) => {
    const text = encodeURIComponent(
      \`🔔 *SERVİS ÇAĞRISI*\\n\` +
        \`--------------------------\\n\` +
        \`📍 *Konum:* \${tableNo}\\n\` +
        \`⚡ *İstek:* \${serviceType}\\n\` +
        \`⏰ *Saat:* \${new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}\`
    );
    window.open(
      \`https://wa.me/\${RESTAURANT_CONFIG.whatsappNumber}?text=\${text}\`,
      "_blank"
    );
  };

  // WhatsApp Adisyon Sipariş İletimi
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;
    let itemsList = "";
    cart.forEach((item) => {
      itemsList += \`▪ \${item.quantity}x \${item.name} - ₺\${item.price * item.quantity}\\n\`;
    });

    const message = encodeURIComponent(
      \`🧾 *YENİ MASA SİPARİŞİ / ADİSYON*\\n\` +
        \`--------------------------\\n\` +
        \`📍 *Masa:* \${tableNo}\\n\` +
        \`⏰ *Saat:* \${new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}\\n\\n\` +
        \`🛒 *Sipariş Detayı:*\\n\${itemsList}\\n\` +
        \`--------------------------\\n\` +
        \`💰 *Toplam Tutar:* ₺\${totalAmount}\\n\` +
        \`--------------------------\\n\` +
        \`Lütfen siparişi onaylayıp mutfağa aktarınız.\`
    );
    window.open(
      \`https://wa.me/\${RESTAURANT_CONFIG.whatsappNumber}?text=\${message}\`,
      "_blank"
    );
  };

  // Akıllı Google İtibar Filtresi
  const handleStarSelection = (stars: number) => {
    setReviewStars(stars);
    if (stars >= 4) {
      window.open(RESTAURANT_CONFIG.googleMapsReviewUrl, "_blank");
      setIsReviewOpen(false);
      setReviewStars(null);
    }
  };

  const handleSendPrivateComplaint = () => {
    if (!privateFeedback.trim()) return;
    const text = encodeURIComponent(
      \`⚠️ *MÜŞTERİ GERİ BİLDİRİMİ (ÖZEL)*\\n\` +
        \`--------------------------\\n\` +
        \`📍 *Masa:* \${tableNo}\\n\` +
        \`⭐ *Puan:* \${reviewStars} / 5\\n\` +
        \`💬 *Not:* \${privateFeedback}\\n\` +
        \`⏰ *Saat:* \${new Date().toLocaleTimeString("tr-TR")}\`
    );
    window.open(
      \`https://wa.me/\${RESTAURANT_CONFIG.whatsappNumber}?text=\${text}\`,
      "_blank"
    );
    setIsFeedbackSent(true);
    setTimeout(() => {
      setIsFeedbackSent(false);
      setIsReviewOpen(false);
      setReviewStars(null);
      setPrivateFeedback("");
    }, 2500);
  };

  // WiFi Şifresi Kopyalama
  const handleCopyWifi = () => {
    navigator.clipboard.writeText(RESTAURANT_CONFIG.wifiPass);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };`;

code = code.replace(oldCartOpsTarget, newCartOps);

// 5. Update Header
const oldHeaderStart = `<header className="fixed top-0 left-0 right-0 z-[999] px-6 sm:px-12 py-4 flex items-center justify-between backdrop-blur-md bg-[#080706]/75 border-b border-white/10 transition-all duration-300">`;
const oldHeaderEnd = `      </header>`;
const headerIdx1 = code.indexOf(oldHeaderStart);
const headerIdx2 = code.indexOf(oldHeaderEnd);

if (headerIdx1 !== -1 && headerIdx2 !== -1) {
  const newHeader = `<header className="fixed top-0 left-0 right-0 z-[999] px-4 sm:px-12 py-3.5 flex items-center justify-between backdrop-blur-md bg-[#080706]/85 border-b border-white/10 transition-all duration-300">
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

        {/* Right: Operasyonel Aksiyonlar (Garson Çağır, Değerlendir, Tepsi) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Garson Çağır Butonu */}
          <button
            onClick={() => handleServiceCall("Garson")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Garson Çağır"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Garson</span>
          </button>

          {/* Akıllı Google İtibar Filtresi Trigger */}
          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Puan Ver & Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden md:inline">Değerlendir</span>
          </button>

          {/* Canlı Tepsi / Sepet Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 sm:px-3.5 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-mono tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">TEPSİ</span>
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
      </header>`;
  code = code.slice(0, headerIdx1) + newHeader + code.slice(headerIdx2 + oldHeaderEnd.length);
}

// 6. Update Wood Tray Card inside coverflow to use real wood <img> layer and w-52 sm:w-64 socket
const oldCardMarkupTarget = `                      className={\`absolute inset-0 m-auto w-full max-w-[340px] sm:max-w-xl md:max-w-2xl h-[380px] sm:h-[440px] rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between select-none shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#d4af37]/40 \${
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
                      }}
                    >
                      {/* Dört Köşede Pirinç/Bronz Köşe Bağlama Süslemesi */}
                      <GoldCorner className="top-3 left-3" />
                      <GoldCorner className="top-3 right-3 rotate-90" />
                      <GoldCorner className="bottom-3 right-3 rotate-180" />
                      <GoldCorner className="bottom-3 left-3 -rotate-90" />`;

const newCardMarkup = `                      className={\`absolute inset-0 m-auto w-full max-w-[340px] sm:max-w-xl md:max-w-2xl h-[380px] sm:h-[440px] rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between select-none shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#d4af37]/40 \${
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
                      <GoldCorner className="bottom-3 left-3 -rotate-90 z-10" />`;

code = code.replace(oldCardMarkupTarget, newCardMarkup);

// 7. Update socket class in card
code = code.replace(
  `className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center my-auto"`,
  `className="w-52 h-52 sm:w-64 sm:h-64 rounded-full flex items-center justify-center relative shadow-[inset_0_24px_48px_rgba(0,0,0,0.98),inset_0_2px_8px_rgba(212,175,55,0.4),0_0_35px_rgba(0,0,0,0.9)] border-2 border-[#d4af37]/35 z-10 my-auto"`
);

// 8. Update Siparişe Ekle button to call handleAddToCart(activeDish)
code = code.replace(
  `onClick={() => addToCart(activeDish.id)}`,
  `onClick={() => handleAddToCart(activeDish)}`
);

// 9. Update Act 3 Footer buttons
const oldFooterButtonsTarget = `<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <a
                href="https://instagram.com/berosrestoran"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@berosrestoran</span>
              </a>

              <a
                href="https://wa.me/905386976353?text=Merhaba,%20Beroş%20Restaurant%20için%20rezervasyon%20yaptırmak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-2.5 rounded-full border border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/40 backdrop-blur-md text-xs font-mono tracking-wider text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Rezervasyon</span>
              </a>

              <a
                href="tel:05386976353"
                className="px-4 sm:px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40 bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 transition-all flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>0538 697 63 53</span>
              </a>

              <a
                href="https://maps.google.com/?q=Bero%C5%9F+Restaurant+Diyarbak%C4%B1r"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-2.5 rounded-full border border-white/20 hover:border-[#d4af37] bg-black/40 backdrop-blur-md text-xs font-mono tracking-wider text-white/80 hover:text-[#d4af37] transition-all flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Harita Yol Tarifi</span>
              </a>

              <button
                onClick={() => scrollToSection(0)}
                className="px-4 sm:px-5 py-2.5 rounded-full bg-[#d4af37] hover:bg-[#e6c158] text-[#080706] text-xs font-mono tracking-wider font-semibold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Yukarı Çık ↑</span>
              </button>
            </div>`;

const newFooterButtons = `<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
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
                href={\`https://wa.me/\${RESTAURANT_CONFIG.whatsappNumber}?text=\${encodeURIComponent("Merhaba, Beroş Restaurant için rezervasyon yaptırmak istiyorum.")}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full border border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/40 backdrop-blur-md text-xs font-mono tracking-wider text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Rezervasyon</span>
              </a>

              <a
                href={\`tel:\${RESTAURANT_CONFIG.phone}\`}
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
                <span>{wifiCopied ? "Şifre Kopyalandı!" : \`WiFi: \${RESTAURANT_CONFIG.wifiPass}\`}</span>
              </button>

              <button
                onClick={() => scrollToSection(0)}
                className="px-4 py-2.5 rounded-full bg-[#d4af37] hover:bg-[#e6c158] text-[#080706] text-xs font-mono tracking-wider font-semibold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Yukarı Çık ↑</span>
              </button>
            </div>`;

code = code.replace(oldFooterButtonsTarget, newFooterButtons);

// 10. Replace old Cart Drawer and add Google Review Modal
const oldCartStart = `{/* ========================================================================= */}\n      {/* 3. CART CONCIERGE DRAWER                                                  */}`;
const oldCartEnd = `{/* ========================================================================= */}\n      {/* 4. MASA REZERVASYONU MODAL                                                */}`;

const cartIdx1 = code.indexOf(oldCartStart);
const cartIdx2 = code.indexOf(oldCartEnd);

if (cartIdx1 !== -1 && cartIdx2 !== -1) {
  const newModalsSection = `{/* ========================================================================= */}
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
                      CANLI MASA ADİSYONU
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
                      <p className="font-serif text-lg text-white/70">Tepsiniz henüz boş</p>
                      <p className="text-xs font-mono">
                        Menüdeki lezzetleri &ldquo;SİPARİŞE EKLE&rdquo; butonu ile tepsiye yerleştirin.
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
                {/* Totals */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-white/50">
                    <span>Servis / Kuver</span>
                    <span className="text-emerald-400 font-medium">Dahil</span>
                  </div>
                  <div className="flex justify-between text-base font-serif text-white pt-1 border-t border-white/5">
                    <span>Toplam Tutar</span>
                    <span className="text-xl text-[#d4af37] font-sans font-semibold">
                      ₺{totalAmount}
                    </span>
                  </div>
                </div>

                {/* Primary WhatsApp Order Button */}
                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Siparişi WhatsApp ile İlet</span>
                </button>

                {/* Quick Service Buttons: Nakit / POS / Garson */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleServiceCall("Hesap (Nakit)")}
                    className="py-2 px-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    💵 Nakit Hesap
                  </button>
                  <button
                    onClick={() => handleServiceCall("Hesap (Kredi Kartı)")}
                    className="py-2 px-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    💳 Kart / POS
                  </button>
                  <button
                    onClick={() => handleServiceCall("Garson")}
                    className="py-2 px-1 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[10px] tracking-wider transition-all active:scale-95 text-center"
                  >
                    🔔 Garson
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3.5 AKILLI GOOGLE İTİBAR FİLTRESİ MODALI                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReviewOpen && (
          <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsReviewOpen(false);
                setReviewStars(null);
                setPrivateFeedback("");
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#120e0b] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-center overflow-hidden z-10"
            >
              <button
                onClick={() => {
                  setIsReviewOpen(false);
                  setReviewStars(null);
                  setPrivateFeedback("");
                }}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-3">
                <Star className="w-6 h-6 fill-[#d4af37]" />
              </div>

              <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase block">
                {tableNo} • MİSAFİR DENEYİMİ
              </span>
              <h3 className="font-serif text-2xl font-light text-white mt-1">
                Deneyiminizi Değerlendirin
              </h3>
              <p className="text-xs text-white/60 font-sans mt-1.5 mb-6">
                Beroş Restaurant lezzet, atmosfer ve servis kalitemizi nasıl buldunuz?
              </p>

              {/* 5 Yıldız Seçimi */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarSelection(star)}
                    className="p-1.5 sm:p-2 transition-transform hover:scale-125 active:scale-95 group focus:outline-none"
                    aria-label={\`\${star} Yıldız\`}
                  >
                    <Star
                      className={\`w-8 h-8 transition-colors \${
                        reviewStars && reviewStars >= star
                          ? "text-[#d4af37] fill-[#d4af37]"
                          : "text-white/25 hover:text-[#d4af37]"
                      }\`}
                    />
                  </button>
                ))}
              </div>

              {/* 1-3 Yıldız Arası Özel Şikayet & Geri Bildirim Formu */}
              {reviewStars && reviewStars < 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left border-t border-white/10 pt-4"
                >
                  <p className="text-xs text-amber-400 font-sans font-medium mb-1.5">
                    Beklentilerinizi tam karşılayamadığımız için üzgünüz.
                  </p>
                  <p className="text-[11px] text-white/60 mb-3">
                    Lütfen eksiklerimizi paylaşın; mesajınız doğrudan işletme sahibimize ve mutfak şefimize özel olarak iletilecektir.
                  </p>
                  <textarea
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    placeholder="Görüş, öneri veya şikayetinizi buraya yazın..."
                    rows={3}
                    className="w-full rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]"
                  />
                  <button
                    onClick={handleSendPrivateComplaint}
                    disabled={isFeedbackSent || !privateFeedback.trim()}
                    className="mt-3 w-full py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e5be46] text-[#080706] font-mono text-xs tracking-wider uppercase font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isFeedbackSent ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>İşletmeye İletildi ✓</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>İşletme Sahibine Özel İlet</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {(!reviewStars || reviewStars >= 4) && (
                <p className="text-[11px] font-mono text-white/40">
                  4 ve 5 yıldızlı değerlendirmeler Google Haritalar profilimize yönlendirilir.
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>\n\n      `;
  code = code.slice(0, cartIdx1) + newModalsSection + code.slice(cartIdx2);
}

fs.writeFileSync("app/page.tsx", code, "utf8");
console.log("Operational system integrated successfully! File size:", code.length);
