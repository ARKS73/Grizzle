'use client';

import React, { useState, useEffect } from 'react';
import { Truck, RotateCcw, Users, Instagram, Star, ShieldCheck, Award, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Truck,
  RotateCcw,
  Users,
  Instagram,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
};

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

  const defaultCards = [
    {
      iconName: 'Truck',
      value: 'EXPRESS DISPATCH',
      label: 'NATIONWIDE DELIVERY',
      sub: 'Pan-India shipping with live order tracking',
      link: '/orders',
    },
    {
      iconName: 'RotateCcw',
      value: 'EASY EXCHANGES',
      label: 'DOORSTEP PICKUP',
      sub: 'Hassle-free size exchanges & dedicated support',
      link: '#return-policy',
    },
    {
      iconName: 'Award',
      value: 'PREMIUM FABRIC',
      label: 'BIO-WASHED COTTON',
      sub: 'Heavy combed cotton built for longevity',
      link: '',
    },
    {
      iconName: 'Instagram',
      value: 'INSTAGRAM COMMUNITY',
      label: '@GRIZZLE.IN',
      sub: 'Follow official page for upcoming drop alerts',
      link: settings?.trustInstagramUrl || 'https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg==',
    },
    {
      iconName: 'Sparkles',
      value: 'HIGH DENSITY PRINTS',
      label: 'DTF PRINT COLLECTIVE',
      sub: 'Vibrant detailed graphics engineered for long-lasting premium wear',
      link: '',
    },
    {
      iconName: 'ShieldCheck',
      value: '100% SECURE',
      label: 'COD & ONLINE PAYMENTS',
      sub: 'Encrypted checkout with Cash on Delivery available',
      link: '',
    },
  ];

  const cardsList = Array.isArray(settings?.featureCards) && settings.featureCards.length > 0
    ? settings.featureCards
    : defaultCards;

  return (
    <section className="trust-band-section">
      <div className="container">
        <div className="trust-band-header">
          <span className="trust-badge-pill">WHY GRIZZLE APPAREL</span>
          <h2 className="trust-title">TRUSTED BY THE STREETS</h2>
          <p className="trust-subtitle">Heavyweight Combed Cotton • High-Density DTF Printing • Built to Last</p>
        </div>

        <div className="trust-grid-6">
          {cardsList.map((card, idx) => {
            const IconComp = ICON_MAP[card.iconName] || ICON_MAP.Sparkles;

            const cardContent = (
              <div className="trust-card glass-panel">
                <div className="trust-icon-box">
                  <IconComp size={22} color="#ffffff" />
                </div>
                <div className="trust-info">
                  <h3 className="trust-stat-val">{card.value}</h3>
                  <span className="trust-stat-label">{card.label}</span>
                  <p className="trust-stat-sub">{card.sub}</p>
                </div>
              </div>
            );

            if (card.link && card.link.startsWith('http')) {
              return (
                <a
                  key={idx}
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trust-card-link"
                >
                  {cardContent}
                </a>
              );
            }

            if (card.link) {
              return (
                <a key={idx} href={card.link} className="trust-card-link">
                  {cardContent}
                </a>
              );
            }

            return <div key={idx} className="trust-card-wrapper">{cardContent}</div>;
          })}
        </div>
      </div>

      <style jsx>{`
        .trust-band-section {
          padding: 3rem 0;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .trust-band-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .trust-badge-pill {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 900;
          color: #d97706;
          background: rgba(250, 204, 21, 0.12);
          border: 1px solid rgba(250, 204, 21, 0.3);
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .trust-title {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin: 0;
        }

        .trust-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0.25rem 0 0 0;
        }

        .trust-grid-6 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 900px) {
          .trust-grid-6 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .trust-band-section {
            padding: 1.5rem 0 !important;
          }
          .trust-band-header {
            margin-bottom: 1.25rem !important;
          }
        }

        @media (max-width: 550px) {
          .trust-grid-6 {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .trust-card-link, .trust-card-wrapper {
          text-decoration: none;
          display: block;
        }

        .trust-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.4rem;
          border-radius: 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          height: 100%;
        }

        .trust-card-link:hover .trust-card,
        .trust-card:hover {
          transform: translateY(-4px);
          border-color: #dc2626;
          box-shadow: 0 12px 30px rgba(220, 38, 38, 0.18);
        }

        .trust-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
        }

        .trust-info {
          display: flex;
          flex-direction: column;
        }

        .trust-stat-val {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .trust-stat-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .trust-stat-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
          line-height: 1.35;
        }
      `}</style>
    </section>
  );
}
