'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Upload, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const ALL_AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];

export default function AdminProductsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'T-Shirts',
    gender: 'Men',
    price: '',
    originalPrice: '',
    stock: '25',
    images: [''],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#0f172a' }],
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }

      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?.name || 'T-Shirts',
      gender: 'Men',
      price: '',
      originalPrice: '',
      stock: '25',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Black', hex: '#0f172a' }],
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      gender: product.gender || 'Men',
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      stock: product.stock.toString(),
      images: product.images || [''],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || [{ name: 'Black', hex: '#0f172a' }],
      isFeatured: product.isFeatured || false,
      isTrending: product.isTrending || false,
      isBestSeller: product.isBestSeller || false,
    });
    setModalOpen(true);
  };

  const handleToggleSize = (size) => {
    setFormData((prev) => {
      const currentSizes = prev.sizes || [];
      if (currentSizes.includes(size)) {
        return { ...prev, sizes: currentSizes.filter((s) => s !== size) };
      } else {
        return { ...prev, sizes: [...currentSizes, size] };
      }
    });
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addToast('Product deleted successfully', 'info');
          fetchProducts();
        }
      } catch (e) {
        addToast('Failed to delete product', 'error');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      try {
        setUploadingImage(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: dataUrl }),
        });
        const data = await res.json();
        const finalUrl = (data.success && data.url) ? data.url : dataUrl;

        setFormData((prev) => ({
          ...prev,
          images: [finalUrl, ...prev.images.filter(Boolean)],
        }));
        addToast(data.success ? 'Image uploaded successfully!' : 'Image preview added', 'success');
      } catch (e) {
        setFormData((prev) => ({
          ...prev,
          images: [dataUrl, ...prev.images.filter(Boolean)],
        }));
        addToast('Image preview added', 'info');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sizes || formData.sizes.length === 0) {
      addToast('Please select at least one size (e.g. S, M, L, XL)', 'error');
      return;
    }

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Product ${editingId ? 'updated' : 'created'} successfully!`, 'success');
        setModalOpen(false);
        fetchProducts();
      } else {
        addToast(data.message || 'Failed to save product', 'error');
      }
    } catch (e) {
      addToast('Error saving product', 'error');
    }
  };

  return (
    <div className="admin-products-wrapper">
      {/* Top Header & Back Button */}
      <div className="page-header">
        <div>
          <button onClick={() => router.back()} className="btn btn-secondary btn-sm mb-2">
            <ArrowLeft size={16} /> Back
          </button>
          <h1>Product Management</h1>
          <p>Add, edit, or manage clothing items, gender filters (Men/Women/Unisex), and available sizes.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Clothes Product
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="toolbar-card glass-panel mb-4">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by title, gender, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="table-card glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Gender</th>
              <th>Category</th>
              <th>Sizes Available</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center p-4">Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} className="text-center p-4">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img src={p.images?.[0]} alt={p.name} className="product-table-img" />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-info">{p.gender || 'Unisex'}</span>
                  </td>
                  <td><span className="badge badge-secondary">{p.category}</span></td>
                  <td>
                    <div className="sizes-pill-list">
                      {p.sizes && p.sizes.length > 0 ? (
                        p.sizes.map((sz) => (
                          <span key={sz} className="size-pill-tag">{sz}</span>
                        ))
                      ) : (
                        <span className="subtext">S, M, L, XL</span>
                      )}
                    </div>
                  </td>
                  <td><strong>₹{p.price?.toFixed(0)}</strong></td>
                  <td>
                    {p.stock <= 10 ? (
                      <span className="badge badge-danger">{p.stock} (Low)</span>
                    ) : (
                      <span className="badge badge-success">{p.stock} in stock</span>
                    )}
                  </td>
                  <td>
                    {p.isFeatured && <span className="badge badge-primary mr-1">Featured</span>}
                    {p.isBestSeller && <span className="badge badge-warning">Best Seller</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => handleOpenEditModal(p)} className="btn btn-secondary btn-xs" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger btn-xs" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} className="modal-close"><X size={20} /></button>
            <h2>{editingId ? 'Edit Product Details' : 'Add New Clothes Product'}</h2>

            <form onSubmit={handleSubmit} className="product-form mt-3">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Heavyweight Printed Boxy Tee"
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender Filter *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="form-select"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="699"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="999"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Sizes Multi-Select Checkboxes */}
              <div className="form-group">
                <label className="form-label">Available Sizes * (Select all that apply)</label>
                <div className="sizes-checkbox-grid">
                  {ALL_AVAILABLE_SIZES.map((sz) => {
                    const isChecked = (formData.sizes || []).includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => handleToggleSize(sz)}
                        className={`size-toggle-btn ${isChecked ? 'active' : ''}`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Fabric details, GSM weight, fit silhouette..."
                  className="form-textarea"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div className="form-group">
                <label className="form-label">Product Image (Cloudinary Integration)</label>
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleFileUpload} id="cloudinary-upload" hidden />
                  <label htmlFor="cloudinary-upload" className="btn btn-secondary upload-btn">
                    <Upload size={16} /> {uploadingImage ? 'Uploading image...' : 'Upload Image File'}
                  </label>
                  <input
                    type="text"
                    placeholder="Or enter Image URL"
                    value={formData.images[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className="form-input"
                  />
                </div>
                {formData.images[0] && (
                  <img src={formData.images[0]} alt="preview" className="image-preview mt-2" />
                )}
              </div>

              {/* Badges Checkboxes */}
              <div className="checkbox-row">
                <label><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} /> Featured</label>
                <label><input type="checkbox" checked={formData.isTrending} onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })} /> Trending</label>
                <label><input type="checkbox" checked={formData.isBestSeller} onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })} /> Best Seller</label>
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-100">
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .toolbar-card { padding: 1rem; border-radius: var(--radius-md); }
        .search-box { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 14px; color: var(--text-muted); }
        .search-box input { padding-left: 2.6rem; }

        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .product-table-img { width: 44px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); }
        .subtext { font-size: 0.75rem; color: var(--text-muted); }
        .action-btns { display: flex; gap: 0.35rem; }

        .sizes-pill-list { display: flex; gap: 4px; flex-wrap: wrap; }
        .size-pill-tag {
          font-size: 0.7rem;
          font-weight: 800;
          background: var(--bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .sizes-checkbox-grid {
          display: flex;
          gap: 0.5rem;
        }
        .size-toggle-btn {
          flex: 1;
          padding: 0.5rem;
          font-weight: 800;
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .size-toggle-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: var(--shadow-sm);
        }

        .product-modal { max-width: 680px; position: relative; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: var(--text-primary); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .image-upload-box { display: flex; gap: 0.75rem; align-items: center; }
        .image-preview { width: 80px; height: 90px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color); }
        .checkbox-row { display: flex; gap: 1.5rem; margin-top: 1rem; font-size: 0.9rem; font-weight: 600; }
        .w-100 { width: 100%; }
      `}</style>
    </div>
  );
}
