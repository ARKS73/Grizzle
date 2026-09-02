'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Upload, X, ArrowLeft, Palette, Image as ImageIcon, Ruler } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';


const ALL_AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];

const PRESET_COLOR_VARIANTS = [
  { name: 'White', hex: '#ffffff', image: '', images: [] },
  { name: 'Black', hex: '#000000', image: '', images: [] },
  { name: 'Red', hex: '#ef4444', image: '', images: [] },
  { name: 'Blue', hex: '#3b82f6', image: '', images: [] },
  { name: 'Green', hex: '#10b981', image: '', images: [] },
];

const PRESET_TSHIRT_IMAGES = [
  { name: 'Oversized Black Tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vintage Acid Wash Tee', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80' },
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
    fabricFit: '',
    category: '',
    gender: 'Men',
    price: '',
    originalPrice: '',
    stock: '25',
    sizeStock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
    images: [],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [],
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

  const DEFAULT_SIZE_CHART_TABLE = {
    title: 'Standard Size Chart (Inches)',
    columns: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
    rows: [
      ['S', '38-40"', '27.5"', '18.5"'],
      ['M', '40-42"', '28.5"', '19.5"'],
      ['L', '42-44"', '29.5"', '20.5"'],
      ['XL', '44-46"', '30.5"', '21.5"'],
      ['XXL', '46-48"', '31.5"', '22.5"'],
    ],
  };

  const handleLoadMasterPreset = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (Array.isArray(s.sizeChartColumns) && Array.isArray(s.sizeChartRows)) {
          setFormData((prev) => ({
            ...prev,
            sizeCharts: [{ title: 'Master Store Size Chart', columns: s.sizeChartColumns, rows: s.sizeChartRows }],
            sizeChartTips: s.sizeChartTips || prev.sizeChartTips,
          }));
          addToast('Loaded Master Store Size Chart Preset', 'info');
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setFormData((prev) => ({
      ...prev,
      sizeCharts: [DEFAULT_SIZE_CHART_TABLE],
    }));
    addToast('Loaded Standard Preset', 'info');
  };

  const handleCopyFromProduct = (sourceProductId) => {
    const src = products.find((p) => p._id === sourceProductId);
    if (!src) return;
    let srcCharts = [];
    if (Array.isArray(src.sizeCharts) && src.sizeCharts.length > 0) {
      srcCharts = JSON.parse(JSON.stringify(src.sizeCharts));
    } else {
      srcCharts = [DEFAULT_SIZE_CHART_TABLE];
    }
    setFormData((prev) => ({
      ...prev,
      sizeCharts: srcCharts,
      sizeChartTips: src.sizeChartTips || prev.sizeChartTips,
    }));
    addToast(`Copied size chart from "${src.name}"!`, 'success');
  };

  const handleAddTable = () => {
    const newTbl = {
      title: `Table #${(formData.sizeCharts || []).length + 1} Specs`,
      columns: ['Size', 'Measure 1', 'Measure 2'],
      rows: [['S', '', '']],
    };
    setFormData((prev) => ({
      ...prev,
      sizeCharts: [...(prev.sizeCharts || []), newTbl],
    }));
  };

  const handleRemoveTable = (tableIdx) => {
    setFormData((prev) => ({
      ...prev,
      sizeCharts: (prev.sizeCharts || []).filter((_, i) => i !== tableIdx),
    }));
  };

  const handleTableTitleChange = (tableIdx, titleVal) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx]) updated[tableIdx].title = titleVal;
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleAddTableColumn = (tableIdx) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx]) {
        const cols = updated[tableIdx].columns || [];
        cols.push(`Col ${cols.length + 1}`);
        updated[tableIdx].rows = (updated[tableIdx].rows || []).map((r) => [...r, '']);
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleRemoveTableColumn = (tableIdx, colIdx) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx]) {
        if (updated[tableIdx].columns.length <= 1) return prev;
        updated[tableIdx].columns = updated[tableIdx].columns.filter((_, i) => i !== colIdx);
        updated[tableIdx].rows = updated[tableIdx].rows.map((r) => r.filter((_, i) => i !== colIdx));
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleRenameTableColumn = (tableIdx, colIdx, val) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx] && updated[tableIdx].columns) {
        updated[tableIdx].columns[colIdx] = val;
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleAddTableRow = (tableIdx) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx]) {
        const colCount = updated[tableIdx].columns ? updated[tableIdx].columns.length : 3;
        const newRow = new Array(colCount).fill('');
        newRow[0] = 'NEW';
        updated[tableIdx].rows.push(newRow);
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleRemoveTableRow = (tableIdx, rowIdx) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx]) {
        updated[tableIdx].rows = updated[tableIdx].rows.filter((_, i) => i !== rowIdx);
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleTableCellChange = (tableIdx, rowIdx, colIdx, val) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.sizeCharts || []));
      if (updated[tableIdx] && updated[tableIdx].rows && updated[tableIdx].rows[rowIdx]) {
        updated[tableIdx].rows[rowIdx][colIdx] = val;
      }
      return { ...prev, sizeCharts: updated };
    });
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: 'High-quality 240 GSM bio-washed combed cotton t-shirt with durable DTF print.',
      fabricFit: '',
      category: categories[0]?.name || 'T-Shirts',
      gender: 'Men',
      price: '699',
      originalPrice: '999',
      stock: '25',
      sizeStock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
      images: [],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: PRESET_COLOR_VARIANTS.slice(0, 2),
      sizeCharts: [DEFAULT_SIZE_CHART_TABLE],
      sizeChartTips: 'Oversized Streetwear Fit: Choose standard size for relaxed dropped-shoulder fit.',
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    const existingSizeStock = product.sizeStock || {};
    sizes.forEach((sz) => {
      if (existingSizeStock[sz] === undefined) {
        existingSizeStock[sz] = Math.floor((product.stock || 20) / sizes.length);
      }
    });

    const colorImages = (product.colors || []).map((c) => c.image).filter((img) => img && img !== '/logo2.png');
    const existingImages = (product.images || []).filter((img) => img && img !== '/logo2.png');
    const combinedAllImages = Array.from(new Set([...existingImages, ...colorImages])).filter(Boolean);

    setFormData({
      name: product.name,
      description: product.description,
      fabricFit: product.fabricFit || '',
      category: product.category,
      gender: product.gender || 'Men',
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      stock: product.stock ? product.stock.toString() : '20',
      sizeStock: existingSizeStock,
      images: combinedAllImages,
      sizes,
      colors: product.colors && product.colors.length > 0 ? product.colors : [],
      sizeCharts: Array.isArray(product.sizeCharts) && product.sizeCharts.length > 0
        ? product.sizeCharts
        : [DEFAULT_SIZE_CHART_TABLE],
      sizeChartTips: product.sizeChartTips || 'Oversized Streetwear Fit: Choose standard size for relaxed dropped-shoulder fit.',
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
      if (!compressedDataUrl) {
        addToast('Failed to read image file', 'error');
        setUploadingImage(false);
        return;
      }
      const dataUrl = compressedDataUrl;

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

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleMultipleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      const newUploadedUrls = [];

      for (const file of files) {
        const compressedDataUrl = await compressImage(file, 800, 1000, 0.75);
        if (!compressedDataUrl) continue;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: compressedDataUrl }),
          });
          const data = await res.json();
          const finalUrl = data.success && data.url ? data.url : compressedDataUrl;
          newUploadedUrls.push(finalUrl);
        } catch (err) {
          newUploadedUrls.push(compressedDataUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: Array.from(new Set([...(prev.images || []), ...newUploadedUrls])).filter(Boolean),
        }));
        addToast(`Uploaded ${newUploadedUrls.length} product gallery photo(s)!`, 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Error uploading images', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: Array.from(new Set([...(prev.images || []), newImageUrl.trim()])).filter(Boolean),
    }));
    setNewImageUrl('');
    addToast('Product photo URL added to gallery!', 'success');
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const imgs = [...(prev.images || [])];
      if (index <= 0 || index >= imgs.length) return prev;
      const target = imgs[index];
      imgs.splice(index, 1);
      imgs.unshift(target);
      return { ...prev, images: imgs };
    });
    addToast('Set as main product cover photo!', 'info');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const [colorUrlInputs, setColorUrlInputs] = useState({});

  const handleColorMultipleFileUpload = async (colorIdx, filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      const newUploadedUrls = [];

      for (const file of files) {
        const compressedDataUrl = await compressImage(file, 800, 1000, 0.75);
        if (!compressedDataUrl) continue;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: compressedDataUrl }),
          });
          const data = await res.json();
          const finalUrl = data.success && data.url ? data.url : compressedDataUrl;
          newUploadedUrls.push(finalUrl);
        } catch (err) {
          newUploadedUrls.push(compressedDataUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        setFormData((prev) => {
          const newColors = JSON.parse(JSON.stringify(prev.colors || []));
          if (newColors[colorIdx]) {
            const currentImgs = newColors[colorIdx].images || (newColors[colorIdx].image ? [newColors[colorIdx].image] : []);
            const updatedColorImgs = Array.from(new Set([...currentImgs, ...newUploadedUrls])).filter(Boolean);
            newColors[colorIdx].images = updatedColorImgs;
            newColors[colorIdx].image = updatedColorImgs[0] || '';
          }
          const allGenImages = Array.from(new Set([...(prev.images || []), ...newUploadedUrls])).filter(Boolean);
          return { ...prev, colors: newColors, images: allGenImages };
        });
        addToast(`Uploaded ${newUploadedUrls.length} photo(s) for color!`, 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Error uploading color images', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddColorImageUrl = (colorIdx) => {
    const rawVal = colorUrlInputs[colorIdx] || '';
    if (!rawVal.trim()) return;
    const cleanUrl = rawVal.trim();

    setFormData((prev) => {
      const newColors = JSON.parse(JSON.stringify(prev.colors || []));
      if (newColors[colorIdx]) {
        const currentImgs = newColors[colorIdx].images || (newColors[colorIdx].image ? [newColors[colorIdx].image] : []);
        const updatedColorImgs = Array.from(new Set([...currentImgs, cleanUrl])).filter(Boolean);
        newColors[colorIdx].images = updatedColorImgs;
        newColors[colorIdx].image = updatedColorImgs[0] || '';
      }
      const allGenImages = Array.from(new Set([...(prev.images || []), cleanUrl])).filter(Boolean);
      return { ...prev, colors: newColors, images: allGenImages };
    });

    setColorUrlInputs((prev) => ({ ...prev, [colorIdx]: '' }));
    addToast('Photo URL added for this color variant!', 'success');
  };

  const handleRemoveColorImage = (colorIdx, imgIdx) => {
    setFormData((prev) => {
      const newColors = JSON.parse(JSON.stringify(prev.colors || []));
      if (newColors[colorIdx]) {
        const currentImgs = newColors[colorIdx].images || (newColors[colorIdx].image ? [newColors[colorIdx].image] : []);
        const updatedColorImgs = currentImgs.filter((_, i) => i !== imgIdx);
        newColors[colorIdx].images = updatedColorImgs;
        newColors[colorIdx].image = updatedColorImgs[0] || '';
      }
      return { ...prev, colors: newColors };
    });
  };

  const handleSetColorCoverImage = (colorIdx, imgIdx) => {
    setFormData((prev) => {
      const newColors = JSON.parse(JSON.stringify(prev.colors || []));
      if (newColors[colorIdx]) {
        const currentImgs = newColors[colorIdx].images || (newColors[colorIdx].image ? [newColors[colorIdx].image] : []);
        if (imgIdx > 0 && imgIdx < currentImgs.length) {
          const target = currentImgs[imgIdx];
          currentImgs.splice(imgIdx, 1);
          currentImgs.unshift(target);
          newColors[colorIdx].images = currentImgs;
          newColors[colorIdx].image = currentImgs[0];
        }
      }
      return { ...prev, colors: newColors };
    });
    addToast('Set main cover photo for this color!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      addToast('Please enter a Product Name', 'error');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      addToast('Please enter a valid Price', 'error');
      return;
    }
    if (!formData.sizes || formData.sizes.length === 0) {
      addToast('Please select at least one size (e.g. S, M, L, XL)', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      // Gather all color-specific t-shirt images into main product images list
      const colorImages = (formData.colors || []).flatMap(c => {
        const arr = Array.isArray(c.images) && c.images.length > 0 ? [...c.images] : [];
        if (c.image && !arr.includes(c.image)) arr.push(c.image);
        return arr;
      }).filter((img) => img && img !== '/logo2.png');
      const userImages = (formData.images || []).filter((img) => img && img !== '/logo2.png');
      let combinedImages = Array.from(new Set([...userImages, ...colorImages])).filter((img) => img && img !== '/logo2.png');

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: formData.category || categories[0]?.name || 'T-Shirts',
          images: combinedImages,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
          stock: parseInt(formData.stock, 10) || 20,
          sizeStock: formData.sizeStock || {},
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
                  <td data-label="Image">
                    <img src={p.images?.[0]} alt={p.name} className="product-table-img" />
                  </td>
                  <td data-label="Name">
                    <strong>{p.name}</strong>
                  </td>
                  <td data-label="Gender">
                    <span className="badge badge-info">{p.gender || 'Unisex'}</span>
                  </td>
                  <td data-label="Category"><span className="badge badge-secondary">{p.category}</span></td>
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
                  <td data-label="Price"><strong>₹{p.price?.toFixed(0)}</strong></td>
                  <td data-label="Stock">
                    {p.stock <= 10 ? (
                      <span className="badge badge-danger">{p.stock} (Low)</span>
                    ) : (
                      <span className="badge badge-success">{p.stock} in stock</span>
                    )}
                  </td>
                  <td data-label="Actions">
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

              {/* Sizes Multi-Select & Size-Wise Stock Inputs */}
              <div className="form-group glass-panel p-3 border-radius-lg">
                <label className="form-label font-bold text-md">Available Sizes & Stock Breakdown *</label>
                <div className="sizes-checkbox-grid mb-3">
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

                {(formData.sizes || []).length > 0 && (
                  <div className="size-stock-breakdown-box bg-secondary p-3 rounded">
                    <label className="subtext font-semibold d-block mb-2">
                      Enter Stock for Each Selected Size:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {(formData.sizes || []).map((sz) => {
                        const currentSizeQty = formData.sizeStock?.[sz] !== undefined ? formData.sizeStock[sz] : 5;
                        return (
                          <div key={sz} className="d-flex align-items-center gap-1 bg-tertiary p-2 rounded border">
                            <span className="badge badge-info font-bold" style={{ minWidth: '24px', textAlign: 'center' }}>{sz}</span>
                            <input
                              type="number"
                              min="0"
                              value={currentSizeQty}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                const updatedSizeStock = { ...(formData.sizeStock || {}), [sz]: val };
                                const newTotalStock = Object.entries(updatedSizeStock)
                                  .filter(([s]) => (formData.sizes || []).includes(s))
                                  .reduce((sum, [, q]) => sum + (parseInt(q, 10) || 0), 0);
                                setFormData({
                                  ...formData,
                                  sizeStock: updatedSizeStock,
                                  stock: newTotalStock.toString(),
                                });
                              }}
                              className="form-input form-input-sm"
                              style={{ width: '64px', textAlign: 'center', padding: '0.2rem 0.4rem' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="subtext mt-2">
                      Total Calculated Stock: <strong>{formData.stock} units</strong>
                    </div>
                  </div>
                )}
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

                      {/* Multiple Photos for this Specific Color */}
                      <div className="color-photo-upload-box mt-3 p-3 bg-tertiary rounded border">
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                          <label className="subtext font-bold d-flex align-items-center gap-1 m-0 text-primary">
                            <ImageIcon size={14} /> Product Photos for <strong>{col.name || 'this color'}</strong>:
                          </label>
                          <div className="d-flex gap-2 align-items-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              id={`col-files-${idx}`}
                              hidden
                              onChange={(e) => handleColorMultipleFileUpload(idx, e.target.files)}
                            />
                            <label
                              htmlFor={`col-files-${idx}`}
                              className="btn btn-secondary btn-xs upload-btn font-bold"
                              style={{ cursor: 'pointer' }}
                            >
                              <Upload size={13} /> + Upload Photos for {col.name || 'Color'}
                            </label>
                          </div>
                        </div>

                        {/* Paste URL for this Color */}
                        <div className="d-flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder={`Paste Photo Image URL for ${col.name || 'this color'}...`}
                            value={colorUrlInputs[idx] || ''}
                            onChange={(e) => setColorUrlInputs({ ...colorUrlInputs, [idx]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColorImageUrl(idx); } }}
                            className="form-input form-input-sm"
                            style={{ fontSize: '0.78rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddColorImageUrl(idx)}
                            className="btn btn-secondary btn-xs font-bold"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            + Add Photo
                          </button>
                        </div>

                        {/* Grid preview of images for this specific color */}
                        {(() => {
                          const colImgs = (Array.isArray(col.images) && col.images.length > 0)
                            ? col.images
                            : (col.image ? [col.image] : []);

                          if (colImgs.length === 0) {
                            return (
                              <div className="text-center p-2 bg-secondary rounded border" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                No photos added yet for {col.name || 'this color'}. Upload or paste URLs above.
                              </div>
                            );
                          }

                          return (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {colImgs.map((cImg, cImgIdx) => (
                                <div
                                  key={cImgIdx}
                                  style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '95px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: cImgIdx === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                  }}
                                >
                                  <img src={cImg} alt={`${col.name} ${cImgIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  {cImgIdx === 0 ? (
                                    <span style={{ position: 'absolute', top: '3px', left: '3px', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.55rem', fontWeight: 900, padding: '1px 4px', borderRadius: '3px' }}>
                                      Cover
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetColorCoverImage(idx, cImgIdx)}
                                      title="Make cover photo for this color"
                                      style={{ position: 'absolute', top: '3px', left: '3px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px', border: 'none', cursor: 'pointer' }}
                                    >
                                      Cover
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorImage(idx, cImgIdx)}
                                    title="Delete photo"
                                    style={{ position: 'absolute', top: '3px', right: '3px', background: '#ef4444', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📐 Product Unique Multi-Table Size Chart Manager */}
              <div className="form-group glass-panel p-3 border-radius-lg border-primary-light mt-3 mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                  <div>
                    <label className="form-label m-0 text-primary d-flex align-items-center gap-2 font-bold text-md">
                      <Ruler size={18} /> Unique Product Size Chart &amp; Fit Guide (Multi-Table Editor)
                    </label>
                    <p className="subtext mt-1">
                      Customize unique size charts for this product. Create multiple named tables (e.g. Inches, CM, Fit Specs), edit cells, or reuse preset/previous product charts.
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {/* Copy from existing product selector */}
                    {products.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCopyFromProduct(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="form-select form-select-sm"
                        style={{ fontSize: '0.78rem', minWidth: '180px' }}
                      >
                        <option value="">📋 Reuse From Existing Product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={handleLoadMasterPreset}
                      className="btn btn-secondary btn-sm"
                      title="Load Default Store Master Size Chart"
                    >
                      🌟 Store Preset
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTable}
                      className="btn btn-primary btn-sm font-bold"
                    >
                      + Add Extra Table
                    </button>
                  </div>
                </div>

                {/* Fit Tips Advice Input */}
                <div className="form-group mb-3">
                  <label className="subtext font-semibold d-block mb-1">
                    Product Fit Advice &amp; Sizing Recommendation Tips:
                  </label>
                  <input
                    type="text"
                    value={formData.sizeChartTips || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sizeChartTips: e.target.value }))}
                    placeholder="e.g. Oversized Streetwear Fit: Choose standard size for dropped-shoulder fit. For regular fit, size down 1 size."
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                {/* Loop Over Multiple Tables */}
                {(formData.sizeCharts || []).map((chart, tIdx) => (
                  <div key={tIdx} className="mb-4 p-3 border rounded glass-panel bg-secondary">
                    <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2 border-bottom pb-2">
                      <div className="d-flex align-items-center gap-2 flex-1" style={{ minWidth: '220px' }}>
                        <span className="badge badge-primary font-bold">Table #{tIdx + 1}</span>
                        <input
                          type="text"
                          value={chart.title || ''}
                          onChange={(e) => handleTableTitleChange(tIdx, e.target.value)}
                          placeholder="Table Name (e.g. Inches Chart, Centimeters Chart)"
                          className="form-input font-bold"
                          style={{ fontSize: '0.9rem', flex: 1 }}
                        />
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          type="button"
                          onClick={() => handleAddTableColumn(tIdx)}
                          className="btn btn-secondary btn-xs"
                          style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                        >
                          + Column
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTableRow(tIdx)}
                          className="btn btn-secondary btn-xs"
                        >
                          + Row
                        </button>
                        {formData.sizeCharts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTable(tIdx)}
                            className="btn btn-danger btn-xs"
                            title="Delete this entire table"
                          >
                            <Trash2 size={13} /> Delete Table
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table Matrix Editor */}
                    <div style={{ overflowX: 'auto', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                          <tr>
                            {(chart.columns || []).map((colTitle, colIdx) => (
                              <th key={colIdx} style={{ padding: '0.35rem', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <input
                                    type="text"
                                    value={colTitle}
                                    onChange={(e) => handleRenameTableColumn(tIdx, colIdx, e.target.value)}
                                    className="form-input"
                                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-primary)' }}
                                    placeholder={`Col ${colIdx + 1}`}
                                  />
                                  {chart.columns.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTableColumn(tIdx, colIdx)}
                                      title="Delete Column"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', fontSize: '0.8rem' }}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th style={{ width: '40px', textAlign: 'center', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: '0.75rem' }}>
                              ✕
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(chart.rows || []).map((rowArr, rowIdx) => (
                            <tr key={rowIdx}>
                              {(chart.columns || []).map((_, colIdx) => (
                                <td key={colIdx} style={{ padding: '0.3rem' }}>
                                  <input
                                    type="text"
                                    value={rowArr[colIdx] || ''}
                                    onChange={(e) => handleTableCellChange(tIdx, rowIdx, colIdx, e.target.value)}
                                    className="form-input"
                                    style={{
                                      padding: '0.3rem 0.45rem',
                                      fontSize: '0.78rem',
                                      fontWeight: colIdx === 0 ? 800 : 400,
                                      background: colIdx === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                    }}
                                    placeholder={colIdx === 0 ? 'e.g. S' : 'Value'}
                                  />
                                </td>
                              ))}
                              <td style={{ textAlign: 'center', padding: '0.3rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTableRow(tIdx, rowIdx)}
                                  className="btn btn-secondary btn-xs"
                                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                  title="Delete Row"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Product overview and summary..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fabric & Fit Details (Optional - shown only if written)</label>
                <textarea
                  rows={3}
                  value={formData.fabricFit || ''}
                  onChange={(e) => setFormData({ ...formData, fabricFit: e.target.value })}
                  placeholder="e.g. 100% Organic Combed Heavyweight Cotton (240 GSM), Boxy Fit, Double-needle reinforced seams..."
                  className="form-textarea"
                />
              </div>

              {/* 📸 Multi-Image Product Gallery Manager (No Color Selection Required) */}
              <div className="form-group glass-panel p-3 border-radius-lg border-primary-light mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                  <div>
                    <label className="form-label m-0 text-primary d-flex align-items-center gap-2 font-bold text-md">
                      <ImageIcon size={18} /> Product Photo Gallery (Upload Multiple Images)
                    </label>
                    <p className="subtext mt-1">
                      Upload multiple product photos for this item (front, back, model shots, close-ups). No color selection required!
                    </p>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="multi-image-upload-input"
                      onChange={handleMultipleFileUpload}
                      hidden
                    />
                    <label
                      htmlFor="multi-image-upload-input"
                      className="btn btn-primary btn-sm font-bold"
                      style={{ cursor: 'pointer' }}
                    >
                      <Upload size={15} /> {uploadingImage ? 'Uploading Photos...' : '+ Upload Multiple Photos'}
                    </label>
                  </div>
                </div>

                {/* Paste Image URL Bar */}
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Or paste Product Photo Image URL here..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddImageUrl(e); }}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    + Add URL
                  </button>
                </div>

                {/* Preset stock image selector chips */}
                <div className="preset-images-list mb-3 p-2 bg-secondary rounded d-flex align-items-center gap-2 flex-wrap">
                  <span className="preset-title font-semibold" style={{ fontSize: '0.78rem' }}>⚡ Quick Add Sample Photos:</span>
                  {PRESET_TSHIRT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: Array.from(new Set([...(prev.images || []), preset.url])).filter(Boolean),
                        }))
                      }
                      className="preset-chip"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>

                {/* Gallery Images Grid Preview */}
                {(formData.images || []).length === 0 ? (
                  <div className="text-center p-4 border rounded bg-secondary">
                    <ImageIcon size={32} className="text-muted mb-2 mx-auto" />
                    <p className="subtext m-0">No gallery photos added yet. Click &quot;+ Upload Multiple Photos&quot; above to add images.</p>
                  </div>
                ) : (
                  <div className="gallery-grid-preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {(formData.images || []).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="gallery-preview-card glass-panel"
                        style={{
                          position: 'relative',
                          aspectRatio: '4 / 5',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)',
                        }}
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              background: 'var(--accent-gradient)',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            }}
                          >
                            ⭐ Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            title="Set as main cover photo"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              background: 'rgba(0,0,0,0.65)',
                              color: '#fff',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Delete photo from gallery"
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          ✕
                        </button>
                        <div style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '0.65rem', color: '#fff', fontWeight: 800, textShadow: '0 1px 3px #000' }}>
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
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
