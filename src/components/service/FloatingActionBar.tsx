"use client";

import React, { useState, useEffect } from "react";
import { Bell, Receipt, Star, Send, X, CheckCircle2, AlertCircle, Sparkles, CreditCard, Banknote, Users } from "lucide-react";
import { RESTAURANT_CONFIG } from "@/src/config/restaurant.config";

interface FloatingActionBarProps {
  tableNo: string | null;
  onSelectTable?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function FloatingActionBar({
  tableNo,
  onSelectTable,
  cartCount = 0,
  onOpenCart,
}: FloatingActionBarProps) {
  // Waiter Call State
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterReason, setWaiterReason] = useState<string>("Sipariş Verme");
  const [customWaiterNote, setCustomWaiterNote] = useState<string>("");
  const [waiterLoading, setWaiterLoading] = useState(false);
  const [waiterSuccess, setWaiterSuccess] = useState(false);

  // Bill State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"kart" | "nakit" | "parcali">("kart");
  const [billLoading, setBillLoading] = useState(false);
  const [billSuccess, setBillSuccess] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [tableTotal, setTableTotal] = useState<number>(0);

  // Review Funnel State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const WAITER_REASONS = [
    "Sipariş Verme",
    "Servis Açma",
    "Su / Buz Talebi",
    "Kül Tablası",
    "Hesap Öncesi Kontrol",
  ];

  // Fetch live table bill details when bill modal opens
  useEffect(() => {
    if (isBillModalOpen && tableNo) {
      fetch(`/api/orders?tableNo=${encodeURIComponent(tableNo)}`)
        .then((res) => res.json())
        .then((orders) => {
          const activeOrders = orders.filter((o: any) => o.status !== "kapandi" && !o.isCancelled);
          setTableOrders(activeOrders);
          const total = activeOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);
          setTableTotal(total);
        })
        .catch(() => {});
    }
  }, [isBillModalOpen, tableNo]);

  const handleCallWaiter = async () => {
    if (!tableNo) {
      if (onSelectTable) onSelectTable();
      return;
    }

    setWaiterLoading(true);
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo,
          serviceType: "Garson",
          reason: customWaiterNote ? `${waiterReason} (${customWaiterNote})` : waiterReason,
        }),
      });
      setWaiterSuccess(true);
      setTimeout(() => {
        setWaiterSuccess(false);
        setIsWaiterModalOpen(false);
        setCustomWaiterNote("");
      }, 1600);
    } catch {
      alert("Garson çağrısı iletilemedi. Lütfen tekrar deneyin.");
    } finally {
      setWaiterLoading(false);
    }
  };

  const handleRequestBill = async () => {
    if (!tableNo) {
      if (onSelectTable) onSelectTable();
      return;
    }

    setBillLoading(true);
    try {
      const methodLabel =
        paymentMethod === "kart" ? "Kredi Kartı" : paymentMethod === "nakit" ? "Nakit" : "Parçalı / Bölüşmeli";

      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo,
          serviceType: "Hesap",
          paymentMethod: methodLabel,
          billAmount: tableTotal,
          reason: `Hesap İste (${methodLabel}) - ₺${tableTotal.toLocaleString("tr-TR")}`,
        }),
      });

      setBillSuccess(true);
      setTimeout(() => {
        setBillSuccess(false);
        setIsBillModalOpen(false);
        // Trigger review funnel automatically upon requesting bill!
        setIsReviewModalOpen(true);
      }, 1400);
    } catch {
      alert("Hesap talebi iletilemedi. Lütfen tekrar deneyin.");
    } finally {
      setBillLoading(false);
    }
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    if (rating === 5) {
      // 5 Stars -> Redirect to Google Maps review page directly!
      window.open(RESTAURANT_CONFIG.social.googleReviewUrl, "_blank");
      setIsReviewModalOpen(false);
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintText.trim()) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo: tableNo || "MASA ??",
          rating: selectedRating || 3,
          comment: complaintText,
        }),
      });
      setComplaintSubmitted(true);
      setTimeout(() => {
        setComplaintSubmitted(false);
        setIsReviewModalOpen(false);
        setSelectedRating(null);
        setComplaintText("");
      }, 2000);
    } catch {
      alert("Geri bildirim iletilemedi.");
    }
  };

  return (
    <>
      {/* Floating Action Bar at Bottom of Screen */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md">
        <div className="flex items-center justify-between gap-2 p-2 bg-[#1A1A1A]/95 border border-[#D4AF37]/30 rounded-2xl shadow-2xl backdrop-blur-xl">
          {/* Table Indicator / Selector */}
          <button
            type="button"
            onClick={onSelectTable}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-left hover:border-[#D4AF37]/50 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">Oturum</div>
              <div className="text-xs font-bold text-[#D4AF37] whitespace-nowrap">
                {tableNo ? tableNo : "Masa Seç"}
              </div>
            </div>
          </button>

          {/* Call Waiter Button */}
          <button
            type="button"
            onClick={() => setIsWaiterModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2E1C14] hover:bg-[#3D251A] border border-[#8B0000]/60 text-white font-medium text-xs transition-all active:scale-95 shadow-md"
          >
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-semibold">Garson Çağır</span>
          </button>

          {/* Request Bill Button */}
          <button
            type="button"
            onClick={() => setIsBillModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#B22222] hover:from-[#B22222] hover:to-[#8B0000] text-white font-medium text-xs transition-all active:scale-95 shadow-md shadow-[#8B0000]/25"
          >
            <Receipt className="w-4 h-4 text-amber-200" />
            <span className="font-semibold">Hesap İste</span>
          </button>
        </div>
      </div>

      {/* 1. GARSON ÇAĞIR MODAL */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#2E1C14] rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsWaiterModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-2">
              <Bell className="w-4 h-4" />
              <span>Garson Masanıza Yönlendirilecek</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Garson Çağır ({tableNo || "Masa Seçilmedi"})
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Lütfen hizmet talebinizin nedenini seçin; garsonumuz hazırlıklı gelsin.
            </p>

            {/* Reasons Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {WAITER_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setWaiterReason(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                    waiterReason === r
                      ? "bg-[#8B0000] border-[#D4AF37] text-white font-semibold shadow-md"
                      : "bg-black/40 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Note input */}
            <input
              type="text"
              placeholder="Ek talebiniz varsa yazabilirsiniz (opsiyonel)..."
              value={customWaiterNote}
              onChange={(e) => setCustomWaiterNote(e.target.value)}
              className="w-full mb-5 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
            />

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleCallWaiter}
              disabled={waiterLoading || waiterSuccess}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#B22222] hover:from-[#B22222] hover:to-[#8B0000] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {waiterSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Garsona İletildi! Yolda...</span>
                </>
              ) : waiterLoading ? (
                <span>Gönderiliyor...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Çağrıyı Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. HESAP İSTE MODAL */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#2E1C14] rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsBillModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-2">
              <Receipt className="w-4 h-4" />
              <span>Adisyon Dökümü & Hesap Talebi</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Hesap İste ({tableNo || "Masa Seçilmedi"})
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Masanızdaki aktif siparişlerin toplamı ve tercih ettiğiniz ödeme yöntemi:
            </p>

            {/* Itemized summary */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-black/50 border border-neutral-800 mb-4 text-xs">
              {tableOrders.length > 0 ? (
                tableOrders.map((ord: any) =>
                  (ord.items || []).map((it: any, idx: number) => (
                    <div key={`${ord.id}-${idx}`} className="flex justify-between items-center text-neutral-300">
                      <span>
                        {it.quantity}x {it.name}
                      </span>
                      <span className="font-mono text-white">₺{(it.price * it.quantity).toLocaleString("tr-TR")}</span>
                    </div>
                  ))
                )
              ) : (
                <div className="text-center text-neutral-500 py-3">Masanızda henüz açık adisyon kaydı yok.</div>
              )}
            </div>

            {/* Total Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#2E1C14]/80 border border-[#D4AF37]/30 mb-5">
              <span className="text-sm font-semibold text-neutral-300">Ödenecek Tutar:</span>
              <span className="text-xl font-serif font-bold text-[#D4AF37]">
                ₺{tableTotal.toLocaleString("tr-TR")}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="text-xs font-semibold text-neutral-400 mb-2">Ödeme Türünü Seçiniz:</div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod("kart")}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "kart"
                    ? "bg-[#8B0000] border-[#D4AF37] text-white font-bold shadow-md"
                    : "bg-black/40 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kredi Kartı</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("nakit")}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "nakit"
                    ? "bg-[#8B0000] border-[#D4AF37] text-white font-bold shadow-md"
                    : "bg-black/40 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Nakit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("parcali")}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "parcali"
                    ? "bg-[#8B0000] border-[#D4AF37] text-white font-bold shadow-md"
                    : "bg-black/40 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parçalı</span>
              </button>
            </div>

            {/* Submit Bill Request */}
            <button
              type="button"
              onClick={handleRequestBill}
              disabled={billLoading || billSuccess}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#B22222] hover:from-[#B22222] hover:to-[#8B0000] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {billSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hesap Talebi Kasaya Düştü!</span>
                </>
              ) : billLoading ? (
                <span>İletiliyor...</span>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Hesabı Masaya İste</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. GOOGLE YORUM TEŞVİK HUNİSİ (SMART RATING MODAL) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#D4AF37]/50 rounded-2xl p-6 text-white shadow-2xl text-center">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 mx-auto rounded-full bg-[#2E1C14] border border-[#D4AF37] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>

            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Deneyiminizi Puanlayın
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              Loqum Et Steakhouse Diyarbakır servis ve lezzet deneyiminiz nasıldı?
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingSelect(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (selectedRating || 0) >= star
                        ? "fill-[#D4AF37] text-[#D4AF37]"
                        : "text-neutral-600 hover:text-[#D4AF37]"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* If 1, 2 or 3 stars: Show internal feedback complaint form */}
            {selectedRating && selectedRating <= 3 && (
              <div className="text-left animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Deneyiminizi mükemmelleştirmek için neyi geliştirebiliriz?</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Lütfen eksik bulduğunuz detayları belirtin (Patron & Şef doğrudan inceleyecektir)..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleComplaintSubmit}
                  disabled={complaintSubmitted || !complaintText.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#B22222] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {complaintSubmitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>İşletme Yetkilisine İletildi. Teşekkürler!</span>
                    </>
                  ) : (
                    <span>Geri Bildirimi İşletmeye İlet</span>
                  )}
                </button>
              </div>
            )}

            {/* 4-5 Stars hint */}
            {(!selectedRating || selectedRating >= 4) && (
              <p className="text-[11px] text-neutral-500">
                5 yıldız seçtiğinizde Google Haritalar profilimize yönlendirileceksiniz.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

