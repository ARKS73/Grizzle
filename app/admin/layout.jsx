'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Boxes, 
  Receipt, 
  Users, 
  FolderTree, 
  Tag, 
  ArrowLeft, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Product Management', href: '/admin/products', icon: ShoppingBag },
    { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
    { name: 'Order Management', href: '/admin/orders', icon: Receipt },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { name: 'User Management', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="admin-wrapper">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-brand">
          <span className="brand-badge">A</span>
          <div>
            <h3>Grizzle Admin</h3>
            <span className="brand-subtitle">Management Console</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="nav-icon-bubble">
                  <Icon size={18} />
                </div>
                <span className="nav-link-text">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="btn btn-outline btn-sm exit-btn">
            <ArrowLeft size={16} /> Customer View
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="admin-main">
        <header className="admin-header glass-panel">
          <div className="admin-header-title">
            <Link href="/" className="btn btn-secondary btn-sm mr-2" title="Back to Customer Storefront">
              <ArrowLeft size={16} /> Back to Store
            </Link>
            <ShieldCheck size={20} className="text-primary ml-2" />
            <span>Logged in as <strong>{user?.name || 'Admin'}</strong> ({user?.email})</span>
          </div>
          <div className="admin-header-actions">
            <button onClick={logout} className="btn btn-secondary btn-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="admin-content-body">{children}</div>
      </main>

      <style jsx>{`
        .admin-wrapper {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .admin-sidebar {
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          padding: 1.5rem 0 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          background: var(--bg-secondary);
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
          z-index: 50;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1.5rem;
          padding-right: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .brand-badge {
          width: 38px;
          height: 38px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        .brand-subtitle { font-size: 0.75rem; color: var(--text-muted); }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex: 1;
          position: relative;
        }
        .admin-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 30px 0 0 30px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .admin-nav-item:hover:not(.active) {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          margin-right: 1rem;
        }

        /* Organic curved bubble notch for active nav tab (matches design reference) */
        .admin-nav-item.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 700;
          z-index: 10;
        }

        .admin-nav-item.active::before {
          content: '';
          position: absolute;
          top: -24px;
          right: 0;
          width: 24px;
          height: 24px;
          background: transparent;
          border-bottom-right-radius: 24px;
          box-shadow: 10px 10px 0 10px var(--bg-primary);
          pointer-events: none;
        }

        .admin-nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -24px;
          right: 0;
          width: 24px;
          height: 24px;
          background: transparent;
          border-top-right-radius: 24px;
          box-shadow: 10px -10px 0 10px var(--bg-primary);
          pointer-events: none;
        }

        .nav-icon-bubble {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        .admin-nav-item:hover:not(.active) .nav-icon-bubble {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-nav-item.active .nav-icon-bubble {
          background: var(--accent-gradient);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .nav-link-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-footer {
          padding: 1rem 1rem 0 0;
          border-top: 1px solid var(--border-color);
        }
        .exit-btn { width: 100%; justify-content: center; }

        .admin-main {
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .admin-header {
          height: 64px;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .admin-header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .admin-content-body {
          padding: 2rem;
        }

        @media (max-width: 900px) {
          .admin-wrapper { grid-template-columns: 1fr; }
          .admin-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
