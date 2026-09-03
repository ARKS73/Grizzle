'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Mail, ArrowRight, ShieldCheck, HelpCircle, Truck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import GrizzleLogo from '@/components/ui/GrizzleLogo';
import SizeChartModal from '@/components/ui/SizeChartModal';
import PolicyModal from '@/components/ui/PolicyModal';
import { useToast } from '@/components/ui/Toast';

export default function Footer() {
  const pathname = usePathname();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState('returns');

  if (pathname?.startsWith('/admin')) return null;

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      if (addToast) addToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    if (addToast) addToast("🎉 Subscribed! You'll get early access to upcoming drops.", 'success');
  };

  const openPolicy = (type) => {
    setPolicyType(type);
    setPolicyModalOpen(true);
  };

  return (
    <footer className="footer-wrapper">
      {/* Main 4-Column Restructured Footer */}
      <div className="container footer-content-grid">
        {/* Column 1: Brand Info */}
        <div className="footer-col footer-col-brand">
          <Link href="/" className="footer-logo-link">
            <GrizzleLogo size="medium" />
          </Link>
          <p className="brand-tagline">
            Self-Made High-Density DTF Printed Streetwear. Bio-Washed Premium Cotton Built for Style &amp; Longevity.
          </p>
          <div className="brand-badges">
            <span className="b-badge">BIO-WASHED</span>
          </div>
        </div>

        {/* Column 2: Customer Service */}
        <div className="footer-col">
          <h4 className="col-heading">CUSTOMER SERVICE</h4>
          <ul className="footer-links-list">
            <li>
              <a
                href="https://wa.me/919176281858?text=Hi%20Grizzle%20Support%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-item highlight-link"
              >
                💬 Contact Us (WhatsApp)
              </a>
            </li>
            <li>
              <Link href="/orders" className="footer-link-item">
                <HelpCircle size={14} /> FAQ &amp; Support
              </Link>
            </li>
            <li>
              <Link href="/orders" className="footer-link-item">
                <Truck size={14} /> Track Order Status
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="footer-btn-link"
              >
                📐 Size Guide &amp; Chart
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="footer-col">
          <h4 className="col-heading">COMPANY</h4>
          <ul className="footer-links-list">
            <li>
              <Link href="/" className="footer-link-item">
                About Grizzle Apparel
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openPolicy('privacy')}
                className="footer-btn-link"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openPolicy('shipping')}
                className="footer-btn-link"
              >
                Shipping &amp; Delivery Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openPolicy('returns')}
                className="footer-btn-link"
              >
                Terms &amp; 7-Day Return Conditions
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Follow Us */}
        <div className="footer-col">
          <h4 className="col-heading">FOLLOW US</h4>
          <p className="follow-desc">Connect with the official Grizzle streetwear community:</p>

          <div className="social-column-btns">
            <a
              href="https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg=="
              target="_blank"
              rel="noopener noreferrer"
              className="social-col-btn insta-col-btn"
            >
              <Instagram size={18} />
              <div className="social-btn-text">
                <span className="social-btn-title">Instagram</span>
                <span className="social-btn-sub">@grizzle.in</span>
              </div>
            </a>

            <a
              href="https://wa.me/919176281858?text=Hi%20Grizzle%20Support%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="social-col-btn wa-col-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div className="social-btn-text">
                <span className="social-btn-title">WhatsApp Support</span>
                <span className="social-btn-sub">+91 91762 81858</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container bottom-bar-container">
          <p className="copyright-text">
            © {new Date().getFullYear()} Grizzle Apparel India (grizzle.in). All rights reserved. Self-Made DTF Printed T-Shirts.
          </p>
          <div className="bottom-badges">
            <span className="pay-tag">💵 CASH ON DELIVERY AVAILABLE</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
      />
      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialType={policyType}
      />

      <style jsx>{`
        .footer-wrapper {
          background: #09090b;
          color: #f4f4f5;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 0;
        }

        /* Newsletter Band */
        .newsletter-band {
          background: linear-gradient(90deg, #121215 0%, #18181c 50%, #121215 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2.5rem 0;
        }

        .newsletter-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .newsletter-text {
          max-width: 500px;
        }

        .newsletter-badge {
          font-size: 0.68rem;
          font-weight: 900;
          color: #facc15;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .newsletter-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0.25rem 0 0.35rem;
          letter-spacing: -0.01em;
        }

        .newsletter-desc {
          font-size: 0.85rem;
          color: #a1a1aa;
          margin: 0;
        }

        .newsletter-form {
          flex: 1;
          max-width: 460px;
        }

        .newsletter-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .input-with-icon {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .mail-icon {
          position: absolute;
          left: 12px;
          color: #71717a;
        }

        .newsletter-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.4rem;
          background: #09090b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .newsletter-input:focus {
          border-color: #dc2626;
        }

        .newsletter-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #dc2626;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 900;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease;
        }

        .newsletter-btn:hover {
          background: #b91c1c;
        }

        .subscribed-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 800;
        }

        /* 4 Column Grid */
        .footer-content-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1.1fr;
          gap: 2.5rem;
          padding: 3.5rem 1rem;
        }

        @media (max-width: 900px) {
          .footer-content-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 550px) {
          .footer-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .footer-col-brand {
          display: flex;
          flex-direction: column;
        }

        .brand-tagline {
          font-size: 0.85rem;
          color: #a1a1aa;
          line-height: 1.6;
          margin: 1rem 0 1.25rem;
        }

        .brand-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .b-badge {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e4e4e7;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .col-heading {
          font-size: 0.88rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.06em;
          margin: 0 0 1.25rem 0;
          text-transform: uppercase;
        }

        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-link-item {
          color: #a1a1aa;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 0.2s ease;
        }

        .footer-link-item:hover {
          color: #ffffff;
        }

        .highlight-link {
          color: #25d366 !important;
          font-weight: 800;
        }

        .footer-btn-link {
          background: none;
          border: none;
          color: #a1a1aa;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: color 0.2s ease;
        }

        .footer-btn-link:hover {
          color: #ffffff;
        }

        .follow-desc {
          font-size: 0.82rem;
          color: #a1a1aa;
          margin: 0 0 1rem 0;
        }

        .social-column-btns {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .social-col-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .insta-col-btn:hover {
          background: rgba(225, 48, 108, 0.15);
          border-color: #e1306c;
          color: #e1306c;
        }

        .wa-col-btn:hover {
          background: rgba(37, 211, 102, 0.15);
          border-color: #25d366;
          color: #25d366;
        }

        .social-btn-text {
          display: flex;
          flex-direction: column;
        }

        .social-btn-title {
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .social-btn-sub {
          font-size: 0.72rem;
          color: #a1a1aa;
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem 0;
          background: #000000;
        }

        .bottom-bar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .copyright-text {
          font-size: 0.78rem;
          color: #71717a;
          margin: 0;
        }

        .bottom-badges {
          display: flex;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .pay-tag {
          font-size: 0.68rem;
          font-weight: 900;
          color: #facc15;
          background: rgba(250, 204, 21, 0.1);
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
      `}</style>
    </footer>
  );
}
