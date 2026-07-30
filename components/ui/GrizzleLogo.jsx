'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', href = '/' }) {
  // Sizing mappings: Bigger logo image, sleeker reduced GRIZZLE title font
  const dimensions = {
    small: { logoSize: 48, fontSize: '1.05rem' },
    medium: { logoSize: 58, fontSize: '1.25rem' },
    large: { logoSize: 78, fontSize: '1.65rem' },
  }[size] || { logoSize: 58, fontSize: '1.25rem' };

  const logoContent = (
    <div className={`grizzle-logo-container size-${size}`}>
      {/* Uploaded Grizzle Brand Logo 2 Image */}
      <img
        src="/logo2.png"
        alt="Grizzle Apparel Logo"
        style={{
          width: dimensions.logoSize,
          height: dimensions.logoSize,
          objectFit: 'contain',
          borderRadius: '50%',
          filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.45)) drop-shadow(0 0 4px rgba(251, 191, 36, 0.45))',
        }}
        className="grizzle-brand-img"
      />

      {/* Brand Text */}
      <div className="grizzle-text-wrapper">
        <span className="brand-name" style={{ fontSize: dimensions.fontSize }}>
          GRIZZLE
        </span>
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
          filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.75)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.75));
        }

        .grizzle-text-wrapper {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-name {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-weight: 900;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #f4f4f5 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
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
