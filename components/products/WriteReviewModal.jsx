'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

export default function WriteReviewModal({ product, onClose, onReviewSubmitted }) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!product) return null;

  const productId = typeof product.product === 'object' ? product.product?._id : (product.product || product._id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      addToast('Invalid product reference', 'error');
      return;
    }

    if (!comment.trim()) {
      addToast('Please enter your review comment', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast('Review submitted successfully!', 'success');
        if (onReviewSubmitted) onReviewSubmitted(productId);
        onClose();
      } else {
        addToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      addToast('Error submitting review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="write-review-modal-root" onClick={onClose}>
      <div className="write-review-backdrop" />
      <div className="write-review-sheet glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title-box">
            <MessageSquarePlus size={20} className="header-icon" />
            <div>
              <h3 className="modal-title">Write a Product Review</h3>
              <p className="modal-sub">Verified Purchase Review for Order History &amp; Tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-circle" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Product Spec Preview */}
        <div className="product-spec-bar">
          {product.image && (
            <img
              src={getOptimizedImageUrl(product.image, 100, 80)}
              alt={product.name}
              className="spec-thumb"
            />
          )}
          <div>
            <h4 className="spec-name">{product.name}</h4>
            <span className="spec-meta">
              {product.size ? `Size: ${product.size}` : ''} {product.color ? `• Color: ${product.color}` : ''}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Overall Star Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="star-btn"
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                </button>
              ))}
              <span className="rating-label-text">
                {(hoverRating || rating) === 5 ? '★ Excellent (5/5)' :
                 (hoverRating || rating) === 4 ? '★ Great (4/5)' :
                 (hoverRating || rating) === 3 ? '★ Average (3/5)' :
                 (hoverRating || rating) === 2 ? '★ Poor (2/5)' : '★ Terrible (1/5)'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Headline / Summary</label>
            <input
              type="text"
              placeholder="e.g., Amazing heavyweight 240 GSM print and perfect fit!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Review</label>
            <textarea
              rows={4}
              placeholder="Share how the fabric quality, DTF printing, fit, and delivery felt after receiving your order..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary font-bold">
              {submitting ? 'Submitting Review...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .write-review-modal-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .write-review-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1;
        }
        .write-review-sheet {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 520px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg, 20px);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .header-title-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-icon {
          color: var(--accent-primary);
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }
        .modal-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }
        .btn-close-circle {
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
          transition: all 0.2s;
        }
        .btn-close-circle:hover {
          background: var(--accent-light);
          color: var(--accent-primary);
        }

        .product-spec-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.5rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }
        .spec-thumb {
          width: 44px;
          height: 52px;
          object-fit: cover;
          border-radius: var(--radius-sm, 6px);
        }
        .spec-name {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }
        .spec-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .star-picker {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .star-btn {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .star-btn:hover {
          transform: scale(1.15);
        }
        .rating-label-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #f59e0b;
          margin-left: 0.5rem;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.88rem;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-primary);
          outline: none;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
