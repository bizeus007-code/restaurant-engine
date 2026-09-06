import fs from "fs";

let content = fs.readFileSync("app/page.tsx", "utf8");

// 1. Add Utensils to lucide-react import
if (!content.includes("Utensils,")) {
  content = content.replace("Plus,\n  Bell,", "Plus,\n  Bell,\n  Utensils,");
}

// 2. Replace state
const oldState = `  // Akıllı Google İtibar Filtresi State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState<number | null>(null);
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [isFeedbackSent, setIsFeedbackSent] = useState(false);`;

const newState = `  // Canlı Operasyon & Servis Toast State
  const [serviceToast, setServiceToast] = useState<string | null>(null);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);`;

if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
} else {
  console.log("oldState not found exactly, check state");
}

// 3. Replace handlers
const oldHandlers = `  // Garson & Hesap Servis Çağrısı (WhatsApp)
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
  };`;

const newHandlers = `  // Garson & Hesap Servis Çağrısı (/api/calls)
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

if (content.includes(oldHandlers)) {
  content = content.replace(oldHandlers, newHandlers);
} else {
  console.log("oldHandlers not found exactly, check handlers");
}

// 4. Header Değerlendir button
content = content.replace(
  `onClick={() => setIsReviewOpen(true)}`,
  `onClick={handleOpenGoogleReview}`
);

// 5. Add floating Service Toast just inside main or header
if (!content.includes("serviceToast &&")) {
  const headerMarker = `      {/* Fixed Architectural Header */}`;
  const toastSnippet = `      {/* Anlık Servis Bildirim Toasti */}
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
      </AnimatePresence>\n\n`;
  content = content.replace(headerMarker, toastSnippet + headerMarker);
}

// 6. Right Panel "+ SİPARİŞE EKLE" button guarantees opening cart drawer
content = content.replace(
  `onClick={() => handleAddToCart(activeDish)}`,
  `onClick={() => { handleAddToCart(activeDish); setIsCartOpen(true); }}`
);

// 7. Cart Drawer Checkout Button & Order Sent state
const oldDrawerButton = `                {/* Primary WhatsApp Order Button */}
                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Siparişi WhatsApp ile İlet</span>
                </button>`;

const newDrawerButton = `                {/* Primary In-System Order Button */}
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

if (content.includes(oldDrawerButton)) {
  content = content.replace(oldDrawerButton, newDrawerButton);
} else {
  console.log("oldDrawerButton not found exactly");
}

// 8. Remove the old review modal block
const reviewModalPattern = /\{\/\* =+ \*\/\}\s*\{\/\* 3\.5 AKILLI GOOGLE İTİBAR FİLTRESİ MODALI[\s\S]*?<\/AnimatePresence>/;
if (reviewModalPattern.test(content)) {
  content = content.replace(reviewModalPattern, "");
  console.log("Removed review modal successfully");
} else {
  console.log("reviewModalPattern not matched");
}

fs.writeFileSync("app/page.tsx", content, "utf8");
console.log("app/page.tsx updated successfully!");
