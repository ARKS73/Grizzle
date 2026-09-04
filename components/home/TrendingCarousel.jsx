'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingBag, Flame, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function TrendingCarousel({ products = [] }) {
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="trending-carousel-section">
      <div className="container">
        {/* Section Header with Navigation Controls */}
        <div className="trending-header">
          <div>
            <div className="trending-badge-pill">
              <Flame size={14} className="text-flame" />
              <span>FASTEST SELLING DROPS</span>
            </div>
            <h2 className="trending-title">TRENDING NOW</h2>
            <p className="trending-subtitle">High-demand tees selling out fast</p>
          </div>

          <div className="carousel-nav-btns">
            <button
              onClick={() => handleScroll('left')}
              className="carousel-arrow-btn"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="carousel-arrow-btn"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div className="trending-scroll-track" ref={scrollRef}>
          {products.map((product) => {
            const original = product.originalPrice || Math.round(product.price * 1.35);
            const discountPct = Math.round(((original - product.price) / original) * 100);

            return (
              <div key={product._id} className="trending-card-item">
                <div className="trending-img-box">
                  <Link href={`/product/${product._id}`}>
                    <img
                      src={
                        Array.isArray(product.images) && product.images[0]
                          ? product.images[0]
                          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={product.name}
                      className="trending-card-img"
                    />
                  </Link>

                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <span className="trending-discount-badge">{discountPct}% OFF</span>
                  )}

                  {/* Quick Add to Bag on Hover */}
                  <div className="trending-quick-add-overlay">
                    <button
                      onClick={() =>
                        addToCart(
                          product,
                          product.sizes?.[0] || 'M',
                          product.colors?.[0]?.name || 'Default',
                          1
                        )
                      }
                      className="trending-add-btn"
                    >
                      <ShoppingBag size={16} />
                      <span>ADD TO BAG</span>
                    </button>
                  </div>
                </div>

                <div className="trending-card-body">
                  <span className="trending-card-cat">{product.category || 'Streetwear'}</span>
                  <Link href={`/product/${product._id}`} className="trending-card-title">
                    {product.name}
                  </Link>

                  <div className="trending-card-pricing">
                    <span className="trending-sale-price">₹{product.price.toFixed(0)}</span>
                    {original > product.price && (
                      <span className="trending-mrp-price">₹{original.toFixed(0)}</span>
                    )}
                    <div className="trending-rating-tag">
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span>{product.ratings ? Number(product.ratings).toFixed(1) : '4.9'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .trending-carousel-section {
          padding: 3.5rem 0;
          background: var(--bg-primary, #09090b);
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }

        .trending-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.75rem;
        }

        .trending-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .trending-title {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--text-primary, #ffffff);
          margin: 0;
          text-transform: uppercase;
        }

        .trending-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted, #a1a1aa);
          margin: 0.25rem 0 0 0;
        }

        .carousel-nav-btns {
          display: flex;
          gap: 0.5rem;
        }

        .carousel-arrow-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-tertiary, #18181b);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          color: var(--text-primary, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .carousel-arrow-btn:hover {
          background: var(--accent-primary, #dc2626);
          border-color: var(--accent-primary, #dc2626);
          color: #ffffff;
          transform: translateY(-2px);
        }

        .trending-scroll-track {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 1rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .trending-scroll-track::-webkit-scrollbar {
          height: 6px;
        }

        .trending-scroll-track::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .trending-card-item {
          flex: 0 0 240px;
          scroll-snap-align: start;
          background: var(--bg-secondary, #121215);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .trending-card-item:hover {
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }

        .trending-img-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #18181b;
          overflow: hidden;
        }

        .trending-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .trending-card-item:hover .trending-card-img {
          transform: scale(1.06);
        }

        .trending-discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #dc2626;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          z-index: 2;
        }

        .trending-quick-add-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.85) 100%);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trending-card-item:hover .trending-quick-add-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .trending-add-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #ffffff;
          color: #09090b;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 0.55rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trending-add-btn:hover {
          background: #dc2626;
          color: #ffffff;
        }

        .trending-card-body {
          padding: 0.85rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .trending-card-cat {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-muted, #a1a1aa);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .trending-card-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.5rem;
        }

        .trending-card-title:hover {
          color: var(--accent-primary, #dc2626);
        }

        .trending-card-pricing {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;
        }

        .trending-sale-price {
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--text-primary, #ffffff);
        }

        .trending-mrp-price {
          font-size: 0.75rem;
          color: var(--text-muted, #71717a);
          text-decoration: line-through;
        }

        .trending-rating-tag {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.72rem;
          font-weight: 800;
          color: #f59e0b;
        }

        @media (max-width: 640px) {
          .trending-card-item {
            flex: 0 0 190px;
          }
          .trending-title {
            font-size: 1.5rem;
          }
          .trending-quick-add-overlay {
            opacity: 1;
            transform: translateY(0);
            background: transparent;
            position: relative;
            padding: 0.5rem 0 0 0;
          }
          .trending-add-btn {
            background: var(--bg-tertiary, #18181b);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
        }
      `}</style>
    </section>
  );
}
