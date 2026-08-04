'use client';

import React from 'react';

export default function GlobalScrollCanvas() {
  return (
    <>
      <div className="global-canvas-background-fixed">
        {/* Soft pastel blue gradient orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Subtle grid pattern overlay */}
        <div className="bg-grid-overlay" />

        {/* Top highlight shimmer */}
        <div className="bg-top-shimmer" />
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
          background: linear-gradient(
            160deg,
            #ffffff 0%,
            #e8f4ff 30%,
            #dbeeff 60%,
            #f0f9ff 100%
          );
        }

        /* --- Floating colour orbs --- */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
        }

        /* Sky-blue large orb — top left */
        .bg-orb-1 {
          width: 620px;
          height: 620px;
          top: -120px;
          left: -80px;
          background: radial-gradient(
            circle,
            rgba(186, 230, 255, 0.9) 0%,
            rgba(147, 210, 255, 0.6) 45%,
            transparent 75%
          );
          animation: floatOrb 20s ease-in-out infinite alternate;
        }

        /* Periwinkle / indigo accent — bottom right */
        .bg-orb-2 {
          width: 700px;
          height: 700px;
          bottom: -180px;
          right: -120px;
          background: radial-gradient(
            circle,
            rgba(196, 221, 255, 0.85) 0%,
            rgba(165, 196, 255, 0.55) 40%,
            transparent 70%
          );
          animation: floatOrb 26s ease-in-out infinite alternate-reverse;
        }

        /* Soft mint — centre */
        .bg-orb-3 {
          width: 480px;
          height: 480px;
          top: 35%;
          left: 40%;
          transform: translateX(-50%);
          background: radial-gradient(
            circle,
            rgba(224, 242, 254, 0.75) 0%,
            rgba(186, 230, 255, 0.45) 55%,
            transparent 75%
          );
          animation: floatOrb 16s ease-in-out infinite alternate;
          animation-delay: -8s;
        }

        @keyframes floatOrb {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(35px, 28px) scale(1.08); }
        }

        /* --- Subtle dot grid --- */
        .bg-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            rgba(56, 189, 248, 0.18) 1px,
            transparent 1px
          );
          background-size: 36px 36px;
        }

        /* --- Top edge shimmer --- */
        .bg-top-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 220px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            transparent 100%
          );
        }

        /* ====== OVERRIDE: ensure all page sections are transparent ====== */
        .single-page-wrapper {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }

        .hero-section-street {
          background: transparent !important;
        }

        .latest-drops-section {
          background: rgba(255, 255, 255, 0.55) !important;
          backdrop-filter: blur(18px) saturate(160%);
          border-top: 1px solid rgba(56, 189, 248, 0.2);
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        }

        .mens-collection-section {
          background: rgba(240, 249, 255, 0.6) !important;
          backdrop-filter: blur(18px) saturate(160%);
        }

        .womens-collection-section {
          background: rgba(248, 250, 255, 0.65) !important;
          backdrop-filter: blur(18px) saturate(160%);
        }

        .all-collections-section {
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(20px) saturate(170%);
        }

        .join-collective-section {
          background: rgba(224, 242, 254, 0.55) !important;
          backdrop-filter: blur(22px) saturate(180%);
        }
      `}</style>
    </>
  );
}
