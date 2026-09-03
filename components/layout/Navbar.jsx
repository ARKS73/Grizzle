'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  PackageCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Tag,
  Flame,
  ArrowRight,
  Shirt,
  Grid,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useTheme } from '@/contexts/ThemeContext';
import GrizzleLogo from '@/components/ui/GrizzleLogo';



const featuredTshirt = {
  name: 'Cyberpunk Neon Oversized Tee',
  category: 'Oversized Printed Tees',
  image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  price: 699,
  originalPrice: 999,
  badge: '240 GSM PREMIUM',
  link: '/products?category=Oversized+Printed+Tees'
};

const collections = [
  {
    title: 'Heavyweight DTF Tees',
    subtitle: '240 GSM Boxy Drop-Shoulder Tees',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=Oversized+Printed+Tees',
    tag: 'MOST POPULAR'
  },
  {
    title: 'Otaku Anime Series',
    subtitle: 'High-Density Back Art Manga Prints',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=Anime+%26+Pop+Culture',
    tag: 'NEW RELEASE'
  },
  {
    title: 'Desi Culture Drops',
    subtitle: 'Quirky Hindi Typography & Desi Quotes',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=Desi+Vibe+Typography',
    tag: 'TRENDING'
  },
  {
    title: 'Artist Handcrafted',
    subtitle: '100% Bio-Washed Cotton Limited Drops',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=400&q=80',
    link: '/products?category=Self-Made+Artist+Drops',
    tag: 'LIMITED'
  }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const genderParam = searchParams?.get('gender') || '';
  const { user, logout } = useAuth();
  const { cartItems, addToCart, removeFromCart, getTotalPrice, getTotalCount } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'tshirts' | 'collections' | null

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const megaMenuRef = useRef(null);
  const wishlistRef = useRef(null);
  const cartRef = useRef(null);

  // Live Auto-suggest search effect
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.products || []);
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error(e);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Click outside to close dropdowns & mega menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(event.target)) {
        setWishlistDropdownOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartDropdownOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setWishlistDropdownOpen(false);
    setCartDropdownOpen(false);
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="container nav-container" ref={megaMenuRef}>
        {/* Mobile Toggle & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="icon-btn mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div onClick={closeAllMenus}>
            <GrizzleLogo size="medium" />
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="search-wrapper" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search T-Shirts, Anime, Oversized..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
              className="search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="search-clear">
                <X size={14} />
              </button>
            )}
          </form>

          {/* Auto-suggest Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown glass-panel">
              {suggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    router.push(`/product/${product._id}`);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="suggestion-item"
                >
                  <img src={product.images[0]} alt={product.name} className="suggestion-img" />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{product.name}</span>
                    <span className="suggestion-price">₹{product.price.toFixed(0)}</span>
                  </div>
                </div>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSuggestions(false)}
                className="suggestion-view-all"
              >
                View all results for &quot;{searchQuery}&quot;
              </Link>
            </div>
          )}
        </div>

        {/* Simple & Clean Desktop Nav Links */}
        <nav className="desktop-nav">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            HOME
          </Link>
          <Link href="/products?gender=Men" className={`nav-link ${pathname === '/products' && genderParam === 'Men' ? 'active' : ''}`}>
            MEN
          </Link>
          <Link href="/products?gender=Women" className={`nav-link ${pathname === '/products' && genderParam === 'Women' ? 'active' : ''}`}>
            WOMEN
          </Link>
          <Link href="/products?gender=Unisex" className={`nav-link nav-highlight ${pathname === '/products' && genderParam === 'Unisex' ? 'active' : ''}`}>
            <Shirt size={15} /> UNISEX
          </Link>
        </nav>

        {/* Actions & User Controls */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="icon-btn theme-toggle-desktop" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} className="icon-sun" /> : <Moon size={20} className="icon-moon" />}
          </button>

          {/* Wishlist & Shopping Cart Dropdowns - ONLY visible when user is logged in */}
          {user && (
            <>
              {/* Wishlist Dropdown */}
              <div
                className="icon-dropdown-wrapper"
                ref={wishlistRef}
                onMouseEnter={() => setWishlistDropdownOpen(true)}
                onMouseLeave={() => setWishlistDropdownOpen(false)}
              >
                <Link
                  href="/wishlist"
                  className="icon-btn badge-container"
                  title="Wishlist"
                  onClick={closeAllMenus}
                >
                  <Heart size={20} />
                  {wishlistItems.length > 0 && (
                    <span className="nav-badge badge-heart">{wishlistItems.length}</span>
                  )}
                </Link>

                {wishlistDropdownOpen && (
                  <div className="quick-preview-menu glass-panel">
                    <div className="preview-header">
                      <span className="preview-title"><Heart size={14} className="text-danger" fill="#ef4444" /> Saved Wishlist ({wishlistItems.length})</span>
                      <Link href="/wishlist" onClick={closeAllMenus} className="preview-link">View All</Link>
                    </div>
                    <div className="preview-divider"></div>
                    {wishlistItems.length === 0 ? (
                      <div className="preview-empty">
                        <p>Your wishlist is empty.</p>
                        <Link href="/products" onClick={closeAllMenus} className="btn btn-secondary btn-sm mt-2">Explore T-Shirts</Link>
                      </div>
                    ) : (
                      <>
                        <div className="preview-items-list">
                          {wishlistItems.slice(0, 4).map((item) => (
                            <div key={item._id} className="preview-item">
                              <img src={item.images?.[0]} alt={item.name} className="preview-img" />
                              <div className="preview-info">
                                <span className="preview-item-name">{item.name}</span>
                                <span className="preview-item-price">₹{item.price?.toFixed(0)}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart(item, item.sizes?.[0] || 'M', item.colors?.[0]?.name || 'Pitch Black', 1);
                                  removeFromWishlist(item._id);
                                }}
                                className="btn btn-primary btn-xs"
                                title="Move to Cart"
                              >
                                + Cart
                              </button>
                            </div>
                          ))}
                        </div>
                        {wishlistItems.length > 4 && (
                          <p className="preview-more-count">+ {wishlistItems.length - 4} more saved items</p>
                        )}
                        <div className="preview-divider"></div>
                        <Link href="/wishlist" onClick={closeAllMenus} className="btn btn-primary btn-sm preview-action-btn">
                          Go to Wishlist Page
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Cart Dropdown */}
              <div
                className="icon-dropdown-wrapper"
                ref={cartRef}
                onMouseEnter={() => setCartDropdownOpen(true)}
                onMouseLeave={() => setCartDropdownOpen(false)}
              >
                <Link
                  href="/cart"
                  className="icon-btn badge-container"
                  title="Cart"
                  onClick={closeAllMenus}
                >
                  <ShoppingBag size={20} />
                  {getTotalCount() > 0 && (
                    <span className="nav-badge badge-cart">{getTotalCount()}</span>
                  )}
                </Link>

                {cartDropdownOpen && (
                  <div className="quick-preview-menu glass-panel">
                    <div className="preview-header">
                      <span className="preview-title">
                        <ShoppingBag size={14} className="text-primary" /> Cart ({getTotalCount()})
                      </span>
                      <Link href="/cart" onClick={closeAllMenus} className="preview-link">View Cart</Link>
                    </div>
                    <div className="preview-divider"></div>
                    {cartItems.length === 0 ? (
                      <div className="preview-empty">
                        <p>Your cart is empty.</p>
                        <Link href="/products" onClick={closeAllMenus} className="btn btn-primary btn-sm mt-2">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="preview-items-list">
                          {cartItems.slice(0, 4).map((item, idx) => (
                            <div key={`${item.product._id}-${item.size}-${idx}`} className="preview-item">
                              <img src={item.product.images?.[0]} alt={item.product.name} className="preview-img" />
                              <div className="preview-info">
                                <span className="preview-item-name">{item.product.name}</span>
                                <span className="preview-item-meta">{item.size} &bull; Qty {item.quantity}</span>
                                <span className="preview-item-price">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFromCart(item.product._id, item.size, item.color);
                                }}
                                className="preview-remove-btn"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {cartItems.length > 4 && (
                          <p className="preview-more-count">+ {cartItems.length - 4} more items</p>
                        )}
                        <div className="preview-divider"></div>
                        <div className="preview-subtotal-row">
                          <span>Total:</span>
                          <strong>₹{getTotalPrice().toFixed(0)}</strong>
                        </div>
                        <div className="preview-actions">
                          <Link href="/cart" onClick={closeAllMenus} className="btn btn-secondary btn-sm flex-1 text-center">
                            View Bag
                          </Link>
                          <Link href="/checkout" onClick={closeAllMenus} className="btn btn-primary btn-sm flex-1 text-center">
                            Checkout
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}



          {/* User Profile Dropdown */}
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="user-avatar-btn"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="user-avatar-img" />
                ) : (
                  <div className="user-avatar-placeholder" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name-short">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Dropdown Menu */}
            {user && userDropdownOpen && (
              <div className="user-dropdown-menu glass-panel">
                <div className="dropdown-user-header">
                  <p className="dropdown-user-name">{user.name}</p>
                  <p className="dropdown-user-email">{user.email}</p>
                </div>

                <div className="dropdown-menu-list">
                  <Link
                    href="/profile"
                    onClick={closeAllMenus}
                    className="dropdown-item"
                  >
                    <User size={16} className="dropdown-item-icon" />
                    <span>Profile & Address</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeAllMenus}
                    className="dropdown-item"
                  >
                    <PackageCheck size={16} className="dropdown-item-icon" />
                    <span>Order History</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={closeAllMenus}
                      className="dropdown-item dropdown-admin"
                    >
                      <ShieldAlert size={16} className="dropdown-item-icon" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="dropdown-divider"></div>

                  <button
                    onClick={() => { logout(); closeAllMenus(); }}
                    className="dropdown-item dropdown-logout"
                  >
                    <LogOut size={16} className="dropdown-item-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel">
          {/* Top Header: Welcome User Name (Left) & User Profile Icon / Close (Right) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.85rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user ? 'Welcome Back,' : 'Welcome to Grizzle'}
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                {user ? user.name : 'Guest User'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* User Profile Logo / Avatar button -> Redirects to Profile & Address Page */}
              <Link
                href={user ? "/profile" : "/login"}
                onClick={closeAllMenus}
                title={user ? "Go to Profile & Address Page" : "Sign In"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  flexShrink: 0
                }}
              >
                {user ? (
                  user.profileImage ? (
                    <img src={user.profileImage} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <User size={20} />
                )}
              </Link>

              {/* Close Drawer Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Menu"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mobile-search-box" style={{ marginBottom: '1rem' }}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          {/* Clean minimal Category List with right arrow chevron */}
          <div className="mobile-category-list" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Link href="/" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>HOME</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            <Link href="/products?sort=newest" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>NEW ARRIVALS</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            <Link href="/products?gender=Men" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>MEN</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            <Link href="/products?gender=Women" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>WOMEN</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            <Link href="/products?gender=Unisex" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>UNISEX</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            <Link href="/products" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
              <span>ALL COLLECTIONS</span>
              <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
            </Link>

            {user ? (
              <>
                <Link href="/orders" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <span>MY ORDERS</span>
                  <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                </Link>

                {user.role === 'admin' && (
                  <Link href="/admin" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--accent-primary)', boxSizing: 'border-box' }}>
                    <span>ADMIN DASHBOARD</span>
                    <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                  </Link>
                )}

                <button
                  onClick={() => { logout(); closeAllMenus(); }}
                  className="mobile-category-row"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}
                >
                  <span>LOGOUT</span>
                  <LogOut size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeAllMenus} className="mobile-category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.95rem 0.35rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--accent-primary)', fontWeight: 800, boxSizing: 'border-box' }}>
                  <span>SIGN IN / REGISTER</span>
                  <ChevronRight size={18} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                </Link>
              </>
            )}
          </div>

          {/* Theme Selection Switcher at bottom */}
          <div className="mobile-theme-card" style={{ marginTop: '1.25rem' }}>
            <span className="mobile-section-label">🎨 Theme</span>
            <div className="mobile-theme-toggle-group">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`mobile-theme-btn ${theme === 'light' ? 'active' : ''}`}
              >
                <Sun size={15} /> Light
              </button>
              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`mobile-theme-btn ${theme === 'dark' ? 'active' : ''}`}
              >
                <Moon size={15} /> Dark
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          border-radius: 0 !important;
          border-top: none;
          border-left: none;
          border-right: none;
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-md);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 1.5rem;
          position: relative;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          text-decoration: none;
        }
        .logo-badge {
          background: var(--accent-gradient);
          color: white;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          box-shadow: var(--shadow-glow);
        }
        .logo-highlight { color: var(--accent-primary); }

        /* Big Search Bar */
        .search-wrapper {
          position: relative;
          flex: 1.5;
          max-width: 520px;
          min-width: 260px;
        }
        .search-form {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--accent-primary);
          transition: transform var(--transition-fast);
        }
        .search-input {
          width: 100%;
          padding: 0.65rem 2.5rem 0.65rem 2.8rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          outline: none;
          transition: all var(--transition-normal);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .search-input:focus {
          border-color: var(--accent-primary);
          background: var(--bg-primary);
          box-shadow: 0 0 0 4px var(--accent-light), var(--shadow-md);
        }
        .search-clear {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        /* Auto suggest */
        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0.5rem;
          box-shadow: var(--shadow-xl);
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .suggestion-item:hover {
          background: var(--bg-tertiary);
        }
        .suggestion-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .suggestion-info {
          display: flex;
          flex-direction: column;
        }
        .suggestion-name {
          font-size: 0.875rem;
          font-weight: 600;
        }
        .suggestion-price {
          font-size: 0.8rem;
          color: var(--accent-primary);
          font-weight: 700;
        }
        .suggestion-view-all {
          display: block;
          text-align: center;
          padding: 0.5rem;
          font-size: 0.8rem;
          color: var(--accent-primary);
          font-weight: 600;
          border-top: 1px solid var(--border-color);
          margin-top: 0.35rem;
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .nav-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.4rem 0;
          letter-spacing: 0.5px;
          position: relative;
        }
        .nav-link:hover {
          color: var(--accent-primary);
        }
        .nav-link.active {
          color: var(--accent-primary);
          font-weight: 800;
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-primary);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
        .nav-link-all {
          color: var(--text-primary);
        }
        .nav-icon {
          color: var(--accent-primary);
        }
        .chevron-icon {
          transition: transform var(--transition-fast);
        }
        .chevron-icon.open {
          transform: rotate(180deg);
        }

        .nav-badge-link {
          position: relative;
        }
        .nav-pill-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .pill-new {
          background: var(--accent-gradient);
          color: white;
        }
        .pill-sale {
          background: #ef4444;
          color: white;
        }
        .nav-highlight {
          color: #ef4444;
        }
        .nav-highlight:hover {
          color: #dc2626;
        }

        /* Dropdown Trigger Wrapper */
        .nav-dropdown-trigger {
          position: relative;
        }

        /* MEGA DROPDOWN STYLES */
        .mega-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%);
          width: 820px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          border-radius: var(--radius-xl);
          padding: 1.25rem;
          z-index: 1000;
          animation: megaSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes megaSlideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .mega-container {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 1.5rem;
        }
        .collections-container {
          grid-template-columns: 1fr;
        }

        .mega-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .mega-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          letter-spacing: 0.5px;
        }
        .mega-view-all {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .mega-view-all:hover {
          text-decoration: underline;
        }

        /* T-SHIRT CATEGORY GRID IN DROPDOWN */
        .tshirt-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .tshirt-cat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .tshirt-cat-card:hover {
          border-color: var(--accent-primary);
          background: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .cat-img-wrapper {
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
        }
        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .tshirt-cat-card:hover .cat-img {
          transform: scale(1.08);
        }

        .cat-badge {
          position: absolute;
          top: 2px;
          left: 2px;
          font-size: 0.55rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          color: white;
          text-transform: uppercase;
        }
        .badge-hot { background: #ef4444; }
        .badge-trending { background: #f59e0b; }
        .badge-bestseller { background: #8b5cf6; }
        .badge-aesthetic { background: #06b6d4; }
        .badge-limited { background: #10b981; }

        .cat-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }
        .cat-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cat-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cat-price {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        /* FEATURED TSHIRT CARD IN DROPDOWN */
        .featured-tshirt-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          height: 100%;
          justify-content: space-between;
        }
        .featured-pill {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-primary);
          background: var(--accent-light);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .featured-img-box {
          width: 100%;
          height: 110px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 0.65rem;
        }
        .featured-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .featured-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          width: 100%;
        }
        .featured-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .featured-price-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
        }
        .featured-price {
          font-weight: 900;
          color: var(--accent-primary);
        }
        .featured-orig-price {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .featured-discount {
          font-size: 0.65rem;
          font-weight: 800;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 1px 4px;
          border-radius: 4px;
        }
        .featured-btn {
          width: 100%;
          margin-top: 0.4rem;
          font-size: 0.78rem;
          padding: 0.4rem 0.6rem;
        }

        /* COLLECTIONS GRID */
        .mega-collections {
          width: 780px;
        }
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        .collection-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          background: var(--bg-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .collection-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        .col-img-wrapper {
          position: relative;
          height: 110px;
          width: 100%;
          overflow: hidden;
        }
        .col-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .collection-card:hover .col-img {
          transform: scale(1.08);
        }
        .col-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        }
        .col-tag {
          position: absolute;
          top: 6px;
          left: 6px;
          font-size: 0.6rem;
          font-weight: 800;
          background: rgba(0,0,0,0.75);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .col-content {
          padding: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .col-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .col-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.2;
        }
        .col-link-text {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--accent-primary);
          margin-top: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }
        .icon-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        .icon-sun { color: #f59e0b; }
        .icon-moon { color: #818cf8; }

        .badge-container { text-decoration: none; }
        .nav-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-heart { background: var(--danger); }
        .badge-cart { background: var(--accent-primary); }

        /* Icon Dropdown Wrapper & Quick Preview Popup */
        .icon-dropdown-wrapper {
          position: relative;
        }
        .quick-preview-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          padding: 1rem;
          box-shadow: var(--shadow-xl);
          background: var(--bg-elevated);
          z-index: 1000;
          border-radius: var(--radius-lg);
          animation: previewFadeIn 0.2s ease;
        }
        @keyframes previewFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .preview-link {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-decoration: none;
        }
        .preview-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.65rem 0;
        }
        .preview-empty {
          text-align: center;
          padding: 1rem 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .preview-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-height: 240px;
          overflow-y: auto;
        }
        .preview-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.35rem;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }
        .preview-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          flex: 1;
          overflow: hidden;
        }
        .preview-item-name {
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-item-meta {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .preview-item-price {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        .btn-xs {
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
        .preview-remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .preview-remove-btn:hover { color: var(--danger); }
        .preview-more-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 0.4rem;
        }
        .preview-action-btn {
          width: 100%;
          text-align: center;
        }
        .preview-subtotal-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.65rem;
        }
        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }
        .flex-1 { flex: 1; }

        /* User Avatar Dropdown */
        .user-dropdown-wrapper {
          position: relative;
        }
        .user-avatar-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          color: var(--text-primary);
        }
        .user-avatar-img {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          object-fit: cover;
        }
        .user-name-short {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          min-width: 240px;
          padding: 0.85rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          background: var(--bg-elevated);
          z-index: 1000;
          border-radius: var(--radius-lg);
          display: flex !important;
          flex-direction: column !important;
          gap: 0.25rem;
          box-sizing: border-box;
        }
        .dropdown-user-header {
          padding: 0.35rem 0.65rem 0.65rem 0.65rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.35rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dropdown-user-name {
          font-weight: 800;
          font-size: 0.92rem;
          color: var(--text-primary);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-user-email {
          font-size: 0.78rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-menu-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.35rem !important;
          width: 100%;
        }
        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.35rem 0;
        }
        .dropdown-item {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 0.75rem !important;
          padding: 0.65rem 0.75rem !important;
          border-radius: var(--radius-md) !important;
          font-size: 0.88rem !important;
          font-weight: 600 !important;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          width: 100% !important;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
          white-space: nowrap !important;
          box-sizing: border-box;
        }
        .dropdown-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          transform: translateX(3px);
        }
        .dropdown-item-icon {
          flex-shrink: 0;
        }
        .dropdown-admin {
          color: var(--accent-primary) !important;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
        }
        .dropdown-admin:hover {
          background: rgba(99, 102, 241, 0.18) !important;
          color: white !important;
        }
        .dropdown-logout {
          color: #ef4444 !important;
        }
        .dropdown-logout:hover {
          background: rgba(239, 68, 68, 0.12) !important;
          color: #ef4444 !important;
        }

        .mobile-toggle, .mobile-user-btn { display: none; }

        /* MOBILE DRAWER STYLING */
        .mobile-drawer {
          padding: 1.25rem;
          border-top: 1px solid var(--border-color);
          max-height: calc(85vh - 72px);
          overflow-y: auto;
          background: var(--bg-elevated) !important;
          color: var(--text-primary) !important;
          box-shadow: var(--shadow-xl);
        }

        .mobile-account-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 0.85rem;
        }
        .mobile-user-profile {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .mobile-user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--accent-primary);
        }
        .mobile-avatar-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-user-text {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mobile-user-name {
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-primary);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .mobile-user-email {
          font-size: 0.78rem;
          color: var(--text-muted);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .mobile-guest-title {
          font-weight: 800;
          font-size: 0.9rem;
          margin-bottom: 0.6rem;
          color: var(--text-primary);
        }
        .mobile-auth-btns {
          display: flex;
          gap: 0.65rem;
        }

        .mobile-theme-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mobile-section-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-secondary);
        }
        .mobile-theme-toggle-group {
          display: flex;
          background: var(--bg-tertiary);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .mobile-theme-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 700;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mobile-theme-btn.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .mobile-section-header {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin: 0.75rem 0 0.5rem 0.25rem;
        }

        .mobile-search-box {
          margin-bottom: 1rem;
        }

        .mobile-category-list {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
        }

        .mobile-category-row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          padding: 1rem 0.35rem !important;
          border-bottom: 1px solid var(--border-color) !important;
          color: var(--text-primary);
          font-size: 0.88rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          text-decoration: none !important;
          box-sizing: border-box !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .mobile-category-row:hover, .mobile-category-row:active {
          color: var(--accent-primary) !important;
        }

        .mobile-primary-nav {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .mobile-nav-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
          border: 1px solid var(--border-color);
          text-decoration: none;
          transition: all var(--transition-fast);
          width: 100%;
          box-sizing: border-box;
        }

        .mobile-nav-btn:hover, .mobile-nav-btn:active {
          background: var(--accent-light);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .mobile-nav-btn-highlight {
          background: var(--accent-gradient);
          color: #ffffff !important;
          border: none;
          box-shadow: var(--shadow-glow);
        }

        .mobile-nav-divider {
          height: 1px;
          background: var(--border-color);
          margin: 1.25rem 0;
        }

        .mobile-secondary-nav {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mobile-sub-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          padding: 0.4rem 0.25rem;
          transition: color var(--transition-fast);
        }

        .mobile-sub-link:hover {
          color: var(--accent-primary);
        }

        .mobile-admin-link {
          color: var(--accent-primary) !important;
          font-weight: 700;
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: none;
          border: none;
          color: var(--danger);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          padding: 0.4rem 0.25rem;
          text-align: left;
        }

        @media (max-width: 1100px) {
          .mega-dropdown {
            width: 95vw;
            left: 50%;
          }
          .collections-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 950px) {
          .desktop-nav { display: none; }
          .search-wrapper { max-width: 260px; }
          .theme-toggle-desktop { display: none !important; }
          .user-dropdown-wrapper { display: none !important; }
          .mobile-toggle, .mobile-user-btn { display: flex; }
        }
        @media (max-width: 600px) {
          .search-wrapper { display: none; }
          .user-name-short { display: none; }
        }
      `}</style>
    </header>
  );
}
