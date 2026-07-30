'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', href = '/' }) {
  // Sizing mappings for standalone full-fledged logo2 emblem
  const logoSize = {
    small: 44,
    medium: 56,
    large: 80,
  }[size] || 56;

  const logoContent = (
    <div className={`grizzle-logo-container size-${size}`}>
      {/* Standalone Full-Fledged Brand Logo 2 Emblem */}
      <img
        src="/logo2.png"
        alt="Grizzle Apparel Brand Logo"
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          objectFit: 'contain',
          borderRadius: '50%',
          filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.5)) drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))',
        }}
        className="grizzle-brand-img"
      />

      <style jsx>{`
        .grizzle-logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          user-select: none;
        }

        .grizzle-brand-img {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
        }

        .grizzle-logo-container:hover .grizzle-brand-img {
          transform: scale(1.1) rotate(-3deg);
          filter: drop-shadow(0 0 18px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
