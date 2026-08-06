'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Power, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminCouponsPage() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('30');
  const [isOneTimePerUser, setIsOneTimePerUser] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          minPurchase: parseFloat(minPurchase),
          expirationDate: new Date('2028-12-31'),
          isOneTimePerUser,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast('Coupon code created successfully!', 'success');
        setCode('');
        setDiscountValue('');
        setIsOneTimePerUser(false);
        fetchCoupons();
      }
    } catch (e) {
      addToast('Error creating coupon', 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message || `Coupon ${coupon.isActive ? 'deactivated' : 'activated'}!`, 'success');
        fetchCoupons();
      } else {
        addToast(data.message || 'Error updating coupon', 'error');
      }
    } catch (e) {
      addToast('Error updating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    const couponId = coupon._id;
    const couponCode = coupon.code || 'this coupon';
    if (!confirm(`Are you sure you want to permanently delete promo code "${couponCode}"?`)) return;

    try {
      setDeletingId(couponId);
      const res = await fetch(`/api/coupons/${couponId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`Promo code "${couponCode}" deleted!`, 'success');
        fetchCoupons();
      } else {
        addToast(data.message || 'Error deleting coupon', 'error');
      }
    } catch (e) {
      addToast('Error deleting coupon', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-coupons-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Promotions & Discount Coupon Manager</h1>
          <p>Create, activate, or deactivate promotional discount codes for customer checkout.</p>
        </div>
      </div>

      <div className="coupons-grid">
        <div className="add-card glass-panel">
          <h3>Create New Promo Code</h3>
          <form onSubmit={handleCreateCoupon} className="mt-3">
            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. SUMMER50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="form-select"
              >
                <option value="percentage">Percentage (%) OFF</option>
                <option value="fixed">Fixed Amount (₹) OFF</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                placeholder="e.g. 15 for 15% or 100 for ₹100"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Min Purchase Requirement (₹)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group mb-3">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={isOneTimePerUser}
                  onChange={(e) => setIsOneTimePerUser(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <span>⚡ One-Time Use Per Customer (Single / First Order Only)</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2">
              <Plus size={16} /> Save Coupon Code
            </button>
          </form>
        </div>

        <div className="table-card glass-panel">
          <h3>Promo Codes List</h3>
          <div className="table-responsive mt-3">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Usage Limit</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}>Loading coupons...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No promo codes created yet.</td></tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id || coupon.code}>
                      <td data-label="Code"><strong className="code-tag">{coupon.code}</strong></td>
                      <td data-label="Discount">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                      </td>
                      <td data-label="Min Purchase">₹{coupon.minPurchase}</td>
                      <td data-label="Usage Limit">
                        {coupon.isOneTimePerUser ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.72rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)' }}>
                            ⚡ 1-Time Customer
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                            Multi-Use
                          </span>
                        )}
                      </td>
                      <td data-label="Status">
                        {coupon.isActive ? (
                          <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                        ) : (
                          <span className="badge badge-danger"><XCircle size={12} /> Deactivated</span>
                        )}
                      </td>
                      <td data-label="Actions" className="actions-cell">
                        <div className="action-buttons-group">
                          <button
                            onClick={() => handleToggleCouponStatus(coupon)}
                            className={`btn btn-sm ${coupon.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                            title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            <Power size={13} /> {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="btn btn-sm btn-delete-coupon"
                            disabled={deletingId === coupon._id}
                            title="Delete Promo Code permanently"
                          >
                            <Trash2 size={13} /> {deletingId === coupon._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coupons-grid { display: grid; grid-template-columns: 340px 1fr; gap: 2rem; align-items: start; }
        .add-card, .table-card { padding: 1.75rem; border-radius: var(--radius-lg); }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 0.85rem; border-bottom: 2px solid var(--border-color); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; text-align: left; }
        .admin-table td { padding: 0.95rem 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; vertical-align: middle; }
        .code-tag { background: var(--accent-light); color: var(--accent-primary); padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; font-weight: 700; word-break: break-all; display: inline-block; }
        .action-buttons-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; flex-wrap: nowrap; }
        
        .btn-deactivate {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-deactivate:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .btn-activate {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-activate:hover {
          background: #10b981;
          color: #ffffff;
        }

        .btn-delete-coupon {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-delete-coupon:hover:not(:disabled) {
          background: #ef4444;
          color: #ffffff;
        }
        .btn-delete-coupon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .w-100 { width: 100%; }
        @media (max-width: 1180px) { 
          .coupons-grid { grid-template-columns: 1fr; gap: 1.5rem; } 
        }
        @media (max-width: 600px) {
          .add-card, .table-card { padding: 1rem; }
          .action-buttons-group { justify-content: flex-start; flex-wrap: wrap; }
          .actions-cell { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}

