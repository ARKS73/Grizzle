'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, CheckCircle2, Clock, Truck, Package, XCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function OrderInvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Order cancelled successfully', 'info');
        fetchOrder();
      }
    } catch (e) {
      addToast('Error cancelling order', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="skeleton" style={{ height: '450px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container text-center mt-5">
        <h2>Order Not Found</h2>
        <Link href="/orders" className="btn btn-primary mt-3">Back to Orders</Link>
      </div>
    );
  }

  // Tracking Steps Progress index
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = order.status === 'Cancelled' ? -1 : steps.indexOf(order.status);

  return (
    <div className="container invoice-page-wrapper">
      <div className="top-nav-bar no-print">
        <Link href="/orders" className="back-link">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="actions">
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <button onClick={handleCancelOrder} className="btn btn-danger btn-sm">
              Cancel Order
            </button>
          )}
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} /> Print / Save Invoice PDF
          </button>
        </div>
      </div>

      {/* Tracking Timeline (Screen Only) */}
      {order.status !== 'Cancelled' && (
        <div className="tracking-card glass-panel no-print">
          <h3>Real-Time Shipment Progress</h3>
          <div className="timeline-wrapper">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              return (
                <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
                  <div className="step-node">
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="step-label">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Styled Printable Invoice Card */}
      <div className="invoice-card glass-panel print-area">
        <div className="invoice-header">
          <div>
            <div className="brand-logo">
              <span className="logo-badge">G</span>
              <span className="logo-text">Griz<span className="logo-highlight">zle</span></span>
            </div>
            <p className="invoice-sub">Official Purchase Invoice</p>
          </div>

          <div className="invoice-meta">
            <h2>{order.invoiceNumber}</h2>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Status: <strong className="status-highlight">{order.status}</strong></p>
          </div>
        </div>

        <div className="invoice-billing-grid">
          <div className="billing-box">
            <h4>Billed & Shipped To:</h4>
            <p><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="billing-box text-right">
            <h4>Payment Details:</h4>
            <p>Method: {order.paymentMethod}</p>
            <p>Payment Status: <span className="text-success font-bold">PAID</span></p>
            <p>Transaction Ref: #{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item & Description</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Qty</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div className="item-name-cell">
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td>Size {item.size} • {item.color}</td>
                <td>₹{item.price?.toFixed(0)}</td>
                <td>{item.quantity}</td>
                <td className="text-right">₹{(item.price * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary Totals */}
        <div className="invoice-totals">
          <div className="totals-box">
            <div className="row"><span>Items Subtotal:</span><span>₹{order.itemsPrice?.toFixed(0)}</span></div>
            {order.discountAmount > 0 && <div className="row text-success"><span>Discount Coupon:</span><span>-₹{order.discountAmount?.toFixed(0)}</span></div>}
            <div className="row"><span>Shipping Fee:</span><span>₹{order.shippingPrice?.toFixed(0)}</span></div>
            <div className="divider" />
            <div className="row grand-total"><span>Grand Total Paid:</span><span>₹{order.totalPrice?.toFixed(0)}</span></div>
          </div>
        </div>

        <div className="invoice-footer-note">
          <p>Thank you for shopping with Grizzle! For support inquiries or returns, visit support@grizzle.com</p>
        </div>
      </div>

      <style jsx>{`
        .invoice-page-wrapper {
          padding-top: 2rem;
        }
        .top-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .tracking-card {
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: var(--radius-lg);
        }
        .timeline-wrapper {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 1.5rem;
        }
        .timeline-wrapper::before {
          content: '';
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--border-color);
          z-index: 1;
        }
        .timeline-step {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .step-node {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .timeline-step.completed .step-node {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .step-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }

        /* Invoice Card */
        .invoice-card {
          padding: 3rem;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .logo-badge {
          background: var(--accent-gradient);
          color: white;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-highlight { color: var(--accent-primary); }
        .invoice-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

        .invoice-meta h2 { font-size: 1.5rem; }
        .invoice-meta p { font-size: 0.85rem; color: var(--text-secondary); }
        .status-highlight { color: var(--accent-primary); }

        .invoice-billing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2rem 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .billing-box h4 { margin-bottom: 0.5rem; font-size: 0.95rem; }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .invoice-table th, .invoice-table td {
          padding: 0.85rem;
          border-bottom: 1px solid var(--border-color);
          text-align: left;
          font-size: 0.9rem;
        }
        .invoice-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }

        .invoice-totals {
          display: flex;
          justify-content: flex-end;
          padding-top: 1.5rem;
        }
        .totals-box {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .totals-box .row { display: flex; justify-content: space-between; }
        .divider { height: 1px; background: var(--border-color); margin: 0.5rem 0; }
        .grand-total { font-size: 1.2rem; font-weight: 800; }

        .invoice-footer-note {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
        }

        @media print {
          .no-print { display: none !important; }
          .print-area { border: none !important; background: white !important; color: black !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
