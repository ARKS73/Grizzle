'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronUp, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingActions() {
  const { getTotalCount, getTotalPrice } = useCart();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 240) {
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
  const totalPrice = getTotalPrice();

  return (
    <div className="floating-actions-wrapper">
      {/* Floating Checkout Bag Button with Item Count */}
      {totalCount > 0 && (
        <Link href="/checkout" className="floating-btn floating-checkout-btn glass-panel" title="Proceed to Checkout">
          <div className="btn-icon-box">
            <ShoppingBag size={20} />
            <span className="count-badge">{totalCount}</span>
          </div>
          <div className="btn-text-content">
            <span className="label-text">Checkout Bag ({totalCount})</span>
            <span className="price-text">₹{totalPrice.toFixed(0)}</span>
          </div>
          <ArrowRight size={18} className="arrow-icon" />
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
          gap: 10px;
          border-radius: 9999px;
          border: 1.5px solid var(--border-color);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          color: white;
          text-decoration: none;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(239, 68, 68, 0.3);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .floating-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 25px var(--accent-primary);
        }

        /* Prominent Checkout Bag Floating Button */
        .floating-checkout-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: rgba(255, 255, 255, 0.3);
          font-weight: 800;
        }

        .btn-icon-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .count-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          background: #ffffff;
          color: #dc2626;
          font-size: 0.72rem;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .btn-text-content {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .label-text {
          font-size: 0.88rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #ffffff;
        }

        .price-text {
          font-size: 0.76rem;
          opacity: 0.92;
          font-weight: 700;
          color: #fee2e2;
        }

        .arrow-icon {
          margin-left: 2px;
          transition: transform 0.2s ease;
        }

        .floating-checkout-btn:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* Back to Top Floating Button */
        .back-to-top-btn {
          width: 48px;
          height: 48px;
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
            bottom: 80px;
            right: 16px;
            gap: 10px;
          }
          .floating-checkout-btn {
            padding: 10px 16px;
          }
          .label-text {
            font-size: 0.82rem;
          }
          .back-to-top-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
