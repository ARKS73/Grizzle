'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', href = '/' }) {
  const logoHeights = {
    small: '26px',
    medium: '36px',
    large: '48px',
  }[size] || '36px';

  const logoContent = (
    <div className={`grizzle-brand-logo-container size-${size}`}>
      <img
        src="/placeholder.png"
        alt="GRIZZLE"
        style={{
          height: logoHeights,
          width: 'auto',
          maxWidth: '220px',
          objectFit: 'contain',
          display: 'block',
        }}
        className="grizzle-brand-logo-img"
      />

      <style jsx>{`
        .grizzle-brand-logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          user-select: none;
          padding: 2px 0;
        }

        .grizzle-brand-logo-img {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease;
          filter: invert(1) brightness(1.2) drop-shadow(0 0 10px rgba(239, 68, 68, 0.6)) !important;
        }

        .grizzle-brand-logo-container:hover .grizzle-brand-logo-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
