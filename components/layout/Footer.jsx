'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, ArrowRight, ShieldCheck, Truck, RotateCcw, Github, Twitter, Instagram } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import GrizzleLogo from '@/components/ui/GrizzleLogo';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      addToast('Thank you for subscribing to Grizzle newsletter! Check your inbox for your 15% discount code.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="footer-wrapper">
      {/* Value Proposition Highlights */}
      <div className="features-bar glass-panel">
        <div className="container features-grid">
          <div className="feature-item">
            <RotateCcw className="feature-icon" size={24} />
            <div>
              <h4>Cash Only Delivery</h4>
              <p>Pay at your doorstep anywhere in India</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-content">
        <div className="footer-brand">
          <GrizzleLogo size="medium" />
          <p className="brand-description">
            High-quality custom DTF (Direct-To-Film) printed t-shirts crafted in India. Featuring 240 GSM bio-washed combed cotton, vibrant multi-color DTF prints, and long-lasting wash durability.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Twitter size={18} /></a>
            <a href="#" className="social-icon"><Instagram size={18} /></a>
            <a href="#" className="social-icon"><Github size={18} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Shop Printed Tees</h4>
          <Link href="/products?category=Oversized+Printed+Tees">Oversized Printed Tees</Link>
          <Link href="/products?category=Desi+Vibe+Typography">Desi Vibe Typography</Link>
          <Link href="/products?category=Anime+%26+Pop+Culture">Anime & Pop Culture</Link>
          <Link href="/products?category=Minimalist+Line+Art">Minimalist Line Art</Link>
          <Link href="/products?category=Self-Made+Artist+Drops">Self-Made Artist Drops</Link>
        </div>

        <div className="footer-links-group">
          <h4>Customer Care</h4>
          <Link href="/orders">Track Your Order</Link>
          <Link href="/wishlist">Saved Wishlist</Link>
          <Link href="/cart">Shopping Bag</Link>
          <Link href="#">Shipping Rates & Delivery</Link>
          <Link href="#">Returns & Refund Policy</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Join the Grizzle Club</h4>
          <p>Subscribe to unlock 15% OFF your first order and receive exclusive drop alerts.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="newsletter-input-box">
              <Mail size={18} className="mail-icon" />
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
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>&copy; {new Date().getFullYear()} Grizzle Apparel India. All rights reserved. Self-Made Printed T-Shirts.</p>
          <div className="payment-badges">
            <span className="pay-badge">COD</span>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        .features-bar {
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          padding: 2.2rem 0;
          background: var(--bg-tertiary);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .feature-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }
        .feature-item h4 {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .feature-item p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 3rem;
          padding: 4rem 1.5rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .logo-badge {
          background: var(--accent-gradient);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-highlight { color: var(--accent-primary); }

        .brand-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .social-links {
          display: flex;
          gap: 0.75rem;
        }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .social-icon:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: var(--accent-light);
        }

        .footer-links-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-links-group h4, .footer-newsletter h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .footer-links-group a {
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .footer-links-group a:hover {
          color: var(--accent-primary);
        }

        .footer-newsletter p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .newsletter-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .mail-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .newsletter-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.4rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          outline: none;
        }
        .newsletter-btn {
          width: 100%;
        }

        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding: 1.5rem 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .bottom-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .payment-badges {
          display: flex;
          gap: 0.5rem;
        }
        .pay-badge {
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid var(--border-color);
        }

        @media (max-width: 960px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
