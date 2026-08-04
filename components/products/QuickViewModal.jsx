'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Heart, Check, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function QuickViewModal({ product, onClose }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isSaved = isInWishlist(product._id);

  const activeColorObj = product?.colors?.find((c) => c.name === selectedColor);
  const activeColorImg = activeColorObj?.image;
  const displayedThumbnails = (selectedColor && activeColorImg) ? [activeColorImg] : (product?.images || []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quickview-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">
          <X size={20} />
        </button>

        <div className="quickview-grid">
          {/* Gallery */}
          <div className="quickview-gallery">
            <div className="main-image-box">
              <img src={selectedImage || activeColorImg || product.images?.[0]} alt={product.name} className="main-image" />
            </div>
            {displayedThumbnails.length > 1 && (
              <div className="thumbnails-row">
                {displayedThumbnails.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  >
                    <img src={img} alt={`thumb-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="quickview-details">
            <span className="badge badge-primary">{product.category}</span>
            <h2 className="product-title">{product.name}</h2>

            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <span className="rating-text">
                {product.numReviews > 0
                  ? `${Number(product.ratings || 0).toFixed(1)} (${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'})`
                  : '0.0 (0 reviews)'}
              </span>
            </div>

            <div className="price-row">
              <span className="price-current">₹{product.price?.toFixed(0)}</span>
              {product.originalPrice > product.price && (
                <span className="price-original">₹{product.originalPrice?.toFixed(0)}</span>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-danger">Save {product.discountPercentage}%</span>
              )}
            </div>

            <p className="description">{product.description}</p>

            {/* Colors Picker */}
            {product.colors?.length > 0 && (
              <div className="variant-group">
                <div className="variant-header-row">
                  <label className="variant-label">
                    Color Option: <span className="selected-color-name">{selectedColor || 'All Colors'}</span>
                  </label>
                  {selectedColor && (
                    <button
                      onClick={() => {
                        setSelectedColor('');
                        setSelectedImage(product.images?.[0] || '');
                      }}
                      className="btn-link-reset-sm"
                    >
                      Reset (Show All Photos)
                    </button>
                  )}
                </div>

                <div className="colors-picker">
                  <button
                    onClick={() => {
                      setSelectedColor('');
                      setSelectedImage(product.images?.[0] || '');
                    }}
                    className={`color-pill ${selectedColor === '' ? 'active' : ''}`}
                  >
                    <span className="color-dot-all" />
                    <span>All Colors</span>
                  </button>

                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.image) {
                          setSelectedImage(c.image);
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
                <label className="variant-label">Select Size:</label>
                <div className="sizes-picker">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="action-row">
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, selectedSize, selectedColor, quantity);
                  onClose();
                  router.push('/checkout');
                }}
                className="btn btn-primary add-to-cart-btn btn-lg font-bold"
                style={{ fontSize: '1.05rem', padding: '0.85rem 1.25rem' }}
              >
                <ShoppingBag size={20} /> Checkout ({quantity}) <ArrowRight size={18} />
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`btn btn-secondary wishlist-btn ${isSaved ? 'saved' : ''}`}
              >
                <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
              </button>
            </div>

            <Link href={`/product/${product._id}`} onClick={onClose} className="full-details-link mt-2">
              View Full Product Page & Verified Reviews &rarr;
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .quickview-card {
          max-width: 900px;
          padding: 2rem;
        }
        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: var(--radius-full);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }

        .quickview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .main-image-box {
          aspect-ratio: 4 / 5;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-tertiary);
        }
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumbnails-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .thumb-btn {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          overflow: hidden;
          cursor: pointer;
        }
        .thumb-btn.active {
          border-color: var(--accent-primary);
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quickview-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .product-title {
          font-size: 1.5rem;
        }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stars { display: flex; gap: 2px; }
        .rating-text { font-size: 0.85rem; color: var(--text-muted); }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .price-current {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .price-original {
          font-size: 1rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .variant-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .variant-label {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .colors-picker {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .color-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .color-pill:active { transform: scale(0.96); }
        .color-pill.active {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
          transform: scale(1.02);
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(0,0,0,0.2);
        }
        .color-dot-all {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #ef4444 25%, #3b82f6 25%, #3b82f6 50%, #10b981 50%, #10b981 75%, #f59e0b 75%);
          border: 1px solid rgba(0,0,0,0.2);
        }
        .variant-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.4rem;
        }
        .selected-color-name {
          font-weight: 800;
          margin-left: 0.35rem;
          color: var(--accent-primary);
        }
        .btn-link-reset-sm {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          margin-left: auto;
          white-space: nowrap;
        }


        .sizes-picker {
          display: flex;
          gap: 0.5rem;
        }
        .size-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          font-weight: 700;
          cursor: pointer;
        }
        .size-btn.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        .action-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .quantity-control button {
          width: 36px;
          height: 40px;
          background: var(--bg-tertiary);
          border: none;
          cursor: pointer;
          font-weight: 700;
        }
        .quantity-control span {
          width: 40px;
          text-align: center;
          font-weight: 700;
        }
        .add-to-cart-btn { flex: 1; }

        .perks-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
        .perks-row span { display: flex; align-items: center; gap: 0.5rem; }

        .full-details-link {
          font-size: 0.85rem;
          color: var(--accent-primary);
          font-weight: 600;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .quickview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
