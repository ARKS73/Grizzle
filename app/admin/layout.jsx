'use client';

import '@/app/admin/admin-mobile.css';
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
  Truck,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GrizzleLogo from '@/components/ui/GrizzleLogo';

const navLinks = [
  { name: 'Dashboard',    short: 'Dash',       href: '/admin',            icon: LayoutDashboard },
  { name: 'Products',     short: 'Products',   href: '/admin/products',   icon: ShoppingBag },
  { name: 'Inventory',    short: 'Stock',      href: '/admin/inventory',  icon: Boxes },
  { name: 'Orders',       short: 'Orders',     href: '/admin/orders',     icon: Receipt },
  { name: 'Categories',   short: 'Cats',       href: '/admin/categories', icon: FolderTree },
  { name: 'Coupons',      short: 'Coupons',    href: '/admin/coupons',    icon: Tag },
  { name: 'Shipping',     short: 'Ship',       href: '/admin/shipping',   icon: Truck },
  { name: 'Users',        short: 'Users',      href: '/admin/users',      icon: Users },
];

// Only show the most important 5 in the bottom tab bar
const bottomTabs = navLinks.slice(0, 5);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const isSoleAdmin = user && user.email?.toLowerCase() === 'grizzlein@gmail.com';

  if (!loading && !isSoleAdmin) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel p-5" style={{ borderRadius: '24px', maxWidth: '540px', margin: '0 auto' }}>
          <ShieldAlert size={52} className="text-danger mb-3 mx-auto" />
          <h2 className="text-danger mb-2">403 Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Only authorized store administrators can access the Admin Management Console.
          </p>
          <Link href="/" className="btn btn-primary">Return to Storefront</Link>
        </div>
      </div>
    );
  }

  const currentPage = navLinks.find((l) => l.href === pathname)?.name || 'Admin';

  return (
    <div className="admin-wrapper">

      {/* ════════════════════════════════
          DESKTOP SIDEBAR
          ════════════════════════════════ */}
      <aside className="admin-sidebar glass-panel">
        {/* Brand */}
        <div className="sidebar-brand">
          <GrizzleLogo size="medium" href="/admin" />
          <div className="brand-info">
            <h3>Grizzle Admin</h3>
            <span className="brand-subtitle">Management Console</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-bubble"><Icon size={18} /></div>
                <span className="nav-link-text">{link.name}</span>
                {isActive && <ChevronRight size={14} className="nav-active-arrow" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <Link href="/" className="exit-btn">
            <ArrowLeft size={15} /> Customer View
          </Link>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════ */}
      <main className="admin-main">

        {/* ── Top Header ── */}
        <header className="admin-header glass-panel">
          <div className="header-left">
            {/* Mobile: page title */}
            <span className="mobile-page-title">{currentPage}</span>
            {/* Desktop: back + user */}
            <Link href="/" className="btn btn-secondary btn-sm desktop-only">
              <ArrowLeft size={15} /> Back to Store
            </Link>
            <ShieldCheck size={18} className="shield-icon desktop-only" />
            <span className="admin-user-label desktop-only">
              {user?.name || 'Admin'}
            </span>
          </div>
          <div className="header-right">
            <button onClick={logout} className="btn btn-secondary btn-sm logout-btn" title="Logout">
              <LogOut size={15} />
              <span className="logout-label">Logout</span>
            </button>
            {/* Mobile: hamburger for full drawer */}
            <button className="drawer-trigger mobile-only" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </header>

        {/* ── Mobile Full Drawer (All 7 links) ── */}
        {drawerOpen && (
          <div className="mobile-backdrop" onClick={() => setDrawerOpen(false)} />
        )}
        <aside className={`mobile-drawer glass-panel ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <GrizzleLogo size="small" href="/admin" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Grizzle Admin</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Logged in as {user?.name || 'Admin'}</div>
            </div>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
          </div>

          <nav className="drawer-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className={`drawer-icon ${isActive ? 'active' : ''}`}><Icon size={20} /></div>
                  <span>{link.name}</span>
                  {isActive && <ChevronRight size={16} className="drawer-arrow" />}
                </Link>
              );
            })}
          </nav>

          <div className="drawer-footer">
            <Link href="/" className="drawer-store-btn" onClick={() => setDrawerOpen(false)}>
              <ArrowLeft size={15} /> Back to Customer Store
            </Link>
            <button onClick={() => { logout(); setDrawerOpen(false); }} className="drawer-logout-btn">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>

        {/* ── Page Content ── */}
        <div className="admin-content-body">{children}</div>

      </main>

      {/* ════════════════════════════════
          MOBILE BOTTOM TAB BAR
          ════════════════════════════════ */}
      <nav className="mobile-bottom-nav">
        {bottomTabs.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`bottom-tab ${isActive ? 'active' : ''}`}>
              <Icon size={22} className="tab-icon" />
              <span className="tab-label">{link.short}</span>
            </Link>
          );
        })}
        {/* "More" opens the full drawer */}
        <button className="bottom-tab" onClick={() => setDrawerOpen(true)}>
          <span className="more-dots">
            <span /><span /><span />
          </span>
          <span className="tab-label">More</span>
        </button>
      </nav>

      {/* ════════════════════════════════
          STYLES
          ════════════════════════════════ */}
      <style jsx>{`

        /* ── Layout grid ── */
        .admin-wrapper {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ══════════════════════
           DESKTOP SIDEBAR
           ══════════════════════ */
        .admin-sidebar {
          border-radius: 0;
          border-top: none; border-bottom: none; border-left: none;
          padding: 1.5rem 0 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          background: var(--bg-secondary);
          z-index: 50;
          overflow-y: auto;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding-bottom: 1.25rem;
          padding-right: 1rem;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .brand-info h3 { font-size: 0.95rem; font-weight: 700; line-height: 1.2; }
        .brand-subtitle { font-size: 0.7rem; color: var(--text-muted); }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 1.25rem;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 1rem 0.7rem 0.5rem;
          border-radius: 30px 0 0 30px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.22s ease;
          text-decoration: none;
          position: relative;
        }
        .admin-nav-item:hover:not(.active) {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          margin-right: 1rem;
        }
        .admin-nav-item.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 700;
          z-index: 10;
        }
        .admin-nav-item.active::before {
          content: '';
          position: absolute;
          top: -22px; right: 0;
          width: 22px; height: 22px;
          background: transparent;
          border-bottom-right-radius: 22px;
          box-shadow: 10px 10px 0 10px var(--bg-primary);
          pointer-events: none;
        }
        .admin-nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -22px; right: 0;
          width: 22px; height: 22px;
          background: transparent;
          border-top-right-radius: 22px;
          box-shadow: 10px -10px 0 10px var(--bg-primary);
          pointer-events: none;
        }
        .nav-icon-bubble {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: all 0.25s ease;
        }
        .admin-nav-item:hover:not(.active) .nav-icon-bubble {
          color: var(--text-primary);
          background: rgba(255,255,255,0.1);
        }
        .admin-nav-item.active .nav-icon-bubble {
          background: var(--accent-gradient);
          color: white;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .nav-link-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-active-arrow { color: var(--accent-primary); margin-right: 0.5rem; }

        .sidebar-footer {
          padding: 1rem 1rem 0 0;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .exit-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          font-size: 0.82rem; font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          background: var(--bg-tertiary);
        }
        .exit-btn:hover { color: var(--accent-primary); border-color: var(--accent-primary); }

        /* ══════════════════════
           MAIN CONTENT
           ══════════════════════ */
        .admin-main {
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          min-width: 0;
        }
        .admin-header {
          height: 58px;
          border-radius: 0;
          border-top: none; border-left: none; border-right: none;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 0.75rem;
        }
        .header-left {
          display: flex; align-items: center; gap: 0.65rem;
          min-width: 0; flex: 1;
        }
        .header-right {
          display: flex; align-items: center; gap: 0.5rem;
          flex-shrink: 0;
        }
        .mobile-page-title {
          display: none;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .shield-icon { color: var(--accent-primary); flex-shrink: 0; }
        .admin-user-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
        .logout-label { white-space: nowrap; }

        /* Hamburger trigger */
        .drawer-trigger {
          display: none;
          flex-direction: column; gap: 5px;
          background: none; border: none;
          cursor: pointer; padding: 6px;
          border-radius: var(--radius-sm);
        }
        .hamburger-line {
          display: block;
          width: 22px; height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .admin-content-body {
          padding: 2rem;
          flex: 1;
        }

        /* ══════════════════════
           MOBILE FULL DRAWER
           ══════════════════════ */
        .mobile-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index: 140;
        }
        .mobile-drawer {
          display: none;
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(320px, 85vw);
          z-index: 150;
          flex-direction: column;
          background: var(--bg-secondary) !important;
          transform: translateX(110%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0;
          border-right: none; border-top: none; border-bottom: none;
          overflow-y: auto;
        }
        .mobile-drawer.open { transform: translateX(0); }

        .drawer-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .drawer-close {
          margin-left: auto;
          background: none; border: none;
          color: var(--text-secondary);
          cursor: pointer; padding: 4px;
          border-radius: var(--radius-sm);
        }
        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.75rem 0.75rem;
          flex: 1;
        }
        .drawer-nav-item {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.18s ease;
        }
        .drawer-nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .drawer-nav-item.active {
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 700;
        }
        .drawer-icon {
          width: 40px; height: 40px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: all 0.18s ease;
        }
        .drawer-icon.active {
          background: var(--accent-gradient);
          color: white;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
        .drawer-arrow { margin-left: auto; color: var(--accent-primary); }

        .drawer-footer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .drawer-store-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          font-size: 0.9rem; font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          background: var(--bg-tertiary);
          transition: all 0.2s ease;
        }
        .drawer-store-btn:hover { color: var(--accent-primary); border-color: var(--accent-primary); }
        .drawer-logout-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: none;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer;
          background: var(--danger-light);
          color: var(--danger);
          transition: all 0.2s ease;
        }
        .drawer-logout-btn:hover { opacity: 0.85; }

        /* ══════════════════════
           MOBILE BOTTOM TAB BAR
           ══════════════════════ */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 120;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          backdrop-filter: blur(20px);
          padding: 0 0.25rem env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
        }
        .bottom-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 0.6rem 0.25rem 0.55rem;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0;
          transition: color 0.18s ease;
          position: relative;
        }
        .bottom-tab.active { color: var(--accent-primary); }
        .bottom-tab.active::before {
          content: '';
          position: absolute;
          top: 0; left: 25%; right: 25%;
          height: 2.5px;
          background: var(--accent-primary);
          border-radius: 0 0 3px 3px;
        }
        .tab-icon { transition: transform 0.18s ease; }
        .bottom-tab.active .tab-icon { transform: translateY(-1px); }
        .tab-label {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1;
          white-space: nowrap;
        }

        /* More button dots */
        .more-dots {
          display: flex; gap: 3px; align-items: center; height: 22px;
        }
        .more-dots span {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: currentColor;
          display: block;
        }

        /* Helpers */
        .desktop-only { display: flex; align-items: center; gap: 0.4rem; }
        .mobile-only  { display: none; }

        /* ══════════════════════
           RESPONSIVE
           ══════════════════════ */
        @media (max-width: 900px) {
          /* Switch to single-column layout */
          .admin-wrapper { grid-template-columns: 1fr; }

          /* Hide desktop sidebar */
          .admin-sidebar { display: none; }

          /* Show mobile elements */
          .desktop-only   { display: none !important; }
          .mobile-only    { display: flex !important; }
          .mobile-page-title { display: block; }
          .drawer-trigger { display: flex; }
          .mobile-drawer  { display: flex; }

          /* Bottom tab bar */
          .mobile-bottom-nav {
            display: flex;
            align-items: stretch;
          }

          /* Content padding respects bottom bar (~68px) */
          .admin-content-body {
            padding: 1rem 0.85rem 5.5rem;
          }

          /* Header */
          .admin-header { padding: 0 1rem; height: 54px; }
          .logout-label { display: none; }
        }

        @media (max-width: 480px) {
          .admin-content-body { padding: 0.75rem 0.65rem 5.5rem; }
        }
      `}</style>
    </div>
  );
}
