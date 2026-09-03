'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function ShareModal({ isOpen, onClose, product }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out ${product.name} on Grizzle!`;
  const shareText = `Check out ${product.name} (₹${product.price?.toFixed(0)}) on Grizzle Streetwear!`;
  const image = product.images?.[0] || product.image || '';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = shareUrl;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy link error:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>Share Product</h3>
          <button onClick={onClose} className="share-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Product Brief */}
        <div className="share-product-preview">
          {image && (
            <img
              src={getOptimizedImageUrl(image, 100, 75)}
              alt={product.name}
              className="share-thumb"
            />
          )}
          <div className="share-product-info">
            <span className="share-brand">Grizzle Streetwear</span>
            <h4 className="share-title">{product.name}</h4>
            <span className="share-price">₹{product.price?.toFixed(0)}</span>
          </div>
        </div>

        {/* Social Apps Grid */}
        <div className="social-grid">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn whatsapp"
          >
            <div className="icon-wrapper wa">
              <MessageCircle size={22} />
            </div>
            <span>WhatsApp</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn telegram"
          >
            <div className="icon-wrapper tg">
              <Send size={20} />
            </div>
            <span>Telegram</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn twitter"
          >
            <div className="icon-wrapper tw">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span>X / Twitter</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn facebook"
          >
            <div className="icon-wrapper fb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span>Facebook</span>
          </a>
        </div>

        {/* Copy Link Section */}
        <div className="copy-link-group">
          <input type="text" readOnly value={shareUrl} className="copy-input" />
          <button onClick={handleCopyLink} className={`copy-btn ${copied ? 'copied' : ''}`}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Native Share for Mobile */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button onClick={handleNativeShare} className="native-share-btn mt-2">
            <Share2 size={16} /> More System Share Options
          </button>
        )}
      </div>

      <style jsx>{`
        .share-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        .share-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-primary, #0f172a);
          border: 1.5px solid var(--border-color, rgba(255, 255, 255, 0.15));
          border-radius: 20px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .share-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .share-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }

        .share-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .share-close-btn:hover {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
        }

        .share-product-preview {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 1.25rem;
        }

        .share-thumb {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .share-product-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .share-brand {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--accent-primary, #ef4444);
          text-transform: uppercase;
        }

        .share-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .share-price {
          font-size: 0.88rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .social-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          transition: transform 0.2s ease;
        }
        .social-btn:hover {
          transform: translateY(-3px);
          color: var(--text-primary);
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .icon-wrapper.wa { background: #25d366; }
        .icon-wrapper.tg { background: #0088cc; }
        .icon-wrapper.tw { background: #000000; border: 1px solid rgba(255,255,255,0.2); }
        .icon-wrapper.fb { background: #1877f2; }

        .copy-link-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .copy-input {
          flex: 1;
          height: 40px;
          padding: 0 0.85rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 0.8rem;
          outline: none;
        }

        .copy-btn {
          height: 40px;
          padding: 0 1rem;
          border-radius: 10px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: none;
          font-weight: 800;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .copy-btn:hover {
          opacity: 0.92;
        }
        .copy-btn.copied {
          background: #10b981 !important;
        }

        .native-share-btn {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .native-share-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
