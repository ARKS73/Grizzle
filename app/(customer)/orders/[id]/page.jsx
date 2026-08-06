'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, CheckCircle2, Clock, Truck, Package, XCircle, ArrowLeft, ShieldCheck, Download, Star } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import WriteReviewModal from '@/components/products/WriteReviewModal';

export default function OrderInvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState(null);
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
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
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
      } else {
        addToast(data.message || 'Failed to cancel order', 'error');
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
  const canCustomerCancel = ['Pending', 'Processing'].includes(order.status);

  return (
    <div className="container invoice-page-wrapper">
      <div className="top-nav-bar no-print mb-4">
        <Link href="/orders" className="back-link">
          <ArrowLeft size={16} /> Back to Order History
        </Link>

        <div className="actions">
          {canCustomerCancel && (
            <button onClick={handleCancelOrder} className="btn btn-secondary btn-sm btn-cancel-order">
              <XCircle size={16} /> Cancel Order
            </button>
          )}

          {order.status === 'Delivered' ? (
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Download size={16} /> Download Invoice (PDF)
            </button>
          ) : (
            <span
              className="btn btn-secondary btn-sm invoice-pending-btn"
              title="Tax invoice will be downloadable once package is Delivered"
            >
              <Download size={16} /> Invoice (Delivered)
            </span>
          )}
        </div>
      </div>

      {/* Real-Time Tracking Timeline */}
      <div className="glass-panel tracking-stepper-card mb-4">
        <h3 className="tracking-title">
          <Truck size={20} color="var(--accent-primary)" />
          <span>Order Tracking Progress:</span>
          <span className="status-pill">{order.status}</span>
        </h3>

        <div className="stepper-grid">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`step-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="step-circle">
                  {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                </div>
                <span className="step-text">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice Card - ONLY visible when product is Delivered */}
      {order.status === 'Delivered' ? (
        <div className="invoice-card glass-panel print-area">
          <div className="invoice-header">
            <div>
              <img src="/placeholder.png" alt="GRIZZLE" style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block', marginBottom: '0.5rem' }} />
              <p className="invoice-sub">Tax Invoice / Purchase Receipt</p>
            </div>

            <div className="invoice-meta">
              <h2>{order.invoiceNumber}</h2>
              <p>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p>Status: <strong className="status-highlight">{order.status.toUpperCase()}</strong></p>
            </div>
          </div>

          <div className="invoice-billing-grid">
            <div className="billing-box">
              <h4>Billed &amp; Shipped To:</h4>
              <p><strong>{order.shippingAddress?.fullName}</strong></p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state || 'Tamil Nadu'} - {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country || 'India 🇮🇳'}</p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="billing-box text-right">
              <h4>Payment Details:</h4>
              <p>Method: {order.paymentMethod || 'Cash on Delivery (COD)'}</p>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Variant</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th className="text-right">Total &amp; Review</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.name}</strong></td>
                    <td>Size {item.size} • {item.color}</td>
                    <td>₹{item.price?.toFixed(0)}</td>
                    <td>{item.quantity}</td>
                    <td className="text-right">
                      <div>₹{(item.price * item.quantity).toFixed(0)}</div>
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => setReviewingProduct(item)}
                          className="btn btn-secondary btn-sm no-print"
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.55rem',
                            color: '#f59e0b',
                            borderColor: 'rgba(245, 158, 11, 0.4)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            marginTop: '4px',
                          }}
                          title="Write a verified review for this product"
                        >
                          <Star size={11} fill="#f59e0b" color="#f59e0b" /> Write Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary Totals */}
          <div className="invoice-totals">
            <div className="totals-box">
              <div className="row"><span>Items Subtotal:</span><span>₹{order.itemsPrice?.toFixed(0)}</span></div>
              {order.discountAmount > 0 && <div className="row text-success"><span>Discount:</span><span>-₹{order.discountAmount?.toFixed(0)}</span></div>}
              <div className="row"><span>Delivery Charges:</span><span>₹{order.shippingPrice?.toFixed(0)}</span></div>
              <div className="divider" />
              <div className="row grand-total"><span>Total Amount:</span><span>₹{order.totalPrice?.toFixed(0)}</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="invoice-notice-card glass-panel no-print">
          <div className="notice-icon-box">
            <ShieldCheck size={28} color="var(--accent-primary)" />
          </div>
          <h4 className="notice-title">Invoice Available Upon Delivery</h4>
          <p className="notice-desc">
            Your official Tax Invoice and Purchase Receipt will be generated and unlocked for view/download once your order status is marked as <strong>Delivered</strong>.
          </p>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewingProduct && (
        <WriteReviewModal
          product={reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          onReviewSubmitted={() => fetchOrder()}
        />
      )}

      <style jsx>{`
        .invoice-page-wrapper {
          padding-top: 2rem;
        }
        .top-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
          font-size: 0.95rem;
        }
        .top-nav-bar .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .btn-cancel-order {
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }
        .invoice-pending-btn {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .tracking-stepper-card {
          padding: 1.5rem;
          border-radius: 20px;
        }
        .tracking-title {
          font-size: 1.05rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .status-pill {
          color: var(--accent-primary);
          text-transform: uppercase;
          background: var(--accent-light);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 900;
        }
        .stepper-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        .step-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 0.5rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        .step-card.completed {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.35);
        }
        .step-card.current {
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
        }
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 0.4rem;
        }
        .step-card.completed .step-circle {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }
        .step-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .step-card.completed .step-text {
          color: #22c55e;
        }
        .step-card.current .step-text {
          color: var(--accent-primary);
        }

        .invoice-notice-card {
          padding: 2rem 1.5rem;
          border-radius: 20px;
          text-align: center;
        }
        .notice-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem auto;
        }
        .notice-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
        }
        .notice-desc {
          color: var(--text-muted);
          font-size: 0.88rem;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.5;
        }

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

        .invoice-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          .top-nav-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .top-nav-bar .actions {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          .top-nav-bar .actions .btn, .top-nav-bar .actions span {
            flex: 1 !important;
            min-width: 120px !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.8rem !important;
            padding: 0.5rem 0.65rem !important;
            white-space: nowrap !important;
          }

          .tracking-stepper-card {
            padding: 1.25rem !important;
          }
          .stepper-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
          }
          .step-card {
            flex-direction: row !important;
            justify-content: flex-start !important;
            gap: 0.6rem !important;
            padding: 0.65rem 0.85rem !important;
          }
          .step-circle {
            margin-bottom: 0 !important;
            width: 28px !important;
            height: 28px !important;
            font-size: 0.75rem !important;
            flex-shrink: 0 !important;
          }
          .step-text {
            font-size: 0.82rem !important;
          }

          .invoice-card {
            padding: 1.25rem !important;
          }
          .invoice-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .invoice-meta {
            text-align: left !important;
          }
          .invoice-billing-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            padding: 1.25rem 0 !important;
          }
          .billing-box.text-right {
            text-align: left !important;
          }
          .totals-box {
            width: 100% !important;
          }
          .invoice-totals {
            width: 100% !important;
            justify-content: stretch !important;
          }
          .invoice-table th, .invoice-table td {
            padding: 0.65rem 0.5rem !important;
            font-size: 0.8rem !important;
          }
        }

        @media print {
          /* Hide all page navigation, headers, footers, and non-printable cards */
          header, footer, nav, .navbar-header, .footer-wrapper, .top-nav-bar, .no-print, .floating-actions, button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 1.5rem !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          .print-area table, .print-area th, .print-area td, .print-area p, .print-area span, .print-area h2, .print-area h4, .print-area strong, .print-area div {
            color: #000000 !important;
          }
          .print-area th {
            border-bottom: 2px solid #000000 !important;
          }
          .print-area td {
            border-bottom: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
}
