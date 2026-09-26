"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Info } from "lucide-react";
import { MenuItem } from "@/src/data/menu-data";

interface ProductDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCartWithNote: (item: MenuItem, quantity: number, note: string) => void;
  quantityInCart?: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  onAddToCartWithNote,
  quantityInCart = 0,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (item) {
      setQuantity(quantityInCart > 0 ? quantityInCart : 1);
      setNote("");
    }
  }, [item, quantityInCart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const hasVerifiedImage = item.imageStatus === "verified" && !!item.localImage;
  const totalPrice = item.price * quantity;
  const formattedUnitPrice = item.price > 0 ? `₺${item.price.toLocaleString("tr-TR")}` : "Fiyat Sorunuz";
  const formattedTotalPrice = totalPrice > 0 ? `₺${totalPrice.toLocaleString("tr-TR")}` : "Fiyat Sorunuz";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#18181A] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* IMAGE / MONOGRAM HEADER */}
        {hasVerifiedImage ? (
          <div className="relative aspect-[16/10] w-full bg-[#101012] flex-shrink-0">
            <Image
              src={item.localImage!}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181A] via-transparent to-black/30" />
            <div className="absolute bottom-3 left-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-black/70 backdrop-blur-md text-[#DF9B66] border border-[#C88A58]/30">
                {item.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-44 w-full bg-gradient-to-b from-[#202024] to-[#18181A] flex flex-col items-center justify-center p-6 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center justify-center w-16 h-16 rounded-full border border-[#C88A58]/40 bg-[#121214] shadow-inner mb-2">
              <span className="text-2xl font-serif font-bold text-[#E5A974]">B</span>
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-white/40">
              BEROŞ RESTAURANT • DİYARBAKIR
            </span>
            <span className="mt-1 text-xs text-[#C88A58]/80 font-medium">
              {item.category}
            </span>
          </div>
        )}

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F6EFE9] leading-snug">
                {item.name}
              </h2>
              <span className="text-xl sm:text-2xl font-bold text-[#DF9B66] font-mono whitespace-nowrap">
                {formattedUnitPrice}
              </span>
            </div>

            {item.description ? (
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                {item.description}
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/40 italic">
                Beroş'un usta şefleri tarafından geleneksel Diyarbakır mutfağı usulünce hazırlanmaktadır.
              </p>
            )}
          </div>

          {/* SİPARİŞ NOTU EKLE */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#C88A58]" />
              Sipariş Notu / Özel İstek (Opsiyonel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Az acılı, soğansız, iyi pişmiş..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101012] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C88A58] transition-colors"
              maxLength={120}
            />
          </div>

          {/* QUANTITY PICKER & ADD ACTION */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            {/* Counter */}
            <div className="flex items-center justify-between w-full sm:w-auto rounded-xl bg-[#101012] border border-white/[0.1] p-1 gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center transition-colors disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-white text-base">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Submit Button */}
            <button
              id={`btn-modal-add-${item.id}`}
              type="button"
              onClick={() => {
                onAddToCartWithNote(item, quantity, note);
                onClose();
              }}
              className="w-full flex-1 py-3 px-5 rounded-xl bg-[#C88A58] hover:bg-[#DF9B66] text-black font-semibold flex items-center justify-between transition-all duration-200 shadow-lg shadow-[#C88A58]/20 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Sepete Ekle</span>
              </div>
              <span className="font-mono font-bold">
                {formattedTotalPrice}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

