'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, ArrowRight, RotateCcw, Twitter, Instagram, Github } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import GrizzleLogo from '@/components/ui/GrizzleLogo';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchFooterCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error('Fetch footer categories error:', e);
      }
    }
    fetchFooterCategories();
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      addToast('Thank you for subscribing! Check your inbox for your 15% discount code.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="footer-wrapper">

      {/* ── Value bar ── */}
      <div className="features-bar">
        <div className="container features-grid">
          <div className="feature-item">
            <RotateCcw className="feature-icon" size={22} />
            <div>
              <h4>Cash On Delivery</h4>
              <p>Pay at your doorstep anywhere in India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="container footer-content">

        {/* Brand */}
        <div className="footer-brand">
          <GrizzleLogo size="medium" />
          <p className="brand-description">
            High-quality custom DTF (Direct-To-Film) printed t-shirts crafted
            in India. 240 GSM bio-washed combed cotton, vibrant multi-colour
            prints, and long-lasting wash durability.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Twitter" className="social-icon"><Twitter size={16} /></a>
            <a href="#" aria-label="Instagram" className="social-icon"><Instagram size={16} /></a>
            <a href="#" aria-label="Github" className="social-icon"><Github size={16} /></a>
          </div>
        </div>

        {/* Shop Categories — only when present */}
        {categories.length > 0 && (
          <div className="footer-links-group">
            <h4 className="col-heading">Shop</h4>
            {categories.map((cat) => (
              <Link key={cat._id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Customer Care */}
        <div className="footer-links-group">
          <h4 className="col-heading">Customer Care</h4>
          <Link href="/orders">Track Your Order</Link>
          <Link href="/wishlist">Saved Wishlist</Link>
          <Link href="/cart">Shopping Bag</Link>
          <Link href="#">Shipping &amp; Delivery</Link>
          <Link href="#">Returns &amp; Refund Policy</Link>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h4 className="col-heading">Join the Grizzle Club</h4>
          <p>
            Subscribe to unlock <strong>15% OFF</strong> your first order and
            receive exclusive drop alerts.
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="newsletter-input-box">
              <Mail size={16} className="mail-icon" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
            </div>
            <button type="submit" className="btn btn-primary newsletter-btn">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>&copy; {new Date().getFullYear()} Grizzle Apparel India. All rights reserved. Self-Made Printed T-Shirts.</p>
          <div className="payment-badges">
            <span className="pay-badge">COD</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── Wrapper ── */
        .footer-wrapper {
          position: relative;
          z-index: 10;
          background: var(--bg-glass);
          backdrop-filter: blur(24px) saturate(190%);
          border-top: 1px solid var(--border-color);
          box-shadow: var(--shadow-xl);
          margin-top: 5rem;
          color: var(--text-primary);
        }

        /* ── Feature bar ── */
        .features-bar {
          padding: 1.4rem 0;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }
        .features-grid {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .feature-icon { color: var(--accent-primary); flex-shrink: 0; }
        .feature-item h4 { font-size: 0.9rem; font-weight: 700; line-height: 1.3; }
        .feature-item p  { font-size: 0.78rem; color: var(--text-muted); line-height: 1.3; }

        /* ── Main grid ── */
        .footer-content {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr 1fr 1.4fr;
          gap: 2.5rem;
          padding: 3.5rem 1.5rem 3rem;
          align-items: start;
        }

        /* ── Brand column ── */
        .footer-brand { display: flex; flex-direction: column; gap: 0; }
        .brand-description {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 1rem 0 1.25rem;
          max-width: 280px;
        }
        .social-links { display: flex; gap: 0.6rem; }
        .social-icon {
          width: 34px; height: 34px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .social-icon:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: var(--accent-light);
        }

        /* ── Link columns ── */
        .col-heading {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .footer-links-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .footer-links-group a {
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          line-height: 1.4;
          white-space: nowrap;
        }
        .footer-links-group a:hover { color: var(--accent-primary); }

        /* ── Newsletter column ── */
        .footer-newsletter { display: flex; flex-direction: column; gap: 0; }
        .footer-newsletter p {
          font-size: 0.83rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0.5rem 0 1.1rem;
        }
        .footer-newsletter strong { color: var(--accent-primary); }
        .newsletter-form { display: flex; flex-direction: column; gap: 0.65rem; }
        .newsletter-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .mail-icon { position: absolute; left: 11px; color: var(--text-muted); flex-shrink: 0; }
        .newsletter-input {
          width: 100%;
          padding: 0.7rem 0.9rem 0.7rem 2.2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.83rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .newsletter-input:focus { border-color: var(--accent-primary); }
        .newsletter-input::placeholder { color: var(--text-muted); }
        .newsletter-btn {
          width: 100%;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.88rem;
          padding: 0.7rem 1rem;
        }

        /* ── Bottom bar ── */
        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding: 1.2rem 0;
        }
        .bottom-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .payment-badges { display: flex; gap: 0.5rem; }
        .pay-badge {
          background: var(--bg-tertiary);
          padding: 0.22rem 0.55rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          border: 1px solid var(--border-color);
          letter-spacing: 0.04em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .brand-description { max-width: 100%; }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2.5rem 1.5rem 2rem;
          }
          .footer-links-group a { white-space: normal; }
        }
      `}</style>
    </footer>
  );
}
