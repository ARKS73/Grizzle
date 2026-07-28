'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
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
    }
    fetchOrders();
  }, []);

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
      <h1 className="orders-title">Your Order History & Tracking</h1>

      {loading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
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
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="total-box">
                  <span>Total Amount Paid:</span>
                  <strong>${order.totalPrice?.toFixed(2)}</strong>
                </div>

                <div className="action-btns">
                  <Link href={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                    <FileText size={16} /> View Invoice & Track
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        .total-box strong { font-size: 1.2rem; color: var(--accent-primary); }

        .empty-orders { padding: 4rem 2rem; }
      `}</style>
    </div>
  );
}
