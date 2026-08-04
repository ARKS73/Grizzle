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
      if (window.scrollY > 180) {
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
      {/* Prominent Floating Shopping Bag Button */}
      {totalCount > 0 && (
        <Link
          href="/cart"
          className="floating-circle-btn floating-cart-btn"
          title="Shopping Bag"
          aria-label="Shopping Bag"
        >
          <ShoppingBag size={28} />
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
          <ChevronUp size={26} />
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
          gap: 14px;
          pointer-events: none;
        }

        .floating-circle-btn {
          pointer-events: auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px solid rgba(239, 68, 68, 0.4);
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .floating-circle-btn:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 16px 32px rgba(239, 68, 68, 0.55), 0 0 24px var(--accent-primary);
        }

        /* Back to Top Button */
        .back-to-top-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .back-to-top-btn:hover {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
        }

        @media (max-width: 768px) {
          .floating-actions-wrapper {
            bottom: 80px;
            right: 16px;
            gap: 12px;
          }
          .floating-circle-btn {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
}
