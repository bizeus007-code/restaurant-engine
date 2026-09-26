"use client";

import React from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { MenuItem } from "@/src/data/menu-data";

interface EditorialProductCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem, e: React.MouseEvent) => void;
  onClickCard: (item: MenuItem) => void;
  isOutOfStock?: boolean;
}

export const EditorialProductCard: React.FC<EditorialProductCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onClickCard,
  isOutOfStock = false,
}) => {
  const hasVerifiedImage = item.imageStatus === "verified" && !!item.localImage;
  const formattedPrice = item.price > 0 ? `₺${item.price.toLocaleString("tr-TR")}` : "Fiyat Sorunuz";

  return (
    <div
      onClick={() => !isOutOfStock && onClickCard(item)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#171719] border transition-all duration-300 overflow-hidden ${
        isOutOfStock
          ? "opacity-50 border-white/[0.04] cursor-not-allowed"
          : "border-white/[0.08] hover:border-[#C88A58]/50 hover:shadow-xl hover:shadow-[#C88A58]/10 cursor-pointer"
      }`}
    >
      {/* CARD TOP MEDIA AREA */}
      {hasVerifiedImage ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#101012]">
          <Image
            src={item.localImage!}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-black/20" />

          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-black/60 backdrop-blur-md text-[#DF9B66] border border-[#C88A58]/30">
              {item.category}
            </span>
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-950/80 text-red-300 border border-red-700/50">
                Tükendi
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ELEGANT TYPOGRAPHIC MONOGRAM / EDITORIAL CREST (No Fake Photos) */
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-[#1E1E22] via-[#171719] to-[#121214] flex flex-col items-center justify-center p-6 border-b border-white/[0.04]">
          {/* Background subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,138,88,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase font-semibold bg-white/[0.04] text-[#C88A58]/80 border border-white/[0.06]">
              {item.category}
            </span>
          </div>

          {/* Luxury Beroş Monogram Emblem */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-[#C88A58]/30 bg-[#121214]/90 shadow-inner mb-2 group-hover:border-[#C88A58]/70 group-hover:scale-105 transition-all duration-300">
            {/* Outer dotted orbit */}
            <div className="absolute inset-[-3px] rounded-full border border-dashed border-[#C88A58]/20 animate-[spin_40s_linear_infinite]" />
            <span className="text-xl font-serif font-bold text-[#E5A974] tracking-widest">
              B
            </span>
          </div>

          <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-white/40">
            BEROŞ • SUR
          </span>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-950/80 text-red-300 border border-red-700/50">
                Tükendi
              </span>
            </div>
          )}
        </div>
      )}

      {/* CARD CONTENT BODY */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-[#F6EFE9] group-hover:text-[#DF9B66] transition-colors leading-tight line-clamp-2">
            {item.name}
          </h3>

          {item.description ? (
            <p className="mt-1.5 text-xs text-white/50 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-white/30 italic">
              Geleneksel Sur taş fırınından taze sunum.
            </p>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-wider uppercase text-white/40">Fiyat</span>
            <span className="text-base sm:text-lg font-bold text-[#DF9B66] font-mono tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            id={`btn-add-to-cart-${item.id}`}
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(item, e);
            }}
            className={`relative inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              quantityInCart > 0
                ? "bg-[#C88A58] text-black font-semibold shadow-md shadow-[#C88A58]/20 hover:bg-[#DF9B66]"
                : "bg-white/[0.07] text-[#F6EFE9] hover:bg-[#C88A58] hover:text-black border border-white/[0.08] hover:border-[#C88A58]"
            } active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {quantityInCart > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{quantityInCart} Adet</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

