'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, Eye, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function ProductCard({ product, onQuickView }) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const isSaved = isInWishlist(product._id);
  const isInCart = cartItems?.some((item) => item.product?._id === product._id);

  const cartItemForProduct = cartItems?.find((item) => item.product?._id === product._id);
  const itemCountInCart = cartItemForProduct ? cartItemForProduct.quantity : 1;

  const pressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const startPressTimer = () => {
    isLongPressRef.current = false;
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (onQuickView) {
        onQuickView(product);
      }
    }, 1200);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleMediaClick = (e) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    router.push(`/product/${product._id}`);
  };

  return (
    <div className="product-card glass-panel">
      {/* Image & Overlay Actions */}
      <div
        className="card-media"
        onMouseEnter={() => {
          if (product?._id) router.prefetch(`/product/${product._id}`);
        }}
        onMouseDown={startPressTimer}
        onMouseUp={clearPressTimer}
        onMouseLeave={clearPressTimer}
        onTouchStart={startPressTimer}
        onTouchEnd={clearPressTimer}
        onTouchCancel={clearPressTimer}
        onClick={handleMediaClick}
        style={{ cursor: 'pointer' }}
        title="Tap to view full details • Hold for quick preview"
      >
        <img
          src={getOptimizedImageUrl(product.images?.[0] || '/logo2.png', 500, 80)}
          alt={product.name}
          className="card-img"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {/* Badges Overlay */}
        <div className="card-badges">
          {product.discountPercentage > 0 && (
            <span className="badge badge-danger">-{product.discountPercentage}%</span>
          )}
          {product.isBestSeller && (
            <span className="badge badge-warning">🔥 Best Seller</span>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="badge badge-info">Only {product.stock} left</span>
          )}
        </div>

        {/* Quick Action Overlay Buttons */}
        <div className="card-overlay-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`action-btn ${isSaved ? 'active' : ''}`}
            title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            className="action-btn"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="card-content">
        <span className="card-category">{product.category}</span>
        <Link href={`/product/${product._id}`} className="card-title">
          {product.name}
        </Link>

        {/* Dynamic Rating Breakdown */}
        <div className="card-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span className="rating-num">
            {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
          </span>
          <span className="review-count">({product.numReviews || 0})</span>
        </div>

        {/* Sizes Pills */}
        <div className="sizes-row">
          {product.sizes?.map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`size-pill ${selectedSize === sz ? 'active' : ''}`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Price & Add to Cart / Checkout Action */}
        <div className="card-footer">
          <div className="price-box">
            <span className="price-current">₹{product.price?.toFixed(0)}</span>
            {product.originalPrice > product.price && (
              <span className="price-original">₹{product.originalPrice?.toFixed(0)}</span>
            )}
          </div>

          {isInCart ? (
            <Link href="/cart" className="btn btn-primary card-add-btn card-checkout-btn font-bold">
              <ShoppingBag size={16} /> View Cart ({itemCountInCart})
            </Link>
          ) : (
            <button
              onClick={() => addToCart(product, selectedSize, product.colors?.[0]?.name || 'Default', 1)}
              className="btn btn-primary card-add-btn"
            >
              <ShoppingBag size={16} /> Add
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-secondary);
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }
        .product-card:hover {
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
        .product-card:hover .card-img {
          transform: scale(1.06);
        }
        .card-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .media-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-glass);
          backdrop-filter: blur(8px);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .action-btn:hover {
          background: var(--bg-secondary);
          color: var(--accent-primary);
        }
        .action-btn.saved {
          border-color: var(--danger);
        }

        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-category {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color var(--transition-fast);
        }
        .card-title:hover {
          color: var(--accent-primary);
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.75rem;
        }
        .stars { display: flex; gap: 2px; }
        .rating-num { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
        .review-count { font-size: 0.8rem; color: var(--text-muted); }

        .sizes-row {
          display: flex;
          gap: 4px;
          margin-bottom: 1rem;
        }
        .size-pill {
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .size-pill.active, .size-pill:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        .price-box {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .price-current {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .price-original {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .card-add-btn {
          padding: 0.45rem 0.85rem;
          font-size: 0.85rem;
        }

        @media (max-width: 640px) {
          .card-content {
            padding: 0.75rem;
          }
          .card-badges {
            top: 6px;
            left: 6px;
            gap: 4px;
          }
          .card-badges .badge {
            font-size: 0.65rem;
            padding: 2px 6px;
          }
          .card-title {
            font-size: 0.85rem;
            margin-bottom: 0.35rem;
          }
          .card-rating {
            margin-bottom: 0.5rem;
            gap: 0.2rem;
          }
          .rating-num { font-size: 0.75rem; }
          .review-count { font-size: 0.7rem; }
          .sizes-row {
            margin-bottom: 0.6rem;
            gap: 3px;
            flex-wrap: wrap;
          }
          .size-pill {
            padding: 2px 5px;
            font-size: 0.65rem;
          }
          .card-footer {
            padding-top: 0.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .price-box {
            width: 100%;
            justify-content: space-between;
          }
          .price-current {
            font-size: 1rem;
          }
          .price-original {
            font-size: 0.75rem;
          }
          .card-add-btn {
            width: 100%;
            justify-content: center;
            padding: 0.4rem 0.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
