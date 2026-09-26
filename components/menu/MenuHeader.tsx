"use client";

import React, { useState } from "react";
import {
  Bell,
  Receipt,
  ShoppingBag,
  Wifi,
  Globe,
  Copy,
  Check,
  X,
  Phone,
} from "lucide-react";
import { RESTAURANT_METADATA } from "@/src/data/menu-data";

interface MenuHeaderProps {
  tableNo: string;
  cartCount: number;
  onOpenCart: () => void;
  onOpenService: (tab: "waiter" | "bill") => void;
  lang: "TR" | "EN";
  onToggleLang: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  tableNo,
  cartCount,
  onOpenCart,
  onOpenService,
  lang,
  onToggleLang,
}) => {
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const handleCopyWifi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(RESTAURANT_METADATA.wifiPass);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0F0F10]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* BRAND & TABLE BADGE */}
          <div className="flex items-center gap-3">
            <a href="#hero-section" className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-serif font-black tracking-widest text-[#F6EFE9]">
                  BEROŞ
                </span>
                <span className="hidden sm:inline text-[9px] uppercase tracking-[0.25em] font-mono text-[#C88A58] border-l border-white/20 pl-2">
                  SUR / DİYARBAKIR
                </span>
              </div>
              <span className="text-[10px] text-white/40 tracking-wider hidden xs:inline">
                1982'den Beri Asırlık Lezzet
              </span>
            </a>

            {/* Live Table Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A1D] border border-[#C88A58]/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DF9B66] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C88A58]" />
              </span>
              <span className="text-xs font-mono font-bold text-[#E5A974] tracking-wider">
                {tableNo}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Wi-Fi Action */}
            <button
              type="button"
              onClick={() => setIsWifiModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white/70 hover:text-white border border-white/[0.06] transition-all"
              title="Misafir Wi-Fi Bilgileri"
            >
              <Wifi className="w-3.5 h-3.5 text-[#C88A58]" />
              <span>Wi-Fi</span>
            </button>

            {/* Garson Çağır */}
            <button
              id="btn-call-waiter"
              type="button"
              onClick={() => onOpenService("waiter")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#C88A58]/20 text-xs font-medium text-white/80 hover:text-[#DF9B66] border border-white/[0.08] hover:border-[#C88A58]/40 transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-[#C88A58]" />
              <span className="hidden sm:inline">Garson</span>
            </button>

            {/* Hesap İste */}
            <button
              id="btn-request-bill"
              type="button"
              onClick={() => onOpenService("bill")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#C88A58]/20 text-xs font-medium text-white/80 hover:text-[#DF9B66] border border-white/[0.08] hover:border-[#C88A58]/40 transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-[#C88A58]" />
              <span className="hidden sm:inline">Hesap</span>
            </button>

            {/* Dil Değiştir */}
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono font-bold text-white/70 hover:text-white border border-white/[0.06] transition-all"
              title="Dili Değiştir (TR / EN)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </button>

            {/* Sepet Butonu */}
            <button
              id="btn-open-cart-header"
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center justify-center p-2 rounded-xl bg-[#C88A58] hover:bg-[#DF9B66] text-black transition-all shadow-md shadow-[#C88A58]/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[#C88A58]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* WI-FI MODAL */}
      {isWifiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsWifiModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm bg-[#18181A] border border-white/[0.1] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-[#C88A58]" />
                <h3 className="text-base font-bold text-white">
                  Misafir Wi-Fi Ağı
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWifiModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#121214] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-white/40 uppercase tracking-wider text-[10px] block">
                    Ağ Adı (SSID)
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {RESTAURANT_METADATA.wifiName}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-white/40 uppercase tracking-wider text-[10px] block">
                    Şifre
                  </span>
                  <span className="font-mono font-bold text-[#E5A974] text-sm">
                    {RESTAURANT_METADATA.wifiPass}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedWifi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/40 text-center">
              Konağımızda keyifli vakit geçirmenizi dileriz.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

