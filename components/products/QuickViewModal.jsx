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
    <div className="modal-overlay quickview-modal-overlay" onClick={onClose}>
      <div className="modal-content quickview-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="quickview-grid">
          {/* Gallery */}
          <div className="quickview-gallery">
            <div className="main-image-box">
              <img
                src={getOptimizedImageUrl(currentMainImage, 600, 85)}
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
                    <img src={getOptimizedImageUrl(img, 140, 75)} alt={`thumb-${idx}`} loading="lazy" />
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
            <h2 className="product-title">{product.name}</h2>

            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'} color="#f59e0b" />
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

            {product.description && (
              <p className="description">
                {product.description}
              </p>
            )}

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
                      <ShoppingBag size={16} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart (${Math.min(quantity, maxAvailable)})`} <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`wishlist-btn ${isSaved ? 'saved' : ''}`}
                      title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={18}
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
        :global(.quickview-modal-overlay) {
          padding-top: 80px !important;
          padding-bottom: 20px !important;
          align-items: flex-start !important;
        }

        .quickview-card {
          max-width: 680px;
          width: 92%;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          position: relative;
          max-height: calc(88vh - 80px);
          overflow-y: auto;
          margin-top: 0;
        }

        .modal-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ffffff !important;
          border: 2px solid var(--accent-primary) !important;
          color: #0f172a !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .modal-close-btn:hover {
          background: var(--accent-primary) !important;
          color: #ffffff !important;
          transform: scale(1.1);
        }

        .quickview-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        .main-image-box {
          position: relative;
          width: 100%;
          height: 270px;
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .thumbnails-row {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          margin-top: 0.5rem;
          padding-bottom: 0.2rem;
        }

        .thumb-btn {
          width: 50px;
          height: 60px;
          border-radius: 6px;
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
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
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
          gap: 0.45rem;
        }

        .product-title {
          font-size: 1.12rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--text-primary);
          margin: 0;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .stars {
          display: flex;
          gap: 2px;
        }
        .rating-text {
          font-size: 0.78rem;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .price-current {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .price-original {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .description {
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .variant-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .variant-label {
          font-size: 0.8rem;
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
          gap: 0.35rem;
        }
        .color-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.78rem;
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
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .sizes-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .size-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 0.6rem;
          border-radius: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.8rem;
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
          margin-top: 0.2rem;
        }
        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          font-size: 0.74rem;
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
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .action-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .quantity-control {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          overflow: hidden;
          background: var(--bg-tertiary);
          height: 38px;
        }
        .quantity-control button {
          width: 30px;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .quantity-control button:hover {
          background: var(--border-color);
        }
        .quantity-control span {
          width: 28px;
          text-align: center;
          font-weight: 800;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .add-to-cart-btn {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-size: 0.88rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .add-to-cart-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: var(--shadow-glow);
        }

        .wishlist-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
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
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          margin-top: 0.5rem;
          display: inline-block;
          transition: color 0.2s ease;
        }
        .view-full-page-link:hover {
          text-decoration: underline;
          color: var(--accent-hover);
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          :global(.quickview-modal-overlay) {
            padding-top: 76px !important;
            padding-bottom: 10px !important;
          }
          .quickview-card {
            padding: 1rem 0.85rem !important;
            max-height: calc(90vh - 76px) !important;
            border-radius: 14px !important;
            width: 94% !important;
          }
          .modal-close-btn {
            top: 8px !important;
            right: 8px !important;
            width: 32px !important;
            height: 32px !important;
          }
          .quickview-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .main-image-box {
            height: 220px !important;
            border-radius: 8px;
          }
          .thumb-btn {
            width: 46px !important;
            height: 56px !important;
          }
          .product-title {
            font-size: 1.05rem !important;
          }
          .price-current {
            font-size: 1.15rem !important;
          }
          .action-row {
            gap: 0.4rem !important;
          }
        }

        @media (max-width: 480px) {
          .main-image-box {
            height: 190px !important;
          }
          .action-row {
            flex-wrap: wrap !important;
          }
          .quantity-control {
            height: 36px;
          }
          .add-to-cart-btn {
            height: 36px;
            font-size: 0.82rem !important;
          }
          .wishlist-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
}
