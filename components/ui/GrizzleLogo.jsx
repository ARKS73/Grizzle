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
      {/* Uploaded Grizzle Brand Logo Image */}
      <img
        src="/logo.jpeg"
        alt="Grizzle Apparel Logo"
        style={{
          width: dimensions.logoSize,
          height: dimensions.logoSize,
          objectFit: 'cover',
          borderRadius: '50%',
          boxShadow: '0 0 12px rgba(239, 68, 68, 0.4), 0 0 4px rgba(251, 191, 36, 0.4)',
        }}
        className="grizzle-brand-img"
      />

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
          gap: 0.75rem;
          text-decoration: none;
          user-select: none;
        }

        .grizzle-brand-img {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
        }

        .grizzle-logo-container:hover .grizzle-brand-img {
          transform: scale(1.08) rotate(-3deg);
          filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.7));
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
