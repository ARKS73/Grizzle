'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ReviewSection from '@/components/products/ReviewSection';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (data.success && data.product) {
        const prod = data.product;
        setProduct(prod);
        setSelectedImage(prod.images?.[0] || '');
        setSelectedSize(prod.sizes?.[0] || 'M');
        setSelectedColor(''); // Default: Show All Colors Mode

        // Fetch related products
        const relRes = await fetch(`/api/products?category=${encodeURIComponent(prod.category)}&limit=4`);
        const relData = await relRes.json();
        if (relData.success) {
          setRelatedProducts((relData.products || []).filter((p) => p._id !== prod._id));
        }

        // Fetch product reviews
        const revRes = await fetch(`/api/reviews?productId=${prod._id}`);
        const revData = await revRes.json();
        if (revData.success) {
          setReviews(revData.reviews || []);
        }
      }
    } catch (e) {
      console.error('Fetch product detail error:', e);
    } finally {
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

  const activeColorObj = product?.colors?.find((c) => c.name === selectedColor);
  const activeColorImg = activeColorObj?.image;
  const displayedThumbnails = (selectedColor && activeColorImg) ? [activeColorImg] : (product?.images || []);

  return (
    <div className="container product-detail-wrapper">
      <div className="product-layout-grid">
        {/* Gallery */}
        <div className="product-gallery-box">
          <div className="main-image-container glass-panel">
            <img
              src={getOptimizedImageUrl(selectedImage || displayedThumbnails[0] || '/placeholder.png', 800, 85)}
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
                  className={`thumbnail-card ${selectedImage === img ? 'active' : ''}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
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
                if (selectedSize && product.sizeStock && product.sizeStock[selectedSize] !== undefined) {
                  const sizeQty = Number(product.sizeStock[selectedSize]);
                  if (sizeQty <= 0) return <span className="text-danger">Size {selectedSize}: Out of Stock</span>;
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
                  Color Option: <span className="selected-color-name">{selectedColor || 'All Colors'}</span>
                </label>
                {selectedColor && (
                  <button
                    onClick={() => {
                      setSelectedColor('');
                      setSelectedImage(product.images?.[0] || '');
                    }}
                    className="btn-link-reset"
                  >
                    Reset (Show All Photos)
                  </button>
                )}
              </div>

              <div className="color-swatches">
                <button
                  onClick={() => {
                    setSelectedColor('');
                    setSelectedImage(product.images?.[0] || '');
                  }}
                  className={`color-btn ${selectedColor === '' ? 'active' : ''}`}
                >
                  <span className="swatch-circle-all" />
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
                <button className="size-guide-link">Size Guide</button>
              </div>
              <div className="sizes-grid">
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
                      className={`size-card ${selectedSize === sz ? 'active' : ''} ${isOut ? 'out-of-stock' : ''}`}
                      title={isOut ? `Size ${sz} is Out of Stock` : `Size ${sz}: ${sizeQty} available`}
                    >
                      <span className="size-text">{sz}</span>
                      {isOut && <span className="size-subtag out">Out</span>}
                      {isLow && !isOut && <span className="size-subtag low">{sizeQty} left</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="cta-box">
            <div className="quantity-picker">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <button
              onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}
              className="btn btn-primary btn-lg add-btn"
            >
              <ShoppingBag size={20} /> Add to Bag
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`btn btn-secondary btn-lg wishlist-btn ${isSaved ? 'saved' : ''}`}
              title="Save to Wishlist"
            >
              <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
            </button>
          </div>
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

      {/* Related Products Carousel Grid */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>Complete The Look (Related Clothes)</h2>
          <div className="grid-products mt-3">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

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
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .quantity-picker {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .quantity-picker button {
          width: 44px;
          height: 48px;
          background: var(--bg-tertiary);
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
        .add-btn { flex: 1; }

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

        .related-section { margin-top: 4rem; }

        @media (max-width: 900px) {
          .product-detail-wrapper {
            padding-top: 0.75rem;
          }
          .product-layout-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .main-image-container {
            max-height: 380px;
            aspect-ratio: 4 / 5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          .main-product-img {
            max-height: 380px;
            object-fit: cover;
          }
          .thumbnails-grid {
            overflow-x: auto;
            white-space: nowrap;
            justify-content: flex-start;
            padding-bottom: 0.35rem;
          }
          .thumbnail-card {
            min-width: 60px;
            height: 70px;
            flex-shrink: 0;
          }
          .product-title-large {
            font-size: 1.4rem;
            line-height: 1.25;
          }
          .price-current {
            font-size: 1.6rem;
          }
          .guarantees-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            padding: 0.85rem;
          }
          .cta-box {
            position: sticky;
            bottom: 0;
            z-index: 95;
            margin: 1rem -1rem 0 -1rem;
            padding: 0.85rem 1rem;
            background: rgba(15, 23, 42, 0.96);
            backdrop-filter: blur(12px);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.3);
          }
          .tabs-container {
            padding: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
