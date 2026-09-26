"use client";

import React from "react";
import Image from "next/image";
import { MenuItem } from "@/data/menu";

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function ProductCard({ item, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex flex-col justify-between bg-[#131416] border border-[#23262a] rounded-2xl overflow-hidden shadow-lg hover:border-[#383c42] transition-all">
      {/* Üst Görsel ve Rozetler */}
      <div className="relative w-full h-48 bg-[#1a1c20]">
        {item.image ? (
          <img
            alt={item.name}
            className="w-full h-full object-cover"
            src={item.image}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Rozetler: Pişirme/Özellik + Kalori */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {item.badge && (
            <span className="text-[11px] font-semibold tracking-wide bg-black/75 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              {item.badge}
            </span>
          )}
          <span className="text-[11px] font-semibold tracking-wide bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
            🔥 {item.calories} kcal
          </span>
        </div>
      </div>

      {/* Gövde Bilgileri */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-base leading-snug">
              {item.name}
            </h3>
            <span className="text-amber-400 font-extrabold text-base whitespace-nowrap">
              ₺{item.price}
            </span>
          </div>

          <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          
          <div className="text-[11px] text-zinc-500 font-medium mt-1">
            Gramaj: <span className="text-zinc-400">{item.weight}</span>
          </div>
        </div>

        {/* Alt Band: Alerjenler (Açık ve Doğrudan) + Doğrudan EKLE Butonu */}
        <div className="pt-3 border-t border-[#23262a] flex items-center justify-between gap-2">
          {/* Açık Alerjen Etiketleri */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold mr-0.5">Alerjen:</span>
            {item.allergens && item.allergens.length > 0 ? (
              item.allergens.map((alg) => {
                const isMantar = alg.toLowerCase().includes('mantar');
                return (
                  <span
                    key={alg}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isMantar
                        ? 'bg-amber-950/80 text-yellow-300 border border-yellow-500/60 font-semibold'
                        : 'bg-red-950/40 text-red-300 border border-red-800/40'
                    }`}
                  >
                    {isMantar ? '▲ Mantar' : alg}
                  </span>
                );
              })
            ) : (
              <span className="text-[10px] text-zinc-500">Bulunmuyor</span>
            )}
          </div>

          {/* Direkt Ekle Butonu */}
          <button
            onClick={() => onAddToCart(item)}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1"
          >
            <span>Ekle</span>
            <span className="text-base leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

