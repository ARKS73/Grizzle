'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ReviewSection({ productId, reviews = [], onReviewAdded }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    async function checkReviewEligibility() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setCanReview(Boolean(data.canReview));
        }
      } catch (err) {
        console.error('Failed checking review eligibility', err);
      }
    }
    checkReviewEligibility();
  }, [productId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to leave a review', 'error');
      return;
    }

    if (!canReview) {
      addToast('Only customers who have purchased and received this product can submit a review', 'error');
      return;
    }

    if (!comment.trim()) {
      addToast('Please enter review comment', 'error');
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
        setTitle('');
        setComment('');
        setShowForm(false);
        if (onReviewAdded) onReviewAdded();
      } else {
        addToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (e) {
      addToast('Error submitting review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="reviews-section glass-panel">
      <div className="reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3>Customer Reviews & Ratings</h3>
          <p className="subtext">Verified customer feedback and rating breakdown</p>
        </div>

        {canReview ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <MessageSquarePlus size={18} /> Write a Review
          </button>
        ) : (
          <div className="verified-purchaser-note" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.85rem', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>✓ Verified Buyers Only:</span> Review option unlocks after delivery
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="review-form glass-panel">
          <h4>Leave Your Product Rating</h4>

          <div className="form-group">
            <label className="form-label">Your Rating (1 - 5 Stars):</label>
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
                    size={24}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Headline / Summary</label>
            <input
              type="text"
              placeholder="e.g. Incredible fit and cotton feel!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Review</label>
            <textarea
              rows={4}
              placeholder="Tell others how the fabric, size fit, and overall quality felt..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <p>No customer reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id || review.id} className="review-card">
              <div className="review-user-row">
                <div className="user-info">
                  <div className="avatar-placeholder">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h5 className="user-name">{review.userName}</h5>
                    {review.isVerifiedPurchase && (
                      <span className="verified-tag">
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
              </div>

              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-comment">{review.comment}</p>
              <span className="review-date">
                {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .reviews-section {
          padding: 2rem;
          margin-top: 3rem;
          border-radius: var(--radius-lg);
        }
        .reviews-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .subtext { font-size: 0.85rem; color: var(--text-muted); }

        .review-form {
          padding: 1.5rem;
          margin-top: 1.5rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }
        .star-picker {
          display: flex;
          gap: 0.5rem;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        .review-card {
          padding: 1.25rem;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }
        .review-user-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--accent-gradient);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name { font-size: 0.95rem; font-weight: 700; }
        .verified-tag {
          font-size: 0.75rem;
          color: var(--success);
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-weight: 600;
        }

        .stars { display: flex; gap: 2px; }
        .review-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.35rem; }
        .review-comment { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
        .review-date { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.5rem; }

        .empty-reviews {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
