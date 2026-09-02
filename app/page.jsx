'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import GlobalScrollCanvas from '@/components/home/GlobalScrollCanvas';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

// Module-level global memory cache for 0ms instant landing page load & tab switching
const globalPageCache = {
  categories: [],
  allProducts: [],
  globalReviews: [],
  heroSettings: null,
  isInitialized: false,
};

export default function SinglePageStreetwearStore() {
  const [categories, setCategories] = useState(globalPageCache.categories);
  const [allProducts, setAllProducts] = useState(globalPageCache.allProducts);
  const [globalReviews, setGlobalReviews] = useState(globalPageCache.globalReviews);
  const [loadingProducts, setLoadingProducts] = useState(
    !globalPageCache.isInitialized && globalPageCache.allProducts.length === 0
  );
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState(false);
  const [heroSettings, setHeroSettings] = useState(
    globalPageCache.heroSettings || {
      heroImage: '',
      heroBadge: 'NEW DROP | SEASON 2026',
      heroTitle: 'Artistry Woven in Heavyweight Cotton',
      heroAccentTitle: 'YOU CAN WEAR',
      heroDesc: 'Exclusivity in every thread. Discover the signature drop',
      heroTapeNote: 'LIMITED TO 100 PIECES GLOBALLY',
    }
  );

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('scroll_pos_home', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const savedPos = sessionStorage.getItem('scroll_pos_home');
    if (savedPos && parseInt(savedPos, 10) > 0) {
      const pos = parseInt(savedPos, 10);
      const timer1 = setTimeout(() => window.scrollTo(0, pos), 50);
      const timer2 = setTimeout(() => window.scrollTo(0, pos), 200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (globalPageCache.allProducts.length === 0) {
        setLoadingProducts(true);
      }

      try {
        const [catRes, prodRes, settingsRes, reviewsRes] = await Promise.all([
          fetch('/api/categories').then((r) => r.json()).catch(() => null),
          fetch('/api/products?limit=30').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/settings').then((r) => r.json()).catch(() => null),
          fetch('/api/reviews?limit=6').then((r) => r.json()).catch(() => null),
        ]);

        if (catRes?.success && Array.isArray(catRes.categories)) {
          setCategories(catRes.categories);
          globalPageCache.categories = catRes.categories;
        }
        if (prodRes?.success && Array.isArray(prodRes.products)) {
          setAllProducts(prodRes.products);
          globalPageCache.allProducts = prodRes.products;

          // Preload product image thumbnails into browser cache for 0ms render
          prodRes.products.forEach((p) => {
            if (p.images?.[0] && typeof window !== 'undefined') {
              const img = new window.Image();
              img.src = p.images[0];
            }
          });
        }
        if (settingsRes?.success && settingsRes.settings) {
          setHeroSettings(settingsRes.settings);
          globalPageCache.heroSettings = settingsRes.settings;
        }
        if (reviewsRes?.success && Array.isArray(reviewsRes.reviews)) {
          setGlobalReviews(reviewsRes.reviews);
          globalPageCache.globalReviews = reviewsRes.reviews;
        }
        globalPageCache.isInitialized = true;
      } catch (e) {
        console.error('Failed to fetch store data:', e);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchData();
  }, []);

  // Filter products by active category with instant useMemo (0ms computation)
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'ALL') return allProducts;
    return allProducts.filter(
      (p) =>
        p.category?.toLowerCase() === activeCategory.toLowerCase() ||
        (activeCategory === 'MEN' && p.category?.includes('Oversized')) ||
        (activeCategory === 'WOMEN' && p.category?.includes('Line'))
    );
  }, [allProducts, activeCategory]);

  const mensProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.gender === 'Men' ||
        p.category?.includes('Oversized') ||
        p.category?.includes('Desi') ||
        p.category?.includes('Anime')
    );
  }, [allProducts]);

  const womensProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.gender === 'Women' ||
        p.category?.includes('Minimalist') ||
        p.category?.includes('Artist')
    );
  }, [allProducts]);

  const unisexProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.gender === 'Unisex' ||
        !p.gender ||
        (p.gender !== 'Men' && p.gender !== 'Women')
    );
  }, [allProducts]);

  const pastelColors = [
    '#d8d8fa', // Pastel Purple/Lavender
    '#fcdada', // Soft Blush Pink
    '#fde5d0', // Soft Peach
    '#d0e6fd', // Ice Blue
  ];

  const displayHeroImg = heroSettings.heroImage || (allProducts?.[0]?.images || []).find((img) => img && img !== '/logo2.png') || '';

  return (
    <div className="single-page-wrapper">
      {/* 240-Frame Interactive Global Background Scroll Canvas */}
      <GlobalScrollCanvas />

      {/* =========================================================================
         SECTION 1: HERO BANNER (Matching Image Section 1)
         ========================================================================= */}
      <section className="hero-section-street" id="hero" style={{ borderRadius: 0, marginTop: 0 }}>
        {/* Athlete Model Background Image */}
        <img
          src="/hero-bg-athlete.jpg"
          alt="Grizzle Hero Image"
          className="hero-athlete-bg-img"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0, borderRadius: 0 }}
        />
        {/* Darkening Overlay for dark background & text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.72) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: 0
          }}
        />

        <div className="container hero-street-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
          <div className="hero-text-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
              <Sparkles size={14} style={{ color: '#93c5fd' }} />
              <span>{heroSettings.heroBadge}</span>
            </div>

            <h1 className="hero-street-title" style={{ textAlign: 'center', width: '100%' }}>
              {heroSettings.heroTitle} <br />
              <span style={{ display: 'block', fontStyle: 'normal', color: 'var(--accent-primary)', textShadow: '0 4px 25px rgba(220, 38, 38, 0.6)', marginTop: '0.5rem', textAlign: 'center' }}>
                {heroSettings.heroAccentTitle}
              </span>
            </h1>

            <p className="hero-street-desc" style={{ textAlign: 'center', margin: '1rem auto 1.5rem', maxWidth: '600px' }}>
              {heroSettings.heroDesc}
            </p>

            <div className="hero-btn-group" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
              <a href="#latest-drops" className="btn-street-dark">
                SHOP DROPS
              </a>
              <Link href="/products" className="btn-street-light">
                ALL COLLECTIONS
              </Link>
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
              <p className="drops-subtitle">OFFICIAL 2026 COLLECTION / WINTER 2026</p>
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
          {loadingProducts ? (
            <div className="pastel-products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-panel text-center p-5" style={{ borderRadius: '24px', padding: '3.5rem 2rem' }}>
              <ShoppingBag size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No Seller Products Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your MongoDB seller database is online and connected. Add clothing products from the Admin Dashboard to display them live!</p>
              <Link href="/admin/products" className="btn-street-dark">
                Go to Admin Product Manager &rarr;
              </Link>
            </div>
          ) : (
            <div className="pastel-products-grid">
              {filteredProducts.slice(0, 8).map((product, idx) => {
                const isSaved = isInWishlist(product._id);

                return (
                  <div key={product._id} className="pastel-card-wrapper">
                    {/* Uniform Image Block */}
                    <div
                      className="pastel-image-block"
                      onClick={() => setQuickViewProduct(product)}
                      title="Click to view product details"
                    >
                      <img
                        src={(product.images || []).find((img) => img && img !== '/logo2.png') || product.images?.[0] || ''}
                        alt={product.name}
                        className="pastel-product-img"
                      />

                      {/* Action Overlay */}
                      <div className="pastel-action-overlay">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
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
                      <div
                        className="info-text-box"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <h4 className="pastel-card-title">{product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                            <Star size={11} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                              {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              ({product.numReviews || 0})
                            </span>
                          </div>
                        </div>
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
          )}
        </div>
      </section>

      {/* =========================================================================
         SECTION: MEN'S COLLECTION SECTION
         ========================================================================= */}
      <section className="latest-drops-section mens-collection-section" id="mens-collection" style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="drops-header">
            <div>
              <h2 className="drops-title">MEN&apos;S COLLECTION</h2>
              <p className="drops-subtitle">240 GSM HEAVYWEIGHT TEES, OVERSIZED CUTS & DESI GRAPHICS</p>
            </div>

            <Link href="/products?gender=Men" className="header-cta-pill">
              SHOP MEN&apos;S COLLECTION &rarr;
            </Link>
          </div>

          {loadingProducts ? (
            <div className="pastel-products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : mensProducts.length === 0 ? (
            <div className="glass-panel text-center p-5" style={{ borderRadius: '24px', padding: '3rem 2rem' }}>
              <ShoppingBag size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Men&apos;s Products Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Products created by the seller in Admin Dashboard will be displayed live here.</p>
              <Link href="/admin/products" className="btn-street-dark">
                Go to Admin Product Manager &rarr;
              </Link>
            </div>
          ) : (
            <div className="pastel-products-grid">
              {mensProducts.slice(0, 4).map((product, idx) => {
                const isSaved = isInWishlist(product._id);

                return (
                  <div key={product._id} className="pastel-card-wrapper">
                    <div
                      className="pastel-image-block"
                      onClick={() => setQuickViewProduct(product)}
                      title="Click to view product details"
                    >
                      <img
                        src={(product.images || []).find((img) => img && img !== '/logo2.png') || product.images?.[0] || ''}
                        alt={product.name}
                        className="pastel-product-img"
                      />
                      <div className="pastel-action-overlay">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                        </button>
                      </div>
                      {product.isBestSeller && <span className="pastel-tag-badge">BESTSELLER</span>}
                    </div>

                    <div className="pastel-card-info">
                      <div
                        className="info-text-box"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <h4 className="pastel-card-title">{product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                            <Star size={11} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                              {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              ({product.numReviews || 0})
                            </span>
                          </div>
                        </div>
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
          )}
        </div>
      </section>

      {/* =========================================================================
         SECTION: WOMEN'S COLLECTION SECTION
         ========================================================================= */}
      <section className="latest-drops-section womens-collection-section" id="womens-collection" style={{ background: 'var(--bg-secondary)', padding: '3rem 0' }}>
        <div className="container">
          <div className="drops-header">
            <div>
              <h2 className="drops-title">WOMEN&apos;S COLLECTION</h2>
              <p className="drops-subtitle">AESTHETIC MINIMALIST LINE ART, PASTELS & SOFT BIO-WASHED TEES</p>
            </div>

            <Link href="/products?gender=Women" className="header-cta-pill">
              SHOP WOMEN&apos;S COLLECTION &rarr;
            </Link>
          </div>

          {loadingProducts ? (
            <div className="pastel-products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : womensProducts.length === 0 ? (
            <div className="glass-panel text-center p-5" style={{ borderRadius: '24px', padding: '3rem 2rem' }}>
              <ShoppingBag size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Women&apos;s Products Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Products created by the seller in Admin Dashboard will be displayed live here.</p>
              <Link href="/admin/products" className="btn-street-light">
                Go to Admin Product Manager &rarr;
              </Link>
            </div>
          ) : (
            <div className="pastel-products-grid">
              {womensProducts.slice(0, 4).map((product, idx) => {
                const isSaved = isInWishlist(product._id);

                return (
                  <div key={product._id} className="pastel-card-wrapper">
                    <div
                      className="pastel-image-block"
                      onClick={() => setQuickViewProduct(product)}
                      title="Click to view product details"
                    >
                      <img
                        src={(product.images || []).find((img) => img && img !== '/logo2.png') || product.images?.[0] || ''}
                        alt={product.name}
                        className="pastel-product-img"
                      />
                      <div className="pastel-action-overlay">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                        </button>
                      </div>
                      {product.isTrending && <span className="pastel-tag-badge badge-trending">TRENDING</span>}
                    </div>

                    <div className="pastel-card-info">
                      <div
                        className="info-text-box"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <h4 className="pastel-card-title">{product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                            <Star size={11} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                              {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              ({product.numReviews || 0})
                            </span>
                          </div>
                        </div>
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
          )}
        </div>
      </section>

      {/* =========================================================================
         SECTION: UNISEX COLLECTION SECTION
         ========================================================================= */}
      <section className="latest-drops-section unisex-collection-section" id="unisex-collection" style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="drops-header">
            <div>
              <h2 className="drops-title">UNISEX COLLECTION</h2>
              <p className="drops-subtitle">VERSATILE FIT TEES FOR EVERYONE, ALL STYLES & ALL SIZES</p>
            </div>

            <Link href="/products?gender=Unisex" className="header-cta-pill">
              SHOP UNISEX COLLECTION &rarr;
            </Link>
          </div>

          {loadingProducts ? (
            <div className="pastel-products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : unisexProducts.length === 0 ? (
            <div className="glass-panel text-center p-5" style={{ borderRadius: '24px', padding: '3rem 2rem' }}>
              <ShoppingBag size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Unisex Products Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Products created by the seller in Admin Dashboard will be displayed live here.</p>
              <Link href="/admin/products" className="btn-street-dark">
                Go to Admin Product Manager &rarr;
              </Link>
            </div>
          ) : (
            <div className="pastel-products-grid">
              {unisexProducts.slice(0, 4).map((product, idx) => {
                const isSaved = isInWishlist(product._id);

                return (
                  <div key={product._id} className="pastel-card-wrapper">
                    <div
                      className="pastel-image-block"
                      onClick={() => setQuickViewProduct(product)}
                      title="Click to view product details"
                    >
                      <img
                        src={(product.images || []).find((img) => img && img !== '/logo2.png') || product.images?.[0] || ''}
                        alt={product.name}
                        className="pastel-product-img"
                      />
                      <div className="pastel-action-overlay">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`pastel-icon-btn ${isSaved ? 'saved' : ''}`}
                          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#1e293b'} />
                        </button>
                      </div>
                      {product.isBestSeller && <span className="pastel-tag-badge">BESTSELLER</span>}
                    </div>

                    <div className="pastel-card-info">
                      <div
                        className="info-text-box"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <h4 className="pastel-card-title">{product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          <span className="pastel-card-price">₹{product.price?.toFixed(0)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                            <Star size={11} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                              {product.numReviews > 0 ? Number(product.ratings || 0).toFixed(1) : '0.0'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              ({product.numReviews || 0})
                            </span>
                          </div>
                        </div>
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
          )}
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

          {categories.length === 0 ? (
            <div className="glass-panel text-center p-5 mb-4" style={{ borderRadius: '24px', padding: '3rem 2rem' }}>
              <Layers size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Categories Created Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create custom categories in the Admin Dashboard to organize your seller products.</p>
              <Link href="/admin/categories" className="btn-street-dark">
                Go to Admin Category Manager &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {categories.map((cat) => {
                // Find all admin-added products belonging to this category
                const catProds = allProducts.filter(p =>
                  p.category?.toLowerCase() === cat.name?.toLowerCase()
                );

                // Pick image from admin-added products in this category
                let displayImg = cat.image && cat.image !== '/logo2.png' ? cat.image : null;
                if (!displayImg && catProds.length > 0) {
                  const randomProd = catProds[Math.floor(Math.random() * catProds.length)];
                  displayImg = randomProd.images?.[0] || null;
                }

                // Fallback to any admin product image if available, else logo2.png
                if (!displayImg && allProducts.length > 0) {
                  displayImg = allProducts[0].images?.[0] || '/logo2.png';
                }
                if (!displayImg) displayImg = '/logo2.png';

                return (
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
                      src={displayImg}
                      alt={cat.name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>{cat.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                      {catProds.length > 0 ? `${catProds.length} Drops Live →` : 'Explore Filters →'}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="collection-cta-wrapper">
            <Link href="/products" className="collection-filter-cta-btn">
              OPEN ALL COLLECTIONS & FILTERS PAGE &rarr;
            </Link>
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
        /* ================================================================
           GRIZZLE LANDING PAGE — DUAL-THEME STYLES
           [data-theme='dark']  → original dark glass / neon pattern
           [data-theme='light'] → white & sky-blue liquid glass pattern
           ================================================================ */

        .single-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          padding-bottom: 3rem;
          background: transparent;
        }

        /* ------------------ HERO BANNER WITH ATHLETE BACKGROUND ------------------ */
        .hero-section-street {
          padding: 4.5rem 2rem 4.5rem 3.5rem;
          position: relative;
          background: #09090b;
          border-radius: 28px !important;
          border-top-left-radius: 28px !important;
          border-top-right-radius: 28px !important;
          border-bottom-left-radius: 28px !important;
          border-bottom-right-radius: 28px !important;
          overflow: hidden !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          min-height: 480px;
          display: flex;
          align-items: center;
          margin-top: 0.5rem;
        }
        [data-theme='light'] .hero-section-street {
          background: #09090b;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }
        .hero-athlete-bg-img {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 58%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          z-index: 1;
          border-radius: 28px;
        }
        .hero-fade-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #09090b 35%, rgba(9, 9, 11, 0.88) 60%, rgba(9, 9, 11, 0.3) 80%, transparent 100%);
          z-index: 2;
        }
        [data-theme='light'] .hero-fade-overlay {
          background: linear-gradient(90deg, #09090b 35%, rgba(9, 9, 11, 0.88) 60%, rgba(9, 9, 11, 0.3) 80%, transparent 100%);
        }
        .hero-street-container {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          max-width: 560px;
          margin: 0;
          padding: 0;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .hero-text-content {
          width: 100%;
          text-align: left;
        }
        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.5), rgba(168, 85, 247, 0.5));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff !important;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
        }
        .hero-street-title {
          font-size: 3.8rem;
          line-height: 1.05;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          color: #ffffff !important;
          text-transform: uppercase;
          text-align: left;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
        }
        .title-accent-italic {
          font-style: italic;
          background: linear-gradient(135deg, #38bdf8 0%, #c084fc 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-street-desc {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.92) !important;
          line-height: 1.6;
          max-width: 520px;
          margin: 0 0 2.25rem 0;
          text-align: left;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
        }
        .hero-btn-group {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1rem;
        }

        /* Collection Filter CTA Buttons */
        .collection-cta-wrapper {
          text-align: center;
          margin-top: 2.2rem;
          padding: 0 0.5rem;
        }
        .collection-filter-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff !important;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          padding: 0.75rem 1.8rem;
          border-radius: var(--radius-full, 9999px);
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
          transition: all 0.25s ease;
          max-width: 100%;
        }
        /* ------------------ HEADER CTA PILL BUTTON ------------------ */
        a.header-cta-pill,
        .header-cta-pill {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
          color: #ffffff !important;
          padding: 0.65rem 1.4rem !important;
          font-size: 0.82rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.04em !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          cursor: pointer !important;
        }

        [data-theme='dark'] a.header-cta-pill,
        [data-theme='dark'] .header-cta-pill {
          background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.35) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        a.header-cta-pill:hover,
        .header-cta-pill:hover {
          transform: translateY(-2px) scale(1.03) !important;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.35) !important;
        }
        .btn-street-dark {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff !important;
          padding: 0.95rem 2.2rem;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-street-dark:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 18px 35px rgba(37, 99, 235, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5);
        }
        a.btn-street-light,
        .btn-street-light,
        [data-theme='light'] a.btn-street-light,
        [data-theme='dark'] a.btn-street-light {
          background: rgba(255, 255, 255, 1) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 1) !important;
          backdrop-filter: blur(12px);
          padding: 0.95rem 2.2rem;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          border-radius: 14px;
          transition: all 0.3s ease;
          text-decoration: none;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        a.btn-street-light:hover,
        .btn-street-light:hover,
        [data-theme='light'] a.btn-street-light:hover,
        [data-theme='dark'] a.btn-street-light:hover {
          background: rgba(255, 255, 255, 0.96) !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.94);
        }

        /* Hero Visual Frame */
        .hero-visual-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .ambient-glow-orb {
          position: absolute;
          width: 340px; height: 340px;
          filter: blur(50px); z-index: 1;
        }
        [data-theme='dark'] .ambient-glow-orb {
          background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(99, 102, 241, 0.25) 60%, transparent 80%);
        }
        [data-theme='light'] .ambient-glow-orb {
          background: radial-gradient(circle, rgba(147, 210, 255, 0.5) 0%, rgba(196, 221, 255, 0.35) 60%, transparent 80%);
        }
        .polaroid-frame-card {
          position: relative; z-index: 2;
          backdrop-filter: blur(20px) saturate(180%);
          padding: 14px 14px 45px 14px;
          border-radius: 20px;
          transform: rotate(2.5deg);
          max-width: 380px; width: 100%;
          transition: all 0.35s ease;
        }
        [data-theme='dark'] .polaroid-frame-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
        [data-theme='dark'] .polaroid-frame-card:hover {
          border-color: rgba(255, 255, 255, 0.45);
          transform: rotate(0deg) scale(1.03);
        }
        [data-theme='light'] .polaroid-frame-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(186, 230, 255, 0.7);
          box-shadow: 0 20px 50px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(255, 255, 255, 1);
        }
        [data-theme='light'] .polaroid-frame-card:hover {
          border-color: rgba(56, 189, 248, 0.6);
          box-shadow: 0 28px 60px rgba(37, 99, 235, 0.2);
          transform: rotate(0deg) scale(1.03);
        }
        .polaroid-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border-radius: 12px;
        }
        .badge-hot-pink {
          position: absolute;
          top: -14px;
          right: -14px;
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, #ff0055, #ec4899);
          color: white;
          font-weight: 900;
          font-size: 0.85rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(255, 0, 85, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
          z-index: 3;
          letter-spacing: 0.05em;
          transform: rotate(12deg);
        }
        .sticky-tape-note {
          position: absolute;
          bottom: 12px;
          left: 14px;
          background: rgba(226, 224, 253, 0.9);
          backdrop-filter: blur(8px);
          color: #1e1b4b;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 0.45rem 0.85rem;
          letter-spacing: 0.08em;
          border: 1px dashed #a5b4fc;
          border-radius: 6px;
          transform: rotate(-1.5deg);
        }

        /* ------------------ LIQUID GLASS DROPS SECTION ------------------ */
        .latest-drops-section {
          padding: 4rem 0;
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
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-top: 0.2rem;
        }
        .category-filter-tabs {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .filter-tab {
          padding: 0.55rem 1.1rem;
          font-size: 0.78rem; font-weight: 800;
          border-radius: 9999px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        [data-theme='dark'] .filter-tab {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
        [data-theme='light'] .filter-tab {
          background: rgba(255, 255, 255, 0.85);
          color: #1e40af;
          border: 1.5px solid rgba(56, 189, 248, 0.35);
          box-shadow: 0 2px 8px rgba(56, 189, 248, 0.1);
        }
        .filter-tab:hover, .filter-tab.active {
          background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35) !important;
          transform: translateY(-2px);
        }

        /* LIQUID GLASS PRODUCT CARDS */
        .pastel-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
        }
        .pastel-card-wrapper {
          display: flex; flex-direction: column;
          border-radius: 24px; overflow: hidden;
          backdrop-filter: blur(20px) saturate(180%) !important;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pastel-card-wrapper:hover { transform: translateY(-8px) scale(1.02) !important; }
        [data-theme='dark'] .pastel-card-wrapper {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
        }
        [data-theme='dark'] .pastel-card-wrapper:hover {
          border-color: rgba(99, 102, 241, 0.5) !important;
          box-shadow: 0 30px 60px rgba(99, 102, 241, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
        }
        [data-theme='light'] .pastel-card-wrapper {
          background: rgba(255, 255, 255, 0.88) !important;
          border: 1px solid rgba(186, 230, 255, 0.6) !important;
          box-shadow: 0 8px 24px rgba(56, 189, 248, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.95) !important;
        }
        [data-theme='light'] .pastel-card-wrapper:hover {
          border-color: rgba(37, 99, 235, 0.4) !important;
          box-shadow: 0 24px 50px rgba(37, 99, 235, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.95) !important;
        }
        .pastel-image-block {
          position: relative;
          width: 100%;
          height: 320px;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-tertiary);
          display: block;
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .pastel-image-block {
            height: 220px;
          }
        }
        .pastel-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .pastel-card-wrapper:hover .pastel-product-img {
          transform: scale(1.06);
        }
        .pastel-action-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pastel-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.15s ease;
        }
        .pastel-icon-btn:hover {
          transform: scale(1.1);
          background: #ffffff;
        }
        .pastel-tag-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.3rem 0.65rem;
          border-radius: 99px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          pointer-events: none;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          width: auto !important;
          height: auto !important;
        }
        .badge-trending {
          background: #ef4444 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45) !important;
          border: none !important;
        }

        .pastel-card-info {
          padding: 1rem;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-top: 1px solid var(--border-color);
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
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
        }
        .pastel-card-price {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .pastel-add-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .pastel-add-btn:hover {
          background: var(--accent-primary);
          color: #ffffff;
        }

        /* ------------------ CULTURE ARCHIVE SECTION ------------------ */
        .culture-archive-section {
          position: relative;
          background: var(--bg-primary);
          color: var(--text-primary);
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
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }
        .sale-header { display: flex; flex-direction: column; }
        .sale-text-large { font-size: 2rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
        .sale-percent { font-size: 0.8rem; font-weight: 800; color: var(--accent-primary); }
        .bento-link-blue { font-size: 0.75rem; font-weight: 800; color: var(--accent-primary); margin-top: 0.5rem; }

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
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .look-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-primary);
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
        /* ── NEWSLETTER — shared structure ── */
        .collective-banner-box {
          position: relative;
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          overflow: hidden;
          color: var(--text-primary);
          transition: background 0.35s ease, border-color 0.35s ease;
        }
        [data-theme='dark'] .collective-banner-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-top: 3px solid var(--accent-primary);
        }
        [data-theme='light'] .collective-banner-box {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(219,238,255,0.85) 100%);
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          border-top: 3px solid #2563eb;
          box-shadow: 0 12px 40px rgba(56, 189, 248, 0.15);
        }

        .collective-watermark {
          position: absolute; bottom: -20px; right: 20px;
          font-size: 8rem; font-weight: 900;
          user-select: none; pointer-events: none;
        }
        [data-theme='dark']  .collective-watermark { color: rgba(255,255,255,0.03); }
        [data-theme='light'] .collective-watermark { color: rgba(37, 99, 235, 0.05); }

        .collective-content { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; }
        .collective-title { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
        [data-theme='dark']  .collective-title { color: var(--text-primary); }
        [data-theme='light'] .collective-title { color: #0f172a; }

        .collective-subtitle { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 2rem; }
        [data-theme='dark']  .collective-subtitle { color: #94a3b8; }
        [data-theme='light'] .collective-subtitle { color: #475569; }

        .collective-form { display: flex; gap: 0.5rem; max-width: 480px; margin: 0 auto; }
        .collective-input {
          flex: 1; padding: 0.85rem 1.2rem; border-radius: 6px;
          font-size: 0.85rem; font-weight: 600; outline: none;
          transition: border-color 0.2s ease;
        }
        [data-theme='dark'] .collective-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
        }
        [data-theme='light'] .collective-input {
          background: rgba(255,255,255,0.95);
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          color: #0f172a;
        }
        [data-theme='light'] .collective-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .collective-input:focus { border-color: #2563eb; }

        .collective-submit-btn {
          border: none; padding: 0.85rem 1.5rem;
          font-weight: 900; font-size: 0.85rem; border-radius: 6px;
          cursor: pointer; transition: all 0.2s ease;
        }
        [data-theme='dark'] .collective-submit-btn {
          background: #ffffff; color: #0f172a;
        }
        [data-theme='dark'] .collective-submit-btn:hover {
          background: #2563eb; color: white;
        }
        [data-theme='light'] .collective-submit-btn {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
        }
        [data-theme='light'] .collective-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45);
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
          .hero-section-street {
            padding: 2.25rem 1.25rem 2.25rem 1.25rem !important;
            min-height: 440px !important;
            border-radius: 20px !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
            border-bottom-left-radius: 20px !important;
            border-bottom-right-radius: 20px !important;
            margin-top: 0.25rem !important;
            align-items: flex-end !important;
          }
          .hero-athlete-bg-img {
            width: 100% !important;
            height: 100% !important;
            inset: 0 !important;
            object-fit: cover !important;
            object-position: center 15% !important;
            opacity: 0.55 !important;
            border-radius: 20px !important;
          }
          .hero-fade-overlay {
            background: linear-gradient(180deg, rgba(9, 9, 11, 0.35) 0%, rgba(9, 9, 11, 0.82) 55%, rgba(9, 9, 11, 0.98) 100%) !important;
          }
          .hero-street-container {
            width: 100% !important;
            max-width: 100% !important;
          }
          .hero-pill-badge {
            font-size: 0.68rem !important;
            padding: 0.35rem 0.75rem !important;
            margin-bottom: 0.85rem !important;
          }
          .hero-street-title {
            font-size: 2.1rem !important;
            line-height: 1.15 !important;
            margin-bottom: 0.85rem !important;
          }
          .hero-street-desc {
            font-size: 0.88rem !important;
            line-height: 1.45 !important;
            margin-bottom: 1.35rem !important;
            max-width: 100% !important;
          }
          .hero-btn-group {
            width: 100% !important;
            flex-direction: column !important;
            gap: 0.65rem !important;
          }
          .btn-street-dark, .btn-street-light {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 0.8rem 1rem !important;
            font-size: 0.85rem !important;
          }
          .hero-visual-wrapper { margin-top: 1.5rem; }
          .culture-container { grid-template-columns: 1fr; }
          .culture-photos-stacked { height: 280px; }
          .pastel-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
          .vibe-bento-grid { grid-template-columns: 1fr; }
          .lookbook-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
          .collective-form { flex-direction: column; }
          .collection-cta-wrapper {
            margin-top: 1.25rem;
            width: 100%;
          }
          .collection-filter-cta-btn {
            width: 100%;
            font-size: 0.76rem;
            padding: 0.65rem 0.8rem;
            letter-spacing: 0.01em;
            white-space: normal;
            text-align: center;
            line-height: 1.35;
          }
        }
      `}</style>
    </div>
  );
}
