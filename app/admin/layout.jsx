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
                <Icon size={18} />
                <span>{link.name}</span>
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
            <ShieldCheck size={20} className="text-primary" />
            <span>Logged in as <strong>{user?.name || 'Admin'}</strong> ({user?.email})</span>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div className="admin-content-body">{children}</div>
      </main>

      <style jsx>{`
        .admin-wrapper {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
        }

        .admin-sidebar {
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          background: var(--bg-secondary);
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .brand-badge {
          width: 38px;
          height: 38px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-subtitle { font-size: 0.75rem; color: var(--text-muted); }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .admin-nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .admin-nav-item.active {
          background: var(--accent-gradient);
          color: white;
          box-shadow: var(--shadow-md);
        }

        .sidebar-footer {
          padding-top: 1rem;
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
