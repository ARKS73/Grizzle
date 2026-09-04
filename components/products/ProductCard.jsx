'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function ProductCard({ product, onQuickView }) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = isInWishlist(product._id);
  const isInCart = cartItems?.some((item) => item.product?._id === product._id);
  const cartItemForProduct = cartItems?.find((item) => item.product?._id === product._id);
  const itemCountInCart = cartItemForProduct ? cartItemForProduct.quantity : 1;



  // Find primary and secondary hover images
  const validImages = (product.images || []).filter((img) => img && img !== '/logo2.png');
  const primaryImg = validImages[0] || product.images?.[0] || '';
  const secondaryImg = validImages[1] || null;

  const originalPriceVal = product.originalPrice > product.price
    ? product.originalPrice
    : Math.round(product.price * 1.3);

  const discountPctVal = product.discountPercentage > 0
    ? product.discountPercentage
    : Math.round(((originalPriceVal - product.price) / originalPriceVal) * 100);

  return (
    <div
      className="streetwear-product-card glass-panel"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product?._id) router.prefetch(`/product/${product._id}`);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Media Container */}
      <div className="card-media-box">
        <Link
          href={`/product/${product._id}`}
          className="card-media-link"
        >
          {/* Primary Image */}
          <img
            src={getOptimizedImageUrl(primaryImg, 600, 85)}
            alt={product.name}
            className={`card-img-primary ${isHovered && secondaryImg ? 'hide-on-hover' : ''} ${isHovered && !secondaryImg ? 'zoom-on-hover' : ''}`}
            loading="eager"
            decoding="async"
          />

          {/* Secondary Hover Image (Swap effect) */}
          {secondaryImg && (
            <img
              src={getOptimizedImageUrl(secondaryImg, 600, 85)}
              alt={`${product.name} back view`}
              className={`card-img-secondary ${isHovered ? 'show-on-hover' : ''}`}
              loading="lazy"
              decoding="async"
            />
          )}
        </Link>

        {/* Brand Tag Badges */}
        <div className="card-badge-row">
          {discountPctVal > 0 && (
            <span className="street-badge badge-sale">-{discountPctVal}% OFF</span>
          )}
          {product.isBestSeller && (
            <span className="street-badge badge-bestseller">🔥 BESTSELLER</span>
          )}
          {product.stock <= 8 && product.stock > 0 && (
            <span className="street-badge badge-stock">ONLY {product.stock} LEFT</span>
          )}
        </div>

        {/* Wishlist & Quick View Floating Buttons */}
        <div className="card-floating-actions">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`float-btn ${isSaved ? 'active-saved' : ''}`}
            title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#ffffff'} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="float-btn"
            title="Quick Preview"
          >
            <Eye size={16} color="#ffffff" />
          </button>
        </div>

        {/* Quick Add To Bag Hover Bar (Desktop Hover & Always visible on Mobile) */}
        <div className="quick-add-hover-bar">
          {isInCart ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/cart');
              }}
              className="quick-add-btn added-state"
            >
              IN BAG ({itemCountInCart}) — VIEW CART <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, selectedSize, product.colors?.[0]?.name || 'Default', 1);
              }}
              className="quick-add-btn"
            >
              <ShoppingBag size={14} /> QUICK ADD TO BAG — ₹{product.price?.toFixed(0)}
            </button>
          )}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="card-info-box">
        <div className="category-meta-row">
          <span className="card-category-tag">{product.category || 'Streetwear'}</span>
          {Boolean(product.numReviews > 0 && product.ratings > 0) && (
            <div className="rating-pill">
              <Star size={11} fill="#facc15" color="#facc15" />
              <span className="rating-val">{Number(product.ratings).toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link href={`/product/${product._id}`} className="card-product-title">
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="card-price-row">
          <div className="price-stack">
            <span className="price-sale">₹{product.price?.toFixed(0)}</span>
            {originalPriceVal > product.price && (
              <span className="price-mrp">₹{originalPriceVal.toFixed(0)}</span>
            )}
          </div>

          {/* Size Selector Pills */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="card-size-pills">
              {product.sizes.slice(0, 4).map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`mini-size-btn ${selectedSize === sz ? 'active' : ''}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .streetwear-product-card {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
        }

        .streetwear-product-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: #dc2626;
        }

        .card-media-box {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: var(--bg-tertiary);
          cursor: pointer;
        }

        .card-media-link {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
        }

        .card-img-primary {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .card-img-primary.hide-on-hover {
          opacity: 0;
        }

        .card-img-primary.zoom-on-hover {
          transform: scale(1.06);
        }

        .card-img-secondary {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.35s ease;
          transform: scale(1.03);
        }

        .card-img-secondary.show-on-hover {
          opacity: 1;
          transform: scale(1.06);
        }

        .card-badge-row {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 3;
        }

        .street-badge {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: fit-content;
        }

        .badge-sale {
          background: #dc2626;
          color: #ffffff;
        }

        .badge-bestseller {
          background: #facc15;
          color: #000000;
        }

        .badge-stock {
          background: rgba(0, 0, 0, 0.85);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .card-floating-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 3;
        }

        .float-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .float-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: scale(1.1);
        }

        .float-btn.active-saved {
          background: rgba(220, 38, 38, 0.2);
          border-color: #dc2626;
        }

        /* Quick Add Hover Bar */
        .quick-add-hover-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
          transform: translateY(100%);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 4;
        }

        .streetwear-product-card:hover .quick-add-hover-bar {
          transform: translateY(0);
        }

        .quick-add-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: #dc2626;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .quick-add-btn:hover {
          background: #b91c1c;
        }

        .quick-add-btn.added-state {
          background: #10b981;
        }

        /* Card Content */
        .card-info-box {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .category-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-category-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .rating-pill {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(250, 204, 21, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .rating-val {
          font-size: 0.72rem;
          font-weight: 800;
          color: #d97706;
        }

        .card-product-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          text-decoration: none;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s ease;
        }

        .card-product-title:hover {
          color: #dc2626;
        }

        .card-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.35rem;
        }

        .price-stack {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .price-sale {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .price-mrp {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .card-size-pills {
          display: flex;
          gap: 3px;
        }

        .mini-size-btn {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 4px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mini-size-btn.active {
          background: var(--text-primary);
          color: var(--text-inverse);
          border-color: var(--text-primary);
        }

        /* Responsive Mobile Scaling — Highest Priority Specificity Overrides */
        @media (max-width: 768px) {
          .card-media-box {
            position: relative !important;
            display: block !important;
            width: 100% !important;
            aspect-ratio: 4 / 5 !important;
            overflow: hidden !important;
          }
          .card-info-box {
            padding: 0.45rem 0.55rem !important;
            gap: 0.15rem !important;
          }
          .card-product-title {
            font-size: 0.65rem !important;
            line-height: 1.18 !important;
            font-weight: 700 !important;
            max-height: 1.58rem !important;
            min-height: auto !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            word-break: break-word !important;
            margin: 1px 0 !important;
          }
          .card-category-tag {
            font-size: 0.52rem !important;
          }
          .price-sale {
            font-size: 0.78rem !important;
          }
          .price-mrp {
            font-size: 0.62rem !important;
          }
          .quick-add-hover-bar {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: translateY(0) !important;
            background: rgba(0, 0, 0, 0.8) !important;
            padding: 4px 6px !important;
            z-index: 4 !important;
          }
          .quick-add-btn {
            padding: 4px 6px !important;
            font-size: 0.60rem !important;
            border-radius: 6px !important;
          }
          .mini-size-btn {
            font-size: 0.52rem !important;
            padding: 1px 3px !important;
          }
        }
      `}</style>
    </div>
  );
}
