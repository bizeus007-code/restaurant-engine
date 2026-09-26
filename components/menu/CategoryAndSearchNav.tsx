"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Camera } from "lucide-react";
import { MenuCategory } from "@/src/data/menu-data";

interface CategoryAndSearchNavProps {
  categories: MenuCategory[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyWithPhotos: boolean;
  onToggleOnlyPhotos: () => void;
  totalProductsCount: number;
}

export const CategoryAndSearchNav: React.FC<CategoryAndSearchNavProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onlyWithPhotos,
  onToggleOnlyPhotos,
  totalProductsCount,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected button into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector(
      `[data-category-slug="${selectedCategorySlug}"]`
    ) as HTMLElement | null;

    if (activeBtn) {
      const container = scrollContainerRef.current;
      const scrollLeft =
        activeBtn.offsetLeft -
        container.offsetWidth / 2 +
        activeBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selectedCategorySlug]);

  return (
    <div className="sticky top-16 z-30 bg-[#0F0F10]/95 backdrop-blur-xl border-y border-white/[0.07] py-3 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
        {/* SEARCH AND QUICK FILTER BAR */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Menüde lezzet veya içerik ara..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#18181A] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C88A58] focus:bg-[#202023] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Photo filter toggle */}
          <button
            type="button"
            onClick={onToggleOnlyPhotos}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
              onlyWithPhotos
                ? "bg-[#C88A58]/20 border-[#C88A58] text-[#E5A974]"
                : "bg-[#18181A] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20"
            }`}
            title="Sadece stüdyo fotoğraflı lezzetleri göster"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fotoğraflı Lezzetler</span>
            <span className="sm:hidden">Fotoğraflı</span>
          </button>
        </div>

        {/* CATEGORIES SCROLL LIST */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {/* TÜMÜ (ALL) */}
          <button
            type="button"
            data-category-slug="all"
            onClick={() => onSelectCategory("all")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              selectedCategorySlug === "all"
                ? "bg-[#C88A58] text-black font-semibold shadow-md shadow-[#C88A58]/20 scale-105"
                : "bg-[#18181A] text-white/70 hover:text-white hover:bg-[#222226] border border-white/[0.06]"
            }`}
          >
            <span>TÜM MENÜ</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategorySlug === "all"
                  ? "bg-black/25 text-black font-mono font-bold"
                  : "bg-white/[0.08] text-white/50 font-mono"
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* INDIVIDUAL CATEGORIES */}
          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                id={`cat-btn-${cat.slug}`}
                data-category-slug={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#C88A58] text-black font-semibold shadow-md shadow-[#C88A58]/20 scale-105"
                    : "bg-[#18181A] text-white/70 hover:text-white hover:bg-[#222226] border border-white/[0.06]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-black/25 text-black font-mono font-bold"
                      : "bg-white/[0.08] text-white/50 font-mono"
                  }`}
                >
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

