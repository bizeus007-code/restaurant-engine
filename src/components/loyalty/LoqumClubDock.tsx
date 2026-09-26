"use client";

import React, { useState, useEffect } from "react";
import { 
  Crown, Gift, CheckCircle2, Sparkles, X, 
  Phone, ArrowRight, Clock, ShieldCheck, Flame, RefreshCw 
} from "lucide-react";
import confetti from "canvas-confetti";

interface LoyaltySettings {
  isEnabled: boolean;
  rewardItemId: string;
  rewardItemName: string;
  rewardItemPrice: number;
  maxStamps: number;
  adminPin: string;
  rateLimitDaily: boolean;
}

interface LoyaltyVisit {
  visitIndex: number;
  date: string;
  approvedBy: string;
  isRewardClaim?: boolean;
}

interface LoyaltyMember {
  phone: string;
  formattedPhone: string;
  currentStamps: number;
  cycleCount: number;
  isRewardUnlocked: boolean;
  visits: LoyaltyVisit[];
}

export function LoqumClubDock() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch settings and check saved phone
  useEffect(() => {
    fetchSettingsAndMember();
  }, []);

  const fetchSettingsAndMember = async () => {
    try {
      const savedPhone = typeof window !== "undefined" ? localStorage.getItem("loqum_club_phone") : null;
      const url = savedPhone 
        ? `/api/loyalty?phone=${encodeURIComponent(savedPhone)}` 
        : `/api/loyalty`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.loyaltySettings) {
        setSettings(data.loyaltySettings);
        if (data.member) {
          setMember(data.member);
          setPhoneInput(data.member.formattedPhone || data.member.phone);
        }
      }
    } catch (e) {
      console.error("Failed to load loyalty settings:", e);
    }
  };

  const handleQueryPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneInput.replace(/\D/g, "");
    if (clean.length < 10) {
      setErrorMessage("Lütfen geçerli 10 veya 11 haneli telefon numarası giriniz.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "queryMember", phone: clean })
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMember(data.member);
        if (typeof window !== "undefined") {
          localStorage.setItem("loqum_club_phone", data.member.phone);
        }
        if (data.member.isRewardUnlocked) {
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {}
        }
      } else {
        setErrorMessage(data.error || "Kart bilgisi alınamadı.");
      }
    } catch (err: any) {
      setErrorMessage("Sunucu bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPhone = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("loqum_club_phone");
    }
    setMember(null);
    setPhoneInput("");
  };

  // Rule: If loyaltySettings.isEnabled === false, dock is completely hidden
  if (!settings || !settings.isEnabled) {
    return null;
  }

  const maxStamps = settings.maxStamps || 6;
  const currentStamps = member?.currentStamps || 0;
  const isUnlocked = member?.isRewardUnlocked || currentStamps >= maxStamps;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING GOLD CAPSULE DOCK (CLEAN RIGHT-BOTTOM CORNER DOCK) */}
      {/* ============================================================== */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            fetchSettingsAndMember();
            setIsOpen(true);
            if (member?.isRewardUnlocked) {
              try {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
              } catch {}
            }
          }}
          className="group relative flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-[#1E1508] via-[#2A1D0B] to-[#1E1508] border-2 border-[#D4AF37] text-white shadow-[0_8px_30px_rgba(212,175,55,0.45)] hover:shadow-[0_8px_40px_rgba(251,226,145,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Loqum Club Sadakat Kartı"
        >
          {/* Pulsing ring indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#D4AF37]"></span>
          </span>

          {/* Left Golden Crown Badge */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FBE291] to-[#C8982B] flex items-center justify-center text-black shadow-md shadow-[#D4AF37]/30 shrink-0 group-hover:rotate-12 transition-transform">
            <Crown className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* Text Labels */}
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FBE291] via-[#FFF3B0] to-[#D4AF37]">
                LOQUM CLUB
              </span>
              <Sparkles className="w-3 h-3 text-[#FBE291] animate-pulse" />
            </div>
            <div className="text-[10px] font-mono font-medium text-amber-200/90 tracking-tight">
              {member ? `${member.currentStamps}/${maxStamps} Damga` : "6+1 Hediye Bonfile"}
            </div>
          </div>

          {/* Right Stamp Circle Preview */}
          <div className="hidden xs:flex items-center gap-1 pl-1 border-l border-[#D4AF37]/30">
            {isUnlocked ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-mono font-bold text-[10px] animate-pulse">
                HEDİYE AÇIK
              </span>
            ) : (
              <div className="flex items-center gap-0.5">
                {[...Array(maxStamps)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentStamps
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                        : "bg-neutral-700 border border-neutral-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. LOQUM CLUB VIP SADAKAT KARTI MODALI                         */}
      {/* ============================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0F0C08] border-2 border-[#D4AF37]/70 rounded-3xl p-5 sm:p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Top gold accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]" />

            {/* Background luxury gradient glow */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#8B0000]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Action Buttons: Refresh & Close */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  fetchSettingsAndMember().finally(() => setIsLoading(false));
                }}
                className="p-2 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-[#FBE291] hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Kartımı Güncelle"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FBE291]' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Header Amblem & Title */}
            <div className="text-center relative z-10 space-y-1">
              <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#FBE291] to-[#C8982B] flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/30 mb-2">
                <Crown className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#D4AF37] uppercase block font-bold">
                LOQUM ET VIP REWARDS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-white">
                LOQUM CLUB
              </h2>
              <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                6 Ziyarette 1 İmza <strong className="text-[#FBE291]">{settings.rewardItemName}</strong> Hediye!
                <span className="text-[#D4AF37] font-mono block mt-0.5 font-semibold">(₺{settings.rewardItemPrice} Değerinde)</span>
              </p>
            </div>

            {/* Member Phone Status or Form */}
            <div className="mt-5 relative z-10">
              {member ? (
                <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#FBE291]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-stone-400">Kayıtlı Misafir Numarası</div>
                      <div className="text-sm font-mono font-bold text-white tracking-wider">
                        {member.formattedPhone || member.phone}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPhone}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 hover:border-[#D4AF37] text-[11px] text-stone-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQueryPhone} className="space-y-2">
                  <label className="text-[11px] font-medium text-stone-300 block">
                    Kartınızı açmak ve damgalarınızı görmek için telefon numaranızı girin:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="0506 176 33 21"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/70 border border-stone-700 text-white font-mono text-sm placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FBE291] hover:brightness-110 text-black font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Kartımı Aç</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-[11px] text-red-400 font-medium">{errorMessage}</p>
                  )}
                </form>
              )}
            </div>

            {/* ============================================================== */}
            {/* 3. 6 YEŞİL HALKA + 1 ALTIN HEDİYE KUTUSU GÖRSEL ÇİZELGESİ      */}
            {/* ============================================================== */}
            <div className="mt-5 relative z-10 bg-black/50 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-3">
                <span className="text-stone-400">Ziyaret Damgaları:</span>
                <span className="text-[#FBE291]">
                  {currentStamps} / {maxStamps} Tamamlandı
                </span>
              </div>

              {/* 6 Circles Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {[...Array(maxStamps)].map((_, idx) => {
                  const stampNumber = idx + 1;
                  const isStamped = stampNumber <= currentStamps;
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all duration-300 ${
                        isStamped
                          ? "bg-emerald-950/50 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-102"
                          : "bg-stone-900/40 border-dashed border-stone-700 text-stone-500"
                      }`}
                    >
                      {isStamped ? (
                        <>
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-1 animate-bounce">
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-300">
                            {stampNumber}. Damga
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full border border-stone-700 flex items-center justify-center text-stone-500 font-mono font-bold text-xs mb-1">
                            {stampNumber}
                          </div>
                          <span className="text-[10px] font-mono text-stone-500">
                            Bekliyor
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 1 Altın Hediye Kutusu (7. Adım / Büyük Ödül) */}
              <div
                className={`mt-4 p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all ${
                  isUnlocked
                    ? "bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-amber-950/80 border-[#FBE291] shadow-[0_0_30px_rgba(251,226,145,0.4)] animate-pulse"
                    : "bg-stone-900/60 border-stone-800"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    isUnlocked
                      ? "bg-gradient-to-br from-[#D4AF37] via-[#FBE291] to-[#C8982B] text-black"
                      : "bg-stone-800 border border-stone-700 text-stone-500"
                  }`}
                >
                  <Gift className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-serif font-extrabold uppercase tracking-wide ${
                        isUnlocked ? "text-[#FBE291]" : "text-stone-400"
                      }`}
                    >
                      BÜYÜK HEDİYE: {settings.rewardItemName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#D4AF37]">
                      ₺{settings.rewardItemPrice}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                    {isUnlocked ? (
                      <strong className="text-emerald-300 font-bold block">
                        🎉 TEBRİKLER! Hediyeniz Açıldı! Kasada telefonunuzu belirterek ikramınızı talep ediniz.
                      </strong>
                    ) : (
                      <span>6 restoran ziyaretinizi tamamladığınızda hediye bonfileniz anında aktifleşir.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Visit History Log if available */}
            {member && member.visits && member.visits.length > 0 && (
              <div className="mt-4 relative z-10">
                <div className="text-[11px] font-mono font-bold text-stone-400 mb-1.5 flex items-center justify-between">
                  <span>Onaylanan Ziyaret Geçmişiniz:</span>
                  <span className="text-emerald-400">Döngü #{member.cycleCount || 1}</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono">
                  {member.visits.slice(-4).reverse().map((v, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-black/40 border border-stone-800 flex items-center justify-between text-stone-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{v.isRewardClaim ? "🎁 Hediye Teslimi" : `${v.visitIndex}. Ziyaret`}</span>
                      </span>
                      <span className="text-stone-400">{v.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Information Footer */}
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center gap-2 relative z-10">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                Nasıl damga kazanırım? Hesap öderken telefon numaranızı kasadaki personele söylemeniz yeterlidir.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

