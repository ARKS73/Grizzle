'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Heart, Check, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
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

  // Displayed thumbnails: chosen color images first + general images (excluding images of other colors)
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
      <div className="modal-content quickview-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={20} />
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
            <span className="badge badge-primary text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.72rem', fontWeight: 800 }}>
              {product.category || 'Grizzle Collection'}
            </span>
            <h2 className="product-title font-bold mt-1 mb-2">{product.name}</h2>

            <div className="rating-row d-flex align-items-center gap-2 mb-2">
              <div className="stars d-flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.round(product.ratings || 0) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <span className="rating-text subtext" style={{ fontSize: '0.82rem' }}>
                {product.numReviews > 0
                  ? `${Number(product.ratings || 0).toFixed(1)} (${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'})`
                  : '0.0 (0 reviews)'}
              </span>
            </div>

            <div className="price-row d-flex align-items-baseline gap-2 mb-3">
              <span className="price-current text-primary font-extrabold" style={{ fontSize: '1.4rem' }}>
                ₹{product.price?.toFixed(0)}
              </span>
              {product.originalPrice > product.price && (
                <span className="price-original text-muted text-decoration-line-through" style={{ fontSize: '0.95rem' }}>
                  ₹{product.originalPrice?.toFixed(0)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-danger font-bold" style={{ fontSize: '0.75rem' }}>
                  -{product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <p className="description subtext mb-3" style={{ lineHeight: 1.5, fontSize: '0.88rem' }}>
              {product.description}
            </p>

            {/* Colors Picker */}
            {product.colors?.length > 0 && (
              <div className="variant-group mb-3">
                <div className="variant-header-row mb-1">
                  <label className="variant-label font-semibold" style={{ fontSize: '0.88rem' }}>
                    Color Option: <span className="selected-color-name font-bold text-danger">{selectedColor || product.colors[0]?.name}</span>
                  </label>
                </div>

                <div className="colors-picker d-flex flex-wrap gap-2">
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
              <div className="variant-group mb-3">
                <div className="size-header mb-1">
                  <label className="variant-label font-semibold" style={{ fontSize: '0.88rem' }}>
                    Select Size: {selectedSize && <span className="selected-color-name font-bold text-danger">{selectedSize}</span>}
                  </label>
                </div>
                <div className="sizes-picker d-flex flex-wrap gap-2">
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
                  <div className="selected-size-stock-badge mt-2">
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
                  <div className="action-row d-flex align-items-center gap-2">
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
                      className="btn btn-primary add-to-cart-btn font-bold flex-1 d-flex align-items-center justify-content-center gap-2"
                      style={{ fontSize: '0.98rem', padding: '0.75rem 1rem' }}
                    >
                      <ShoppingBag size={18} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart (${Math.min(quantity, maxAvailable)})`} <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`btn btn-secondary wishlist-btn ${isSaved ? 'saved' : ''}`}
                      title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
                    </button>
                  </div>

                  {/* View Full Product Page Link */}
                  <div className="mt-3 pt-2">
                    <Link
                      href={`/product/${product._id}`}
                      onClick={onClose}
                      className="view-full-page-link font-semibold subtext text-primary d-inline-flex align-items-center gap-1"
                      style={{ textDecoration: 'none' }}
                    >
                      View Full Product Page &amp; Verified Reviews &rarr;
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
