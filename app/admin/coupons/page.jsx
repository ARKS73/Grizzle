'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Power, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminCouponsPage() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('30');

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast('Coupon code created!', 'success');
        setCode('');
        setDiscountValue('');
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

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Coupon deleted', 'success');
        fetchCoupons();
      } else {
        addToast(data.message || 'Error deleting coupon', 'error');
      }
    } catch (e) {
      addToast('Error deleting coupon', 'error');
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

            <div className="form-group">
              <label className="form-label">Min Purchase Requirement (₹)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="form-input"
              />
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
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}>Loading coupons...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No promo codes created yet.</td></tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id || coupon.code}>
                      <td><strong className="code-tag">{coupon.code}</strong></td>
                      <td>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                      </td>
                      <td>₹{coupon.minPurchase}</td>
                      <td>
                        {coupon.isActive ? (
                          <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                        ) : (
                          <span className="badge badge-danger"><XCircle size={12} /> Deactivated</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          <button
                            onClick={() => handleToggleCouponStatus(coupon)}
                            className={`btn btn-sm ${coupon.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                            title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            <Power size={13} /> {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="btn btn-sm btn-delete-icon"
                            title="Delete Promo Code"
                          >
                            <Trash2 size={14} />
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
        .coupons-grid { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; }
        .add-card, .table-card { padding: 1.5rem; border-radius: var(--radius-lg); }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .code-tag { background: var(--accent-light); color: var(--accent-primary); padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 0.9rem; }
        .action-buttons-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; }
        
        .btn-deactivate {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-deactivate:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .btn-activate {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-activate:hover {
          background: #10b981;
          color: #ffffff;
        }

        .btn-delete-icon {
          background: var(--bg-tertiary);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-delete-icon:hover {
          color: #ef4444;
          border-color: #ef4444;
        }

        .w-100 { width: 100%; }
        @media (max-width: 900px) { .coupons-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

