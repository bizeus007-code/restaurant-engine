import fs from "fs";

let content = fs.readFileSync("app/page.tsx", "utf8");

// 1. Add CreditCard to lucide-react import
if (!content.includes("CreditCard,")) {
  content = content.replace("ShoppingBag,\n", "ShoppingBag,\n  CreditCard,\n");
}

// 2. Update RESTAURANT_CONFIG Google Review URL
content = content.replace(
  `googleMapsReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJW2u_01vAakARv5w4_xKxGqM"`,
  `googleMapsReviewUrl: "https://share.google/2P0mhAwLo4XOEs0uQ"`
);

// 3. Update State declarations: add inventory, actionToast, isOrderSubmitting
const oldStateBlock = `  // Canlı Operasyon & Servis Toast State
  const [serviceToast, setServiceToast] = useState<string | null>(null);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);`;

const newStateBlock = `  // Canlı Stok & Operasyon State
  const [inventory, setInventory] = useState<Record<string, { count: number; isUnlimited: boolean; isLocked: boolean }>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);

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
  };`;

if (content.includes(oldStateBlock)) {
  content = content.replace(oldStateBlock, newStateBlock);
} else {
  console.log("oldStateBlock not matched, check state");
}

// 4. Update handleAddToCart
const oldAddToCart = `  // Sepet / Adisyon İşlemleri
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
  };`;

const newAddToCart = `  // Sepet / Adisyon İşlemleri
  const handleAddToCart = (dish: MenuItem) => {
    if (isDishOutOfStock(dish.id)) {
      triggerToast(\`Üzgünüz, \${dish.name} tükendi.\`);
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
        { id: dish.id, name: dish.name, price: dish.priceNum, quantity: 1 },
      ];
    });
    triggerToast(\`\${dish.name} tepsiye eklendi ✓\`);
    setIsCartOpen(true);
  };`;

if (content.includes(oldAddToCart)) {
  content = content.replace(oldAddToCart, newAddToCart);
} else {
  console.log("oldAddToCart not matched");
}

// 5. Update handleServiceCall, handleCheckoutInSystem, and handleOpenGoogleReview
const oldHandlers = `  // Garson & Hesap Servis Çağrısı (/api/calls)
  const handleServiceCall = async (
    serviceType: "Garson" | "Hesap (Nakit)" | "Hesap (Kredi Kartı)"
  ) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNo, serviceType }),
      });
      setServiceToast(\`\${tableNo}: \${serviceType} talebiniz görevliye iletildi.\`);
      setTimeout(() => setServiceToast(null), 4000);
    } catch (err) {
      alert("Bağlantı hatası, lütfen garsona el işareti yapınız.");
    }
  };

  // Kasa / Mutfak Sipariş İletimi (/api/orders)
  const handleCheckoutInSystem = async () => {
    if (cart.length === 0) return;
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo,
          items: cart,
          totalAmount,
        }),
      });
      setIsOrderSubmitted(true);
      setTimeout(() => {
        setCart([]);
        setIsOrderSubmitted(false);
        setIsCartOpen(false);
      }, 2800);
    } catch (err) {
      alert("Sipariş iletilemedi, lütfen garsonu çağırınız.");
    }
  };

  // Doğrudan Beroş Google Yorumlarını Aç (Aracı form/modal yok)
  const handleOpenGoogleReview = () => {
    window.open(
      "https://search.google.com/local/writereview?placeid=ChIJW2u_01vAakARv5w4_xKxGqM",
      "_blank"
    );
  };`;

const newHandlers = `  // Garson & Hesap Servis Çağrısı (/api/calls)
  const handleServiceCall = async (
    serviceType: "Garson" | "Hesap İste (Nakit)" | "Hesap İste (Kredi Kartı)" | "Hesap (Nakit)" | "Hesap (Kredi Kartı)"
  ) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNo, serviceType }),
      });
      triggerToast(\`\${tableNo}: \${serviceType} talebiniz kasaya iletildi ✓\`);
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
        triggerToast(\`Siparişiniz mutfağa iletildi! (\${tableNo})\`);
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
  };`;

if (content.includes(oldHandlers)) {
  content = content.replace(oldHandlers, newHandlers);
} else {
  console.log("oldHandlers not matched");
}

// 6. Update Header Action Buttons: Add [ 💳 Hesap İste ]
const oldHeaderButtons = `        {/* Right: Operasyonel Aksiyonlar (Garson Çağır, Değerlendir, Tepsi) */}
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
            onClick={handleOpenGoogleReview}
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
          </button>`;

