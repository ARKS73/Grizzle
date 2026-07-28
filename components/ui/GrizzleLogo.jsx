'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', showSubtext = true, href = '/' }) {
  // Sizing mappings
  const dimensions = {
    small: { logoSize: 36, fontSize: '1.15rem', subSize: '0.65rem' },
    medium: { logoSize: 44, fontSize: '1.45rem', subSize: '0.75rem' },
    large: { logoSize: 64, fontSize: '2.1rem', subSize: '0.9rem' },
  }[size] || { logoSize: 44, fontSize: '1.45rem', subSize: '0.75rem' };

  const logoContent = (
    <div className={`grizzle-logo-container size-${size}`}>
      {/* SVG Icon matching the uploaded logo: Crimson G with glowing Golden Stroke */}
      <svg
        width={dimensions.logoSize}
        height={dimensions.logoSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="grizzle-svg-logo"
      >
        <defs>
          {/* Deep Crimson to Burgundy Gradient */}
          <linearGradient id="grizzleRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Golden Glow Filter */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Fiery Gold Stroke Gradient */}
          <linearGradient id="goldStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Golden Outer Glowing Stroke Ring */}
        <path
          d="M 78 28 C 66 12 36 12 22 28 C 6 46 8 74 26 88 C 42 100 74 96 86 80 C 92 72 90 64 80 62 L 52 62 L 52 48 L 88 48 C 96 48 98 56 96 68 C 92 90 62 104 32 96 C 8 90 -4 64 2 38 C 10 12 40 -2 74 8 C 84 11 88 18 84 24 Z"
          fill="none"
          stroke="url(#goldStrokeGrad)"
          strokeWidth="3.5"
          filter="url(#goldGlow)"
        />

        {/* Rich Crimson Red Inner Fill for the Letter "G" */}
        <path
          d="M 76 30 C 64 16 38 16 25 30 C 11 46 13 71 28 84 C 42 95 70 92 82 78 L 82 64 L 54 64 L 54 52 L 86 52 C 92 52 94 58 93 66 C 89 86 61 98 33 91 C 11 85 0 62 6 39 C 13 16 41 4 72 13 Z"
          fill="url(#grizzleRedGrad)"
        />

        {/* Dynamic Stylized Inner Accent Line */}
        <path
          d="M 32 36 C 44 24 62 24 70 34"
          stroke="#fef08a"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {/* Brand Text */}
      <div className="grizzle-text-wrapper">
        <span className="brand-name" style={{ fontSize: dimensions.fontSize }}>
          GRIZZLE
        </span>
        {showSubtext && (
          <span className="brand-subtext" style={{ fontSize: dimensions.subSize }}>
            DTF PRINTING <span className="text-gold">&bull; 240 GSM</span>
          </span>
        )}
      </div>

      <style jsx>{`
        .grizzle-logo-container {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          user-select: none;
        }

        .grizzle-svg-logo {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.35));
        }

        .grizzle-logo-container:hover .grizzle-svg-logo {
          transform: scale(1.08) rotate(-3deg);
          filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
        }

        .grizzle-text-wrapper {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-name {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #f4f4f5 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
        }

        .brand-subtext {
          font-weight: 800;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 0.15rem;
        }

        .text-gold {
          color: #fbbf24;
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
