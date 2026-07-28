'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Eye, 
  ShoppingBag, 
  Star, 
  Check, 
  Flame, 
  Zap, 
  X, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones,
  Tag,
  Layers
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import QuickViewModal from '@/components/products/QuickViewModal';
import { seedCategories, seedProducts } from '@/lib/seedData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/components/ui/Toast';

export default function SinglePageStreetwearStore() {
  const [categories, setCategories] = useState(seedCategories);
  const [allProducts, setAllProducts] = useState(seedProducts);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success && catData.categories?.length > 0) {
          setCategories(catData.categories);
        }

        const prodRes = await fetch('/api/products?limit=20');
        const prodData = await prodRes.json();
        if (prodData.success && prodData.products?.length > 0) {
          setAllProducts(prodData.products);
        }
      } catch (e) {
        console.error('Failed to fetch store data:', e);
      }
    }
    fetchData();
  }, []);

  // Filter products by active category
  const filteredProducts = activeCategory === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase() || (activeCategory === 'MEN' && p.category?.includes('Oversized')) || (activeCategory === 'WOMEN' && p.category?.includes('Line')));

  const mensProducts = allProducts.filter(p => p.gender === 'Men' || p.category?.includes('Oversized') || p.category?.includes('Desi') || p.category?.includes('Anime'));
  const womensProducts = allProducts.filter(p => p.gender === 'Women' || p.category?.includes('Minimalist') || p.category?.includes('Artist'));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      addToast('Welcome to the Collective! Check your email for early drop access & 15% off.', 'success');
      setNewsletterEmail('');
    }
  };

  const pastelColors = [
    '#d8d8fa', // Pastel Purple/Lavender
    '#fcdada', // Soft Blush Pink
    '#fde5d0', // Soft Peach
    '#d0e6fd', // Ice Blue
  ];

  return (
    <div className="single-page-wrapper">
      
      {/* =========================================================================
         SECTION 1: HERO BANNER (Matching Image Section 1)
         ========================================================================= */}
      <section className="hero-section-street" id="hero">
        <div className="container hero-street-container">
          <div className="hero-text-content">
            <div className="hero-pill-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>NEW DROP | SEASON 2026</span>
            </div>

            <h1 className="hero-street-title">
              HIGH-DENSITY DTF PRINTS <br />
              <span className="title-accent-italic">YOU CAN WEAR</span>
            </h1>

            <p className="hero-street-desc">
              Merging high-fidelity DTF printing with 240 GSM bio-washed heavy cotton. Vibrant prints built to last for 50+ washes.
            </p>

            <div className="hero-btn-group">
              <a href="#latest-drops" className="btn-street-dark">
                SHOP DROPS
              </a>
              <Link href="/products" className="btn-street-light">
                ALL COLLECTIONS
              </Link>
            </div>
          </div>

          <div className="hero-visual-wrapper">
            <div className="ambient-glow-orb"></div>
            
            {/* Framed Polaroid Artwork */}
            <div className="polaroid-frame-card">
              <div className="badge-hot-pink">HOT</div>
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                alt="Streetwear Culture Model"
                className="polaroid-img"
              />
              <div className="sticky-tape-note">
                LIMITED TO 100 PIECES GLOBALLY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 2: LATEST DROPS (Matching Image Section 2)
         ========================================================================= */}
      <section className="latest-drops-section" id="latest-drops">
        <div className="container">
          <div className="drops-header">
            <div>
              <h2 className="drops-title">LATEST DROPS</h2>
              <p className="drops-subtitle">TRADEMARK 2026 COLLECTION / WINTER 2026</p>
            </div>
            
            {/* Filter Pills */}
            <div className="category-filter-tabs">
              <button 
                className={`filter-tab ${activeCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ALL')}
              >
                ALL
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id || cat.slug}
                  className={`filter-tab ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Pastel Product Grid */}
          <div className="pastel-products-grid">
            {filteredProducts.slice(0, 8).map((product, idx) => {
              const bgPastel = pastelColors[idx % pastelColors.length];
              const isSaved = isInWishlist(product._id);

              return (
                <div key={product._id} className="pastel-card-wrapper">
                  {/* Soft Pastel Image Block */}
                  <div className="pastel-image-block" style={{ backgroundColor: bgPastel }}>
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name}
                      className="pastel-product-img"
                    />

                    {/* Action Overlay */}
                    <div className="pastel-action-overlay">
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                        title="Wishlist"
                      >
                        <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                      </button>
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="pastel-icon-btn"
                        title="Quick View"
                      >
                        <Eye size={16} color="#1e293b" />
                      </button>
                    </div>

                    {/* Tag Badge */}
                    {product.isBestSeller && (
                      <span className="pastel-tag-badge">BESTSELLER</span>
                    )}
                    {product.isTrending && (
                      <span className="pastel-tag-badge badge-trending">TRENDING</span>
                    )}
                  </div>

                  {/* Bottom Dark Info Bar */}
                  <div className="pastel-card-info">
                    <div className="info-text-box">
                      <h4 className="pastel-card-title">{product.name}</h4>
                      <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                    </div>

                    <button 
                      onClick={() => addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default', 1)}
                      className="pastel-add-btn"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION: MEN'S COLLECTION SECTION
         ========================================================================= */}
      <section className="latest-drops-section mens-collection-section" id="mens-collection" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="drops-header">
            <div>
              <span className="badge-hot-pink" style={{ position: 'static', display: 'inline-block', marginBottom: '0.5rem' }}>MEN&apos;S DTF PRINTS</span>
              <h2 className="drops-title">MEN&apos;S COLLECTION</h2>
              <p className="drops-subtitle">240 GSM HEAVYWEIGHT TEES, OVERSIZED CUTS & DESI GRAPHICS</p>
            </div>
            
            <Link href="/products?gender=Men" className="btn-street-dark">
              SHOP MEN&apos;S FILTERS &rarr;
            </Link>
          </div>

          <div className="pastel-products-grid">
            {mensProducts.slice(0, 4).map((product, idx) => {
              const bgPastel = pastelColors[idx % pastelColors.length];
              const isSaved = isInWishlist(product._id);

              return (
                <div key={product._id} className="pastel-card-wrapper">
                  <div className="pastel-image-block" style={{ backgroundColor: bgPastel }}>
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name}
                      className="pastel-product-img"
                    />
                    <div className="pastel-action-overlay">
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                        title="Wishlist"
                      >
                        <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                      </button>
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="pastel-icon-btn"
                        title="Quick View"
                      >
                        <Eye size={16} color="#1e293b" />
                      </button>
                    </div>
                    {product.isBestSeller && <span className="pastel-tag-badge">BESTSELLER</span>}
                  </div>

                  <div className="pastel-card-info">
                    <div className="info-text-box">
                      <h4 className="pastel-card-title">{product.name}</h4>
                      <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                    </div>

                    <button 
                      onClick={() => addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default', 1)}
                      className="pastel-add-btn"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/products?gender=Men" className="btn btn-primary btn-lg" style={{ padding: '0.9rem 2.2rem', borderRadius: 'var(--radius-full)' }}>
              VIEW MEN&apos;S COLLECTION PAGE WITH FILTERS &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION: WOMEN'S COLLECTION SECTION
         ========================================================================= */}
      <section className="latest-drops-section womens-collection-section" id="womens-collection" style={{ background: 'var(--bg-secondary)', padding: '4rem 0' }}>
        <div className="container">
          <div className="drops-header">
            <div>
              <span className="badge-pink-tilted" style={{ position: 'static', display: 'inline-block', marginBottom: '0.5rem' }}>WOMEN&apos;S LINE</span>
              <h2 className="drops-title">WOMEN&apos;S COLLECTION</h2>
              <p className="drops-subtitle">AESTHETIC MINIMALIST LINE ART, PASTELS & SOFT BIO-WASHED TEES</p>
            </div>
            
            <Link href="/products?gender=Women" className="btn-street-light">
              SHOP WOMEN&apos;S FILTERS &rarr;
            </Link>
          </div>

          <div className="pastel-products-grid">
            {womensProducts.slice(0, 4).map((product, idx) => {
              const bgPastel = pastelColors[(idx + 2) % pastelColors.length];
              const isSaved = isInWishlist(product._id);

              return (
                <div key={product._id} className="pastel-card-wrapper">
                  <div className="pastel-image-block" style={{ backgroundColor: bgPastel }}>
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name}
                      className="pastel-product-img"
                    />
                    <div className="pastel-action-overlay">
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                        title="Wishlist"
                      >
                        <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                      </button>
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="pastel-icon-btn"
                        title="Quick View"
                      >
                        <Eye size={16} color="#1e293b" />
                      </button>
                    </div>
                    {product.isTrending && <span className="pastel-tag-badge badge-trending">TRENDING</span>}
                  </div>

                  <div className="pastel-card-info">
                    <div className="info-text-box">
                      <h4 className="pastel-card-title">{product.name}</h4>
                      <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                    </div>

                    <button 
                      onClick={() => addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default', 1)}
                      className="pastel-add-btn"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/products?gender=Women" className="btn btn-secondary btn-lg" style={{ padding: '0.9rem 2.2rem', borderRadius: 'var(--radius-full)' }}>
              VIEW WOMEN&apos;S COLLECTION PAGE WITH FILTERS &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION: ALL COLLECTIONS SECTION
         ========================================================================= */}
      <section className="all-collections-section" id="all-collections" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="drops-header" style={{ textAlign: 'center', display: 'block', marginBottom: '2.5rem' }}>
            <span className="bento-tag-pill" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>EXPLORE ALL</span>
            <h2 className="drops-title" style={{ fontSize: '2.5rem' }}>ALL DTF PRINTED COLLECTIONS</h2>
            <p className="drops-subtitle">SELECT A CATEGORY BELOW TO OPEN THE FULL INTERACTIVE FILTERS PAGE</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {categories.map((cat) => (
              <Link 
                key={cat._id || cat.slug} 
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  background: 'var(--bg-secondary)',
                }}
              >
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>{cat.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700' }}>Show Filters &rarr;</span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/products" className="btn btn-primary btn-lg" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)' }}>
              OPEN ALL COLLECTIONS & FILTERS PAGE &rarr;
            </Link>
          </div>
        </div>
      </section>





      {/* =========================================================================
         SECTION 6: JOIN THE COLLECTIVE (Matching Image Section 6)
         ========================================================================= */}
      <section className="join-collective-section" id="newsletter">
        <div className="container">
          <div className="collective-banner-box">
            <div className="collective-watermark">TEAMZ</div>

            <div className="collective-content">
              <h2 className="collective-title">JOIN THE COLLECTIVE</h2>
              <p className="collective-subtitle">
                SIGN UP FOR EARLY ACCESS TO DROPS, EXCLUSIVE ARTIST NEWS, AND COMMUNITY-ONLY EVENTS.
              </p>

              <form onSubmit={handleSubscribe} className="collective-form">
                <input
                  type="email"
                  placeholder="YOUR@EMAIL.COM"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="collective-input"
                  required
                />
                <button type="submit" className="collective-submit-btn">
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Popup Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Manifesto Modal */}
      {manifestoOpen && (
        <div className="modal-overlay" onClick={() => setManifestoOpen(false)}>
          <div className="modal-content manifesto-modal-card" onClick={e => e.stopPropagation()}>
            <button onClick={() => setManifestoOpen(false)} className="modal-close-btn">
              <X size={20} />
            </button>
            <div className="manifesto-inner">
              <span className="badge badge-primary">ARCHIVE MANIFESTO</span>
              <h2>THE DTF PRINTING COLLECTIVE</h2>
              <p className="manifesto-quote">
                &ldquo;We don&apos;t design for mass production. We design for the 1% who treat clothing as a canvas of personal identity.&rdquo;
              </p>
              <div className="manifesto-body">
                <p>1. Heavyweight 240 GSM organic Indian cotton sourced directly from sustainable mills.</p>
                <p>2. Limited print runs of 100 numbered pieces per colorway to prevent overproduction.</p>
                <p>3. High-density screen prints and custom DTF ink formulas that resist cracking for 50+ washes.</p>
                <p>4. Direct profit sharing with independent graphic artists & street painters across India.</p>
              </div>
              <button 
                onClick={() => setManifestoOpen(false)} 
                className="btn btn-primary btn-block"
                style={{ marginTop: '1.5rem' }}
              >
                EXPLORE THE DROPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lookbook Shop Modal */}
      {lookbookModalOpen && (
        <div className="modal-overlay" onClick={() => setLookbookModalOpen(false)}>
          <div className="modal-content lookbook-shop-card" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLookbookModalOpen(false)} className="modal-close-btn">
              <X size={20} />
            </button>
            <h3>LOOKBOOK 01 - FEATURED ITEMS</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select items from Look 01 to add directly to your bag.
            </p>
            <div className="lookbook-items-list">
              {allProducts.slice(0, 2).map(prod => (
                <div key={prod._id} className="lookbook-item-row">
                  <img src={prod.images[0]} alt={prod.name} className="lookbook-item-thumb" />
                  <div className="lookbook-item-info">
                    <h4>{prod.name}</h4>
                    <span className="lookbook-item-price">₹{prod.price?.toFixed(0)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      addToCart(prod, 'M', 'Default', 1);
                      addToast(`Added ${prod.name} to cart!`, 'success');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         STYLES FOR SINGLE PAGE STREETWEAR APP
         ========================================================================= */}
      <style jsx>{`
        .single-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          padding-bottom: 3rem;
          background-color: var(--bg-primary);
        }

        /* ------------------ HERO SECTION ------------------ */
        .hero-section-street {
          padding: 4rem 0 2rem 0;
          position: relative;
        }
        .hero-street-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          align-items: center;
        }
        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          background: #2563eb;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .hero-street-title {
          font-size: 4rem;
          line-height: 1.05;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          text-transform: uppercase;
        }
        .title-accent-italic {
          font-style: italic;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-street-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 500px;
          margin-bottom: 2.25rem;
        }
        .hero-btn-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-street-dark {
          background: #0f172a;
          color: #ffffff;
          padding: 0.9rem 2rem;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .btn-street-dark:hover {
          background: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .btn-street-light {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 0.9rem 2rem;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .btn-street-light:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        /* Hero Visual Frame */
        .hero-visual-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .ambient-glow-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 80%);
          filter: blur(40px);
          z-index: 1;
        }
        .polaroid-frame-card {
          position: relative;
          z-index: 2;
          background: #ffffff;
          padding: 14px 14px 45px 14px;
          border-radius: 4px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: rotate(2.5deg);
          max-width: 380px;
          width: 100%;
          transition: transform 0.3s ease;
        }
        .polaroid-frame-card:hover {
          transform: rotate(0deg) scale(1.02);
        }
        .polaroid-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border-radius: 2px;
        }
        .badge-hot-pink {
          position: absolute;
          top: -14px;
          right: -14px;
          width: 52px;
          height: 52px;
          background: #ff0055;
          color: white;
          font-weight: 900;
          font-size: 0.85rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(255, 0, 85, 0.4);
          z-index: 3;
          letter-spacing: 0.05em;
          transform: rotate(12deg);
        }
        .sticky-tape-note {
          position: absolute;
          bottom: 12px;
          left: 14px;
          background: #e2e0fd;
          color: #1e1b4b;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 0.4rem 0.75rem;
          letter-spacing: 0.08em;
          border: 1px dashed #a5b4fc;
          transform: rotate(-1.5deg);
        }

        /* ------------------ LATEST DROPS ------------------ */
        .latest-drops-section {
          padding: 3rem 0;
        }
        .drops-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .drops-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }
        .drops-subtitle {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-top: 0.2rem;
        }
        .category-filter-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-tab {
          padding: 0.45rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover, .filter-tab.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* Pastel Grid */
        .pastel-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .pastel-card-wrapper {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .pastel-card-wrapper:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }
        .pastel-image-block {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .pastel-product-img {
          max-height: 85%;
          max-width: 85%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }
        .pastel-card-wrapper:hover .pastel-product-img {
          transform: scale(1.08);
        }
        .pastel-action-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pastel-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.15s ease;
        }
        .pastel-icon-btn:hover {
          transform: scale(1.1);
        }
        .pastel-tag-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: #0f172a;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .badge-trending { background: #f43f5e; }

        .pastel-card-info {
          padding: 1rem;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .info-text-box {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          overflow: hidden;
        }
        .pastel-card-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
        }
        .pastel-card-price {
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
        }
        .pastel-add-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .pastel-add-btn:hover {
          background: #38bdf8;
          color: #ffffff;
        }

        /* ------------------ CULTURE ARCHIVE SECTION ------------------ */
        .culture-archive-section {
          position: relative;
          background: #090d16;
          color: #ffffff;
          padding: 6rem 0;
          overflow: hidden;
        }
        .watermark-bg-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 13rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.03);
          user-select: none;
          pointer-events: none;
          letter-spacing: -0.05em;
        }
        .culture-container {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .culture-photos-stacked {
          position: relative;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tilted-photo {
          position: absolute;
          width: 260px;
          aspect-ratio: 4 / 5;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border: 8px solid #ffffff;
        }
        .tilted-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .photo-back {
          transform: rotate(-8deg) translate(-30px, -10px);
        }
        .photo-front {
          transform: rotate(5deg) translate(30px, 10px);
        }
        .badge-pink-tilted {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f43f5e;
          color: white;
          font-weight: 900;
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          transform: rotate(6deg);
          z-index: 3;
        }
        .culture-heading {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #ffffff;
        }
        .pink-italic-accent {
          font-style: italic;
          color: #f43f5e;
        }
        .culture-paragraph {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 520px;
        }
        .collective-manifesto-btn {
          background: transparent;
          color: #ffffff;
          border: none;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          padding-bottom: 4px;
          border-bottom: 2px solid #f43f5e;
          transition: color 0.2s ease;
        }
        .collective-manifesto-btn:hover {
          color: #f43f5e;
        }

        /* ------------------ BENTO CATEGORY GRID ------------------ */
        .choose-vibe-section {
          padding: 3rem 0;
        }
        .section-title-bold {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 2rem;
          text-transform: uppercase;
        }
        .vibe-bento-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          grid-template-rows: 200px 200px;
          gap: 1.25rem;
        }
        .bento-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        .bento-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .bento-card:hover .bento-img {
          transform: scale(1.06);
        }
        .bento-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(37,99,235,0.2) 0%, rgba(15,23,42,0.9) 100%);
          z-index: 1;
        }
        .bento-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: #ffffff;
        }
        .bento-mens {
          grid-row: span 2;
          background: #1e3a8a;
        }
        .bento-mens h3 {
          font-size: 1.8rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0.5rem 0;
        }
        .bento-tag-pill {
          background: #2563eb;
          color: white;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }
        .bento-link {
          font-weight: 800;
          font-size: 0.85rem;
          color: #60a5fa;
        }

        .bento-womens {
          background: linear-gradient(135deg, #f43f5e 0%, #831843 100%);
        }
        .bento-womens h3 { font-size: 1.5rem; font-weight: 900; color: #ffffff; }
        .bento-subtext { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.8); }

        .bento-collabs {
          background: linear-gradient(135deg, #b45309 0%, #78350f 100%);
        }
        .bento-collabs h3 { font-size: 1.3rem; font-weight: 900; color: #ffffff; }
        .bento-sub-desc { font-size: 0.7rem; color: #fde68a; font-weight: 700; }

        .bento-sale {
          background: #0f172a;
          border: 1px solid #1e293b;
        }
        .sale-header { display: flex; flex-direction: column; }
        .sale-text-large { font-size: 2rem; font-weight: 900; color: #ffffff; line-height: 1; }
        .sale-percent { font-size: 0.8rem; font-weight: 800; color: #38bdf8; }
        .bento-link-blue { font-size: 0.75rem; font-weight: 800; color: #38bdf8; margin-top: 0.5rem; }

        /* ------------------ LOOKBOOK ------------------ */
        .lookbook-section {
          padding: 3rem 0;
        }
        .lookbook-header {
          margin-bottom: 2rem;
        }
        .lookbook-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }
        .lookbook-title-sub {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          line-height: 0.9;
        }
        .lookbook-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          grid-template-rows: 240px 240px;
          gap: 1.5rem;
        }
        .lookbook-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
        }
        .lookbook-main {
          grid-row: span 2;
        }
        .lookbook-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .lookbook-card:hover .lookbook-img {
          transform: scale(1.05);
        }
        .lookbook-shop-floating {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .look-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
        }
        .shop-this-look-btn {
          background: #f43f5e;
          color: white;
          border: none;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
        }

        /* ------------------ NEWSLETTER COLLECTIVE ------------------ */
        .join-collective-section {
          padding: 2rem 0;
        }
        .collective-banner-box {
          position: relative;
          background: #090d16;
          border-top: 3px solid #2563eb;
          border-radius: 12px;
          padding: 4rem 2rem;
          text-align: center;
          overflow: hidden;
          color: white;
        }
        .collective-watermark {
          position: absolute;
          bottom: -20px;
          right: 20px;
          font-size: 8rem;
          font-weight: 900;
          color: rgba(255,255,255,0.03);
          user-select: none;
          pointer-events: none;
        }
        .collective-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          margin: 0 auto;
        }
        .collective-title {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .collective-subtitle {
          font-size: 0.85rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
          margin-bottom: 2rem;
        }
        .collective-form {
          display: flex;
          gap: 0.5rem;
          max-width: 480px;
          margin: 0 auto;
        }
        .collective-input {
          flex: 1;
          padding: 0.85rem 1.2rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
        }
        .collective-input:focus {
          border-color: #2563eb;
        }
        .collective-submit-btn {
          background: #ffffff;
          color: #0f172a;
          border: none;
          padding: 0.85rem 1.5rem;
          font-weight: 900;
          font-size: 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .collective-submit-btn:hover {
          background: #2563eb;
          color: white;
        }

        /* Modals */
        .manifesto-modal-card h2 { margin: 1rem 0 0.5rem 0; font-size: 1.5rem; }
        .manifesto-quote { font-style: italic; color: var(--text-secondary); margin-bottom: 1rem; }
        .manifesto-body p { font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.5; }

        .lookbook-shop-card h3 { font-size: 1.3rem; margin-bottom: 0.25rem; }
        .lookbook-items-list { display: flex; flex-direction: column; gap: 1rem; }
        .lookbook-item-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; }
        .lookbook-item-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
        .lookbook-item-info { flex: 1; }
        .lookbook-item-info h4 { font-size: 0.9rem; margin-bottom: 0.2rem; }
        .lookbook-item-price { font-size: 0.85rem; font-weight: 700; color: var(--accent-primary); }

        /* Media Queries */
        @media (max-width: 1024px) {
          .pastel-products-grid { grid-template-columns: repeat(2, 1fr); }
          .vibe-bento-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .bento-mens { grid-row: span 1; }
        }
        @media (max-width: 768px) {
          .hero-street-container { grid-template-columns: 1fr; }
          .hero-street-title { font-size: 2.8rem; }
          .hero-visual-wrapper { margin-top: 1.5rem; }
          .culture-container { grid-template-columns: 1fr; }
          .culture-photos-stacked { height: 280px; }
          .pastel-products-grid { grid-template-columns: 1fr; }
          .vibe-bento-grid { grid-template-columns: 1fr; }
          .lookbook-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
          .collective-form { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
