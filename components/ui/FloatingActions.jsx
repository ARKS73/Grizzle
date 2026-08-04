'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronUp } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingActions() {
  const router = useRouter();
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

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/cart');
  };

  const totalCount = getTotalCount();

  return (
    <div className="floating-actions-wrapper">
      {/* Prominent Floating Shopping Bag Button - always visible */}
      <a
        href="/cart"
        onClick={handleCartClick}
        className="floating-circle-btn floating-cart-btn"
        title={`Shopping Bag${totalCount > 0 ? ` (${totalCount} items)` : ''}`}
        aria-label="Go to Shopping Bag"
      >
        <ShoppingBag size={26} />
        {totalCount > 0 && (
          <span className="floating-cart-badge">{totalCount}</span>
        )}
      </a>

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
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .floating-circle-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #0f172a);
          border: 2px solid var(--border-color, #e2e8f0);
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .floating-circle-btn:hover {
          transform: translateY(-4px) scale(1.08);
          background: var(--bg-primary, #ffffff);
          color: var(--accent-primary, #ef4444);
          border-color: var(--accent-primary, #ef4444);
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.25);
        }

        .floating-cart-btn {
          border-color: var(--accent-primary, #ef4444);
          color: var(--text-primary, #0f172a);
        }

        .floating-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          line-height: 1;
          padding: 0 4px;
        }

        /* Back to Top Button */
        .back-to-top-btn {
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #0f172a);
          border: 2px solid var(--border-color, #e2e8f0);
        }

        .back-to-top-btn:hover {
          background: var(--accent-primary, #ef4444);
          color: #ffffff;
          border-color: var(--accent-primary, #ef4444);
        }

        @media (max-width: 768px) {
          .floating-actions-wrapper {
            bottom: 80px;
            right: 16px;
            gap: 12px;
          }
          .floating-circle-btn {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </div>
  );
}

