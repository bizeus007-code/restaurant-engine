"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { MenuItem } from "@/src/data/menu-data";
import { soundFx } from "@/src/utils/audio";

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
}

interface StickyCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cart: CartItem[];
  tableNo: string;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const StickyCartDrawer: React.FC<StickyCartDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  cart,
  tableNo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const [generalNote, setGeneralNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    time: string;
    totalAmount: number;
  } | null>(null);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        tableNo,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          note: item.note || generalNote || undefined,
        })),
        totalAmount,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        soundFx.playSuccessSound();
        setSubmittedOrder({
          id: data.order.id,
          time: data.order.time || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          totalAmount,
        });
        onOrderSuccess(data.order.id);
        onClearCart();
      } else {
        alert("Sipariş iletilirken bir sorun oluştu. Lütfen garson çağırınız.");
      }
    } catch {
      alert("Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* FLOATING STICKY BAR (MOBILE & DESKTOP) */}
      {totalItemsCount > 0 && !isOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 animate-in slide-in-from-bottom-6 duration-300">
          <button
            id="btn-open-cart-floating"
            type="button"
            onClick={onOpen}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#C88A58] to-[#DF9B66] text-black font-semibold shadow-2xl shadow-[#C88A58]/30 flex items-center justify-between sm:gap-6 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-bold">
                {totalItemsCount}
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider font-bold opacity-80 leading-none">
                  {tableNo} • Sepetiniz
                </div>
                <div className="text-base font-bold font-mono leading-tight mt-0.5">
                  ₺{totalAmount.toLocaleString("tr-TR")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pl-4 border-l border-black/15">
              <span>Siparişi Gör</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* SLIDE-OVER CART DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

          <div className="relative w-full max-w-md h-full bg-[#161618] border-l border-white/[0.08] shadow-2xl z-10 flex flex-col justify-between">
            {/* DRAWER HEADER */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#121214]">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C88A58]" />
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Sipariş Sepeti
                  </h2>
                </div>
                <span className="text-xs text-[#C88A58] font-mono font-medium">
                  {tableNo} • Canlı Masaya Servis
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DRAWER BODY */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* If an order was just placed, display confirmation banner */}
              {submittedOrder && (
                <div className="p-4 rounded-2xl bg-[#C88A58]/10 border border-[#C88A58]/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#DF9B66]">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-semibold">
                      Siparişiniz Mutfağa İletildi!
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Sipariş No: <span className="font-mono text-white font-bold">{submittedOrder.id}</span> ({submittedOrder.time}).
                    Taş fırın ve ocakbaşı ekibimiz hazırlığa başladı.
                  </p>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-white/40 space-y-3">
                  <ChefHat className="w-12 h-12 stroke-[1.2] text-[#C88A58]/40" />
                  <p className="text-sm">Sepetinizde henüz lezzet bulunmuyor.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-[#DF9B66] font-medium border border-white/[0.08]"
                  >
                    Menüden Lezzet Seç
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[#1A1A1D] border border-white/[0.06] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-[#F6EFE9] leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-xs font-mono text-white/50">
                              {item.price > 0 ? `₺${item.price} x ${item.quantity}` : "İkram"}
                            </span>
                          </div>

                          <span className="text-sm font-bold font-mono text-[#DF9B66]">
                            {lineTotal > 0 ? `₺${lineTotal.toLocaleString("tr-TR")}` : "₺0"}
                          </span>
                        </div>

                        {item.note && (
                          <div className="text-[11px] text-[#C88A58] bg-black/30 px-2 py-1 rounded-md border border-[#C88A58]/20 italic">
                            Not: {item.note}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-white/30 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>

                          {/* Increment / Decrement */}
                          <div className="flex items-center gap-2 bg-[#121214] border border-white/[0.08] rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-mono text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Genel Masa Notu */}
                  <div className="pt-2">
                    <label className="text-xs font-medium text-white/60 block mb-1">
                      Masa Sipariş Notu (Opsiyonel)
                    </label>
                    <textarea
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      rows={2}
                      placeholder="Mutfak ve servis için genel notunuz..."
                      className="w-full px-3 py-2 rounded-xl bg-[#101012] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C88A58]"
                      maxLength={160}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DRAWER FOOTER & SUBMIT */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/[0.08] bg-[#121214] space-y-4">
                <div className="space-y-1.5 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span className="font-mono text-white">₺{totalAmount.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Masa Servis Ücreti</span>
                    <span className="font-mono text-[#C88A58]">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/[0.08]">
                    <span>Genel Toplam</span>
                    <span className="font-mono text-[#DF9B66]">₺{totalAmount.toLocaleString("tr-TR")}</span>
                  </div>
                </div>

                <button
                  id="btn-submit-order"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C88A58] hover:bg-[#DF9B66] text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C88A58]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>
                    {isSubmitting ? "Mutfağa İletiliyor..." : "Siparişi Mutfağa İlet"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

