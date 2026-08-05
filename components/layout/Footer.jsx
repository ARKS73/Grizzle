'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RotateCcw, Instagram } from 'lucide-react';
import GrizzleLogo from '@/components/ui/GrizzleLogo';

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);

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

  return (
    <footer className="footer-wrapper">

      {/* ── Value bar ── */}
      <div className="features-bar">
        <div className="container features-grid">
          <div className="feature-item">
            <RotateCcw className="feature-icon" size={22} />
            <div>
              <h4>Cash On Delivery</h4>
              <p>Available for all eligible delivery pincodes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="container footer-content">

        {/* Brand */}
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <GrizzleLogo size="medium" />
          </Link>
          <p className="brand-description">
            Self-Made High-Density DTF Printed Streetwear. Bio-Washed 240 GSM Premium Cotton Built for Style & Longevity.
          </p>
          <div className="social-links">
            <a
              href="https://wa.me/919176281858"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon whatsapp-icon"
              title="Contact Us on WhatsApp (+91 91762 81858)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg=="
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon instagram-icon"
              title="Instagram (@grizzle.in)"
            >
              <Instagram size={16} />
            </a>
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
          <a
            href="https://wa.me/919176281858"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-contact-link"
          >
            💬 Contact Us (WhatsApp)
          </a>
          <Link href="/orders">Track Your Order</Link>
          <Link href="/wishlist">Saved Wishlist</Link>
          <Link href="/cart">View Cart</Link>
          <Link href="#">Shipping &amp; Delivery</Link>
          <Link href="#">Returns &amp; Refund Policy</Link>
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
          grid-template-columns: 2fr 1fr 1.2fr;
          gap: 3rem;
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
          max-width: 320px;
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

        .social-icon.whatsapp-icon:hover {
          color: #25d366;
          border-color: #25d366;
          background: rgba(37, 211, 102, 0.12);
        }
        .social-icon.instagram-icon:hover {
          color: #e1306c;
          border-color: #e1306c;
          background: rgba(225, 48, 108, 0.12);
        }
        .whatsapp-contact-link {
          color: #25d366 !important;
          font-weight: 700 !important;
        }
        .whatsapp-contact-link:hover {
          text-decoration: underline;
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
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .payment-badges {
          display: flex;
          gap: 0.5rem;
        }
        .pay-badge {
          padding: 0.25rem 0.65rem;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
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
