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

  const cleanImages = (product?.images || []).filter((img) => img && img !== '/logo2.png');
  const defaultColor = product?.colors?.[0]?.name || '';
  const defaultColorObj = product?.colors?.[0];
  const initialImg = defaultColorObj?.images?.[0] || defaultColorObj?.image || cleanImages[0] || product?.images?.[0] || '';

  const [selectedImage, setSelectedImage] = useState(initialImg);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product?.colors?.[0]?.name && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  if (!product) return null;

  const isSaved = isInWishlist(product._id);

  const activeColorObj = product?.colors?.find((c) => c.name === selectedColor) || product?.colors?.[0];
  const activeColorImages = (Array.isArray(activeColorObj?.images) && activeColorObj.images.length > 0)
    ? activeColorObj.images.filter((img) => img && img !== '/logo2.png')
    : (activeColorObj?.image && activeColorObj.image !== '/logo2.png' ? [activeColorObj.image] : []);

  const userImages = (product?.images || []).filter((img) => img && img !== '/logo2.png');

  // Show ONLY chosen color images if defined; otherwise fallback to general product gallery
  const displayedThumbnails = activeColorImages.length > 0
    ? activeColorImages
    : (userImages.length > 0 ? userImages : (product?.images || []));

  const currentMainImage = (selectedImage && displayedThumbnails.includes(selectedImage))
    ? selectedImage
    : (displayedThumbnails[0] || '');

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
              <img
                src={getOptimizedImageUrl(currentMainImage, 600, 80)}
                alt={product.name}
                className="main-image"
                loading="eager"
                decoding="async"
              />
            </div>
            {displayedThumbnails.length > 1 && (
              <div className="thumbnails-row">
                {displayedThumbnails.map((img, idx) => (
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
                    Color Option: <span className="selected-color-name">{selectedColor || product.colors[0]?.name}</span>
                  </label>
                </div>

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
                <div className="size-header">
                  <label className="variant-label">
                    Select Size: {selectedSize && <span className="selected-color-name">{selectedSize}</span>}
                  </label>
                </div>
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
                    className="btn btn-primary add-to-cart-btn btn-lg font-bold"
                    style={{ fontSize: '1.05rem', padding: '0.85rem 1.25rem' }}
                  >
                    <ShoppingBag size={20} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart (${Math.min(quantity, maxAvailable)})`} <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`btn btn-secondary wishlist-btn ${isSaved ? 'saved' : ''}`}
                  >
                    <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
