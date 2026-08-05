'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, ShieldCheck, Check, Star } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // Track selected size for each item on the wishlist page
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleMoveToCart = (product) => {
    const chosenSize = selectedSizes[product._id] || product.sizes?.[0] || 'M';
    const chosenColor = product.colors?.[0]?.name || 'Pitch Black';
    addToCart(product, chosenSize, chosenColor, 1);
    removeFromWishlist(product._id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((product) => {
      const chosenSize = selectedSizes[product._id] || product.sizes?.[0] || 'M';
      const chosenColor = product.colors?.[0]?.name || 'Pitch Black';
      addToCart(product, chosenSize, chosenColor, 1);
    });
    clearWishlist();
  };

  // Calculate total savings
  const totalSavings = wishlistItems.reduce((acc, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return acc + (item.originalPrice - item.price);
    }
    return acc;
  }, 0);

  const totalPrice = wishlistItems.reduce((acc, item) => acc + (item.price || 0), 0);

  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist-hero-wrapper">
        <div className="empty-card glass-panel">
          <div className="icon-pulse-wrapper">
            <Heart size={44} className="empty-heart-icon" fill="#ef4444" color="#ef4444" />
          </div>
          <h2 className="empty-title">Your Wishlist is Empty</h2>
          <p className="empty-subtitle">
            Keep track of your favorite high-density DTF printed tees, anime drop art & 240 GSM heavy hoodies in one place.
          </p>
          <Link href="/products" className="btn btn-primary btn-lg mt-4 shadow-glow explore-btn">
            Explore T-Shirts & Drops <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container wishlist-page-wrapper">
      {/* Header Banner */}
      <div className="wishlist-header-banner glass-panel">
        <div className="wishlist-header-info">
          <h1 className="wishlist-title">
            <Heart size={28} className="title-icon text-danger" fill="#ef4444" />
            Saved Wishlist <span className="item-count-badge">({wishlistItems.length} items)</span>
          </h1>
          <p className="wishlist-subtitle">
            Select your preferred size for each t-shirt and move them directly to your Cart.
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="wishlist-header-actions">
            {totalSavings > 0 && (
              <div className="savings-badge">
                <Sparkles size={16} /> Total Savings: <strong>₹{totalSavings.toFixed(0)}</strong>
              </div>
            )}
            <button onClick={handleMoveAllToCart} className="btn btn-primary shadow-glow">
              <ShoppingBag size={18} /> Move All to Cart
            </button>
          </div>
        )}
      </div>

      {/* Grid of Wishlist Products */}
      <div className="grid-products">
        {wishlistItems.map((product) => {
          const currentSize = selectedSizes[product._id] || product.sizes?.[0] || 'M';
          const discountPct = product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

          return (
            <div key={product._id} className="wishlist-card glass-panel">
              <div className="card-media">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="card-img"
                />
                
                {/* Remove Icon */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="remove-wishlist-btn"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>

                {discountPct > 0 && (
                  <span className="discount-tag">-{discountPct}% OFF</span>
                )}
              </div>

              <div className="card-body">
                <div className="card-top-meta">
                  <span className="badge badge-primary">{product.category}</span>
                  {product.stock <= 10 && product.stock > 0 && (
                    <span className="badge badge-warning">Only {product.stock} left</span>
                  )}
                </div>

                <Link href={`/product/${product._id}`} className="product-title">
                  {product.name}
                </Link>

                <div className="rating-row">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <span className="rating-val">
                    {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="price-row">
                  <span className="price">₹{product.price?.toFixed(0)}</span>
                  {product.originalPrice > product.price && (
                    <span className="original-price">₹{product.originalPrice?.toFixed(0)}</span>
                  )}
                </div>

                {/* Size Selector on Wishlist Card */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="size-selector-box">
                    <label className="size-label">Select Size:</label>
                    <div className="sizes-pills">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSizeSelect(product._id, sz)}
                          className={`size-btn ${currentSize === sz ? 'selected' : ''}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Move to Bag Button */}
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="btn btn-primary move-cart-btn"
                >
                  <ShoppingBag size={16} /> Move to Bag ({currentSize})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .wishlist-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .wishlist-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .wishlist-title {
          font-size: 2rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }
        .item-count-badge {
          font-size: 1.25rem;
          color: var(--accent-primary);
          font-weight: 700;
        }
        .wishlist-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .wishlist-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .savings-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Wishlist Card */
        .wishlist-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-secondary);
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }
        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .card-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: var(--bg-tertiary);
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .wishlist-card:hover .card-img {
          transform: scale(1.06);
        }

        .remove-wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-glass);
          backdrop-filter: blur(8px);
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 3;
        }
        .remove-wishlist-btn:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        .discount-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          flex: 1;
        }
        .card-top-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .product-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          text-decoration: none;
        }
        .product-title:hover {
          color: var(--accent-primary);
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .stars { display: flex; gap: 2px; }
        .rating-val { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .price { font-size: 1.25rem; font-weight: 900; color: var(--text-primary); }
        .original-price { font-size: 0.85rem; color: var(--text-muted); text-decoration: line-through; }

        /* Size Selector */
        .size-selector-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }
        .size-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .sizes-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .size-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .size-btn.selected, .size-btn:hover {
          border-color: var(--accent-primary);
          color: white;
          background: var(--accent-primary);
        }

        .move-cart-btn {
          margin-top: auto;
          width: 100%;
          padding: 0.65rem 1rem;
        }

        /* Empty State Centered Hero */
        .empty-wishlist-hero-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          width: 100%;
          margin: auto;
        }
        .empty-card {
          padding: 4.25rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 580px;
          width: 100%;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          margin: 0 auto;
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
        }
        .icon-pulse-wrapper {
          width: 96px;
          height: 96px;
          border-radius: var(--radius-full);
          background: rgba(239, 68, 68, 0.12);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.75rem auto;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
          animation: heartPulse 2.2s infinite ease-in-out;
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(239, 68, 68, 0.25); }
          50% { transform: scale(1.08); box-shadow: 0 0 35px rgba(239, 68, 68, 0.5); }
        }
        .empty-title {
          font-size: 2.1rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }
        .empty-subtitle {
          color: var(--text-muted);
          font-size: 0.98rem;
          line-height: 1.6;
          max-width: 440px;
          margin: 0 auto;
        }
        .explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          font-size: 1rem;
          border-radius: var(--radius-full);
        }

        @media (max-width: 768px) {
          .wishlist-header-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .wishlist-header-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
