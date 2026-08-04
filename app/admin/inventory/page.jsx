'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, RefreshCw, Plus, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminInventoryPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Helper to extract or fallback size-based stock
  const getProductSizeMap = (product) => {
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
    const existing = product.sizeStock || {};
    const result = {};
    sizes.forEach((sz) => {
      if (existing[sz] !== undefined && existing[sz] !== null) {
        result[sz] = Number(existing[sz]);
      } else {
        const perSize = Math.floor((product.stock || 0) / sizes.length);
        result[sz] = Math.max(0, perSize);
      }
    });
    return result;
  };

  // Adjust stock per size
  const handleSizeStockAdjust = async (product, sizeName, delta) => {
    const currentMap = getProductSizeMap(product);
    const currentQty = currentMap[sizeName] || 0;
    const newQty = Math.max(0, currentQty + delta);
    const updatedSizeStock = { ...currentMap, [sizeName]: newQty };
    const totalStock = Object.values(updatedSizeStock).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);

    const updateKey = `${product._id}-${sizeName}`;
    setUpdatingKey(updateKey);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id ? { ...p, sizeStock: updatedSizeStock, stock: totalStock } : p
      )
    );

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizeStock: updatedSizeStock, stock: totalStock }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${product.name} [Size ${sizeName}] stock set to ${newQty}`, 'success');
      } else {
        addToast(data.message || 'Failed to update stock', 'error');
        fetchInventory(); // Revert on failure
      }
    } catch (e) {
      addToast('Failed to update size stock', 'error');
      fetchInventory();
    } finally {
      setUpdatingKey(null);
    }
  };

  const lowStockCount = products.filter((p) => (p.stock || 0) <= 10).length;

  return (
    <div className="admin-inventory-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Size-Wise Inventory & Stock Control</h1>
          <p>Manage and adjust warehouse stock based on available sizes (S, M, L, XL, XXL).</p>
        </div>
        <div className="summary-pills">
          <span className="badge badge-info">{products.length} Products</span>
          <span className="badge badge-danger">{lowStockCount} Low Stock (&le; 10)</span>
        </div>
      </div>

      <div className="table-card glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock by Available Size</th>
              <th>Total Units</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Loading inventory...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4">No products found.</td></tr>
            ) : (
              products.map((product) => {
                const sizeMap = getProductSizeMap(product);
                const totalCalculatedStock = Object.values(sizeMap).reduce((a, b) => a + b, 0);

                return (
                  <tr key={product._id}>
                    <td data-label="Product">
                      <div className="product-cell">
                        <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="table-img" />
                        <div>
                          <strong className="d-block">{product.name}</strong>
                          <span className="subtext">Gender: {product.gender || 'Unisex'}</span>
                        </div>
                      </div>
                    </td>

                    <td data-label="Category">
                      <span className="badge badge-secondary">{product.category}</span>
                    </td>

                    <td data-label="Price">
                      <strong>₹{product.price?.toFixed(0)}</strong>
                    </td>

                    <td data-label="Stock by Size">
                      <div className="sizes-stock-matrix">
                        {Object.entries(sizeMap).map(([sz, qty]) => {
                          const isLow = qty <= 2;
                          const isOut = qty === 0;
                          const isUpdating = updatingKey === `${product._id}-${sz}`;

                          return (
                            <div
                              key={sz}
                              className={`size-stock-card ${isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'}`}
                            >
                              <span className="size-label">{sz}</span>
                              <div className="size-controls">
                                <button
                                  type="button"
                                  disabled={isUpdating || qty <= 0}
                                  onClick={() => handleSizeStockAdjust(product, sz, -1)}
                                  className="btn-stock-step"
                                  title={`Decrease size ${sz} stock`}
                                >
                                  <Minus size={12} />
                                </button>

                                <span className="size-qty-num">{qty}</span>

                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleSizeStockAdjust(product, sz, 1)}
                                  className="btn-stock-step"
                                  title={`Increase size ${sz} stock`}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td data-label="Total Units">
                      <span className={`badge ${totalCalculatedStock <= 10 ? 'badge-danger' : 'badge-success'} font-bold`}>
                        {totalCalculatedStock} Units Total
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .summary-pills { display: flex; gap: 0.5rem; }
        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .product-cell { display: flex; align-items: center; gap: 0.75rem; }
        .table-img { width: 44px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); }
        .subtext { font-size: 0.75rem; color: var(--text-muted); }

        /* Sizes & Stock Matrix */
        .sizes-stock-matrix {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .size-stock-card {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.45rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          transition: all 0.2s ease;
        }

        .size-stock-card.in-stock {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.06);
        }
        .size-stock-card.low-stock {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.08);
        }
        .size-stock-card.out-of-stock {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
        }

        .size-label {
          font-weight: 900;
          font-size: 0.75rem;
          min-width: 18px;
          text-align: center;
          color: var(--text-primary);
        }

        .size-controls {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          background: var(--bg-primary);
          padding: 2px 4px;
          border-radius: 4px;
        }

        .size-qty-num {
          font-weight: 800;
          font-size: 0.8rem;
          min-width: 22px;
          text-align: center;
          color: var(--text-primary);
        }

        .btn-stock-step {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: all 0.15s ease;
        }
        .btn-stock-step:hover:not(:disabled) {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }
        .btn-stock-step:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .font-bold { font-weight: 800; }
      `}</style>
    </div>
  );
}
