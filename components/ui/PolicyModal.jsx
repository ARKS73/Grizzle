'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, Truck, ShieldCheck } from 'lucide-react';

export default function PolicyModal({ isOpen, onClose, initialType = 'returns' }) {
  const [activeTab, setActiveTab] = useState(initialType);
  const [settings, setSettings] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialType) setActiveTab(initialType);
  }, [initialType]);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('Error fetching policy settings:', e);
      }
    }
    fetchSettings();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const returnPolicy = settings?.returnPolicyText ||
    'We accept returns and exchanges within 7 days of delivery. The item must be unworn, unwashed, and in its original packaging with tags intact. To initiate a return, contact us on WhatsApp with your Order Invoice Number.';

  const shippingPolicy = settings?.shippingPolicyText ||
    'All orders are processed within 24-48 hours. Standard dispatch takes 3-5 business days across India. Cash On Delivery (COD) and Online Express Delivery available.';

  const modalContent = (
    <div className="policy-modal-root" onClick={onClose}>
      <div className="policy-backdrop" />
      <div className="policy-sheet glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="title-group">
            <div className="icon-badge">
              <ShieldCheck size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 className="modal-title">Grizzle Customer Policies</h3>
              <p className="modal-sub">Official Shipping, Returns &amp; Guarantee Guidelines</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-circle" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-bar">
          <button
            onClick={() => setActiveTab('returns')}
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
          >
            <RotateCcw size={14} /> Returns &amp; Exchange Policy
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          >
            <Truck size={14} /> Shipping &amp; Delivery Policy
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {activeTab === 'returns' ? (
            <div className="policy-card">
              <div className="policy-head">
                <RotateCcw size={18} color="var(--accent-primary)" />
                <h4>Return &amp; Hassle-Free Exchange Guarantee</h4>
              </div>
              <p className="policy-content">{returnPolicy}</p>
            </div>
          ) : (
            <div className="policy-card">
              <div className="policy-head">
                <Truck size={18} color="var(--accent-primary)" />
                <h4>Express Nationwide Delivery &amp; COD Terms</h4>
              </div>
              <p className="policy-content">{shippingPolicy}</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="modal-footer">
          <a
            href="https://wa.me/919176281858"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm font-bold"
            style={{ color: '#25d366', borderColor: 'rgba(37,211,102,0.4)', textDecoration: 'none' }}
          >
            💬 Contact WhatsApp Support
          </a>
          <button onClick={onClose} className="btn btn-primary btn-sm font-bold" style={{ padding: '0.55rem 1rem' }}>
            Close Window
          </button>
        </div>
      </div>

      <style jsx>{`
        .policy-modal-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
        }
        .policy-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1;
        }
        .policy-sheet {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg, 18px);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .modal-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .modal-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 1px;
        }
        .btn-close-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .tab-bar {
          display: flex;
          background: var(--bg-tertiary);
          padding: 4px;
          border-bottom: 1px solid var(--border-color);
          gap: 4px;
          flex-shrink: 0;
        }
        .tab-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.76rem;
          font-weight: 700;
          padding: 0.5rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: all 0.15s ease;
        }
        .tab-btn.active {
          background: var(--bg-secondary);
          color: var(--accent-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .modal-body-scroll {
          overflow-y: auto;
          flex: 1;
          padding: 1.1rem;
          -webkit-overflow-scrolling: touch;
        }

        .policy-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .policy-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .policy-head h4 {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .policy-content {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
          background: var(--bg-tertiary);
          padding: 0.85rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
        }

        .policy-list-box {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 10px;
          padding: 0.75rem 0.9rem;
        }
        .policy-list-box h5 {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--accent-primary);
          margin: 0 0 0.4rem 0;
        }
        .policy-list-box ul {
          margin: 0;
          padding-left: 1.1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.1rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          flex-shrink: 0;
          gap: 0.5rem;
        }

        @media (max-width: 600px) {
          .policy-modal-root {
            padding: 0.5rem;
          }
          .policy-sheet {
            max-width: 95vw;
            max-height: 85vh;
            border-radius: 14px;
          }
          .modal-header {
            padding: 0.75rem 0.85rem;
          }
          .modal-title {
            font-size: 0.9rem;
          }
          .modal-sub {
            font-size: 0.68rem;
          }
          .tab-bar {
            padding: 3px;
            gap: 2px;
          }
          .tab-btn {
            font-size: 0.7rem;
            padding: 0.45rem 0.35rem;
            gap: 0.25rem;
          }
          .modal-body-scroll {
            padding: 0.85rem;
          }
          .policy-head h4 {
            font-size: 0.86rem;
          }
          .policy-content {
            font-size: 0.8rem;
            padding: 0.75rem;
          }
          .modal-footer {
            flex-direction: column-reverse;
            padding: 0.75rem 0.85rem;
            gap: 0.5rem;
          }
          .modal-footer a,
          .modal-footer button {
            width: 100%;
            justify-content: center;
            text-align: center;
            font-size: 0.82rem;
            padding: 0.6rem 0.5rem !important;
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
