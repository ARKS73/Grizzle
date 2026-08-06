'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FolderTree, Plus, Trash2, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setImage(compressedBase64);
          setUploadingImage(false);
          addToast('Category image uploaded successfully!', 'success');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
      addToast('Failed to upload image file', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image: image || '/logo2.png',
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Category created successfully!', 'success');
        setName('');
        setImage('');
        setDescription('');
        fetchCategories();
      } else {
        addToast(data.message || 'Error creating category', 'error');
      }
    } catch (e) {
      addToast('Error creating category', 'error');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      setDeletingId(catId);
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Category "${catName}" deleted!`, 'success');
        fetchCategories();
      } else {
        addToast(data.message || 'Failed to delete category', 'error');
      }
    } catch (err) {
      addToast('Error deleting category', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-categories-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Category Manager</h1>
          <p>Create and manage custom clothing categories stored securely in your seller MongoDB database.</p>
        </div>
      </div>

      <div className="categories-grid">
        {/* Add Category Form */}
        <div className="add-category-card glass-panel">
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory} className="mt-3">
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Hoodies & Sweatshirts"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image</label>
              {image && (
                <div className="image-preview-box mb-2" style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => setImage('')} 
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary w-100 mb-2"
                disabled={uploadingImage}
              >
                <Upload size={16} /> {uploadingImage ? 'Compressing Image...' : 'Upload Cover Image from Local'}
              </button>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              <Plus size={16} /> Save Category to DB
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="table-card glass-panel">
          <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3>Live Seller Categories ({categories.length})</h3>
            <button onClick={fetchCategories} className="btn btn-sm btn-secondary" title="Refresh Categories">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <table className="admin-table mt-3">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-4">Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    <p style={{ color: 'var(--text-muted)' }}>No categories found in MongoDB. Create your first seller category using the form!</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id || cat.slug}>
                    <td data-label="Image">
                      <img src={cat.image || '/logo2.png'} alt={cat.name} className="cat-img" />
                    </td>
                    <td data-label="Category Name"><strong>{cat.name}</strong></td>
                    <td data-label="Slug"><code>{cat.slug}</code></td>
                    <td data-label="Products"><span className="badge badge-primary">{cat.productCount || 0} items</span></td>
                    <td data-label="Actions" className="actions-cell" style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="btn-danger-icon"
                        disabled={deletingId === cat._id}
                        title="Delete Category from Database"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .categories-grid { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; }
        .add-category-card, .table-card { padding: 1.5rem; border-radius: var(--radius-lg); }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .cat-img { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-md); }
        .btn-danger-icon { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 6px 10px; cursor: pointer; transition: background 0.2s; }
        .btn-danger-icon:hover { background: rgba(239, 68, 68, 0.25); }
        .w-100 { width: 100%; }
        code { word-break: break-all; }
        @media (max-width: 900px) { 
          .categories-grid { grid-template-columns: 1fr; gap: 1.25rem; } 
        }
        @media (max-width: 600px) {
          .add-category-card, .table-card { padding: 1rem; }
          .cat-img { width: 38px; height: 38px; }
          .actions-cell { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
