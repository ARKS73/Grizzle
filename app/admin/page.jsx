'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, PackageCheck, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();

        if (data.success) {
          setMetrics(data.metrics);
          setLowStockProducts(data.lowStockProducts || []);
          setRecentOrders(data.recentOrders || []);
          setMonthlySales(data.monthlySales || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />;
  }

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 5000);

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-header mb-4">
        <h1>Sales Analytics & Executive Dashboard</h1>
        <p>Monitor revenue metrics, order statuses, and low inventory notifications.</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-revenue"><DollarSign size={24} /></div>
          <div>
            <span className="kpi-label">Total Revenue</span>
            <h2 className="kpi-value">₹{metrics?.totalRevenue?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
            <span className="kpi-trend text-success"><TrendingUp size={14} /> +18.4% this month</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-orders"><ShoppingBag size={24} /></div>
          <div>
            <span className="kpi-label">Total Orders</span>
            <h2 className="kpi-value">{metrics?.totalOrders || 0}</h2>
            <span className="kpi-trend text-success"><TrendingUp size={14} /> +12.1% orders</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-users"><Users size={24} /></div>
          <div>
            <span className="kpi-label">Registered Customers</span>
            <h2 className="kpi-value">{metrics?.totalUsers || 0}</h2>
            <span className="kpi-trend text-info">Active Customer Accounts</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-warning"><AlertTriangle size={24} /></div>
          <div>
            <span className="kpi-label">Low Stock Alerts</span>
            <h2 className="kpi-value">{metrics?.lowStockCount || 0}</h2>
            <span className="kpi-trend text-danger">Stock &lt; 10 units</span>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Chart */}
      <div className="chart-card glass-panel mt-4">
        <div className="chart-header">
          <div>
            <h3>Monthly Revenue Overview</h3>
            <p className="subtext">Completed sales revenue trajectory for current fiscal year</p>
          </div>
        </div>

        <div className="bar-chart-container">
          {monthlySales.map((item) => {
            const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={item.month} className="bar-col">
                <div className="bar-val">₹{item.revenue}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${heightPercent}%` }} />
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="dashboard-tables-grid mt-4">
        {/* Recent Orders */}
        <div className="table-card glass-panel">
          <div className="table-card-header">
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" className="view-link">View All &rarr;</Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td><strong>#{order.invoiceNumber}</strong></td>
                  <td>{order.user?.name || 'Customer'}</td>
                  <td><span className="badge badge-warning">{order.status}</span></td>
                  <td>₹{order.totalPrice?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="table-card glass-panel">
          <div className="table-card-header">
            <h3>Low Stock Warning Items</h3>
            <Link href="/admin/inventory" className="view-link">Manage Inventory &rarr;</Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td><span className="badge badge-danger">{p.stock} units left</span></td>
                  <td><Link href="/admin/inventory" className="btn btn-secondary btn-xs">Update</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .kpi-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border-radius: var(--radius-lg);
        }
        .kpi-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-revenue { background: var(--accent-light); color: var(--accent-primary); }
        .icon-orders { background: var(--success-light); color: var(--success); }
        .icon-users { background: var(--info-light); color: var(--info); }
        .icon-warning { background: var(--danger-light); color: var(--danger); }

        .kpi-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
        .kpi-value { font-size: 1.8rem; font-weight: 800; line-height: 1.1; margin: 0.2rem 0; }
        .kpi-trend { font-size: 0.75rem; display: flex; align-items: center; gap: 3px; font-weight: 600; }

        .chart-card {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .subtext { font-size: 0.85rem; color: var(--text-muted); }
        .bar-chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 220px;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .bar-val { font-size: 0.75rem; font-weight: 700; color: var(--accent-primary); margin-bottom: 6px; }
        .bar-track {
          width: 100%;
          max-width: 48px;
          flex: 1;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .bar-fill {
          width: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition: height 0.5s ease;
        }
        .bar-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-top: 8px; }

        .dashboard-tables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .table-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }
        .table-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .view-link { font-size: 0.85rem; color: var(--accent-primary); font-weight: 600; }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th, .admin-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          text-align: left;
          font-size: 0.85rem;
        }
        .admin-table th { color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; }

        @media (max-width: 900px) {
          .dashboard-tables-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
