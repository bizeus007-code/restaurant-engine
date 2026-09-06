"use client";

import React from "react";
import { motion } from "motion/react";

export interface SteamEffectProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
  delayStart?: number;
}

function SteamEffect({
  className = "",
  intensity = "high",
  delayStart = 0,
}: SteamEffectProps) {
  const plumes = [
    { id: 1, left: "30%", duration: 3.2, delay: 0.1, xSway: [-8, 8, -10], scale: 1.15 },
    { id: 2, left: "48%", duration: 3.6, delay: 0.6, xSway: [8, -12, 10], scale: 1.35 },
    { id: 3, left: "62%", duration: 3.4, delay: 1.1, xSway: [-6, 10, -6], scale: 1.05 },
    { id: 4, left: "38%", duration: 4.0, delay: 1.6, xSway: [10, -8, 12], scale: 1.25 },
    { id: 5, left: "54%", duration: 3.5, delay: 0.8, xSway: [-10, 8, -8], scale: 1.4 },
  ];

  const maxOpacity =
    intensity === "low" ? 0.3 : intensity === "medium" ? 0.5 : 0.72;
  const blurVal = intensity === "low" ? "blur-[10px]" : "blur-[8px]";
  const riseHeight = intensity === "high" ? -140 : -100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delayStart, duration: 0.8 }}
      className={`absolute inset-x-0 -top-24 h-44 pointer-events-none overflow-visible z-20 ${className}`}
      style={{ mixBlendMode: "screen", pointerEvents: "none" }}
    >
      {plumes.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute bottom-3 rounded-full ${blurVal}`}
          style={{
            left: p.left,
            width: `${24 * p.scale}px`,
            height: `${68 * p.scale}px`,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(245,158,11,0.18) 40%, transparent 75%)",
          }}
          animate={{
            y: [0, riseHeight * 0.55, riseHeight],
            x: p.xSway,
            scaleX: [0.75, 1.4, 2.2],
            scaleY: [0.75, 1.6, 2.4],
            opacity: [0, maxOpacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: delayStart + p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Ambient Rising Heat Haze */}
      <motion.div
        className="absolute bottom-1 left-1/4 right-1/4 h-14 rounded-full blur-[14px] bg-gradient-to-t from-amber-400/15 via-white/12 to-transparent"
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [0.92, 1.15, 0.92],
        }}
        transition={{
          duration: 2.8,
          delay: delayStart,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

export { SteamEffect };
export default SteamEffect;
