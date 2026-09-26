'use client';

import { useEffect, useState } from 'react';

export function MobileDebug() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<{
    viewport: string;
    isTouch: boolean;
    lastError: string | null;
  }>({
    viewport: '',
    isTouch: false,
    lastError: null,
  });

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=1');

    // Yalnızca development VE açıkça ?debug=1 varsa çalışır, normal kullanıcılara ASLA DOM basmaz
    if (!isDev || !hasDebugParam) return;

    setMounted(true);

    // Eruda dynamic import only when in dev AND ?debug=1
    import('eruda')
      .then((erudaModule) => {
        const eruda = (erudaModule as any).default || erudaModule;
        if (!window.__eruda_initialized__) {
          eruda.init();
          window.__eruda_initialized__ = true;
        }
      })
      .catch(() => {});

    // Listen for uncaught errors
    const errorHandler = (event: ErrorEvent) => {
      setStats((prev) => ({
        ...prev,
        lastError: `${event.message} (${event.filename}:${event.lineno})`,
      }));
    };
    window.addEventListener('error', errorHandler);

    // Initial stats
    const updateStats = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setStats((prev) => ({
        ...prev,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        isTouch,
      }));
    };
    updateStats();
    window.addEventListener('resize', updateStats);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('resize', updateStats);
    };
  }, []);

  const isDev = process.env.NODE_ENV === 'development';
  const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=1');
  if (!mounted || !isDev || !hasDebugParam) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '8px',
        left: '8px',
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid #D5AC68',
        borderRadius: '8px',
        padding: '4px 8px',
        color: '#F6D38B',
        fontFamily: 'monospace',
        fontSize: '10px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        maxWidth: '260px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <div>📱 {stats.viewport} | {stats.isTouch ? 'Touch Device' : 'Desktop'}</div>
      {stats.lastError && (
        <div style={{ color: '#ff5555', wordBreak: 'break-all' }}>⚠️ {stats.lastError}</div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    __eruda_initialized__?: boolean;
  }
}
