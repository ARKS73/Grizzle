'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Check, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ReviewSection from '@/components/products/ReviewSection';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

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
  const [activeTab, setActiveTab] = useState('description');
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
        setSelectedColor(prod.colors?.[0]?.name || 'Pitch Black');

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

  return (
    <div className="container product-detail-wrapper">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/products">Shop</Link> &gt; <Link href={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> &gt; <span>{product.name}</span>
      </div>

      {/* Main Grid */}
      <div className="detail-grid">
        {/* Gallery */}
        <div className="gallery-section">
          <div className="main-image-container glass-panel">
            <img src={selectedImage || product.images?.[0]} alt={product.name} className="main-image" />
            {product.discountPercentage > 0 && (
              <span className="badge badge-danger discount-tag">Save {product.discountPercentage}%</span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnails-grid">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`thumbnail-card ${selectedImage === img ? 'active' : ''}`}
                >
                  <img src={img} alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="info-section">
          <span className="badge badge-primary">{product.category}</span>
          <h1 className="product-name">{product.name}</h1>

          {/* Rating */}
          <div className="ratings-box">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.ratings || 4.8) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="rating-score">{product.ratings || 4.8}</span>
            <span className="reviews-link">({reviews.length || product.numReviews || 12} Verified Reviews)</span>
          </div>

          {/* Price */}
          <div className="price-box">
            <span className="price-main">₹{product.price?.toFixed(0)}</span>
            {product.originalPrice > product.price && (
              <span className="price-compare">₹{product.originalPrice?.toFixed(0)}</span>
            )}
            <span className="stock-status">
              {product.stock > 0 ? (
                <span className="text-success"><Check size={14} /> In Stock ({product.stock} units)</span>
              ) : (
                <span className="text-danger">Out of Stock</span>
              )}
            </span>
          </div>

          <p className="short-desc">{product.description}</p>

          {/* Colors Selection */}
          {product.colors?.length > 0 && (
            <div className="variant-box">
              <label className="variant-title">Color Option: <strong>{selectedColor}</strong></label>
              <div className="color-swatches">
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
                    {c.image && <span className="color-img-indicator">📷</span>}
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Sizes Selection */}
          {product.sizes?.length > 0 && (
            <div className="variant-box">
              <div className="size-header">
                <label className="variant-title">Select Size:</label>
                <button className="size-guide-link">Size Guide</button>
              </div>
              <div className="sizes-grid">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`size-card ${selectedSize === sz ? 'active' : ''}`}
                  >
                    {sz}
                  </button>
                ))}
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

          {/* Guarantee Badges */}
          <div className="guarantees-grid glass-panel">
            <div className="g-item">
              <Truck size={18} className="text-primary" />
              <div>
                <strong>Pan-India Express Shipping</strong>
                <span>Free delivery on orders ₹999+</span>
              </div>
            </div>
            <div className="g-item">
              <RotateCcw size={18} className="text-primary" />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <span>Pay at doorstep anywhere in India</span>
              </div>
            </div>
            <div className="g-item">
              <ShieldCheck size={18} className="text-primary" />
              <div>
                <strong>100% Bio-Washed Cotton</strong>
                <span>Durable high-density DTF prints</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Fabric Care */}
      <div className="tabs-container glass-panel">
        <div className="tabs-header">
          <button
            onClick={() => setActiveTab('description')}
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
          >
            Fabric & Fit Details
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
          >
            Care Instructions
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <h3>Signature Organic Cotton Construction</h3>
              <p>{product.description}</p>
              <ul>
                <li><strong>Material:</strong> 100% Organic Combed Heavyweight Cotton (240 GSM)</li>
                <li><strong>Fit:</strong> Dropped shoulder relaxed boxy silhouette</li>
                <li><strong>Stitching:</strong> Double-needle reinforced seams and heavy collar ribbing</li>
                <li><strong>Pre-shrunk:</strong> Garment washed to eliminate shrinkage after home washing</li>
              </ul>
            </div>
          )}
          {activeTab === 'care' && (
            <div className="tab-pane">
              <h3>How to Preserve Your Garment Quality</h3>
              <ul>
                <li>Machine wash cold inside out with like colors</li>
                <li>Use mild detergent; do not bleach or use fabric softeners</li>
                <li>Tumble dry low or line dry in shade for best longevity</li>
                <li>Cool iron inside out if needed; do not iron directly over graphics</li>
              </ul>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="tab-pane">
              <h3>Shipping Information</h3>
              <p>All orders are processed within 1 business day. Standard delivery takes 3-5 business days. Free express shipping on orders over $100.</p>
            </div>
          )}
        </div>
      </div>

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

        .detail-grid {
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
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .discount-tag {
          position: absolute;
          top: 16px;
          left: 16px;
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

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .product-name {
          font-size: 2.2rem;
          line-height: 1.2;
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
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .color-btn.active {
          border-color: var(--accent-primary);
          background: var(--accent-light);
        }
        .swatch-circle {
          width: 14px;
          height: 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(0,0,0,0.2);
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
        .sizes-grid { display: flex; gap: 0.65rem; }
        .size-card {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-weight: 700;
          cursor: pointer;
        }
        .size-card.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        .cta-box {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .quantity-picker {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        .quantity-picker button {
          width: 42px;
          height: 48px;
          background: var(--bg-tertiary);
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .quantity-picker span {
          width: 44px;
          text-align: center;
          font-weight: 700;
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
          .detail-grid { grid-template-columns: 1fr; }
          .guarantees-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
