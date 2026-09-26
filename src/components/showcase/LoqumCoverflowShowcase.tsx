"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, ChevronLeft, ChevronRight, Award, Plus, Info } from "lucide-react";
import { RESTAURANT_CONFIG } from "@/src/config/restaurant.config";

export interface SignatureDishItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  priceText: string;
  priceNumber: number;
  desc: string;
  agingDays?: string;
  img: string;
  allergens?: string[];
  prepTime?: string;
  calories?: number;
  options?: { name: string; choices: string[] }[];
}

export const LOQUM_SIGNATURE_ITEMS: SignatureDishItem[] = [
  {
    id: "st-01",
    tag: "#28GünDryAged",
    title: "TOMAHAWK STEAK",
    subtitle: "HİMALAYA TUZ ODASINDA DİNLENDİRİLMİŞ",
    priceText: "₺1.850",
    priceNumber: 1850,
    desc: "28 gün dinlendirilmiş kemikli antrikot, deniz tuzu pulları ve taze biberiye.",
    agingDays: "28 Gün Kuru Dinlendirme",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80",
    prepTime: "25 dk",
    calories: 1450,
    options: [
      {
        name: "Pişme Derecesi",
        choices: ["Az Pişmiş (Rare)", "Orta Az (Medium Rare)", "Orta (Medium)", "Orta İyi (Medium Well)", "İyi Pişmiş (Well Done)"]
      }
    ]
  },
  {
    id: "st-02",
    tag: "#DökümMühür",
    title: "LOQUM BONFİLE",
    subtitle: "TEREYAĞI BANYOSU İLE MÜHÜRLENMİŞ",
    priceText: "₺920",
    priceNumber: 920,
    desc: "Döküm tavada tereyağı banyosu ile mühürlenmiş lokum bonfile dilimleri.",
    agingDays: "Özel Dinlendirilmiş",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    prepTime: "15 dk",
    calories: 580,
    options: [
      {
        name: "Pişme Derecesi",
        choices: ["Az Pişmiş", "Orta Az", "Orta Pişmiş", "Orta İyi", "İyi Pişmiş"]
      }
    ]
  },
  {
    id: "st-03",
    tag: "#MermersiYağ",
    title: "DALLAS STEAK",
    subtitle: "KÖMÜR IZGARA MERMER DOKUSU",
    priceText: "₺1.100",
    priceNumber: 1100,
    desc: "Yüksek mermersi yağ dokusu, kömür ızgara deseni ve 24 gün kuru dinlendirme lezzeti.",
    agingDays: "24 Gün Kuru Dinlendirme",
    img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&auto=format&fit=crop&q=80",
    prepTime: "20 dk",
    calories: 920,
    options: [
      {
        name: "Pişme Derecesi",
        choices: ["Orta Az", "Orta", "Orta İyi"]
      }
    ]
  },
  {
    id: "tv-01",
    tag: "#SurGeleneği",
    title: "DİYARBAKIR SAÇ TAVA",
    subtitle: "YÖRESEL KUZU KUŞBAŞI & KUYRUK YAĞI",
    priceText: "₺580",
    priceNumber: 580,
    desc: "Yöresel kuzu kuşbaşı, közlenmiş sivri biber, domates ve kuyruk yağı dengesi.",
    agingDays: "Taş Fırın & Sac",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    prepTime: "16 dk",
    calories: 790
  }
];

interface LoqumCoverflowShowcaseProps {
  onSelectItem?: (item: SignatureDishItem) => void;
  className?: string;
}

