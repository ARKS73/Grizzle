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
          background: #09090b;
        }

        .bg-canvas-element {
          width: 100vw;
          height: 100vh;
          object-fit: contain;
          opacity: 0.55;
          filter: contrast(1.1) brightness(0.9);
        }

        .bg-vignette-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(9, 9, 11, 0.2) 0%,
            rgba(9, 9, 11, 0.75) 70%,
            rgba(9, 9, 11, 0.95) 100%
          );
          pointer-events: none;
        }

        /* Make sections semi-transparent to reveal background 3D scroll animation */
        .single-page-wrapper {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }

        .hero-section-street {
          background: rgba(9, 9, 11, 0.45) !important;
          backdrop-filter: blur(8px);
        }

        .latest-drops-section {
          background: rgba(9, 9, 11, 0.65) !important;
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mens-collection-section {
          background: rgba(15, 23, 42, 0.7) !important;
          backdrop-filter: blur(12px);
        }

        .womens-collection-section {
          background: rgba(24, 18, 28, 0.7) !important;
          backdrop-filter: blur(12px);
        }

        .all-collections-section {
          background: rgba(9, 9, 11, 0.75) !important;
          backdrop-filter: blur(14px);
        }

        .join-collective-section {
          background: rgba(9, 9, 11, 0.8) !important;
          backdrop-filter: blur(16px);
        }
      `}</style>
    </>
  );
}
