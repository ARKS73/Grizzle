'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ReviewSection from '@/components/products/ReviewSection';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import SizeChartModal from '@/components/ui/SizeChartModal';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import { getProductVariantStock } from '@/utils/stockHelper';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, getTotalCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (data.success && data.product) {
        const prod = data.product;
        setProduct(prod);
        const cleanImages = (prod.images || []).filter((img) => img && img !== '/logo2.png');
        const defaultColor = prod.colors?.[0]?.name || '';
        const defaultColorObj = prod.colors?.[0];
        const initialImg = defaultColorObj?.image || cleanImages[0] || prod.images?.[0] || '';

        setSelectedImage(initialImg);
        setSelectedSize(prod.sizes?.[0] || 'M');
        setSelectedColor(defaultColor);
        setLoading(false); // Unblock UI immediately for instant rendering

        // Preload primary Cloudinary image in browser cache for 0ms delay
        if (prod.images?.[0] && typeof window !== 'undefined') {
          const imgPreload = new Image();
          imgPreload.src = getOptimizedImageUrl(prod.images[0], 800, 80);
        }

        // Fetch related products & reviews asynchronously in parallel background
        Promise.all([
          fetch(`/api/products?category=${encodeURIComponent(prod.category)}&limit=8`).then((r) => r.json()).catch(() => null),
          fetch(`/api/reviews?productId=${prod._id}`).then((r) => r.json()).catch(() => null),
        ]).then(async ([relData, revData]) => {
          let related = (relData?.success && relData.products)
            ? relData.products.filter((p) => p._id !== prod._id)
            : [];

          // Fallback: If fewer than 4 products in same category, load general catalog products
          if (related.length < 4) {
            try {
              const genRes = await fetch('/api/products?limit=12');
              const genData = await genRes.json();
              if (genData?.success && genData.products) {
                const extra = genData.products.filter((p) => p._id !== prod._id && !related.some((r) => r._id === p._id));
                related = [...related, ...extra];
              }
            } catch (err) {
              console.error('Fetch fallback products error:', err);
            }
          }

          setRelatedProducts(related.slice(0, 8));

          if (revData?.success) {
            setReviews(revData.reviews || []);
          }
        });
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Fetch product detail error:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="container product-detail-wrapper mt-5">
        <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center mt-5">
        <h2>Product Not Found</h2>
        <Link href="/products" className="btn btn-primary mt-3">Back to Catalog</Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);

  const totalReviews = reviews.length;
  const hasRealReviews = totalReviews > 0 || (product.numReviews > 0);
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : (product.numReviews > 0 && product.ratings ? Number(product.ratings).toFixed(1) : '0.0');

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

  const displayedThumbnails = cleanImages.length > 0 ? cleanImages : (product?.images || []);

  const currentMainImage = (selectedImage && displayedThumbnails.includes(selectedImage))
    ? selectedImage
    : (displayedThumbnails[0] || '');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="container product-detail-wrapper">
      <button onClick={handleBack} className="btn-back-link mb-3">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="product-layout-grid">
        {/* Gallery */}
        <div className="product-gallery-box">
          <div className="main-image-container glass-panel">
            <img
              src={getOptimizedImageUrl(currentMainImage, 800, 80)}
              alt={product.name}
              className="main-product-img"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            {product.discountPercentage > 0 && (
              <span className="badge-discount">-{product.discountPercentage}%</span>
            )}
          </div>

          {displayedThumbnails.length > 1 && (
            <div className="thumbnails-grid">
              {displayedThumbnails.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`thumbnail-card ${currentMainImage === img ? 'active' : ''}`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 180, 70)}
                    alt={`Thumb ${idx}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="product-info-box">
          <span className="category-pill">{product.category}</span>
          <h1 className="product-title-large">{product.name}</h1>

          {/* Dynamic Rating */}
          <div className="ratings-box">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={hasRealReviews && i < Math.round(Number(avgRating)) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="rating-score">{avgRating}</span>
            <span className="reviews-link">
              ({hasRealReviews ? `${totalReviews || product.numReviews} Verified ${totalReviews === 1 ? 'Review' : 'Reviews'}` : '0 Verified Reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="price-box">
            <span className="price-main">₹{product.price?.toFixed(0)}</span>
            {product.originalPrice > product.price && (
              <span className="price-compare">₹{product.originalPrice?.toFixed(0)}</span>
            )}
            <span className="stock-status">
              {(() => {
                if (selectedSize) {
                  const sizeQty = getProductVariantStock(product, selectedSize, selectedColor);
                  if (sizeQty <= 0) return <span className="text-danger">Size {selectedSize} ({selectedColor || 'Default'}): Out of Stock</span>;
                  return <span className="text-success"><Check size={14} /> Size {selectedSize}: In Stock ({sizeQty} left)</span>;
                }
                return product.stock > 0 ? (
                  <span className="text-success"><Check size={14} /> In Stock ({product.stock} total)</span>
                ) : (
                  <span className="text-danger">Out of Stock</span>
                );
              })()}
            </span>
          </div>

          <p className="short-desc">{product.description}</p>

          {/* Colors Selection */}
          {product.colors?.length > 0 && (
            <div className="variant-box">
              <div className="variant-header-row">
                <label className="variant-title">
                  Color Option: <span className="selected-color-name">{selectedColor || product.colors[0]?.name}</span>
                </label>
              </div>

              <div className="color-swatches">
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
                    className={`color-btn ${selectedColor === c.name ? 'active' : ''}`}
                  >
                    <span className="swatch-circle" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes Selection */}
          {product.sizes?.length > 0 && (
            <div className="variant-box">
              <div className="size-header">
                <label className="variant-title">
                  Select Size: {selectedSize && <span className="selected-color-name">{selectedSize}</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="size-guide-link"
                >
                  📐 Size Guide
                </button>
              </div>
              <div className="sizes-grid">
                {product.sizes.map((sz) => {
                  const sizeQty = getProductVariantStock(product, sz, selectedColor);
                  const isOut = sizeQty <= 0;
                  const isLow = sizeQty > 0 && sizeQty <= 3;

                  return (
                    <button
                      key={sz}
                      onClick={() => !isOut && setSelectedSize(sz)}
                      disabled={isOut}
                      className={`size-card ${selectedSize === sz ? 'active' : ''} ${isOut ? 'out-of-stock' : ''}`}
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
              addToCart(product, selectedSize, selectedColor, finalQty);
              router.push('/checkout');
            };

            return (
              <div className="cta-box">
                <div className="cta-controls-group">
                  <div className="quantity-picker">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => {
                        if (!isMaxReached) {
                          setQuantity(quantity + 1);
                        } else if (addToast) {
                          addToast(`Only ${maxAvailable} item(s) available in stock for Size ${selectedSize || ''}`, 'info');
                        }
                      }}
                      disabled={isMaxReached || maxAvailable <= 0}
                      title={isMaxReached ? `Only ${maxAvailable} in stock` : ''}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`btn wishlist-btn ${isSaved ? 'saved' : ''}`}
                    title="Save to Wishlist"
                  >
                    <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} color="#ef4444" stroke="#ef4444" />
                  </button>
                </div>

                <div className="cta-buttons-group">
                  <button
                    onClick={() => {
                      const finalQty = Math.min(quantity, maxAvailable);
                      addToCart(product, selectedSize, selectedColor, finalQty);
                    }}
                    disabled={maxAvailable <= 0}
                    className="btn btn-secondary add-btn font-bold"
                  >
                    <ShoppingBag size={18} /> {maxAvailable <= 0 ? 'Out of Stock' : `Add to Cart (${Math.min(quantity, maxAvailable)})`}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={maxAvailable <= 0}
                    className="btn buy-now-btn font-bold"
                  >
                    ⚡ Buy It Now <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Optional Fabric & Fit Details - Only shown if written by Admin */}
      {product.fabricFit && product.fabricFit.trim() && (
        <div className="tabs-container glass-panel mb-4">
          <div className="tabs-header">
            <button className="tab-btn active">
              Fabric & Fit Details
            </button>
          </div>
          <div className="tab-content">
            <div className="tab-pane">
              <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {product.fabricFit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <ReviewSection
        productId={product._id}
        reviews={reviews}
        onReviewAdded={fetchProductData}
      />

      {/* Suggested & Recommended Grizzle Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section mt-5 mb-4">
          <div className="section-header-clean mb-3">
            <h2 className="section-title-streetwear">Grizzle Streetwear Collection</h2>
            <div className="section-title-line" />
          </div>
          <div className="grid-products">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Size Chart Modal */}
      <SizeChartModal
        product={product}
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
      />

      <style jsx>{`
        .product-detail-wrapper {
          padding-top: 2rem;
        }
        .breadcrumb {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .breadcrumb a { color: var(--text-secondary); }
        .breadcrumb a:hover { color: var(--accent-primary); }

        .product-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .main-image-container {
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .main-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .badge-discount {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #ef4444;
          color: white;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          z-index: 2;
          letter-spacing: 0.05em;
        }

        .thumbnails-grid {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .thumbnail-card {
          width: 70px;
          height: 70px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .thumbnail-card.active, .thumbnail-card:hover {
          border-color: var(--accent-primary);
        }
        .thumbnail-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info-box {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .category-pill {
          display: inline-block;
          width: fit-content;
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 800;
          font-size: 0.75rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .product-title-large {
          font-size: 2.2rem;
          line-height: 1.2;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-transform: uppercase;
        }

        .ratings-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stars { display: flex; gap: 2px; }
        .rating-score { font-weight: 700; }
        .reviews-link { font-size: 0.85rem; color: var(--accent-primary); }

        .price-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .price-main { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
        .price-compare { font-size: 1.2rem; color: var(--text-muted); text-decoration: line-through; }
        .stock-status { font-size: 0.85rem; font-weight: 600; margin-left: auto; }

        .short-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .variant-box {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .variant-title { font-size: 0.9rem; font-weight: 600; }
        .color-swatches { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .color-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .color-btn:active {
          transform: scale(0.96);
        }
        .color-btn.active {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
          transform: scale(1.02);
        }
        .swatch-circle {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(0,0,0,0.2);
        }
        .swatch-circle-all {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #ef4444 25%, #3b82f6 25%, #3b82f6 50%, #10b981 50%, #10b981 75%, #f59e0b 75%);
          border: 1px solid rgba(0,0,0,0.2);
        }
        .variant-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .selected-color-name {
          font-weight: 800;
          margin-left: 0.35rem;
          color: var(--accent-primary);
        }
        .btn-link-reset {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          margin-left: auto;
          white-space: nowrap;
        }

        .size-header {
          display: flex;
          justify-content: space-between;
        }
        .size-guide-link {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .sizes-grid { display: flex; gap: 0.65rem; flex-wrap: wrap; }
        .size-card {
          min-width: 54px;
          height: 52px;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-weight: 800;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .size-card:active {
          transform: scale(0.95);
        }
        .size-card.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
          transform: scale(1.04);
        }
        .size-card.out-of-stock {
          opacity: 0.45;
          cursor: not-allowed;
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.3);
          text-decoration: line-through;
        }
        .size-text { font-size: 0.95rem; font-weight: 800; line-height: 1; }
        .size-subtag {
          font-size: 0.6rem;
          font-weight: 800;
          line-height: 1;
          margin-top: 3px;
          text-transform: uppercase;
        }
        .size-subtag.out { color: var(--danger); }
        .size-subtag.low { color: var(--warning); }

        .cta-box {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .cta-controls-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cta-buttons-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .quantity-picker {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-tertiary);
          height: 48px;
        }
        .quantity-picker button {
          width: 44px;
          height: 48px;
          background: transparent;
          border: none;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          color: var(--text-primary);
        }
        .quantity-picker span {
          width: 44px;
          text-align: center;
          font-weight: 800;
        }

        .add-btn {
          flex: 1;
          height: 48px;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .buy-now-btn {
          flex: 1;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-size: 1rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .buy-now-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
        }
        .buy-now-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .wishlist-btn {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1.5px solid #ef4444 !important;
          color: #ef4444 !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .wishlist-btn svg {
          stroke: #ef4444 !important;
          color: #ef4444 !important;
        }
        .wishlist-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          transform: scale(1.05);
        }
        .wishlist-btn.saved {
          background: rgba(239, 68, 68, 0.18) !important;
          border-color: #ef4444 !important;
        }

        .guarantees-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-top: 1rem;
        }
        .g-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.75rem;
        }
        .g-item strong { display: block; font-size: 0.8rem; }
        .g-item span { color: var(--text-muted); }

        .tabs-container {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .tabs-header {
          display: flex;
          gap: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .tab-btn {
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
        }
        .tab-btn.active {
          color: var(--accent-primary);
          border-bottom: 2px solid var(--accent-primary);
          padding-bottom: 0.5rem;
        }
        .tab-pane h3 { font-size: 1.1rem; margin-bottom: 0.75rem; }
        .tab-pane p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }
        .tab-pane ul { margin-left: 1.25rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.5rem; }

        .btn-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-tertiary, rgba(255, 255, 255, 0.08));
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          padding: 0.45rem 0.9rem;
          border-radius: var(--radius-md, 8px);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-back-link:hover {
          background: var(--accent-primary, #ef4444);
          color: #ffffff;
          border-color: var(--accent-primary, #ef4444);
        }

        .section-header-clean {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          padding-left: 2px;
        }
        .section-title-streetwear {
          font-size: 1.45rem;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
        }
        .section-title-line {
          width: 44px;
          height: 3px;
          background: var(--accent-primary, #ef4444);
          border-radius: 99px;
        }

        .related-section { margin-top: 3.5rem; }

        @media (max-width: 900px) {
          .product-detail-wrapper {
            padding-top: 0.5rem;
            overflow-x: hidden;
          }
          .product-layout-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .product-info-box {
            width: 100%;
            overflow: visible !important;
            word-break: break-word;
            overflow-wrap: break-word;
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            padding: 0 4px;
            box-sizing: border-box;
          }
          .main-image-container {
            max-height: 320px;
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          .main-product-img {
            max-height: 320px;
            object-fit: contain;
          }
          .thumbnails-grid {
            overflow-x: auto;
            white-space: nowrap;
            justify-content: flex-start;
            padding-bottom: 0.35rem;
            gap: 0.35rem;
          }
          .thumbnail-card {
            min-width: 54px;
            height: 60px;
            flex-shrink: 0;
          }
          .product-title-large {
            font-size: 1.25rem;
            line-height: 1.25;
          }
          .ratings-box {
            font-size: 0.78rem;
            gap: 0.35rem;
            flex-wrap: wrap;
          }
          .rating-score {
            font-size: 0.8rem;
          }
          .reviews-link {
            font-size: 0.75rem;
          }
          .price-box {
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: baseline;
          }
          .price-main {
            font-size: 1.35rem;
          }
          .price-compare {
            font-size: 0.85rem;
          }
          .stock-status {
            font-size: 0.75rem;
            width: 100%;
          }
          .short-desc {
            font-size: 0.8rem;
            line-height: 1.4;
          }
          .variant-box {
            gap: 0.35rem;
          }
          .variant-title {
            font-size: 0.8rem;
          }
          .variant-header-row {
            flex-wrap: wrap;
            gap: 0.35rem;
          }
          .selected-color-name {
            font-size: 0.8rem;
          }
          .btn-link-reset {
            font-size: 0.72rem;
            white-space: normal;
          }
          .color-swatches {
            gap: 0.35rem;
          }
          .color-btn {
            padding: 0.3rem 0.55rem;
            font-size: 0.75rem;
            gap: 0.3rem;
          }
          .swatch-circle, .swatch-circle-all {
            width: 10px;
            height: 10px;
          }
          .size-header {
            flex-wrap: wrap;
            gap: 0.35rem;
          }
          .sizes-grid {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .size-card {
            flex: 1;
            min-width: 52px;
            height: 48px;
            padding: 0.25rem 0.4rem;
            border-radius: var(--radius-md);
            border: 1.5px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-weight: 800;
          }
          .selected-size-stock-badge {
            margin-top: 0.65rem;
            display: flex;
            align-items: center;
          }
          .stock-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-size: 0.8rem;
            font-weight: 800;
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
          }
          .stock-pill.stock-in {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .stock-pill.stock-low {
            background: rgba(245, 158, 11, 0.12);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.35);
          }
          .stock-pill.stock-out {
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          .stock-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
          }
          .size-text {
            font-size: 0.88rem;
            font-weight: 800;
          }
          .size-subtag {
            font-size: 0.58rem;
            font-weight: 800;
            margin-top: 2px;
          }
          .guarantees-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            padding: 0.75rem;
            font-size: 0.75rem;
          }
          .cta-box {
            position: relative;
            z-index: 10;
            margin: 1.25rem 0 0 0;
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            width: 100% !important;
            box-sizing: border-box;
          }

          .cta-controls-group {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .cta-buttons-group {
            display: flex;
            gap: 0.5rem;
            width: 100%;
          }

          .quantity-picker {
            border: 1.5px solid var(--border-color);
            border-radius: var(--radius-md);
            background: var(--bg-tertiary);
            height: 42px;
          }
          .quantity-picker button {
            width: 36px;
            height: 42px;
            background: transparent;
            font-size: 1rem;
            font-weight: 800;
            color: var(--text-primary);
          }
          .quantity-picker span {
            width: 30px;
            font-size: 0.88rem;
            font-weight: 800;
            color: var(--text-primary);
          }
          .add-btn {
            font-size: 0.84rem !important;
            padding: 0 0.5rem !important;
            height: 46px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 10px;
            flex: 1;
          }
          .buy-now-btn {
            font-size: 0.84rem !important;
            padding: 0 0.5rem !important;
            height: 46px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 10px;
            flex: 1;
          }
          .wishlist-btn {
            width: 42px;
            height: 42px;
            border-radius: 10px;
          }
          .tabs-container {
            padding: 0.85rem;
          }
          .tabs-header {
            gap: 0.75rem;
            padding-bottom: 0.5rem;
            margin-bottom: 0.75rem;
            overflow-x: auto;
          }
          .tab-btn {
            font-size: 0.82rem;
            white-space: nowrap;
          }
          .tab-pane h3 {
            font-size: 0.95rem;
          }
          .tab-pane p, .tab-pane ul {
            font-size: 0.78rem;
            line-height: 1.4;
          }
        }
      `}</style>
    </div>
  );
}