export default function LoqumCoverflowShowcase({
  onSelectItem,
  className = ""
}: LoqumCoverflowShowcaseProps) {
  // Two-pass hydration guarantee
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Parallax & Scroll listener (requestAnimationFrame throttled + passive: true)
  useEffect(() => {
    if (!isClient) return;
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isClient]);

  // Three.js Stage Setup for Active Dish with IntersectionObserver optimization
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animFrame: number = 0;
    let observer: IntersectionObserver | null = null;
    let isVisible = true;

    try {
      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.set(0, 2.5, 5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      // Sınır: Math.min(window.devicePixelRatio, 1.5) (aşırı GPU yükünü ve ısınmayı kes)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Atmospheric Lighting (Warm ember & luxury gold)
      const ambientLight = new THREE.AmbientLight(0xfff0e0, 0.8);
      scene.add(ambientLight);

      const goldSpot = new THREE.SpotLight(0xd4af37, 2.5);
      goldSpot.position.set(3, 5, 4);
      goldSpot.angle = Math.PI / 4;
      goldSpot.penumbra = 0.5;
      scene.add(goldSpot);

      const emberSpot = new THREE.PointLight(0x8b0000, 3, 10);
      emberSpot.position.set(-3, -1, 2);
      scene.add(emberSpot);

      // Rotating Cast-Iron Pedestal / Plate Mesh
      const plateGroup = new THREE.Group();
      scene.add(plateGroup);

      // Base cast iron rim
      const cylinderGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.15, 48);
      const castIronMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.85,
        roughness: 0.35
      });
      const basePlate = new THREE.Mesh(cylinderGeo, castIronMat);
      plateGroup.add(basePlate);

      // Outer gold inlay ring
      const ringGeo = new THREE.TorusGeometry(1.65, 0.03, 16, 64);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.2
      });
      const goldRing = new THREE.Mesh(ringGeo, goldMat);
      goldRing.rotation.x = Math.PI / 2;
      goldRing.position.y = 0.08;
      plateGroup.add(goldRing);

      // Sizzling sparks / warm particle cloud
      const particleCount = 40;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 3;
        posArray[i + 1] = Math.random() * 1.5;
        posArray[i + 2] = (Math.random() - 0.5) * 3;
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xffaa33,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Animation loop (Viewport dışındayken render döngüsünü durdur)
      let time = 0;
      const animate = () => {
        if (!isVisible) {
          animFrame = 0;
          return;
        }

        time += 0.015;
        plateGroup.rotation.y = time * 0.4 + (scrollProgress - 0.5) * 0.8;
        plateGroup.position.y = Math.sin(time) * 0.05;

        // Camera gentle swing with scroll depth
        camera.position.x = Math.sin(time * 0.2) * 0.3;
        camera.position.y = 2.2 + Math.cos(scrollProgress * Math.PI) * 0.4;
        camera.lookAt(0, 0.1, 0);

        // Sparkle float
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += 0.008;
          if (positions[i] > 1.8) positions[i] = 0.1;
        }
        particleGeo.attributes.position.needsUpdate = true;

        if (renderer) renderer.render(scene, camera);
        animFrame = requestAnimationFrame(animate);
      };

      // IntersectionObserver: Viewport dışındayken GPU döngüsünü askıya al
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        isVisible = entry ? entry.isIntersecting : false;
        if (isVisible && !animFrame) {
          animFrame = requestAnimationFrame(animate);
        } else if (!isVisible && animFrame) {
          cancelAnimationFrame(animFrame);
          animFrame = 0;
        }
      }, { threshold: 0.05 });

      observer.observe(canvas);
      animFrame = requestAnimationFrame(animate);
    } catch {
      setHasWebGL(false);
    }

    return () => {
      if (observer) observer.disconnect();
      if (animFrame) cancelAnimationFrame(animFrame);
      if (renderer) renderer.dispose();
    };
  }, [isClient, scrollProgress]);

  // Touch handlers with touch-action: pan-y protection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;

    // Only swipe if horizontal motion exceeds vertical motion
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        nextDish();
      } else {
        prevDish();
      }
    }
  };

  const nextDish = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % LOQUM_SIGNATURE_ITEMS.length);
  }, []);

  const prevDish = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + LOQUM_SIGNATURE_ITEMS.length) % LOQUM_SIGNATURE_ITEMS.length);
  }, []);

  const currentDish = LOQUM_SIGNATURE_ITEMS[currentIndex];

  if (!isClient) {
    // Two-pass SSR fallback
    return (
      <div className={`w-full py-12 bg-[#0D0D0D] flex items-center justify-center min-h-[460px] ${className}`}>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-mono text-xs uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4 text-[#8B0000] animate-pulse" />
            Loqum Et 3D İmza Vitrini
          </div>
          <h3 className="text-xl text-white font-serif tracking-wide">Yükleniyor...</h3>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-gradient-to-b from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] py-14 select-none ${className}`}
      style={{ touchAction: "pan-y" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Decorative Embers */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8B0000] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#D4AF37] rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header Banner */}
      <div className="relative max-w-6xl mx-auto px-4 text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E1C14]/80 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase backdrop-blur-md mb-3">
          <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
          28 Gün Dry-Aged & Döküm Ateşi
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight">
          Şefin İmza Lezzetleri
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl mx-auto mt-2 font-sans">
          Loqum Et ustalarının özel kuru dinlendirilmiş etleri ve kadim Diyarbakır fırın gelenekleri.
        </p>
      </div>

      {/* 3D Showcase Interactive Stage */}
      <div className="relative max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 min-h-[420px]">
        {/* Left / Center 3D Stage with Canvas or Perspective Dish */}
        <div 
          className="relative w-full max-w-[380px] h-[340px] flex items-center justify-center touch-pan-y"
          style={{ touchAction: "pan-y" }}
        >
          {/* WebGL Canvas Background Pedestal */}
          {hasWebGL && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0 touch-pan-y"
              style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
            />
          )}

          {/* Dish Dynamic Card Float */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDish.id}
              initial={{ opacity: 0, scale: 0.85, y: 20, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20, rotateY: 15 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative z-10 w-[280px] h-[280px] rounded-full p-2 bg-gradient-to-br from-[#D4AF37]/40 via-transparent to-[#8B0000]/40 shadow-[0_0_50px_rgba(139,0,0,0.35)]"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl group">
                <img
                  src={currentDish.img}
                  alt={currentDish.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                {/* Aging Tag Badge */}
                {currentDish.agingDays && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/80 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-lg">
                    {currentDish.agingDays}
                  </div>
                )}

                {/* Sizzle Glow overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000]/90 text-white text-xs font-bold shadow-lg">
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>{currentDish.priceText}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Info Box */}
        <div className="relative z-10 w-full md:w-[420px] flex flex-col justify-center text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDish.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-[#1A1A1A]/90 border border-[#2E1C14] rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              {/* Subtle top ember line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]" />

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                  {currentDish.tag}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {currentIndex + 1} / {LOQUM_SIGNATURE_ITEMS.length}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                {currentDish.title}
              </h3>
              <p className="text-xs font-medium text-amber-200/80 mb-3 tracking-wide">
                {currentDish.subtitle}
              </p>

              <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                {currentDish.desc}
              </p>

              {/* Specs Pill Grid */}
              <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-neutral-300">
                {currentDish.prepTime && (
                  <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1">
                    <span className="text-neutral-500">Hazırlanış:</span>
                    <span className="font-semibold text-white">{currentDish.prepTime}</span>
                  </div>
                )}
                {currentDish.calories && (
                  <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1">
                    <span className="text-neutral-500">Kalori:</span>
                    <span className="font-semibold text-white">{currentDish.calories} kcal</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectItem && onSelectItem(currentDish)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#B22222] hover:from-[#B22222] hover:to-[#8B0000] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#8B0000]/30 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Siparişe İncele & Ekle</span>
                  <span className="ml-auto font-bold text-amber-200">{currentDish.priceText}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-1.5">
              {LOQUM_SIGNATURE_ITEMS.map((dish, idx) => (
                <button
                  key={dish.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-8 bg-[#D4AF37]"
                      : "w-2 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevDish}
                className="w-9 h-9 rounded-full bg-black/60 border border-neutral-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/50 flex items-center justify-center transition-colors active:scale-95"
                aria-label="Önceki"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextDish}
                className="w-9 h-9 rounded-full bg-black/60 border border-neutral-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/50 flex items-center justify-center transition-colors active:scale-95"
                aria-label="Sonraki"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

