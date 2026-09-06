"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { motion } from "motion/react";

interface ThreeDishStageProps {
  dishImage: string;
  dishName: string;
  isBluePlate?: boolean;
  className?: string;
  onInteract?: () => void;
}

export default function ThreeDishStage({
  dishImage,
  dishName,
  isBluePlate = false,
  className = "",
  onInteract,
}: ThreeDishStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dishGroupRef = useRef<THREE.Group | null>(null);
  const topPlateMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const basePlateMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Interaction tracking (both WebGL and CSS fallback)
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 14, y: 0 });
  const dragRotation = useRef({ x: 0.15, y: 0 });

  // 1. Detect WebGL capability safely
  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl2") ||
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // 2. Initialize Three.js WebGL only if supported
  useEffect(() => {
    if (!hasWebGL) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 0.1, 0);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Lighting Architecture
    const keyLight = new THREE.DirectionalLight(0xf59e0b, 2.6);
    keyLight.position.set(3.2, 4.5, 2.8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x2563eb, 3.2, 10);
    rimLight.position.set(-3.2, 2.2, -2.0);
    scene.add(rimLight);

    const champagneFill = new THREE.PointLight(0xd4af37, 1.4, 8);
    champagneFill.position.set(0, 2.5, 2.5);
    scene.add(champagneFill);

    const ambientLight = new THREE.AmbientLight(0x1a1816, 1.2);
    scene.add(ambientLight);

    // Dark Obsidian Basalt Pedestal
    const pedestalGroup = new THREE.Group();
    const pedestalGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.28, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x090807,
      roughness: 0.35,
      metalness: 0.65,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.set(0, -0.65, 0);
    pedestalMesh.receiveShadow = true;
    pedestalGroup.add(pedestalMesh);

    const ringGeo = new THREE.TorusGeometry(1.66, 0.008, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -0.51, 0);
    pedestalGroup.add(ringMesh);

    scene.add(pedestalGroup);

    // Levitating 3D Dish Group
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 0.08, 0);
    dishGroupRef.current = dishGroup;

    const baseGeo = new THREE.CylinderGeometry(1.35, 1.15, 0.12, 64);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: isBluePlate ? 0x1d4ed8 : 0x18181b,
      roughness: isBluePlate ? 0.22 : 0.4,
      metalness: isBluePlate ? 0.45 : 0.2,
    });
    basePlateMatRef.current = basePlateMat;

    const baseMesh = new THREE.Mesh(baseGeo, basePlateMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    dishGroup.add(baseMesh);

    const topPlateGeo = new THREE.CircleGeometry(1.33, 64);
    const topPlateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
    });
    topPlateMatRef.current = topPlateMat;

    const topPlateMesh = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlateMesh.rotation.x = -Math.PI / 2;
    topPlateMesh.position.set(0, 0.062, 0);
    topPlateMesh.receiveShadow = true;
    dishGroup.add(topPlateMesh);

    scene.add(dishGroup);

    // Volumetric Floating Embers
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 1] = Math.random() * 2.8 - 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // Load Dish Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(dishImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (topPlateMatRef.current) {
        topPlateMatRef.current.map = tex;
        topPlateMatRef.current.needsUpdate = true;
      }
    });

    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mousePos.current.x = THREE.MathUtils.lerp(
        mousePos.current.x,
        mousePos.current.targetX,
        0.06
      );
      mousePos.current.y = THREE.MathUtils.lerp(
        mousePos.current.y,
        mousePos.current.targetY,
        0.06
      );

      if (dishGroupRef.current) {
        const floatY = 0.08 + Math.sin(elapsedTime * 1.6) * 0.045;
        dishGroupRef.current.position.y = floatY;

        const targetRotX =
          dragRotation.current.x +
          mousePos.current.y * 0.2 +
          Math.cos(elapsedTime * 0.8) * 0.025;
        const targetRotY =
          dragRotation.current.y +
          mousePos.current.x * 0.35 +
          Math.sin(elapsedTime * 0.6) * 0.035;

        dishGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          dishGroupRef.current.rotation.x,
          targetRotX,
          0.08
        );
        dishGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          dishGroupRef.current.rotation.y,
          targetRotY,
          0.08
        );
      }

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += 0.003;
          if (positions[i * 3 + 1] > 2.5) {
            positions[i * 3 + 1] = -0.5;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      baseGeo.dispose();
      basePlateMat.dispose();
      topPlateGeo.dispose();
      topPlateMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [hasWebGL]);

  // Update Three.js texture dynamically
  useEffect(() => {
    if (!hasWebGL || !rendererRef.current) return;
    const loader = new THREE.TextureLoader();
    loader.load(dishImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (topPlateMatRef.current) {
        if (topPlateMatRef.current.map) {
          topPlateMatRef.current.map.dispose();
        }
        topPlateMatRef.current.map = tex;
        topPlateMatRef.current.needsUpdate = true;
      }
    });

    if (basePlateMatRef.current) {
      basePlateMatRef.current.color.set(isBluePlate ? 0x1d4ed8 : 0x18181b);
      basePlateMatRef.current.needsUpdate = true;
    }
  }, [dishImage, isBluePlate, hasWebGL]);

  // Pointer Handlers for Orbit Rotation (Works on both WebGL and CSS 3D fallback)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    prevMouse.current = { x: e.clientX, y: e.clientY };
    if (onInteract) onInteract();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePos.current.targetX = nx;
    mousePos.current.targetY = ny;

    if (isDragging.current) {
      const deltaX = e.clientX - prevMouse.current.x;
      const deltaY = e.clientY - prevMouse.current.y;

      dragRotation.current.y += deltaX * 0.008;
      dragRotation.current.x = Math.max(
        -0.2,
        Math.min(0.6, dragRotation.current.x + deltaY * 0.008)
      );

      setRotation((prev) => ({
        x: Math.max(-20, Math.min(45, prev.x - deltaY * 0.35)),
        y: prev.y + deltaX * 0.5,
      }));

      prevMouse.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none flex items-center justify-center ${className}`}
    >
      {/* 1. WebGL Three.js Canvas (If supported) */}
      {hasWebGL ? (
        <canvas ref={canvasRef} className="w-full h-full block" />
      ) : (
        /* 2. Resilient Spatial CSS 3D Pedestal Stage (If WebGL is unavailable in sandbox/headless) */
        <div className="relative w-full h-full flex items-center justify-center [perspective:1200px]">
          {/* Obsidian Pedestal Contact Shadow & Base */}
          <div
            className="absolute bottom-6 w-72 sm:w-96 h-28 rounded-full pointer-events-none transition-all duration-700"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(12,10,9,0.95) 0%, rgba(8,7,6,0.85) 45%, transparent 75%)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.9), inset 0 1px 1px rgba(212,175,55,0.3)",
              border: "1px solid rgba(212,175,55,0.15)",
              transform: "rotateX(75deg) translateZ(-40px)",
            }}
          >
            {/* Pedestal Gold Inlay */}
            <div className="absolute inset-2 rounded-full border border-[#d4af37]/25" />
          </div>

          {/* Levitating 3D Dish Sculpture */}
          <motion.div
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(65px)`,
              transformStyle: "preserve-3d",
            }}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-64 sm:w-80 lg:w-[340px] aspect-square flex items-center justify-center transition-transform duration-75"
          >
            {/* Ceramic Plate Shadow Base */}
            <div
              className={`absolute -inset-2 rounded-full transition-all duration-500 ${
                isBluePlate
                  ? "bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6] shadow-[0_0_40px_rgba(29,78,216,0.35)]"
                  : "bg-gradient-to-tr from-[#18181b] via-[#27272a] to-[#3f3f46] shadow-[0_0_35px_rgba(0,0,0,0.8)]"
              }`}
              style={{
                transform: "translateZ(-8px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />

            {/* High-Resolution Dish Image */}
            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center p-2">
              <img
                src={dishImage}
                alt={dishName}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              />
              {/* Dynamic Specular Sheen */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(212,175,55,0.06) 40%, transparent 70%)",
                }}
              />
            </div>
          </motion.div>

          {/* Golden Micro-Embers Floating in Spatial Depth */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#d4af37]"
                style={{
                  left: `${20 + (i * 17) % 60}%`,
                  bottom: `${15 + (i * 13) % 40}%`,
                  opacity: 0.6,
                }}
                animate={{
                  y: [0, -90, -160],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 18, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0.6, 1.2, 0.4],
                }}
                transition={{
                  duration: 3.2 + (i % 3),
                  delay: i * 0.28,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subtle Interactive Spatial Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-md z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-white/70">
          3D DÖNDÜR & İNCELE
        </span>
      </div>
    </div>
  );
}

