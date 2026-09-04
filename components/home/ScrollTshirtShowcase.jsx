'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Layers, ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';

const TOTAL_FRAMES = 240;

// Helper to pad frame numbers (e.g. 1 -> "001", 42 -> "042", 120 -> "120")
const getFramePath = (index) => {
  const paddedIndex = String(index).padStart(3, '0');
  return `/scrool/ezgif-frame-${paddedIndex}.jpg`;
};

export default function ScrollTshirtShowcase() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Preload all 240 frames into memory
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
  }, []);

  // Render current frame to canvas
  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index - 1];

    if (img && img.complete && img.naturalWidth > 0) {
      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image object-fit contain
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.min(hRatio, vRatio);

      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

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

  // Scroll handler computing frame index from scroll position
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollableHeight = rect.height - windowHeight;

      if (totalScrollableHeight <= 0) return;

      // Calculate scroll progress between 0 and 1
      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollableHeight));

      // Calculate corresponding frame index (1 to 240)
      const frameIndex = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
      );

      setCurrentFrameIndex(frameIndex);
      renderFrame(frameIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [imagesLoaded]);

  // Initial draw once loaded
  useEffect(() => {
    if (imagesLoaded) {
      renderFrame(currentFrameIndex);
    }
  }, [imagesLoaded]);

  // Progress percentage (0 to 100%)
  const scrollPercentage = Math.round(((currentFrameIndex - 1) / (TOTAL_FRAMES - 1)) * 100);

  return (
    <div ref={containerRef} className="scroll-showcase-track">
      <div className="sticky-canvas-container">
        {/* Canvas for 3D Scroll Render */}
        <canvas ref={canvasRef} className="tshirt-scroll-canvas" />

        {/* Loading Overlay */}
        {!imagesLoaded && (
          <div className="showcase-loader-overlay">
            <div className="loader-spinner"></div>
            <p className="loader-text">Loading 3D T-Shirt Experience... {loadProgress}%</p>
            <div className="loader-bar-bg">
              <div className="loader-bar-fill" style={{ width: `${loadProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* Overlay Floating Story Cards based on Scroll Progress */}
        <div className="showcase-ui-overlay">
          {/* Badge 1: 0% - 25% */}
          <div className={`story-card card-step-1 ${scrollPercentage <= 25 ? 'active' : ''}`}>
            <span className="story-badge">
              <RotateCw size={14} className="spin-icon" /> 360° INTERACTIVE SHOWCASE
            </span>
            <h3 className="story-title">SCROLL TO UNRAVEL THE DESIGN</h3>
            <p className="story-desc">
              Bio-Washed Heavyweight Cotton engineered for structural luxury &amp; breathability.
            </p>
          </div>

          {/* Badge 2: 25% - 50% */}
          <div className={`story-card card-step-2 ${scrollPercentage > 25 && scrollPercentage <= 50 ? 'active' : ''}`}>
            <span className="story-badge badge-purple">
              <Sparkles size={14} /> HIGH-DENSITY DTF PRINTS
            </span>
            <h3 className="story-title">ULTRA-VIBRANT GRAPHICS</h3>
            <p className="story-desc">
              High-fidelity digital transfer technology resisting cracking and fading with proper care.
            </p>
          </div>

          {/* Badge 3: 50% - 75% */}
          <div className={`story-card card-step-3 ${scrollPercentage > 50 && scrollPercentage <= 75 ? 'active' : ''}`}>
            <span className="story-badge badge-gold">
              <ShieldCheck size={14} /> SEAMLESS PRECISION STITCHING
            </span>
            <h3 className="story-title">REINFORCED STREETWEAR CUT</h3>
            <p className="story-desc">
              Double-stitched ribbed collar, drop shoulders, and relaxed streetwear fitting.
            </p>
          </div>

          {/* Badge 4: 75% - 100% */}
          <div className={`story-card card-step-4 ${scrollPercentage > 75 ? 'active' : ''}`}>
            <span className="story-badge badge-pink">
              <Layers size={14} /> LIMITED COLLECTOR DROPS
            </span>
            <h3 className="story-title">LIMITED TO 100 PIECES GLOBALLY</h3>
            <p className="story-desc">
              Handcrafted in limited runs for true streetwear enthusiasts.
            </p>
            <Link href="/products" className="btn btn-primary btn-sm mt-2 flex-inline align-center gap-2">
              SHOP THIS DROP <ArrowRight size={14} />
            </Link>
          </div>

          {/* Bottom Scroll Progress Bar Indicator */}
          <div className="scroll-hud-footer">
            <div className="hud-frame-counter">
              <span className="dot-live"></span>
              <span>FRAME {String(currentFrameIndex).padStart(3, '0')} / {TOTAL_FRAMES}</span>
            </div>
            <div className="hud-progress-bar">
              <div className="hud-progress-fill" style={{ width: `${scrollPercentage}%` }}></div>
            </div>
            <div className="hud-hint">SCROLL DOWN ↓</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scroll-showcase-track {
          height: 320vh;
          position: relative;
          background: var(--bg-primary);
        }

        .sticky-canvas-container {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tshirt-scroll-canvas {
          width: 100%;
          height: 100%;
          max-width: 1200px;
          max-height: 90vh;
          object-fit: contain;
        }

        .showcase-loader-overlay {
          position: absolute;
          inset: 0;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .loader-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loader-text {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
        }

        .loader-bar-bg {
          width: 240px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          overflow: hidden;
        }

        .loader-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #ec4899);
          transition: width 0.1s ease;
        }

        .showcase-ui-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          z-index: 10;
        }

        .story-card {
          position: absolute;
          top: 15%;
          left: 5%;
          max-width: 380px;
          padding: 1.5rem;
          background: rgba(18, 18, 24, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: auto;
        }

        .story-card.active {
          opacity: 1;
          transform: translateY(0);
        }

        .card-step-2 { left: auto; right: 5%; top: 25%; }
        .card-step-3 { left: 5%; top: 35%; }
        .card-step-4 { left: auto; right: 5%; top: 40%; }

        .story-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.4);
          font-weight: 800;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          border-radius: 9999px;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .badge-purple {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
          border-color: rgba(168, 85, 247, 0.4);
        }

        .badge-gold {
          background: rgba(234, 179, 8, 0.2);
          color: #fde047;
          border-color: rgba(234, 179, 8, 0.4);
        }

        .badge-pink {
          background: rgba(236, 72, 153, 0.2);
          color: #f472b6;
          border-color: rgba(236, 72, 153, 0.4);
        }

        .story-title {
          font-size: 1.25rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }

        .story-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .scroll-hud-footer {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 5rem);
          max-width: 600px;
          background: rgba(18, 18, 24, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.25rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          pointer-events: auto;
        }

        .hud-frame-counter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: #a1a1aa;
          white-space: nowrap;
        }

        .dot-live {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 8px #22c55e;
        }

        .hud-progress-bar {
          flex: 1;
          height: 5px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          overflow: hidden;
        }

        .hud-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #ec4899);
          border-radius: 9999px;
          transition: width 0.05s linear;
        }

        .hud-hint {
          font-size: 0.7rem;
          font-weight: 900;
          color: #e4e4e7;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .showcase-ui-overlay { padding: 1.25rem; }
          .story-card {
            top: 10%;
            left: 1.25rem;
            right: 1.25rem;
            max-width: none;
          }
          .scroll-hud-footer {
            bottom: 1.25rem;
            width: calc(100% - 2.5rem);
          }
        }
      `}</style>
    </div>
  );
}
