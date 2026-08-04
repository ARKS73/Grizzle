'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronUp } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingActions() {
  const { getTotalCount } = useCart();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const totalCount = getTotalCount();

  return (
    <div className="floating-actions-wrapper">
      {/* View Cart Circular Button - Identical size to Back-to-Top with Product Count Badge */}
      {totalCount > 0 && (
        <Link href="/cart" className="floating-circle-btn floating-cart-btn" title={`View Cart (${totalCount} items)`}>
          <ShoppingBag size={22} />
          <span className="cart-count-badge">{totalCount}</span>
        </Link>
      )}

      {/* Back to Top Circular Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="floating-circle-btn back-to-top-btn"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ChevronUp size={24} />
        </button>
      )}

      <style jsx>{`
        .floating-actions-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          pointer-events: none;
        }

        /* Standardized Identical Circular Button Size (52px x 52px) */
        .floating-circle-btn {
          pointer-events: auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(12px);
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35), 0 0 15px rgba(239, 68, 68, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .floating-circle-btn:hover {
          transform: translateY(-4px) scale(1.08);
          border-color: var(--accent-primary);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45), 0 0 22px var(--accent-primary);
        }

        /* View Cart Button Styling */
        .floating-cart-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: rgba(255, 255, 255, 0.35);
        }

        /* Product Count Badge on View Cart Button */
        .cart-count-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ffffff;
          color: #dc2626;
          font-size: 0.75rem;
          font-weight: 900;
          min-width: 22px;
          height: 22px;
          padding: 0 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
          border: 2px solid #ef4444;
        }

        /* Back to Top Button Styling */
        .back-to-top-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .back-to-top-btn:hover {
          background: var(--accent-primary);
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .floating-actions-wrapper {
            bottom: 80px;
            right: 16px;
            gap: 10px;
          }
          .floating-circle-btn {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
