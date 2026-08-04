'use client';

import React, { useRef, useEffect, useState } from 'react';

const TOTAL_FRAMES = 240;

const getFramePath = (index) => {
  const paddedIndex = String(index).padStart(3, '0');
  return `/scrool/ezgif-frame-${paddedIndex}.jpg`;
};

export default function GlobalScrollCanvas() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload 240 frames (used only in dark mode)
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
      };
      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;
  }, []);

  // Draw current frame to canvas
  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index - 1];

    if (img && img.complete && img.naturalWidth > 0) {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth * dpr;
      const height = window.innerHeight * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const hRatio = width / img.width;
      const vRatio = height / img.height;
      const ratio = Math.min(hRatio, vRatio) * 0.9;
      const centerShift_x = (width - img.width * ratio) / 2;
      const centerShift_y = (height - img.height * ratio) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }
  };

  // Scroll-driven frame rendering
  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;

        const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
        const frameIndex = Math.min(
          TOTAL_FRAMES,
          Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
        );
        renderFrame(frameIndex);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded]);

  useEffect(() => {
    if (imagesLoaded) renderFrame(1);
  }, [imagesLoaded]);

  return (
    <>
      {/* ── SHARED WRAPPER ── */}
      <div className="global-canvas-background-fixed">

        {/* ── DARK THEME: scroll-driven canvas + orbs ── */}
        <div className="dark-bg-layer">
          <div className="dark-orb dark-orb-1" />
          <div className="dark-orb dark-orb-2" />
          <canvas ref={canvasRef} className="bg-canvas-element" />
          <div className="bg-vignette-overlay" />
        </div>

        {/* ── LIGHT THEME: white/sky-blue gradient background ── */}
        <div className="light-bg-layer">
          <div className="light-orb light-orb-1" />
          <div className="light-orb light-orb-2" />
          <div className="light-orb light-orb-3" />
          <div className="light-grid-overlay" />
          <div className="light-top-shimmer" />
        </div>

      </div>

      <style jsx global>{`

        /* ================================================================
           SHARED WRAPPER
           ================================================================ */
        .global-canvas-background-fixed {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* ================================================================
           DARK THEME BACKGROUND LAYER
           ================================================================ */
        .dark-bg-layer {
          position: absolute;
          inset: 0;
          background: var(--bg-primary);
          transition: opacity 0.4s ease;
        }

        [data-theme='dark'] .dark-bg-layer  { opacity: 1; }
        [data-theme='light'] .dark-bg-layer { opacity: 0; pointer-events: none; }

        .dark-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .dark-orb-1 {
          top: -10%; left: 15%;
          width: 550px; height: 550px;
          background: radial-gradient(circle,
            rgba(99, 102, 241, 0.22) 0%,
            rgba(236, 72, 153, 0.12) 50%,
            transparent 70%);
          animation: floatOrb 18s ease-in-out infinite alternate;
        }
        .dark-orb-2 {
          bottom: -10%; right: 15%;
          width: 600px; height: 600px;
          background: radial-gradient(circle,
            rgba(37, 99, 235, 0.25) 0%,
            rgba(168, 85, 247, 0.15) 50%,
            transparent 70%);
          animation: floatOrb 22s ease-in-out infinite alternate-reverse;
        }

        .bg-canvas-element {
          width: 100vw; height: 100vh;
          object-fit: contain;
          opacity: 0.65;
          filter: contrast(1.15) brightness(0.95);
        }

        .bg-vignette-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(7, 7, 9, 0.15) 0%,
            rgba(7, 7, 9, 0.65) 60%,
            rgba(7, 7, 9, 0.92) 100%
          );
          pointer-events: none;
        }

        /* ================================================================
           LIGHT THEME BACKGROUND LAYER
           ================================================================ */
        .light-bg-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            #ffffff 0%,
            #e8f4ff 30%,
            #dbeeff 60%,
            #f0f9ff 100%
          );
          transition: opacity 0.4s ease;
        }

        [data-theme='light'] .light-bg-layer  { opacity: 1; }
        [data-theme='dark']  .light-bg-layer  { opacity: 0; pointer-events: none; }

        .light-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
        }
        .light-orb-1 {
          width: 620px; height: 620px;
          top: -120px; left: -80px;
          background: radial-gradient(circle,
            rgba(186, 230, 255, 0.9) 0%,
            rgba(147, 210, 255, 0.6) 45%,
            transparent 75%);
          animation: floatOrb 20s ease-in-out infinite alternate;
        }
        .light-orb-2 {
          width: 700px; height: 700px;
          bottom: -180px; right: -120px;
          background: radial-gradient(circle,
            rgba(196, 221, 255, 0.85) 0%,
            rgba(165, 196, 255, 0.55) 40%,
            transparent 70%);
          animation: floatOrb 26s ease-in-out infinite alternate-reverse;
        }
        .light-orb-3 {
          width: 480px; height: 480px;
          top: 35%; left: 40%;
          transform: translateX(-50%);
          background: radial-gradient(circle,
            rgba(224, 242, 254, 0.75) 0%,
            rgba(186, 230, 255, 0.45) 55%,
            transparent 75%);
          animation: floatOrb 16s ease-in-out infinite alternate;
          animation-delay: -8s;
        }

        .light-grid-overlay {
          position: absolute; inset: 0;
          background-image: radial-gradient(
            circle, rgba(56, 189, 248, 0.18) 1px, transparent 1px
          );
          background-size: 36px 36px;
        }
        .light-top-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 220px;
          background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%);
        }

        /* ================================================================
           SHARED ANIMATION
           ================================================================ */
        @keyframes floatOrb {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(35px, 28px) scale(1.08); }
        }

        /* ================================================================
           PAGE SECTION z-index / transparency overrides
           ================================================================ */
        .single-page-wrapper {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }
        .hero-section-street { background: transparent !important; }

        /* ── DARK section backgrounds ── */
        [data-theme='dark'] .latest-drops-section {
          background: rgba(18, 18, 24, 0.45) !important;
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        [data-theme='dark'] .mens-collection-section {
          background: rgba(15, 23, 42, 0.5) !important;
          backdrop-filter: blur(20px) saturate(180%);
        }
        [data-theme='dark'] .womens-collection-section {
          background: rgba(24, 18, 28, 0.5) !important;
          backdrop-filter: blur(20px) saturate(180%);
        }
        [data-theme='dark'] .all-collections-section {
          background: rgba(18, 18, 24, 0.55) !important;
          backdrop-filter: blur(24px) saturate(190%);
        }
        [data-theme='dark'] .join-collective-section {
          background: rgba(18, 18, 24, 0.65) !important;
          backdrop-filter: blur(24px) saturate(190%);
        }

        /* ── LIGHT section backgrounds ── */
        [data-theme='light'] .latest-drops-section {
          background: rgba(255, 255, 255, 0.55) !important;
          backdrop-filter: blur(18px) saturate(160%);
          border-top: 1px solid rgba(56, 189, 248, 0.2);
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        }
        [data-theme='light'] .mens-collection-section {
          background: rgba(240, 249, 255, 0.6) !important;
          backdrop-filter: blur(18px) saturate(160%);
        }
        [data-theme='light'] .womens-collection-section {
          background: rgba(248, 250, 255, 0.65) !important;
          backdrop-filter: blur(18px) saturate(160%);
        }
        [data-theme='light'] .all-collections-section {
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(20px) saturate(170%);
        }
        [data-theme='light'] .join-collective-section {
          background: rgba(224, 242, 254, 0.55) !important;
          backdrop-filter: blur(22px) saturate(180%);
        }
      `}</style>
    </>
  );
}