const newHeaderButtons = `        {/* Right: Operasyonel Aksiyonlar (Garson, Hesap İste, Değerlendir, Tepsi) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Garson Çağır Butonu */}
          <button
            onClick={() => handleServiceCall("Garson")}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Garson Çağır"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Garson</span>
          </button>

          {/* Hesap İste Butonu */}
          <button
            onClick={() => handleServiceCall("Hesap İste (Kredi Kartı)")}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Hesap İste"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hesap</span>
          </button>

          {/* Google Haritalar'da Değerlendir */}
          <button
            onClick={handleOpenGoogleReview}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 text-xs font-mono tracking-wider transition-all active:scale-95"
            title="Google Haritalar'da Değerlendir"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden md:inline">Değerlendir</span>
          </button>

          {/* Canlı Tepsi / Sepet Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 sm:px-3.5 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-mono tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">TEPSİ</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#d4af37] text-[#080706] font-bold text-[10px]">
              {totalCartCount}
            </span>
          </button>`;

if (content.includes(oldHeaderButtons)) {
  content = content.replace(oldHeaderButtons, newHeaderButtons);
} else {
  console.log("oldHeaderButtons not matched");
}

// 7. Update Right Panel "+ SİPARİŞE EKLE" button to reflect stock state
const oldAddButton = `                {/* Sipariş Ekle Butonu */}
                <button
                  onClick={() => { handleAddToCart(activeDish); setIsCartOpen(true); }}
                  className="flex-1 lg:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#d4af37] hover:bg-[#e6c158] text-[#080706] font-mono text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-semibold transition-all duration-300 shadow-[0_10px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.4)] active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span>SİPARİŞE EKLE</span>
                </button>`;

const newAddButton = `                {/* Sipariş Ekle Butonu (Stok Kontrollü) */}
                <button
                  onClick={() => {
                    if (activeDish) handleAddToCart(activeDish);
                  }}
                  disabled={isDishOutOfStock(activeDish?.id)}
                  className="flex-1 lg:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#d4af37] hover:bg-[#e6c158] active:scale-95 text-[#080706] font-mono text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-bold transition-all duration-300 shadow-[0_10px_25px_rgba(212,175,55,0.25)] flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span>
                    {isDishOutOfStock(activeDish?.id)
                      ? "TÜKENDİ"
                      : "+ SİPARİŞE EKLE"}
                  </span>
                </button>`;

if (content.includes(oldAddButton)) {
  content = content.replace(oldAddButton, newAddButton);
} else {
  console.log("oldAddButton not matched");
}

// 8. Update Cart Drawer Order Button to reflect isOrderSubmitting state
const oldDrawerOrderBtn = `                {/* Primary In-System Order Button */}
                {isOrderSubmitted ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Siparişiniz mutfağa iletildi!</span>
                    </div>
                    <div className="text-[11px] text-white/70">
                      Masa: {tableNo}, Tutar: ₺{totalAmount} hazırlanıyor...
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckoutInSystem}
                    disabled={cart.length === 0}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Siparişi Onayla & Mutfağa İlet</span>
                  </button>
                )}`;

const newDrawerOrderBtn = `                {/* Primary In-System Order Button */}
                <button
                  onClick={handleCheckoutInSystem}
                  disabled={cart.length === 0 || isOrderSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>
                    {isOrderSubmitting ? "Mutfağa İletiliyor..." : "Siparişi Mutfağa İlet"}
                  </span>
                </button>`;

if (content.includes(oldDrawerOrderBtn)) {
  content = content.replace(oldDrawerOrderBtn, newDrawerOrderBtn);
} else {
  console.log("oldDrawerOrderBtn not matched");
}

// 9. Update Cart Drawer Quick Buttons to use new service call types
content = content.replace(
  `onClick={() => handleServiceCall("Hesap (Nakit)")}`,
  `onClick={() => handleServiceCall("Hesap İste (Nakit)")}`
);
content = content.replace(
  `onClick={() => handleServiceCall("Hesap (Kredi Kartı)")}`,
  `onClick={() => handleServiceCall("Hesap İste (Kredi Kartı)")}`
);

// 10. Replace the top serviceToast with the bottom actionToast
const oldToastBlock = `      {/* Anlık Servis Bildirim Toasti */}
      <AnimatePresence>
        {serviceToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[1200] px-5 py-3 rounded-2xl bg-[#14100c] border border-amber-500/50 shadow-[0_10px_35px_rgba(245,158,11,0.25)] flex items-center gap-3 text-amber-400 font-mono text-xs backdrop-blur-md pointer-events-none"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{serviceToast}</span>
          </motion.div>
        )}
      </AnimatePresence>`;

const newToastBlock = `      {/* Anlık Aksiyon & Servis Bildirim Toasti (Sayfa Altı) */}
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
      </AnimatePresence>`;

if (content.includes(oldToastBlock)) {
  content = content.replace(oldToastBlock, newToastBlock);
} else {
  console.log("oldToastBlock not matched");
}

fs.writeFileSync("app/page.tsx", content, "utf8");
console.log("app/page.tsx stock & buttons integration complete!");
