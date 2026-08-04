'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, ShoppingBag, ChevronUp } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingActions() {
  const { getTotalCount } = useCart();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
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
      {/* Floating View Cart / Bag Button */}
      {totalCount > 0 && (
        <Link href="/cart" className="floating-btn floating-cart-btn glass-panel" title="View Shopping Bag">
          <ShoppingBag size={20} />
        </Link>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="floating-btn back-to-top-btn glass-panel"
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
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          pointer-events: none;
        }

        .floating-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          padding: 0;
          border-radius: 9999px;
          border: 1.5px solid var(--border-color);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          color: white;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(239, 68, 68, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .floating-btn:hover {
          transform: translateY(-4px) scale(1.03);
          border-color: var(--accent-primary);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px var(--accent-primary);
        }

        /* View Cart Floating Button */
        .floating-cart-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: rgba(255, 255, 255, 0.3);
          animation: floatBounce 2s ease-in-out infinite;
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* Back to Top Floating Button */
        .back-to-top-btn {
          width: 46px;
          height: 46px;
          padding: 0;
          justify-content: center;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .back-to-top-btn:hover {
          background: var(--accent-primary);
          color: white;
        }

        @media (max-width: 768px) {
          .floating-actions-wrapper {
            bottom: 80px; /* Space for mobile navigation bar */
            right: 16px;
            gap: 8px;
          }
          .floating-btn {
            padding: 8px 14px;
          }
          .back-to-top-btn {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
}
