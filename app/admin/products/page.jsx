'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Upload, X, ArrowLeft, Palette, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const ALL_AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];

const SAMPLE_PRESET_IMAGES = [
  { name: 'Oversized Black Tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { name: 'Charcoal Graphic', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Anime Manga Print', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Line Art', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Artist Drop Hoodie', url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80' },
];

const PRESET_COLOR_VARIANTS = [
  { name: 'Pitch Black', hex: '#0f172a', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { name: 'Off White', hex: '#f8fafc', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Washed Charcoal', hex: '#334155', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Royal Navy', hex: '#1e3a8a', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crimson Maroon', hex: '#881337', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Olive Green', hex: '#3f6212', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
];

// Helper to compress local uploaded image files before sending to server (prevents 413 Payload Too Large)
const compressImage = (file, maxWidth = 800, maxHeight = 1000, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    colors: PRESET_COLOR_VARIANTS.slice(0, 3),
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
      colors: PRESET_COLOR_VARIANTS.slice(0, 3),
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
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors && product.colors.length > 0 ? product.colors : PRESET_COLOR_VARIANTS.slice(0, 3),
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

    try {
      setUploadingImage(true);
      const compressedDataUrl = await compressImage(file, 800, 1000, 0.75);
      const dataUrl = compressedDataUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: dataUrl }),
      });
      const data = await res.json();
      const finalUrl = (data.success && data.url) ? data.url : dataUrl;

      setFormData((prev) => ({
        ...prev,
        images: Array.from(new Set([finalUrl, ...prev.images])).filter(Boolean),
      }));
      addToast('Main image uploaded successfully!', 'success');
    } catch (e) {
      console.error('Image Upload Error:', e);
      addToast('Image uploaded locally', 'info');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sizes || formData.sizes.length === 0) {
      addToast('Please select at least one size (e.g. S, M, L, XL)', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      // Gather all color-specific t-shirt images into main product images list
      const colorImages = (formData.colors || []).map(c => c.image).filter(Boolean);
      const combinedImages = Array.from(new Set([...colorImages, ...formData.images])).filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: combinedImages.length > 0 ? combinedImages : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
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
    } finally {
      setIsSubmitting(false);
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
          <p>Add, edit, or manage clothing items, color-wise t-shirt photos, gender filters, and sizes.</p>
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
              <th>Color Variants (T-Shirt Photos)</th>
              <th>Sizes Available</th>
              <th>Price</th>
              <th>Stock</th>
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
                    <div className="colors-swatch-list">
                      {p.colors && p.colors.length > 0 ? (
                        p.colors.map((c, idx) => (
                          <div key={idx} className="color-swatch-item-box" title={`${c.name}: ${c.image ? 'Has T-shirt photo' : 'No photo'}`}>
                            <span className="color-swatch-dot" style={{ backgroundColor: c.hex }} />
                            {c.image && <span className="photo-indicator-tag">📷</span>}
                          </div>
                        ))
                      ) : (
                        <span className="subtext">Default</span>
                      )}
                    </div>
                  </td>
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
            <h2>{editingId ? 'Edit Product & Color Collection' : 'Add New Clothes Product (1 Style, Multiple Colors)'}</h2>

            <form onSubmit={handleSubmit} className="product-form mt-3">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Cyberpunk Neon Oversized Tee"
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

              {/* Color-wise T-Shirt Variants Manager */}
              <div className="form-group glass-panel p-3 border-radius-lg border-primary-light">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <label className="form-label m-0 text-primary d-flex align-items-center gap-2 font-bold text-md">
                      <Palette size={18} /> Color Variants & Color-Wise T-Shirt Photos (1 Style, Multiple Colors)
                    </label>
                    <p className="subtext mt-1">
                      Add color variants for this t-shirt style and upload/set a specific t-shirt photo for each color option.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        colors: [...(prev.colors || []), { name: 'New Color', hex: '#0f172a', image: '' }],
                      }))
                    }
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Color Variant
                  </button>
                </div>

                {/* Preset Color Quick Add */}
                <div className="preset-colors-row mb-3 p-2 bg-secondary rounded">
                  <span className="preset-title font-semibold">⚡ Quick Add Preset Colors:</span>
                  {PRESET_COLOR_VARIANTS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (!formData.colors.some((c) => c.name === preset.name)) {
                          setFormData((prev) => ({
                            ...prev,
                            colors: [...(prev.colors || []), preset],
                            images: Array.from(new Set([...prev.images, preset.image])).filter(Boolean),
                          }));
                        }
                      }}
                      className="preset-color-chip"
                    >
                      <span className="chip-circle" style={{ backgroundColor: preset.hex }} />
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Color Variants List */}
                <div className="color-variants-list">
                  {(formData.colors || []).map((col, idx) => (
                    <div key={idx} className="color-variant-card-box mb-3 p-3 border rounded glass-panel">
                      <div className="color-card-header d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            value={col.hex || '#0f172a'}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[idx].hex = e.target.value;
                              setFormData({ ...formData, colors: newColors });
                            }}
                            className="color-picker-circle"
                          />
                          <input
                            type="text"
                            placeholder="Color Name (e.g. Off White, Pitch Black)"
                            value={col.name || ''}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[idx].name = e.target.value;
                              setFormData({ ...formData, colors: newColors });
                            }}
                            className="form-input col-name-input font-bold"
                          />
                          <span className="color-hex-tag subtext">{col.hex}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = formData.colors.filter((_, i) => i !== idx);
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className="btn btn-danger btn-xs"
                          title="Remove this color variant"
                        >
                          <Trash2 size={14} /> Remove Color
                        </button>
                      </div>

                      {/* T-Shirt Photo for this Color */}
                      <div className="color-photo-upload-row mt-2 p-2 bg-tertiary rounded d-flex align-items-center gap-3">
                        {col.image ? (
                          <img src={col.image} alt={col.name} className="color-variant-preview-img" />
                        ) : (
                          <div className="color-no-img-box">
                            <ImageIcon size={20} className="text-muted" />
                            <span className="subtext">No Photo</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="subtext font-semibold d-block mb-1">
                            T-Shirt Photo for <strong>{col.name || 'this color'}</strong>:
                          </label>
                          <div className="d-flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              id={`col-file-${idx}`}
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const compressed = await compressImage(file, 800, 1000, 0.75);
                                if (compressed) {
                                  const newColors = [...formData.colors];
                                  newColors[idx].image = compressed;
                                  const newImages = Array.from(new Set([compressed, ...formData.images])).filter(Boolean);
                                  setFormData({ ...formData, colors: newColors, images: newImages });
                                  addToast(`T-shirt image uploaded for ${col.name}!`, 'success');
                                }
                              }}
                            />
                            <label htmlFor={`col-file-${idx}`} className="btn btn-secondary btn-xs upload-btn">
                              <Upload size={14} /> Upload T-Shirt Photo
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste T-Shirt Image URL"
                              value={col.image || ''}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[idx].image = e.target.value;
                                const newImages = Array.from(new Set([e.target.value, ...formData.images])).filter(Boolean);
                                setFormData({ ...formData, colors: newColors, images: newImages });
                              }}
                              className="form-input form-input-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

              {/* Main Product Gallery Images */}
              <div className="form-group">
                <label className="form-label">Main Gallery Image (Upload or Paste URL)</label>
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleFileUpload} id="cloudinary-upload" hidden />
                  <label htmlFor="cloudinary-upload" className="btn btn-secondary upload-btn">
                    <Upload size={16} /> {uploadingImage ? 'Uploading image...' : 'Upload Image File'}
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste Image URL"
                    value={formData.images[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value, ...formData.images.slice(1)] })}
                    className="form-input"
                  />
                </div>

                {/* Preset stock image selector chips */}
                <div className="preset-images-list mt-2">
                  <span className="preset-title">Or pick sample photo:</span>
                  {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, images: Array.from(new Set([preset.url, ...formData.images])).filter(Boolean) })}
                      className="preset-chip"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {formData.images[0] && (
                  <div className="image-preview-container mt-2">
                    <img src={formData.images[0]} alt="preview" className="image-preview" />
                  </div>
                )}
              </div>

              {/* Badges Checkboxes */}
              <div className="checkbox-row">
                <label><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} /> Featured</label>
                <label><input type="checkbox" checked={formData.isTrending} onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })} /> Trending</label>
                <label><input type="checkbox" checked={formData.isBestSeller} onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })} /> Best Seller</label>
              </div>

              <button type="submit" disabled={isSubmitting || uploadingImage} className="btn btn-primary mt-4 w-100">
                {isSubmitting ? 'Saving Changes...' : editingId ? 'Update Product' : 'Create Product'}
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
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-md { font-size: 1rem; }
        .action-btns { display: flex; gap: 0.35rem; }

        .colors-swatch-list { display: flex; gap: 6px; align-items: center; }
        .color-swatch-item-box { display: flex; align-items: center; gap: 2px; }
        .color-swatch-dot {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          border: 1.5px solid rgba(0,0,0,0.3);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .photo-indicator-tag { font-size: 0.65rem; }

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

        .border-radius-lg { border-radius: var(--radius-lg); }

        .preset-colors-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .preset-title { font-size: 0.8rem; color: var(--text-secondary); }
        .preset-color-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--text-primary);
        }
        .preset-color-chip:hover {
          background: var(--accent-light);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        .chip-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.25);
        }

        .color-variants-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .color-variant-card-box {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-color);
        }
        .color-picker-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
        }
        .col-name-input { width: 220px; }
        .color-variant-preview-img {
          width: 54px;
          height: 62px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--accent-primary);
        }
        .color-no-img-box {
          width: 54px;
          height: 62px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }
        .form-input-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; }

        .product-modal { max-width: 760px; position: relative; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: var(--text-primary); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .image-upload-box { display: flex; gap: 0.75rem; align-items: center; }
        .image-preview-container { display: flex; align-items: center; gap: 1rem; }
        .image-preview { width: 80px; height: 90px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color); }
        .preset-images-list { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; font-size: 0.75rem; }
        .preset-chip {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-primary);
        }
        .preset-chip:hover {
          background: var(--accent-light);
          color: var(--accent-primary);
        }

        .checkbox-row { display: flex; gap: 1.5rem; margin-top: 1rem; font-size: 0.9rem; font-weight: 600; }
        .w-100 { width: 100%; }

        @media (max-width: 700px) {
          .color-card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .col-name-input { width: 100%; }
          .color-photo-upload-row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
