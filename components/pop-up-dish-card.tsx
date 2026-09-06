"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Box,
  Plus,
  Heart,
  Clock,
  Rotate3d,
  Play,
  Pause,
} from "lucide-react";
import SteamEffect from "@/components/steam-effect";
import { type Dish } from "@/components/ar-spatial-viewer";

interface PopUpDishCardProps {
  dish: Dish;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectDish: (dish: Dish) => void;
  onOpenAr: (dish: Dish, e: React.MouseEvent) => void;
  onAddToCart: (dish: Dish, e: React.MouseEvent) => void;
  playSound: (freq?: number, type?: OscillatorType, duration?: number) => void;
}

export function PopUpDishCard({
  dish,
  index,
  isFavorite,
  onToggleFavorite,
  onSelectDish,
  onOpenAr,
  onAddToCart,
  playSound,
}: PopUpDishCardProps) {
  // 360° Interactive Rotation
  const [rotateY, setRotateY] = useState(15 + (index % 4) * 15);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(index === 0); // Hero signature default video
  const lastXRef = useRef(0);

  const isBluePlate = dish.id === "beros-imza-tandir";
  const isPizza = dish.id === "tas-firin-pizza";

  // Auto-spin loop
  useEffect(() => {
    if (!isAutoSpin || isDragging) return;
    const timer = setInterval(() => {
      setRotateY((prev) => (prev + 1.2) % 360);
    }, 30);
    return () => clearInterval(timer);
  }, [isAutoSpin, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setIsAutoSpin(false);
    lastXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    setRotateY((prev) => (prev + deltaX * 0.9) % 360);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Sine wave duration for natural organic rhythm
  const floatDuration = 4.2 + (index % 3) * 0.6;

  return (
    <div
      className="relative pt-24 pb-4 px-2 select-none overflow-visible"
      style={{ perspective: "1200px" }}
    >
      {/* 3D TILTED BASE PEDESTAL (Masa Perspektifi Veren Zemin Kartı) */}
      <motion.div
        whileHover={{
          y: -4,
          transition: { duration: 0.25 },
        }}
        whileTap={{
          scale: 0.985,
          transition: { duration: 0.1 },
        }}
        onClick={() => {
          playSound(520, "sine", 0.15);
          onSelectDish(dish);
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(8deg)",
        }}
        className={`relative rounded-[2rem] bg-gradient-to-b from-[#1c1917] via-[#161413] to-[#0c0a09] border ${
          isBluePlate
            ? "border-blue-500/50 shadow-[0_20px_50px_rgba(30,64,175,0.3)]"
            : "border-white/[0.09] hover:border-[#d4af37]/45 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        } pt-24 pb-5 px-5 cursor-pointer transition-colors duration-300 overflow-visible`}
      >
        {/* Subtle Luxury Card Perimeter Reflection & Texture */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        <div className="absolute -inset-px rounded-[2rem] border border-amber-500/10 pointer-events-none" />

        {/* --- FLOATING 3D POP-UP DISH CONTAINER (KARTIN DIŞINA FIRLAYAN TABAK) --- */}
        <div
          className="absolute -top-24 left-0 right-0 flex items-center justify-center overflow-visible z-20 pointer-events-auto"
          style={{ transformStyle: "preserve-3d" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* DİNAMİK SENKRONİZE TABAN GÖLGESİ (Floating Shadow) */}
          <motion.div
            animate={{
              scale: [1, 0.72, 1],
              opacity: [0.75, 0.28, 0.75],
            }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-28 w-44 h-12 rounded-full pointer-events-none blur-md"
            style={{
              background: isBluePlate
                ? "radial-gradient(ellipse at center, rgba(30,64,175,0.55) 0%, rgba(0,0,0,0.85) 55%, transparent 80%)"
                : "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, transparent 80%)",
            }}
          />

          {/* SİNÜS DALGASI SÜZÜLME & 360° 3D DÖNÜŞ (The Popping Out Plate) */}
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotateY}deg) rotateX(16deg)`,
            }}
            className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75"
          >
            {/* CANLI YÜKSELEN SICAK BUHAR KATMANI (Rising Steam) */}
            <SteamEffect intensity={isBluePlate || isPizza ? "high" : "medium"} />

            {/* DIŞ TABAK GÖVDESİ (Mavi Otantik Sırlı Çini / Taş Fırın Ahşap Bordür) */}
            <div
              className={`w-full h-full rounded-full p-2.5 relative flex items-center justify-center shadow-2xl transition-all ${
                isBluePlate
                  ? "bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] border-4 border-[#d4af37]"
                  : isPizza
                  ? "bg-gradient-to-tr from-[#78350f] via-[#92400e] to-[#b45309] border-4 border-amber-600/70"
                  : "bg-gradient-to-tr from-[#262626] via-[#1c1917] to-[#171717] border-2 border-[#d4af37]/45"
              }`}
              style={{
                boxShadow: isBluePlate
                  ? "0 15px 45px rgba(30,64,175,0.5), inset 0 0 25px rgba(212,175,55,0.3)"
                  : "0 15px 45px rgba(0,0,0,0.9), inset 0 0 15px rgba(212,175,55,0.2)",
              }}
            >
              {/* Çini ve Yaldız Halka Detayları */}
              <div className="absolute inset-2.5 rounded-full border border-white/20 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-[#d4af37]/35 pointer-events-none" />

              {/* Tabağın İç Görseli (Video veya 2D Resim) */}
              <div className="w-[84%] h-[84%] rounded-full overflow-hidden relative shadow-inner bg-black flex items-center justify-center">
                {isVideoPlaying ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={dish.posterUrl}
                    className="w-full h-full object-cover scale-110"
                  />
                ) : (
                  <img
                    src={dish.posterUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover scale-110"
                  />
                )}

                {/* Sırlı Parlama & Isı Gradienti */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 pointer-events-none" />
              </div>

              {/* Mavi Otantik / Taş Fırın Mini Rozeti */}
              {isBluePlate && (
                <div
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-950/95 border border-[#d4af37] text-[9px] font-mono text-[#fef08a] shadow-xl flex items-center gap-1 whitespace-nowrap"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                  Mavi Otantik Tabak
                </div>
              )}

              {isPizza && (
                <div
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-950/95 border border-amber-400 text-[9px] font-mono text-amber-200 shadow-xl flex items-center gap-1 whitespace-nowrap"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Taş Fırın Odun Ateşi
                </div>
              )}
            </div>
          </motion.div>

          {/* DÖNDÜR (360° Auto-Spin) & CANLI VİDEO DUMAN KONTROLLERİ */}
          <div className="absolute top-0 right-2 flex flex-col gap-1.5 z-30">
            {/* 360° Otomatik Dönüş Butonu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSound(600, "sine", 0.1);
                setIsAutoSpin(!isAutoSpin);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all ${
                isAutoSpin
                  ? "bg-[#d4af37] border-[#d4af37] text-black font-bold animate-spin"
                  : "bg-black/60 border-white/20 text-white/80 hover:text-white"
              }`}
              style={{ animationDuration: "6s" }}
              title={isAutoSpin ? "Dönüşü Durdur" : "360° Döndür"}
            >
              <Rotate3d className="w-3.5 h-3.5" />
            </button>

            {/* Canlı Duman / Video Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSound(700, "sine", 0.1);
                setIsVideoPlaying(!isVideoPlaying);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all ${
                isVideoPlaying
                  ? "bg-amber-500 border-amber-400 text-black font-bold"
                  : "bg-black/60 border-white/20 text-white/80 hover:text-white"
              }`}
              title={isVideoPlaying ? "Statik Fotoğraf" : "Canlı Dumanlı Video"}
            >
              {isVideoPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
            </button>
          </div>

          {/* Favori Butonu */}
          <button
            onClick={(e) => onToggleFavorite(dish.id, e)}
            className={`absolute top-0 left-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all z-30 ${
              isFavorite
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-black/60 border-white/20 text-white/80 hover:text-white"
            }`}
            aria-label="Favorilere Ekle"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-400" : ""}`} />
          </button>
        </div>

        {/* --- KART METİN VE DETAY ALANI (ZEMİN ÜZERİNDE) --- */}
        <div className="relative z-10 pt-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/25">
              {dish.category}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <Clock className="w-3 h-3 text-[#d4af37]" />
              {dish.prepTime.split("•")[0]}
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-[#d4af37] transition-colors line-clamp-1 font-serif">
            {dish.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {dish.subtitle}
          </p>

          {/* Alt Eylem Barı: Fiyat, 3D Masada Gör ve Sipariş */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">
                Fiyat
              </span>
              <span className="text-base font-bold text-[#d4af37] font-mono">
                {dish.price}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onOpenAr(dish, e)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] text-zinc-200 flex items-center gap-1 transition-colors"
                title="3D Spatial AR"
              >
                <Box className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">3D</span> Masada Gör
              </button>

              <button
                onClick={(e) => onAddToCart(dish, e)}
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black hover:brightness-110 flex items-center justify-center font-bold shadow-md active:scale-95 transition-all"
                title="Siparişe Ekle"
                aria-label="Siparişe Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

