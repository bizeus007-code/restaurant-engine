'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxComponentProps {
  lang?: 'TR' | 'EN';
}

export function ParallaxComponent({ lang = 'TR' }: ParallaxComponentProps) {
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroMediaRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Lenis Smooth Scroll Motoru (Mobilde native 120Hz akış için touch cihazlarda devre dışı, sadece masaüstünde aktif)
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    let lenis: Lenis | null = null;
    let tickerHandler: ((time: number) => void) | null = null;

    if (!isTouchDevice) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
      });

      lenis.on('scroll', ScrollTrigger.update);
      tickerHandler = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerHandler);
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Hero Kaybolma & Parallaks Efekti (Ekranı Küçültmeden, Perde/Curtain Mantığıyla)
    const ctx = gsap.context(() => {
      gsap.set(heroMediaRef.current, { scale: 1.18, transformOrigin: 'center 48%' });
      gsap.set(heroTextRef.current, { y: 0, opacity: 1 });

      gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      })
      .to(heroMediaRef.current, {
        yPercent: 8,           // Görsel arka planda hafifçe süzülür, derinlik katar
        scale: 1.18,           // Ölçek korunur
        opacity: 0.90,         // Zemin asla zifiri siyaha düşmez, mekanın görseli canlı ve şeffaf kalır (%88 - %92)
        ease: 'none'
      }, 0)
      .to(heroTextRef.current, {
        y: -15,                // Hafif ve yumuşak kaybolma, tavana fırlama yok
        opacity: 0,
        ease: 'power1.out'
      }, 0);

      // 4. Koordinatları Yeniden Hesapla (Tüm Çakışmaları Engeller)
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      if (tickerHandler) gsap.ticker.remove(tickerHandler);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* 1. SABİT ARKA PLAN FOTOĞRAFI: Hem Hero hem 3D Vitrin boyunca altta canlı ve kesintisiz (%88 - %92) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      >
        <img 
          ref={heroMediaRef}
          src="/images/loqum-hero-master.jpg" 
          alt="LOQUM ET Steakhouse Giriş, Tabela ve Boğalar" 
          className="hero-media absolute inset-0 w-full h-full object-cover object-[center_48%] scale-[1.18] origin-[center_48%] opacity-90 transition-opacity duration-300 pointer-events-none transform-gpu will-change-transform"
        />
        {/* Hafif Atmosferik Karartma Gradyanı (Katı siyah zemin yok, sadece derinlik) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35 pointer-events-none" />
      </div>

      {/* 2. HERO KATMANI: Tam Ekran (100vw / 100vh), Serbest Yüzen Metin Grubu */}
      <header 
        ref={heroSectionRef} 
        className="hero-section relative z-10 h-screen sm:h-[100dvh] min-h-[600px] w-full select-none"
      >
        <div className="hero-inner relative w-full h-full">
          {/* Başlık ve Buton Grubu: Kapı camının tam ortasında (Tabela ve çelenk altı, kırmızı halı ve boğalar üstü) */}
          <div 
            className="hero-text-wrapper absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[92%] max-w-xl pointer-events-none select-none text-center"
          >
            <div 
              ref={heroTextRef}
              className="flex flex-col items-center pointer-events-none transform-gpu will-change-transform"
            >
              {/* İnce Altın Rozet */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 border border-[#C8982B]/60 mb-2.5 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBE291] animate-ping"></span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBE291] via-[#E5C158] to-[#C8982B] font-display text-[9px] sm:text-[11px] tracking-[0.28em] uppercase font-bold [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                  {lang === 'EN' ? 'AGED PREMIUM STEAKS' : 'ÖZEL DİNLENDİRİLMİŞ PREMİUM ETLER'}
                </span>
              </div>

              {/* Başlık - Kutu Yok, Doğrudan Fotoğraf Üzerinde Serbest */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight mb-2.5 [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                Gerçek{' '}
                <span className="font-serif not-italic font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FBE291] via-[#E5C158] to-[#C8982B]">
                  LOQUM ET
                </span>{' '}
                Deneyimi
              </h1>

              {/* Açıklama */}
              <p className="max-w-md text-xs sm:text-sm text-stone-100 font-light tracking-wide leading-relaxed mb-4 [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                {lang === 'EN'
                  ? 'Prime selections aged 28 days in Himalayan dry-aging rooms and flame-seared at your table.'
                  : 'Özel kurutma odalarında 28 gün dinlendirilmiş dry-aged seçkiler ve masanızda mühürlenen lezzetler.'}
              </p>

              {/* Buton ve Menü Keşfet Satırı */}
              <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
                <a
                  href="#rezervasyon"
                  className="group flex items-center space-x-2 bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-bold rounded-full px-6 py-2.5 transition-all duration-300 hover:brightness-110 shadow-[0_4px_20px_rgba(200,152,43,0.4)] cursor-pointer text-xs sm:text-sm tracking-[0.2em] pointer-events-auto"
                >
                  <span className="min-w-[135px] text-center inline-block">{lang === 'EN' ? 'BOOK A TABLE' : 'YERİNİZİ AYIRTIN'}</span>
                  <svg className="w-4 h-4 text-black transition-transform group-hover:rotate-12" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26 0C24.2 0 23.5 2 23.5 2.7C23.5 3.7 24.5 5.2 25 5.2C14 5.8 5.2 15.6 5.2 27.6H46.8C46.8 15.6 38.1 5.8 27.1 5.2C27.5 5.2 28.5 3.7 28.5 2.7C28.5 2 27.8 0 26 0ZM5.1 30C4.6 30 1.8 32 0 34.1V37.2C0 37.6 0.4 38 0.8 38H51.2C51.6 38 52 37.6 52 37.2V34.1C50.2 32 47.3 30 46.9 30L26 30H5.1Z" fill="currentColor"/>
                  </svg>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const vitrin = document.getElementById('vitrin-3d') || document.getElementById('menu');
                    if (vitrin) vitrin.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 bg-black/50 hover:bg-black/70 border border-white/20 hover:border-[#C8982B] rounded-full px-4 py-2.5 transition-all duration-300 text-stone-200 hover:text-white text-xs font-mono tracking-wider shadow-lg cursor-pointer pointer-events-auto"
                >
                  <span className="[text-shadow:_0_2px_14px_rgba(0,0,0,0.95)]">{lang === 'EN' ? 'Explore Menu' : 'Menüyü Keşfet'}</span>
                  <span className="text-[#FBE291] text-xs animate-bounce">↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
