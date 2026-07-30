'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import ProductFilter from '@/components/products/ProductFilter';
import QuickViewModal from '@/components/products/QuickViewModal';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';

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
      console.error('Fetch products error:', e);
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
      {/* Top Banner Header */}
      <div className="page-header glass-panel">
        <div>
          <h1>
            {filters.gender 
              ? `${filters.gender}'s Custom DTF Collection` 
              : filters.category 
              ? `${filters.category}` 
              : 'All DTF Printed Collections'}
          </h1>
          <p>Explore high-density DTF printed oversized tees, desi typography, Japanese manga art, and 240 GSM bio-washed cotton drops.</p>
        </div>
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn btn-secondary mobile-filter-btn"
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div className="catalog-layout">
        {/* Filter Sidebar */}
        <aside className={`sidebar-box ${mobileFilterOpen ? 'open' : ''}`}>
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

        @media (max-width: 900px) {
          .catalog-layout { grid-template-columns: 1fr; }
          .sidebar-box { display: none; }
          .sidebar-box.open { display: block; }
          .mobile-filter-btn { display: flex; }
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
