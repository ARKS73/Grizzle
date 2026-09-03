'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import { getProductVariantStock } from '@/utils/stockHelper';

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
                    const sizeQty = getProductVariantStock(product, sz, selectedColor);
                    const isOut = sizeQty <= 0;
                    const isLow = sizeQty > 0 && sizeQty <= 3;

                    return (
                      <button
                        key={sz}
                        onClick={() => !isOut && setSelectedSize(sz)}
                        disabled={isOut}
                        className={`size-btn ${selectedSize === sz ? 'active' : ''} ${isOut ? 'out-of-stock' : ''}`}
                        title={isOut ? `Size ${sz} (${selectedColor || ''}) is Out of Stock` : `Size ${sz}: ${sizeQty} available`}
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
                      const selectedQty = getProductVariantStock(product, selectedSize, selectedColor);
                      if (selectedQty <= 0) {
                        return (
                          <span className="stock-pill stock-out">
                            ✕ Size {selectedSize} ({selectedColor || 'Default'}): Out of Stock
                          </span>
                        );
                      }
                      return (
                        <span className={`stock-pill ${selectedQty <= 3 ? 'stock-low' : 'stock-in'}`}>
                          <span className="stock-dot" />
                          Size {selectedSize} ({selectedColor || 'Default'}): In Stock ({selectedQty} {selectedQty === 1 ? 'left' : 'left'})
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Quantity & CTA */}
            {(() => {
              const maxAvailable = getProductVariantStock(product, selectedSize, selectedColor);
              const isMaxReached = quantity >= maxAvailable;

              const handleBuyNow = () => {
                if (maxAvailable <= 0) return;
                const finalQty = Math.min(quantity, maxAvailable);
                const finalColor = selectedColor || product?.colors?.[0]?.name || 'Standard';
                addToCart(product, selectedSize, finalColor, finalQty);
                onClose();
                router.push('/checkout');
              };

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
                      className="btn btn-secondary add-to-cart-btn font-bold"
                    >
                      <ShoppingBag size={16} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart`}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={maxAvailable <= 0}
                      className="btn buy-now-btn font-bold"
                    >
                      ⚡ Buy Now
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

                  {/* View Full Product Page & Verified Reviews Button */}
                  <Link
                    href={`/product/${product._id}`}
                    onClick={onClose}
                    className="btn-view-full-details"
                  >
                    <Star size={15} fill="#f59e0b" color="#f59e0b" className="star-icon" />
                    <span>View Full Details &amp; Verified Reviews</span>
                    <ArrowRight size={16} className="arrow-icon" />
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
          max-width: 900px;
          width: 92%;
          padding: 1.75rem 2rem;
          border-radius: 20px;
          position: relative;
          max-height: calc(88vh - 80px);
          overflow-y: auto;
          margin-top: 0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }

        .modal-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
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
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .main-image-box {
          position: relative;
          width: 100%;
          height: 390px;
          border-radius: 14px;
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
          gap: 0.5rem;
          overflow-x: auto;
          margin-top: 0.75rem;
          padding-bottom: 0.25rem;
        }

        .thumb-btn {
          width: 60px;
          height: 72px;
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
          transform: scale(1.04);
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quickview-details {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .product-title {
          font-size: 1.35rem;
          font-weight: 800;
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
          font-size: 0.8rem;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
        }
        .price-current {
          font-size: 1.45rem;
          font-weight: 900;
          color: var(--text-primary);
        }
        .price-original {
          font-size: 0.95rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .description {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .variant-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .variant-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .selected-color-name {
          font-weight: 800;
          color: var(--accent-primary);
        }

        .colors-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .color-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.8rem;
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
          gap: 0.4rem;
        }
        .size-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          border-radius: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.85rem;
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
          margin-top: 0.25rem;
        }
        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          border-radius: 99px;
          font-size: 0.76rem;
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
          gap: 0.6rem;
          margin-top: 0.75rem;
        }

        .quantity-control {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-tertiary);
          height: 42px;
        }
        .quantity-control button {
          width: 34px;
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
          width: 32px;
          text-align: center;
          font-weight: 800;
          font-size: 0.92rem;
          color: var(--text-primary);
        }

        .add-to-cart-btn {
          flex: 1;
          height: 42px;
          border-radius: 8px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-size: 0.92rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .add-to-cart-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: var(--shadow-glow);
        }

        .buy-now-btn {
          flex: 1;
          height: 42px;
          border-radius: 8px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-size: 0.92rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .buy-now-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
        }

        .wishlist-btn {
          width: 42px;
          height: 42px;
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

        /* Premium High-Impact Button for View Full Product Page */
        .btn-view-full-details {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.85rem 1.25rem;
          margin-top: 1rem;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 2px solid #ef4444;
          color: #ef4444;
          font-size: 0.88rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15);
          letter-spacing: 0.01em;
        }

        .btn-view-full-details:hover {
          background: #ef4444;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        }

        :global(.btn-view-full-details .star-icon) {
          transition: transform 0.2s ease, fill 0.2s ease;
        }

        .btn-view-full-details:hover :global(.star-icon) {
          fill: #ffffff;
          color: #ffffff;
          transform: scale(1.15) rotate(12deg);
        }

        :global(.btn-view-full-details .arrow-icon) {
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .btn-view-full-details:hover :global(.arrow-icon) {
          transform: translateX(5px);
          color: #ffffff;
        }

        /* Tablet & Intermediate Screen Sizing */
        @media (max-width: 960px) and (min-width: 769px) {
          .quickview-card {
            max-width: 760px;
            padding: 1.35rem 1.5rem;
          }
          .quickview-grid {
            grid-template-columns: 290px 1fr;
            gap: 1.5rem;
          }
          .main-image-box {
            height: 320px;
          }
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
