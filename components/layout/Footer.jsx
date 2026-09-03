'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, HelpCircle, Truck, ShieldCheck, CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react';
import GrizzleLogo from '@/components/ui/GrizzleLogo';
import SizeChartModal from '@/components/ui/SizeChartModal';
import PolicyModal from '@/components/ui/PolicyModal';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState('returns');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed fetching store settings in Footer', e);
      }
    }
    fetchSettings();
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const openPolicy = (type) => {
    setPolicyType(type);
    setPolicyModalOpen(true);
  };

  const aboutText = settings?.footerAboutText || 'Self-Made High-Density DTF Printed Streetwear. Bio-Washed Premium Cotton Built for Style & Longevity.';
  const copyrightText = settings?.footerCopyrightText || `© ${new Date().getFullYear()} Grizzle Apparel India (grizzle.in). All rights reserved.`;
  const customLinks = Array.isArray(settings?.footerCustomLinks) && settings.footerCustomLinks.length > 0
    ? settings.footerCustomLinks
    : [
        { label: '📐 Size Chart & Fit Guide', url: '#size-chart' },
        { label: '🚚 Shipping & Delivery Policy', url: '#shipping-policy' },
        { label: '🔄 Returns & Refund Policy', url: '#return-policy' },
      ];

  const instaUrl = settings?.trustInstagramUrl || 'https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg==';

  return (
    <footer className="footer-wrapper">
      {/* Main 4-Column Footer */}
      <div className="container footer-content-grid">
        {/* Column 1: Brand Info */}
        <div className="footer-col footer-col-brand">
          <Link href="/" className="footer-logo-link">
            <GrizzleLogo size="medium" />
          </Link>
          <p className="brand-tagline">{aboutText}</p>
          <div className="brand-badges">
            <span className="b-badge">BIO-WASHED</span>
            <span className="b-badge">HIGH DENSITY DTF</span>
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
                <HelpCircle size={14} /> FAQ &amp; Order Support
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

        {/* Column 3: Company & Admin Custom Links */}
        <div className="footer-col">
          <h4 className="col-heading">COMPANY & POLICIES</h4>
          <ul className="footer-links-list">
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
                Shipping Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openPolicy('returns')}
                className="footer-btn-link"
              >
                7-Day Return Policy
              </button>
            </li>
            {customLinks.map((lnk, idx) => (
              <li key={idx}>
                {lnk.url.startsWith('#') ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (lnk.url.includes('size')) setSizeChartOpen(true);
                      else if (lnk.url.includes('return')) openPolicy('returns');
                      else if (lnk.url.includes('shipping')) openPolicy('shipping');
                      else openPolicy('privacy');
                    }}
                    className="footer-btn-link"
                  >
                    {lnk.label}
                  </button>
                ) : (
                  <a
                    href={lnk.url}
                    target={lnk.url.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="footer-link-item"
                  >
                    {lnk.label} {lnk.url.startsWith('http') && <ExternalLink size={12} />}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Follow Us */}
        <div className="footer-col">
          <h4 className="col-heading">FOLLOW US</h4>
          <p className="follow-desc">Connect with official Grizzle streetwear community:</p>

          <div className="social-column-btns">
            <a
              href={instaUrl}
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
              <MessageCircle size={18} />
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
          <p className="copyright-text">{copyrightText}</p>
          <div className="bottom-badges">
            <span className="pay-tag">💵 CASH ON DELIVERY AVAILABLE</span>
            <span className="pay-tag">🔒 100% SECURE CHECKOUT</span>
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
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          margin-top: 0;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .footer-content-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1.1fr;
          gap: 2.5rem;
          padding: 3.5rem 1.5rem;
        }

        @media (max-width: 900px) {
          .footer-content-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }

        @media (max-width: 550px) {
          .footer-content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
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
          gap: 0.75rem;
        }

        .social-col-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
