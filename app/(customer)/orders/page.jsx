'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, FileText, Star, MessageSquarePlus } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import WriteReviewModal from '@/components/products/WriteReviewModal';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast('Order cancelled successfully', 'info');
        fetchOrders();
      } else {
        if (addToast) addToast(data.message || 'Failed to cancel order', 'error');
      }
    } catch (e) {
      if (addToast) addToast('Error cancelling order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Delivered</span>;
      case 'Shipped':
        return <span className="badge badge-info"><Truck size={12} /> Shipped</span>;
      case 'Processing':
        return <span className="badge badge-warning"><Clock size={12} /> Processing</span>;
      case 'Cancelled':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-primary">Pending</span>;
    }
  };

  return (
    <div className="container orders-page-wrapper">
      <h1 className="orders-title">Your Order History &amp; Tracking</h1>

      {loading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
      ) : !user ? (
        <div className="empty-orders glass-panel text-center">
          <Package size={56} className="text-muted mb-3" />
          <h2>Sign In to View Your Orders</h2>
          <p>Please sign in to view your personal order history, live tracking, and official invoices.</p>
          <Link href="/login?redirect=/orders" className="btn btn-primary mt-3">Sign In to Your Account</Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders glass-panel text-center">
          <Package size={56} className="text-muted mb-3" />
          <h2>No Past Orders Found</h2>
          <p>Place your first order to track shipments and download official invoices.</p>
          <Link href="/products" className="btn btn-primary mt-3">Shop Clothes Collection</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card glass-panel">
              <div className="order-header">
                <div>
                  <span className="invoice-num">Invoice #{order.invoiceNumber || order._id.slice(-6)}</span>
                  <span className="order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="order-items-preview">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={item.image} alt={item.name} className="preview-img" />
                    <div>
                      <span className="item-name">{item.name}</span>
                      <span className="item-spec">{item.quantity}x • Size {item.size} • {item.color}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className="item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => setReviewingProduct(item)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.65rem',
                            color: '#f59e0b',
                            borderColor: 'rgba(245, 158, 11, 0.4)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                          }}
                          title="Write a review for this delivered product"
                        >
                          <Star size={12} fill="#f59e0b" color="#f59e0b" /> Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="total-box">
                  <span>Total Amount:</span>
                  <strong>₹{order.totalPrice?.toFixed(0)}</strong>
                </div>

                <div className="action-btns" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {['Pending', 'Processing'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <XCircle size={15} /> Cancel Order
                    </button>
                  )}
                  {order.status === 'Delivered' ? (
                    <Link href={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                      <FileText size={16} /> View Invoice &amp; Receipt
                    </Link>
                  ) : (
                    <Link href={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                      <Truck size={16} /> Track Order
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {reviewingProduct && (
        <WriteReviewModal
          product={reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          onReviewSubmitted={() => fetchOrders()}
        />
      )}

      <style jsx>{`
        .orders-page-wrapper {
          padding-top: 2rem;
        }
        .orders-title {
          font-size: 2.2rem;
          margin-bottom: 2rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .order-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }
        .order-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .invoice-num { font-weight: 800; font-size: 1.05rem; display: block; }
        .order-date { font-size: 0.8rem; color: var(--text-muted); }

        .order-items-preview {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 0;
        }
        .preview-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .preview-img {
          width: 50px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .preview-item div { flex: 1; }
        .item-name { font-size: 0.9rem; font-weight: 700; display: block; }
        .item-spec { font-size: 0.75rem; color: var(--text-muted); }
        .item-price { font-weight: 700; }

        .order-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .total-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .empty-orders { padding: 4rem 2rem; }

        @media (max-width: 640px) {
          .order-card {
            padding: 1rem;
          }
          .order-header {
            align-items: flex-start;
          }
          .order-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
          }
          .total-box {
            justify-content: space-between;
            width: 100%;
          }
          .action-btns {
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .action-btns .btn, .action-btns a, .action-btns button {
            flex: 1;
            min-width: 120px;
            justify-content: center;
            text-align: center;
            font-size: 0.82rem;
            padding: 0.5rem 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
