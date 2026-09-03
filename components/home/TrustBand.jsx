'use client';

import React, { useState, useEffect } from 'react';
import { Users, Instagram, Star, ShieldCheck } from 'lucide-react';

export default function TrustBand() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed fetching store settings for TrustBand', e);
      }
    }
    fetchSettings();
  }, []);

  const happyCust = settings?.trustHappyCustomers || '15,000+';
  const instaFol = settings?.trustInstagramFollowers || '45.8K+';
  const instaUrl = settings?.trustInstagramUrl || 'https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg==';
  const reviewsTxt = settings?.trustReviewsText || '4.9 ★';
  const secureTxt = settings?.trustSecureCheckoutText || '100%';

  const stats = [
    {
      id: 1,
      icon: Users,
      value: happyCust,
      label: 'HAPPY STREETWEAR CUSTOMERS',
      sub: 'Pan-India delivery across 19,000+ pincodes',
    },
    {
      id: 2,
      icon: Instagram,
      value: instaFol,
      label: 'INSTAGRAM COMMUNITY',
      sub: 'Follow @grizzle.in for limited drop alerts',
      link: instaUrl,
    },
    {
      id: 3,
      icon: Star,
      value: reviewsTxt,
      label: '5-STAR VERIFIED REVIEWS',
      sub: 'Verified customer ratings & feedback',
    },
    {
      id: 4,
      icon: ShieldCheck,
      value: secureTxt,
      label: 'SECURE CHECKOUT & COD',
      sub: '256-Bit Encrypted Payments & Cash on Delivery',
    },
  ];

  return (
    <section className="trust-band-section">
      <div className="container">
        <div className="trust-band-header">
          <span className="trust-badge-pill">JOIN THE COMMUNITY</span>
          <h2 className="trust-title">TRUSTED BY THE STREETS</h2>
          <p className="trust-subtitle">Premium 240 GSM Heavyweight Cotton. No Compromises.</p>
        </div>

        <div className="trust-grid">
          {stats.map((stat) => {
            const IconComp = stat.icon;
            const content = (
              <div key={stat.id} className="trust-card glass-panel">
                <div className="trust-icon-box">
                  <IconComp size={24} color="var(--accent-primary, #dc2626)" />
                </div>
                <div className="trust-info">
                  <h3 className="trust-stat-val">{stat.value}</h3>
                  <span className="trust-stat-label">{stat.label}</span>
                  <p className="trust-stat-sub">{stat.sub}</p>
                </div>
              </div>
            );

            if (stat.link) {
              return (
                <a
                  key={stat.id}
                  href={stat.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trust-card-link"
                >
                  {content}
                </a>
              );
            }

            return content;
          })}
        </div>
      </div>

      <style jsx>{`
        .trust-band-section {
          padding: 4rem 0;
          background: linear-gradient(180deg, #09090b 0%, #121215 100%);
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }

        .trust-band-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .trust-badge-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: #facc15;
          background: rgba(250, 204, 21, 0.12);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 0.5rem;
        }

        .trust-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin: 0;
        }

        .trust-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted, #a1a1aa);
          margin-top: 0.35rem;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 992px) {
          .trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 550px) {
          .trust-grid {
            grid-template-columns: 1fr;
          }
        }

        .trust-card-link {
          text-decoration: none;
          display: block;
        }

        .trust-card {
          background: rgba(24, 24, 27, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.25s ease;
          height: 100%;
        }

        .trust-card:hover {
          border-color: var(--accent-primary, #dc2626);
          transform: translateY(-4px);
          background: rgba(24, 24, 27, 0.9);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }

        .trust-icon-box {
          background: rgba(220, 38, 38, 0.12);
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trust-info {
          display: flex;
          flex-direction: column;
        }

        .trust-stat-val {
          font-size: 1.6rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          line-height: 1;
        }

        .trust-stat-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary, #dc2626);
          letter-spacing: 0.05em;
          margin-top: 0.35rem;
        }

        .trust-stat-sub {
          font-size: 0.78rem;
          color: var(--text-muted, #a1a1aa);
          margin: 0.35rem 0 0 0;
          line-height: 1.4;
        }
      `}</style>
    </section>
  );
}
