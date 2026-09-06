"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  X,
  RotateCcw,
  Camera,
  Layers,
  Flame,
  Compass,
} from "lucide-react";

export interface Dish {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  frenchTitle: string;
  price: string;
  priceNum: number;
  calories: string;
  portion: string;
  prepTime: string;
  temperature: string;
  chefNote: string;
  allergens: string[];
  videoUrl: string;
  posterUrl: string;
  ingredients: string[];
  modelLayers: {
    name: string;
    description: string;
    color: string;
    offsetY: number;
  }[];
}

interface ArSpatialViewerProps {
  dish: Dish;
  onClose: () => void;
}

export function ArSpatialViewer({ dish, onClose }: ArSpatialViewerProps) {
  const [rotateX, setRotateX] = useState(15);
  const [rotateY, setRotateY] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodedView, setExplodedView] = useState(false);
  const [thermalView, setThermalView] = useState(false);
  const [arCameraMode, setArCameraMode] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Auto rotation loop when not dragging
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotateY((prev) => (prev + 0.8) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const [cameraWarning, setCameraWarning] = useState<string | null>(null);

  const toggleCameraMode = () => {
    if (!arCameraMode) {
      if (
        typeof window !== "undefined" &&
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
      ) {
        setCameraWarning("Kamera ve AR görünümü güvenli bağlantı (HTTPS) gerektirir.");
        setTimeout(() => setCameraWarning(null), 4000);
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraWarning("Cihazınızda kamera erişimi desteklenmiyor.");
        setTimeout(() => setCameraWarning(null), 4000);
        return;
      }

      setArCameraMode(true);
    } else {
      setArCameraMode(false);
    }
  };

  // Handle AR Camera stream
  useEffect(() => {
    if (arCameraMode) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setCameraWarning("Kamera izni alınamadı veya reddedildi.");
          setArCameraMode(false);
        });
    } else {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    }
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [arCameraMode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotateY((prev) => prev + deltaX * 0.7);
    setRotateX((prev) => Math.max(-45, Math.min(65, prev - deltaY * 0.7)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#070709]/95 backdrop-blur-2xl text-white select-none overflow-hidden"
      onPointerUp={handlePointerUp}
    >
      {/* Real Camera Background in AR Mode */}
      {arCameraMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        />
      )}

      {/* Camera Warning Banner */}
      {cameraWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs text-center shadow-xl">
          {cameraWarning}
        </div>
      )}

      {/* Top Bar with Status and Close */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37]">
                Spatial 3D Model • AR Engine
              </span>
              <span className="bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f] text-[9px] px-2 py-0.5 rounded-full">
                Zero-G
              </span>
            </div>
            <h2 className="text-base font-medium tracking-tight text-white/90">
              {dish.name}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-95"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3D Viewport Stage */}
      <div
        className="relative flex-1 flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing px-4 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* AR Tracking Reticle Grid on Table */}
        <div
          className="absolute bottom-20 w-80 h-80 rounded-full pointer-events-none transition-all duration-700"
          style={{
            transform: "rotateX(75deg) translateZ(-80px)",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.02) 65%, transparent 80%)",
            border: "1px dashed rgba(212, 175, 55, 0.35)",
            boxShadow: "0 0 50px rgba(212,175,55,0.15)",
          }}
        >
          <div className="absolute inset-4 rounded-full border border-[#d4af37]/20 animate-spin" style={{ animationDuration: "24s" }} />
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono text-[#d4af37]/70 tracking-widest uppercase text-center">
            Masa Yüzeyi • 60 FPS
          </div>
        </div>

        {/* 3D Levitating Plate Root */}
        <motion.div
          animate={{
            y: [0, -14, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
          className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-transform duration-75"
        >
          {/* Main Obsidian Luxury Dish Base Plate */}
          <div
            className="absolute inset-0 rounded-full border border-[#d4af37]/40 shadow-2xl transition-all duration-500 flex items-center justify-center"
            style={{
              transform: "translateZ(0px)",
              background:
                thermalView
                  ? "radial-gradient(circle, #3b82f6 0%, #1e1b4b 60%, #09090b 100%)"
                  : "radial-gradient(circle, #222227 0%, #121215 70%, #08080a 100%)",
              boxShadow: thermalView
                ? "0 0 40px rgba(59, 130, 246, 0.4)"
                : "0 20px 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(212, 175, 55, 0.2)",
            }}
          >
            {/* Fine dining concentric plate rims */}
            <div className="w-[85%] h-[85%] rounded-full border border-white/10" />
            <div className="absolute w-[68%] h-[68%] rounded-full border border-[#d4af37]/25" />
          </div>

          {/* Dish Visual Body (Video / Texture Layer) */}
          <div
            className="absolute w-[72%] h-[72%] rounded-full overflow-hidden shadow-inner border border-white/20 flex items-center justify-center transition-all duration-700"
            style={{
              transform: `translateZ(${explodedView ? 65 : 20}px)`,
              filter: thermalView ? "hue-rotate(180deg) saturate(2)" : "none",
            }}
          >
            <img
              src={dish.posterUrl}
              alt={dish.name}
              className="w-full h-full object-cover scale-110"
            />
            {/* Ambient hot steam simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-500/10 pointer-events-none" />
          </div>

          {/* Zero-G Floating Garnish / Gourmet Layers (Exploded View) */}
          {explodedView &&
            dish.modelLayers.map((layer, idx) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, z: 20 }}
                animate={{
                  opacity: 1,
                  z: layer.offsetY,
                }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `translateZ(${layer.offsetY}px)`,
                }}
                className="absolute w-56 p-2.5 rounded-xl bg-black/85 border border-[#d4af37]/40 backdrop-blur-md shadow-2xl flex items-center gap-3"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg"
                  style={{ backgroundColor: layer.color }}
                />
                <div className="text-left">
                  <div className="text-xs font-semibold text-white/95 leading-none">
                    {layer.name}
                  </div>
                  <div className="text-[10px] text-[#d4af37] font-mono mt-0.5">
                    {layer.description}
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Thermal Overlay Badge */}
          {thermalView && (
            <div
              className="absolute z-30 px-3 py-1.5 rounded-full bg-red-600/90 text-[11px] font-mono font-bold tracking-wider text-white shadow-lg animate-pulse"
              style={{ transform: "translateZ(85px)" }}
            >
              SICAK MERKEZ: {dish.temperature}
            </div>
          )}
        </motion.div>

        {/* Interaction Hint Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-center">
          <span className="text-[11px] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/70">
            {autoRotate ? "Döndürmek için ekrana dokunup sürükleyin" : "Serbest 3D Açısı"}
          </span>
        </div>
      </div>

      {/* Floating Spatial Controls Footer */}
      <div className="relative z-20 px-6 pb-8 pt-3 bg-gradient-to-t from-[#070709] via-[#070709]/90 to-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#141417]/90 border border-white/10 backdrop-blur-xl">
          {/* Auto Orbit Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs transition-all ${
              autoRotate
                ? "bg-[#d4af37] text-black font-semibold shadow-md"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4 mb-1" />
            <span className="text-[10px]">360° Dönüş</span>
          </button>

          {/* Exploded Layers Toggle */}
          <button
            onClick={() => setExplodedView(!explodedView)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs transition-all ${
              explodedView
                ? "bg-[#d4af37] text-black font-semibold shadow-md"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Katmanlar</span>
          </button>

          {/* Thermal View Toggle */}
          <button
            onClick={() => setThermalView(!thermalView)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs transition-all ${
              thermalView
                ? "bg-red-500 text-white font-semibold shadow-md"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Termal Isı</span>
          </button>

          {/* AR Camera Toggle */}
          <button
            onClick={toggleCameraMode}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs transition-all ${
              arCameraMode
                ? "bg-emerald-500 text-white font-semibold shadow-md"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Camera className="w-4 h-4 mb-1" />
            <span className="text-[10px]">{arCameraMode ? "Kamera Açık" : "AR Kamera"}</span>
          </button>

          {/* Reset Angle */}
          <button
            onClick={() => {
              setRotateX(15);
              setRotateY(25);
            }}
            className="p-2 rounded-xl text-white/70 hover:bg-white/5 flex items-center justify-center"
            title="Açıyı Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
