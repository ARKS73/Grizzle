'use client';

import React from 'react';
import Link from 'next/link';

export default function GrizzleLogo({ size = 'medium', href = '/' }) {
  // Natural rectangular aspect ratio sizing for high visibility without circular clipping
  const logoStyles = {
    small: { height: '42px', maxWidth: '140px' },
    medium: { height: '54px', maxWidth: '190px' },
    large: { height: '76px', maxWidth: '260px' },
  }[size] || { height: '54px', maxWidth: '190px' };

  const logoContent = (
    <div className={`grizzle-logo-container size-${size}`}>
      {/* Rectangular Natural Aspect Ratio Logo Image without curve clipping */}
      <img
        src="/logo2.png"
        alt="Grizzle Apparel Logo"
        style={{
          height: logoStyles.height,
          width: 'auto',
          maxWidth: logoStyles.maxWidth,
          objectFit: 'contain',
          borderRadius: '0px',
          filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4)) drop-shadow(0 0 4px rgba(251, 191, 36, 0.3))',
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
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .grizzle-logo-container:hover .grizzle-brand-img {
          transform: scale(1.05);
          filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.7)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
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
