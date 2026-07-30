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

  // Preload 240 frames
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

      // Object fit contain with scaling
      const hRatio = width / img.width;
      const vRatio = height / img.height;
      const ratio = Math.min(hRatio, vRatio) * 0.9; // 90% scale for sleek framing

      const centerShift_x = (width - img.width * ratio) / 2;
      const centerShift_y = (height - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
    }
  };

  // Scroll handler tracking overall page scroll
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
    if (imagesLoaded) {
      renderFrame(1);
    }
  }, [imagesLoaded]);

  return (
    <>
      <div className="global-canvas-background-fixed">
        <div className="bg-liquid-glow-orb-1"></div>
        <div className="bg-liquid-glow-orb-2"></div>
        <canvas ref={canvasRef} className="bg-canvas-element" />
        <div className="bg-vignette-overlay"></div>
      </div>

      <style jsx global>{`
        .global-canvas-background-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: #070709;
        }

        .bg-liquid-glow-orb-1 {
          position: absolute;
          top: -10%;
          left: 15%;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 70%);
          filter: blur(80px);
          animation: floatOrb 18s ease-in-out infinite alternate;
        }

        .bg-liquid-glow-orb-2 {
          position: absolute;
          bottom: -10%;
          right: 15%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 70%);
          filter: blur(90px);
          animation: floatOrb 22s ease-in-out infinite alternate-reverse;
        }

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.1); }
        }

        .bg-canvas-element {
          width: 100vw;
          height: 100vh;
          object-fit: contain;
          opacity: 0.65;
          filter: contrast(1.15) brightness(0.95);
        }

        .bg-vignette-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(7, 7, 9, 0.15) 0%,
            rgba(7, 7, 9, 0.65) 60%,
            rgba(7, 7, 9, 0.92) 100%
          );
          pointer-events: none;
        }

        /* LIQUID GLASS SECTION OVERRIDES */
        .single-page-wrapper {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }

        .hero-section-street {
          background: transparent !important;
        }

        .latest-drops-section {
          background: rgba(18, 18, 24, 0.45) !important;
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mens-collection-section {
          background: rgba(15, 23, 42, 0.5) !important;
          backdrop-filter: blur(20px) saturate(180%);
        }

        .womens-collection-section {
          background: rgba(24, 18, 28, 0.5) !important;
          backdrop-filter: blur(20px) saturate(180%);
        }

        .all-collections-section {
          background: rgba(18, 18, 24, 0.55) !important;
          backdrop-filter: blur(24px) saturate(190%);
        }

        .join-collective-section {
          background: rgba(18, 18, 24, 0.65) !important;
          backdrop-filter: blur(24px) saturate(190%);
        }
      `}</style>
    </>
  );
}
