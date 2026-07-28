'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="admin-orders-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Order Fulfillment & Status Workflow</h1>
          <p>Update fulfillment statuses (Pending &rarr; Processing &rarr; Shipped &rarr; Delivered).</p>
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
                  <td><strong>#{order.invoiceNumber || order._id.slice(-6)}</strong></td>
                  <td>
                    <strong>{order.user?.name || order.shippingAddress?.fullName}</strong>
                    <span className="subtext d-block">{order.user?.email}</span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.orderItems?.length} item(s)</td>
                  <td><strong>₹{order.totalPrice?.toFixed(0)}</strong></td>
                  <td>
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
                  <td>
                    <Link href={`/orders/${order._id}`} className="btn btn-secondary btn-xs">
                      View Invoice
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
