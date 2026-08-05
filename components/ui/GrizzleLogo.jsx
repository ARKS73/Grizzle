'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', href = '/' }) {
  const logoHeights = {
    small: '30px',
    medium: '40px',
    large: '54px',
  }[size] || '40px';

  const logoContent = (
    <div className={`grizzle-brand-logo-container size-${size}`}>
      <img
        src="/grizzle-logo-brand.jpg"
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
          mix-blend-mode: screen;
          filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));
        }

        [data-theme='light'] .grizzle-brand-logo-img {
          mix-blend-mode: multiply;
          filter: contrast(180%) drop-shadow(0 0 6px rgba(0, 0, 0, 0.15));
        }

        .grizzle-brand-logo-container:hover .grizzle-brand-logo-img {
          transform: scale(1.05);
          filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.7));
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
