'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminInventoryPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleStockUpdate = async (productId, newStock) => {
    try {
      setUpdatingId(productId);
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(newStock, 10) }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Stock level updated successfully!', 'success');
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: parseInt(newStock, 10) } : p))
        );
      }
    } catch (e) {
      addToast('Failed to update stock', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="admin-inventory-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Inventory & Real-Time Stock Control</h1>
          <p>Monitor warehouse availability and receive low stock alerts.</p>
        </div>
        <div className="summary-pills">
          <span className="badge badge-info">{products.length} Total SKUs</span>
          <span className="badge badge-danger">{lowStockCount} Low Stock (&lt; 10)</span>
        </div>
      </div>

      <div className="table-card glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock Status</th>
              <th>Adjust Inventory Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Loading inventory...</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-cell">
                      <img src={product.images?.[0]} alt={product.name} className="table-img" />
                      <div>
                        <strong>{product.name}</strong>
                        <span className="subtext d-block">Sizes: {product.sizes?.join(', ')}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-secondary">{product.category}</span></td>
                  <td><strong>₹{product.price?.toFixed(0)}</strong></td>
                  <td>
                    {product.stock <= 10 ? (
                      <span className="badge badge-danger">
                        <AlertTriangle size={12} /> Low Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="badge badge-success">In Stock ({product.stock})</span>
                    )}
                  </td>
                  <td>
                    <div className="stock-adjuster">
                      <button
                        onClick={() => handleStockUpdate(product._id, Math.max(0, product.stock - 5))}
                        className="btn btn-secondary btn-xs"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleStockUpdate(product._id, Math.max(0, product.stock - 1))}
                        className="btn btn-secondary btn-xs"
                      >
                        -1
                      </button>
                      <span className="stock-num">{product.stock}</span>
                      <button
                        onClick={() => handleStockUpdate(product._id, product.stock + 1)}
                        className="btn btn-secondary btn-xs"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleStockUpdate(product._id, product.stock + 10)}
                        className="btn btn-secondary btn-xs"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; }
        .summary-pills { display: flex; gap: 0.5rem; }
        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .product-cell { display: flex; align-items: center; gap: 0.75rem; }
        .table-img { width: 44px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); }
        .subtext { font-size: 0.75rem; color: var(--text-muted); }

        .stock-adjuster { display: flex; align-items: center; gap: 0.35rem; }
        .stock-num { font-weight: 800; min-width: 32px; text-align: center; }
      `}</style>
    </div>
  );
}
