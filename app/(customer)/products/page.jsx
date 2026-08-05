'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import ProductFilter from '@/components/products/ProductFilter';
import QuickViewModal from '@/components/products/QuickViewModal';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, X, RotateCcw, CheckCircle2 } from 'lucide-react';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: 0,
    maxPrice: 1999,
    size: searchParams.get('size') || '',
    color: '',
    rating: 0,
    sort: 'newest',
    page: 1,
  });

  // Sync state when searchParams change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      size: searchParams.get('size') || '',
    }));
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const activeCount = [
    filters.category,
    filters.gender,
    filters.size,
    filters.color,
    filters.search,
    filters.rating > 0 ? filters.rating : null,
  ].filter(Boolean).length;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: filters.search,
        category: filters.category,
        gender: filters.gender,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        size: filters.size,
        color: filters.color,
        rating: filters.rating.toString(),
        sort: filters.sort,
        page: filters.page.toString(),
        limit: '9',
      });

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      gender: '',
      minPrice: 0,
      maxPrice: 1999,
      size: '',
      color: '',
      rating: 0,
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="container products-page-wrapper">
      {/* Top Banner / Breadcrumb */}
      <div className="page-header glass-panel">
        <div>
          <h1>STREETWEAR CATALOG &amp; DROPS</h1>
          <p>Discover high-density DTF printed 240 GSM bio-washed heavy cotton oversized tees.</p>
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="btn btn-secondary mobile-filter-btn"
        >
          <SlidersHorizontal size={16} /> Filters &amp; Refinements
        </button>
      </div>

      <div className="catalog-layout">
        {/* Desktop Filter Sidebar */}
        <aside className="sidebar-box desktop-sidebar">
          <ProductFilter
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Main Products Grid & Toolbar */}
        <main className="catalog-main">
          {/* Controls Bar */}
          <div className="controls-bar glass-panel">
            <div className="results-count">
              Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
            </div>

            <div className="sort-box">
              <ArrowUpDown size={16} className="sort-icon" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                className="form-select sort-select"
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(filters.category || filters.gender || filters.size || filters.color || filters.search || filters.rating > 0) && (
            <div className="active-filters-row">
              {filters.search && <span className="badge badge-info">Search: {filters.search}</span>}
              {filters.gender && <span className="badge badge-primary">Gender: {filters.gender}</span>}
              {filters.category && <span className="badge badge-primary">Category: {filters.category}</span>}
              {filters.size && <span className="badge badge-warning">Size: {filters.size}</span>}
              {filters.color && <span className="badge badge-success">Color: {filters.color}</span>}
              {filters.rating > 0 && <span className="badge badge-info">Min Rating: {filters.rating}★</span>}
              <button onClick={handleResetFilters} className="clear-all-btn">Clear All</button>
            </div>
          )}

          {/* Products Grid / Skeletons */}
          {loading ? (
            <div className="grid-products">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card skeleton" style={{ height: '360px' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog glass-panel">
              <h3>No matching clothes found</h3>
              <p>Try resetting filters or adjusting search parameters.</p>
              <button onClick={handleResetFilters} className="btn btn-primary mt-3">
                <RefreshCw size={16} /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid-products">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="page-indicator">Page {filters.page} of {totalPages}</span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-Over Drawer Sheet */}
      {mobileFilterOpen && (
        <div className="mobile-filter-drawer-root">
          <div
            className="mobile-filter-backdrop"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="mobile-filter-sheet">
            <div className="sheet-header">
              <div className="sheet-title-box">
                <SlidersHorizontal size={18} className="sheet-title-icon" />
                <h3 className="sheet-title">Filters &amp; Refinements</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="sheet-close-btn"
                aria-label="Close filters"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sheet-body">
              <ProductFilter
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                hideHeader={true}
              />
            </div>

            <div className="sheet-footer">
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary sheet-reset-btn"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary sheet-apply-btn"
              >
                Show {products.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Slide-Over Sheet */}
      {mobileSortOpen && (
        <div className="mobile-filter-drawer-root">
          <div className="mobile-filter-backdrop" onClick={() => setMobileSortOpen(false)} />
          <div className="mobile-filter-sheet" style={{ height: 'auto', maxHeight: '55vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
            <div className="sheet-header">
              <div className="sheet-title-box">
                <ArrowUpDown size={18} className="sheet-title-icon" />
                <h3 className="sheet-title">Sort Products By</h3>
              </div>
              <button onClick={() => setMobileSortOpen(false)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="sheet-body" style={{ padding: '1rem' }}>
              {[
                { label: 'Newest Arrivals', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-low' },
                { label: 'Price: High to Low', value: 'price-high' },
                { label: 'Highest Rated', value: 'rating' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, sort: opt.value }));
                    setMobileSortOpen(false);
                  }}
                  className={`sort-option-btn ${filters.sort === opt.value ? 'selected' : ''}`}
                >
                  <span>{opt.label}</span>
                  {filters.sort === opt.value && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Floating Filter & Sort Bar */}
      <div className="mobile-bottom-bar-fixed">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="mobile-bar-btn"
        >
          <SlidersHorizontal size={16} />
          <span>FILTER BY SIZE, COLOR &amp; MORE</span>
          {activeCount > 0 && <span className="active-count-badge">{activeCount}</span>}
        </button>

        <div className="mobile-bar-divider" />

        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="mobile-bar-btn"
        >
          <ArrowUpDown size={16} />
          <span>SORT</span>
        </button>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <style jsx>{`
        .products-page-wrapper {
          padding-top: 2rem;
        }
        .page-header {
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .page-header h1 { font-size: 2.2rem; }
        .page-header p { color: var(--text-secondary); margin-top: 0.25rem; }
        .mobile-filter-btn { display: none; }

        .catalog-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        .controls-bar {
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .results-count { font-size: 0.9rem; color: var(--text-secondary); }
        .sort-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sort-icon { color: var(--text-muted); }
        .sort-select {
          padding: 0.4rem 0.85rem;
          font-size: 0.85rem;
        }

        .active-filters-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .clear-all-btn {
          background: none;
          border: none;
          color: var(--danger);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-catalog {
          text-align: center;
          padding: 4rem 2rem;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 3rem;
        }
        .page-indicator { font-size: 0.9rem; font-weight: 600; }

        @media (max-width: 768px) {
          .products-page-wrapper {
            padding-top: 1rem;
          }
          .page-header {
            padding: 1rem 1.25rem;
            margin-bottom: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .page-header h1 {
            font-size: 1.3rem;
            line-height: 1.2;
          }
          .page-header p {
            font-size: 0.78rem;
          }
          .mobile-filter-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0.4rem 0.75rem;
            font-size: 0.78rem;
            align-self: flex-start;
          }
          .catalog-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .desktop-sidebar {
            display: none;
          }
          .controls-bar {
            padding: 0.6rem 0.85rem;
            margin-bottom: 0.85rem;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .results-count {
            font-size: 0.78rem;
          }
          .sort-box {
            gap: 0.35rem;
          }
          .sort-select {
            padding: 0.3rem 0.5rem;
            font-size: 0.75rem;
          }
          .active-filters-row {
            gap: 0.35rem;
            margin-bottom: 0.75rem;
          }
          .clear-all-btn {
            font-size: 0.75rem;
          }
          .pagination {
            margin-top: 1.5rem;
            gap: 0.5rem;
          }
          .page-indicator {
            font-size: 0.8rem;
          }
        }

        /* Mobile Filter Sheet */
        .mobile-filter-drawer-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .mobile-filter-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          z-index: 1;
          animation: fadeIn 0.2s ease-out;
        }
        .mobile-filter-sheet {
          position: relative;
          z-index: 2;
          width: 100vw;
          max-height: 85vh;
          background: var(--bg-secondary);
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          border-top: 1px solid var(--border-color);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .sheet-title-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sheet-title-icon {
          color: var(--accent-primary);
        }
        .sheet-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .sheet-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sheet-close-btn:active {
          transform: scale(0.9);
          background: var(--accent-light);
          color: var(--accent-primary);
        }
        .sheet-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          -webkit-overflow-scrolling: touch;
        }
        .sheet-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .sheet-reset-btn {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.65rem 1rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: var(--radius-md);
        }
        .sheet-apply-btn {
          flex: 1;
          font-size: 0.88rem !important;
          font-weight: 800 !important;
          padding: 0.65rem 1rem !important;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-bottom-bar-fixed {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-bottom-bar-fixed {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 54px;
            background: #0d1e30;
            border-top: 1px solid #1e3a5f;
            z-index: 995;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
          }
          .mobile-bar-btn {
            flex: 1;
            height: 100%;
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            padding: 0 0.5rem;
          }
          .mobile-bar-btn:active {
            background: rgba(255, 255, 255, 0.08);
          }
          .mobile-bar-divider {
            width: 1px;
            height: 26px;
            background: rgba(255, 255, 255, 0.3);
          }
          .active-count-badge {
            background: #ffffff;
            color: #0d1e30;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.72rem;
            font-weight: 900;
          }
          .sort-option-btn {
            width: 100%;
            padding: 0.85rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            cursor: pointer;
          }
          .sort-option-btn.selected {
            border-color: var(--accent-primary);
            background: rgba(99, 102, 241, 0.12);
            font-weight: 800;
          }
          .products-page-wrapper {
            padding-bottom: 70px;
          }
          .mobile-filter-btn {
            display: none !important;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mt-5"><div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} /></div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
