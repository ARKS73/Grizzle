'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
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
      }
    } catch (e) {
      addToast('Error creating category', 'error');
    }
  };

  return (
    <div className="admin-categories-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>Clothes Category Manager</h1>
          <p>Organize product listings into T-Shirts, Hoodies, Outerwear, Denim, and Activewear.</p>
        </div>
      </div>

      <div className="categories-grid">
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
                placeholder="e.g. Tank Tops & Polos"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              <Plus size={16} /> Create Category
            </button>
          </form>
        </div>

        <div className="table-card glass-panel">
          <h3>Existing Categories</h3>
          <table className="admin-table mt-3">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading categories...</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id || cat.slug}>
                    <td>
                      <img src={cat.image} alt={cat.name} className="cat-img" />
                    </td>
                    <td><strong>{cat.name}</strong></td>
                    <td><code>{cat.slug}</code></td>
                    <td><span className="badge badge-primary">{cat.productCount || 0} items</span></td>
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
        .w-100 { width: 100%; }
        @media (max-width: 900px) { .categories-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
