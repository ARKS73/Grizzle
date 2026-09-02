'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function QuickViewModal({ product, onClose }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const defaultColor = product?.colors?.[0]?.name || '';

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);

  // Active color object
  const activeColorObj = product?.colors?.find((c) => c.name === selectedColor) || product?.colors?.[0];

  // Images of ALL OTHER colors (to hide when current color is active)
  const otherColors = (product?.colors || []).filter((c) => c.name !== activeColorObj?.name);
  const otherColorImages = otherColors.flatMap((c) =>
    (Array.isArray(c.images) && c.images.length > 0) ? c.images : (c.image ? [c.image] : [])
  ).filter((img) => img && img !== '/logo2.png');

  // Images of the ACTIVE color
  const activeColorImages = (Array.isArray(activeColorObj?.images) && activeColorObj.images.length > 0)
    ? activeColorObj.images.filter((img) => img && img !== '/logo2.png')
    : (activeColorObj?.image && activeColorObj.image !== '/logo2.png' ? [activeColorObj.image] : []);

  // General product gallery images
  const userImages = (product?.images || []).filter((img) => img && img !== '/logo2.png');

  // Displayed thumbnails: active color images first + general images (excluding images of other colors)
  const cleanImages = Array.from(
    new Set([
      ...activeColorImages,
      ...userImages.filter((img) => !otherColorImages.includes(img)),
    ])
  ).filter(Boolean);

  const finalThumbnails = cleanImages.length > 0 ? cleanImages : (product?.images || []);

  const [selectedImage, setSelectedImage] = useState(finalThumbnails[0] || '');

  useEffect(() => {
    if (product?.colors?.[0]?.name && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  if (!product) return null;

  const isSaved = isInWishlist(product._id);

  const currentMainImage = (selectedImage && finalThumbnails.includes(selectedImage))
    ? selectedImage
    : (finalThumbnails[0] || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quickview-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="quickview-grid">
          {/* Gallery */}
          <div className="quickview-gallery">
            <div className="main-image-box">
              <img
                src={getOptimizedImageUrl(currentMainImage, 600, 80)}
                alt={product.name}
                className="main-image"
                loading="eager"
                decoding="async"
              />
            </div>
            {finalThumbnails.length > 1 && (
              <div className="thumbnails-row">
                {finalThumbnails.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`thumb-btn ${currentMainImage === img ? 'active' : ''}`}
                  >
                    <img src={getOptimizedImageUrl(img, 150, 70)} alt={`thumb-${idx}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="quickview-details">
            <span className="badge badge-primary text-uppercase">
              {product.category || 'Grizzle Collection'}
            </span>
            <h2 className="product-title font-bold mt-1 mb-2">{product.name}</h2>

            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <span className="rating-text subtext">
                {product.numReviews > 0
                  ? `${Number(product.ratings || 0).toFixed(1)} (${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'})`
                  : '0.0 (0 reviews)'}
              </span>
            </div>

            <div className="price-row">
              <span className="price-current">
                ₹{product.price?.toFixed(0)}
              </span>
              {product.originalPrice > product.price && (
                <span className="price-original">
                  ₹{product.originalPrice?.toFixed(0)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-danger">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>

            <p className="description">
              {product.description}
            </p>

            {/* Colors Picker */}
            {product.colors?.length > 0 && (
              <div className="variant-group">
                <label className="variant-label">
                  Color Option: <span className="selected-color-name">{selectedColor || product.colors[0]?.name}</span>
                </label>

                <div className="colors-picker">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c.name);
                        const cImgs = (Array.isArray(c.images) && c.images.length > 0)
                          ? c.images
                          : (c.image ? [c.image] : []);
                        if (cImgs[0]) {
                          setSelectedImage(cImgs[0]);
                        }
                      }}
                      className={`color-pill ${selectedColor === c.name ? 'active' : ''}`}
                    >
                      <span className="color-dot" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Picker */}
            {product.sizes?.length > 0 && (
              <div className="variant-group">
                <label className="variant-label">
                  Select Size: {selectedSize && <span className="selected-color-name">{selectedSize}</span>}
                </label>
                <div className="sizes-picker">
                  {product.sizes.map((sz) => {
                    const sizeQty = (product.sizeStock && product.sizeStock[sz] !== undefined)
                      ? Number(product.sizeStock[sz])
                      : Math.max(0, Math.floor((product.stock || 0) / product.sizes.length));
                    const isOut = sizeQty <= 0;
                    const isLow = sizeQty > 0 && sizeQty <= 3;

                    return (
                      <button
                        key={sz}
                        onClick={() => !isOut && setSelectedSize(sz)}
                        disabled={isOut}
                        className={`size-btn ${selectedSize === sz ? 'active' : ''} ${isOut ? 'out-of-stock' : ''}`}
                        title={isOut ? `Size ${sz} is Out of Stock` : `Size ${sz}: ${sizeQty} available`}
                      >
                        <span className="size-text">{sz}</span>
                        {isOut && <span className="size-subtag out">Out</span>}
                        {isLow && !isOut && <span className="size-subtag low">{sizeQty} left</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Selected Size Stock Pill */}
                {selectedSize && (
                  <div className="selected-size-stock-badge">
                    {(() => {
                      const selectedQty = (product.sizeStock && product.sizeStock[selectedSize] !== undefined)
                        ? Number(product.sizeStock[selectedSize])
                        : (product.stock || 0);
                      if (selectedQty <= 0) {
                        return (
                          <span className="stock-pill stock-out">
                            ✕ Size {selectedSize}: Out of Stock (0 left)
                          </span>
                        );
                      }
                      return (
                        <span className={`stock-pill ${selectedQty <= 3 ? 'stock-low' : 'stock-in'}`}>
                          <span className="stock-dot" />
                          Size {selectedSize}: In Stock ({selectedQty} {selectedQty === 1 ? 'left' : 'left'})
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Quantity & CTA */}
            {(() => {
              const maxAvailable = selectedSize && product.sizeStock && product.sizeStock[selectedSize] !== undefined
                ? Math.max(0, Number(product.sizeStock[selectedSize]))
                : Math.max(0, Number(product.stock || 0));
              const isMaxReached = quantity >= maxAvailable;

              return (
                <div>
                  <div className="action-row">
                    <div className="quantity-control">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => {
                          if (!isMaxReached) {
                            setQuantity(quantity + 1);
                          }
                        }}
                        disabled={isMaxReached || maxAvailable <= 0}
                        title={isMaxReached ? `Only ${maxAvailable} in stock` : ''}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const finalQty = Math.min(quantity, maxAvailable);
                        const finalColor = selectedColor || product?.colors?.[0]?.name || 'Standard';
                        addToCart(product, selectedSize, finalColor, finalQty);
                        onClose();
                      }}
                      disabled={maxAvailable <= 0}
                      className="btn btn-primary add-to-cart-btn"
                    >
                      <ShoppingBag size={18} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart (${Math.min(quantity, maxAvailable)})`} <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`wishlist-btn ${isSaved ? 'saved' : ''}`}
                      title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={20}
                        fill={isSaved ? '#ef4444' : 'transparent'}
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* View Full Product Page Link */}
                  <Link
                    href={`/product/${product._id}`}
                    onClick={onClose}
                    className="view-full-page-link"
                  >
                    View Full Product Page &amp; Verified Reviews &rarr;
                  </Link>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .quickview-card {
          max-width: 820px;
          width: 95%;
          padding: 2rem;
          border-radius: var(--radius-lg);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .modal-close-btn:hover {
          background: var(--accent-light);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .quickview-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .main-image-box {
          position: relative;
          width: 100%;
          height: 360px;
          border-radius: 14px;
          overflow: hidden;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnails-row {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          margin-top: 0.75rem;
          padding-bottom: 0.25rem;
        }

        .thumb-btn {
          width: 64px;
          height: 76px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid var(--border-color);
          background: var(--bg-tertiary);
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .thumb-btn.active {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
          transform: scale(1.03);
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quickview-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .product-title {
          font-size: 1.35rem;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stars {
          display: flex;
          gap: 2px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
        }
        .price-current {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .price-original {
          font-size: 0.95rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .description {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .variant-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .variant-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .selected-color-name {
          font-weight: 800;
          color: var(--accent-primary);
        }

        .colors-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .color-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          border-radius: 99px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .color-pill.active {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 800;
          box-shadow: 0 0 0 1px var(--accent-primary);
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .sizes-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .size-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          height: 42px;
          padding: 0 0.8rem;
          border-radius: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .size-btn.active {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 900;
          box-shadow: 0 0 0 1px var(--accent-primary);
        }
        .size-btn.out-of-stock {
          opacity: 0.4;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .selected-size-stock-badge {
          margin-top: 0.35rem;
        }
        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .stock-in {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .stock-low {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .stock-out {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        .stock-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .action-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .quantity-control {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-tertiary);
          height: 46px;
        }
        .quantity-control button {
          width: 36px;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .quantity-control button:hover {
          background: var(--border-color);
        }
        .quantity-control span {
          width: 36px;
          text-align: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .add-to-cart-btn {
          flex: 1;
          height: 46px;
          border-radius: 10px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-size: 0.98rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all 0.2s ease;
        }
        .add-to-cart-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: var(--shadow-glow);
        }

        .wishlist-btn {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-color);
          color: var(--accent-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .wishlist-btn:hover {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          transform: scale(1.05);
        }
        .wishlist-btn.saved {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: #ef4444 !important;
        }

        .view-full-page-link {
          color: var(--accent-primary);
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          margin-top: 1rem;
          display: inline-block;
          transition: color 0.2s ease;
        }
        .view-full-page-link:hover {
          text-decoration: underline;
          color: var(--accent-hover);
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .quickview-card {
            padding: 1.25rem 1rem !important;
            max-height: 92vh !important;
            border-radius: 16px !important;
            width: 95% !important;
          }
          .modal-close-btn {
            top: 0.75rem;
            right: 0.75rem;
            width: 32px;
            height: 32px;
          }
          .quickview-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .main-image-box {
            height: 260px !important;
            border-radius: 12px;
          }
          .thumb-btn {
            width: 54px !important;
            height: 66px !important;
          }
          .product-title {
            font-size: 1.15rem !important;
          }
          .price-current {
            font-size: 1.2rem !important;
          }
          .action-row {
            gap: 0.5rem !important;
          }
          .add-to-cart-btn {
            font-size: 0.88rem !important;
            padding: 0 0.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .main-image-box {
            height: 220px !important;
          }
          .action-row {
            flex-wrap: wrap !important;
          }
          .quantity-control {
            height: 42px;
          }
          .add-to-cart-btn {
            height: 42px;
            font-size: 0.85rem !important;
          }
          .wishlist-btn {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
}
