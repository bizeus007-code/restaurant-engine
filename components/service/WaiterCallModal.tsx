"use client";

import React, { useState, useEffect } from "react";
import { Bell, Receipt, X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { soundFx } from "@/src/utils/audio";

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNo: string;
  defaultTab?: "waiter" | "bill";
}

const COOLDOWN_SECONDS = 120; // 2 Dakika
const STORAGE_KEY = "beros_service_last_call_timestamp";

export const WaiterCallModal: React.FC<WaiterCallModalProps> = ({
  isOpen,
  onClose,
  tableNo,
  defaultTab = "waiter",
}) => {
  const [activeTab, setActiveTab] = useState<"waiter" | "bill">(defaultTab);
  const [paymentType, setPaymentType] = useState<"Kredi Kartı" | "Nakit">("Kredi Kartı");
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync tab with prop
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSuccessMessage(null);
    }
  }, [isOpen, defaultTab]);

  // Cooldown countdown timer
  useEffect(() => {
    const checkCooldown = () => {
      if (typeof window === "undefined") return;
      const lastCall = localStorage.getItem(STORAGE_KEY);
      if (lastCall) {
        const elapsed = Math.floor((Date.now() - parseInt(lastCall, 10)) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
        setRemainingCooldown(remaining);
      } else {
        setRemainingCooldown(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendCall = async (serviceType: "Garson" | "Hesap İste") => {
    if (remainingCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const typeLabel = serviceType === "Hesap İste" ? `Hesap (${paymentType})` : "Garson Çağrısı";
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNo,
          serviceType: typeLabel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundFx.playSuccessSound();
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
        }
        setRemainingCooldown(COOLDOWN_SECONDS);
        setSuccessMessage(
          serviceType === "Hesap İste"
            ? `Hesap talebiniz (${paymentType}) kasa ve servis görevlisine iletildi.`
            : "Garson çağrınız servis personeline iletildi. En kısa sürede masanıza gelinecektir."
        );
      } else {
        alert("Çağrı iletilemedi. Lütfen doğrudan personele sesleniniz.");
      }
    } catch {
      alert("Ağ hatası oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-[#18181A] border border-white/[0.1] rounded-3xl p-6 shadow-2xl z-10 space-y-5">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Masa Servis Talebi</h3>
            <span className="text-xs text-[#C88A58] font-mono">{tableNo}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-2 p-1 bg-[#121214] rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("waiter")}
            className={`py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "waiter"
                ? "bg-[#C88A58] text-black font-semibold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Garson Çağır</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bill")}
            className={`py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "bill"
                ? "bg-[#C88A58] text-black font-semibold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Hesap İste</span>
          </button>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-[#C88A58]/10 border border-[#C88A58]/30 flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#DF9B66] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/80 leading-relaxed">
              {successMessage}
            </div>
          </div>
        )}

        {/* COOLDOWN RATE-LIMIT ALERT */}
        {remainingCooldown > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 flex items-center gap-3 text-xs text-amber-200/90">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Yeni bir servis talebi göndermeden önce lütfen bekleyiniz:{" "}
              <strong className="font-mono text-amber-300">
                {remainingCooldown} sn
              </strong>
            </span>
          </div>
        )}

        {/* TAB BODY */}
        {activeTab === "waiter" ? (
          <div className="space-y-4">
            <p className="text-xs text-white/60 leading-relaxed">
              Masanıza servis personeli yönlendirilecektir. Su, ekmek, çatal-kaşık veya diğer talepleriniz için butona basabilirsiniz.
            </p>

            <button
              id="btn-call-waiter-submit"
              type="button"
              disabled={remainingCooldown > 0 || isSubmitting}
              onClick={() => handleSendCall("Garson")}
              className="w-full py-3.5 rounded-xl bg-[#C88A58] hover:bg-[#DF9B66] text-black font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#C88A58]/20"
            >
              <Bell className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "İletiliyor..."
                  : remainingCooldown > 0
                  ? `Bekleyiniz (${remainingCooldown}s)`
                  : "Garson Çağır"}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-white/60 leading-relaxed">
              Hesabınızı masanızda kapatmak için tercih ettiğiniz ödeme yöntemini seçiniz.
            </p>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("Kredi Kartı")}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentType === "Kredi Kartı"
                    ? "border-[#C88A58] bg-[#C88A58]/10 text-[#E5A974]"
                    : "border-white/[0.08] bg-[#121214] text-white/60 hover:text-white"
                }`}
              >
                <span>💳 Kredi Kartı / POS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("Nakit")}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentType === "Nakit"
                    ? "border-[#C88A58] bg-[#C88A58]/10 text-[#E5A974]"
                    : "border-white/[0.08] bg-[#121214] text-white/60 hover:text-white"
                }`}
              >
                <span>💵 Nakit</span>
              </button>
            </div>

            <button
              id="btn-request-bill-submit"
              type="button"
              disabled={remainingCooldown > 0 || isSubmitting}
              onClick={() => handleSendCall("Hesap İste")}
              className="w-full py-3.5 rounded-xl bg-[#C88A58] hover:bg-[#DF9B66] text-black font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#C88A58]/20"
            >
              <Receipt className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "İletiliyor..."
                  : remainingCooldown > 0
                  ? `Bekleyiniz (${remainingCooldown}s)`
                  : `Hesap İste (${paymentType})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

