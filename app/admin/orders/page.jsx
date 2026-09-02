'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Truck, CheckCircle2, Clock, XCircle, Printer, X, ExternalLink, MapPin, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const fetchOrders = async () => {
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
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedInvoiceOrder && selectedInvoiceOrder._id === orderId) {
          setSelectedInvoiceOrder({ ...selectedInvoiceOrder, status: newStatus });
        }
      }
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="admin-orders-wrapper">
      <div className="page-header mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="m-0">Order Fulfillment &amp; Invoice Management</h1>
          <p className="subtext mt-1">Review orders, inspect customer invoices, and update fulfillment statuses.</p>
        </div>
      </div>

      <div className="table-card glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Due</th>
              <th>Order Status</th>
              <th>Invoice View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-4">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-4">No customer orders yet.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td data-label="Invoice">
                    <strong className="text-primary">#{order.invoiceNumber || order._id.slice(-6)}</strong>
                  </td>
                  <td data-label="Customer">
                    <div>
                      <strong>{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</strong>
                      <span className="subtext d-block">{order.user?.email || order.shippingAddress?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td data-label="Items">{order.orderItems?.length || 0} item(s)</td>
                  <td data-label="Total"><strong className="text-success">₹{order.totalPrice?.toFixed(0)}</strong></td>
                  <td data-label="Status">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="form-select status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td data-label="Invoice">
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="btn btn-primary btn-xs font-bold d-flex align-items-center gap-1"
                        title="View Full Order Invoice"
                      >
                        <Receipt size={14} /> View Invoice
                      </button>
                      <Link
                        href={`/orders/${order._id}`}
                        target="_blank"
                        className="btn btn-secondary btn-xs"
                        title="Open Customer Order Page in New Tab"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧾 Interactive Order Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="modal-overlay" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="modal-content invoice-modal-content glass-panel p-4 rounded-xl" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '90%' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <div>
                <h3 className="m-0 font-bold text-primary d-flex align-items-center gap-2">
                  <Receipt size={20} /> TAX INVOICE &amp; PACKING SLIP
                </h3>
                <span className="subtext">
                  Invoice #{selectedInvoiceOrder.invoiceNumber || selectedInvoiceOrder._id.slice(-6)} &bull; Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm font-bold d-flex align-items-center gap-1"
                >
                  <Printer size={16} /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="btn btn-outline btn-sm p-1 rounded-circle"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Details Section */}
            <div className="row g-3 mb-3" style={{ fontSize: '0.85rem' }}>
              <div className="col-md-6">
                <div className="p-3 rounded bg-tertiary border h-100">
                  <h6 className="font-bold text-primary mb-2 d-flex align-items-center gap-1">
                    <User size={15} /> Customer &amp; Shipping Details
                  </h6>
                  <p className="m-0 font-bold">{selectedInvoiceOrder.shippingAddress?.fullName || selectedInvoiceOrder.user?.name || 'N/A'}</p>
                  <p className="m-0 text-muted subtext"><Mail size={12} /> {selectedInvoiceOrder.user?.email || selectedInvoiceOrder.shippingAddress?.email || 'N/A'}</p>
                  <p className="m-0 text-muted subtext"><Phone size={12} /> {selectedInvoiceOrder.shippingAddress?.phone || 'N/A'}</p>
                  <p className="mt-2 mb-0 subtext">
                    <MapPin size={12} /> {selectedInvoiceOrder.shippingAddress?.address}, {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} - <strong>{selectedInvoiceOrder.shippingAddress?.postalCode}</strong>
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded bg-tertiary border h-100">
                  <h6 className="font-bold text-primary mb-2 d-flex align-items-center gap-1">
                    <Truck size={15} /> Order Summary &amp; Status
                  </h6>
                  <p className="m-0 subtext">Payment Method: <strong>{selectedInvoiceOrder.paymentMethod || 'Cash On Delivery'}</strong></p>
                  <p className="m-0 subtext">Payment Status: <strong className={selectedInvoiceOrder.isPaid ? 'text-success' : 'text-warning'}>{selectedInvoiceOrder.isPaid ? 'Paid' : 'Pending (COD)'}</strong></p>
                  <p className="mt-2 mb-0 d-flex align-items-center gap-2">
                    <span className="subtext">Fulfillment Status:</span>
                    <select
                      value={selectedInvoiceOrder.status}
                      onChange={(e) => handleStatusChange(selectedInvoiceOrder._id, e.target.value)}
                      className="form-select status-select"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </p>
                </div>
              </div>
            </div>

            {/* Purchased Items Table */}
            <div className="table-responsive mb-3">
              <table className="table table-bordered align-middle" style={{ fontSize: '0.82rem' }}>
                <thead className="table-dark">
                  <tr>
                    <th>Item Description</th>
                    <th className="text-center">Color Option</th>
                    <th className="text-center">Size</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoiceOrder.orderItems || []).map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={item.image || '/logo2.png'}
                            alt={item.name}
                            style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <strong className="d-block">{item.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary text-dark border font-bold" style={{ fontSize: '0.75rem' }}>
                          {item.color || 'Standard'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary text-white font-bold" style={{ fontSize: '0.75rem' }}>
                          {item.size || 'M'}
                        </span>
                      </td>
                      <td className="text-center font-bold">{item.quantity}</td>
                      <td className="text-end">₹{item.price?.toFixed(0)}</td>
                      <td className="text-end font-bold">₹{(item.price * item.quantity)?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Total */}
            <div className="d-flex justify-content-end border-top pt-3">
              <div className="text-end" style={{ minWidth: '220px' }}>
                <div className="d-flex justify-content-between subtext mb-1">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoiceOrder.itemsPrice ? selectedInvoiceOrder.itemsPrice.toFixed(0) : selectedInvoiceOrder.totalPrice?.toFixed(0)}</span>
                </div>
                <div className="d-flex justify-content-between subtext mb-1">
                  <span>Shipping Fee:</span>
                  <span>{selectedInvoiceOrder.shippingPrice > 0 ? `₹${selectedInvoiceOrder.shippingPrice.toFixed(0)}` : 'FREE'}</span>
                </div>
                <div className="d-flex justify-content-between font-bold text-lg text-primary border-top pt-2 mt-1">
                  <span>Total Amount:</span>
                  <span>₹{selectedInvoiceOrder.totalPrice?.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .subtext { font-size: 0.75rem; color: var(--text-muted); }
        .status-select { padding: 0.3rem 0.65rem; font-size: 0.8rem; font-weight: 700; border-radius: var(--radius-md); }
      `}</style>
    </div>
  );
}
