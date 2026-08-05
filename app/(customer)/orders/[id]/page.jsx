'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, CheckCircle2, Clock, Truck, Package, XCircle, ArrowLeft, ShieldCheck, Download } from 'lucide-react';
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
      <div className="top-nav-bar no-print mb-4">
        <Link href="/orders" className="back-link">
          <ArrowLeft size={16} /> Back to Order History
        </Link>

        <div className="actions">
          {order.status === 'Delivered' ? (
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Download size={16} /> Download Invoice (PDF)
            </button>
          ) : (
            <span
              className="btn btn-secondary btn-sm"
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
              title="Tax invoice will be downloadable once package is Delivered"
            >
              <Download size={16} /> Invoice (Delivered Only)
            </span>
          )}
        </div>
      </div>

      {/* Real-Time Tracking Timeline */}
      <div className="glass-panel p-4 mb-4" style={{ borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={20} color="var(--accent-primary)" /> Order Tracking Progress: <span style={{ color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{order.status}</span>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center', position: 'relative' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div key={step} style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', background: isCompleted ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.03)', border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-color)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCompleted ? '#22c55e' : 'var(--border-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto', fontWeight: 800, fontSize: '0.85rem' }}>
                  {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <div style={{ fontWeight: isCompleted ? 800 : 500, fontSize: '0.85rem', color: isCompleted ? '#22c55e' : 'var(--text-muted)' }}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Tax Invoice Card */}
      <div className="invoice-card glass-panel print-area">
        <div className="invoice-header">
          <div>
            <img src="/placeholder.png" alt="GRIZZLE" style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block', marginBottom: '0.5rem' }} />
            <p className="invoice-sub">Tax Invoice / Purchase Receipt</p>
          </div>

          <div className="invoice-meta">
            <h2>{order.invoiceNumber}</h2>
            <p>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p>Status: <strong className="status-highlight">DELIVERED</strong></p>
          </div>
        </div>

        <div className="invoice-billing-grid">
          <div className="billing-box">
            <h4>Billed & Shipped To:</h4>
            <p><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state || 'Tamil Nadu'} - {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country || 'India 🇮🇳'}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="billing-box text-right">
            <h4>Payment Details:</h4>
            <p>Method: {order.paymentMethod || 'Cash on Delivery (COD)'}</p>
            <p>Payment Status: <span className="text-success font-bold">PAID</span></p>
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
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.name}</strong></td>
                  <td>Size {item.size} • {item.color}</td>
                  <td>₹{item.price?.toFixed(0)}</td>
                  <td>{item.quantity}</td>
                  <td className="text-right">₹{(item.price * item.quantity).toFixed(0)}</td>
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
            <div className="row grand-total"><span>Total Amount Paid:</span><span>₹{order.totalPrice?.toFixed(0)}</span></div>
          </div>
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

        .invoice-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
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
