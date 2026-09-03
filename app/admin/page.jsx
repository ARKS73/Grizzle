'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, PackageCheck, ArrowUpRight, Image as ImageIcon, Upload, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// Helper to compress uploaded hero image
const compressHeroImage = (file, maxWidth = 900, maxHeight = 1200, quality = 0.85) => {
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

const DEFAULT_SIZE_CHART_COLS = [
  'Size',
  'Chest (in)',
  'Chest (cm)',
  'Length (in)',
  'Length (cm)',
  'Shoulder (in)',
  'Shoulder (cm)',
];

const DEFAULT_SIZE_CHART_ROWS = [
  ['S', '38-40"', '96-102 cm', '27.5"', '70 cm', '18.5"', '47 cm'],
  ['M', '40-42"', '102-107 cm', '28.5"', '72 cm', '19.5"', '49.5 cm'],
  ['L', '42-44"', '107-112 cm', '29.5"', '75 cm', '20.5"', '52 cm'],
  ['XL', '44-46"', '112-117 cm', '30.5"', '77 cm', '21.5"', '54.5 cm'],
  ['XXL', '46-48"', '117-122 cm', '31.5"', '80 cm', '22.5"', '57 cm'],
];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const { addToast } = useToast();

  const fileInputRef = useRef(null);
  const [storeSettings, setStoreSettings] = useState({
    heroImage: '',
    heroBadge: 'NEW DROP | SEASON 2026',
    heroTitle: 'HIGH-DENSITY DTF PRINTS',
    heroAccentTitle: 'YOU CAN WEAR',
    heroDesc: 'Merging high-fidelity DTF printing with 240 GSM bio-washed heavy cotton. Vibrant prints built to last for 50+ washes.',
    heroTapeNote: 'LIMITED TO 100 PIECES GLOBALLY',
    footerAboutText: 'Self-Made High-Density DTF Printed Streetwear. Bio-Washed 240 GSM Premium Cotton Built for Style & Longevity.',
    footerCopyrightText: '© 2026 Grizzle Apparel India. All rights reserved. Self-Made Printed T-Shirts.',
    footerCustomLinks: [
      { label: '📐 Size Chart & Fit Guide', url: '#size-chart' },
      { label: '🚚 Shipping & Delivery Policy', url: '/products' },
      { label: '🔄 Returns & Refund Policy', url: '/orders' },
    ],
    sizeChartTips: 'Oversized Streetwear Fit: Choose your standard size for a relaxed dropped-shoulder silhouette. For regular fit, size down 1 size.',
    sizeChartData: [
      { size: 'S', chestIn: '38-40"', chestCm: '96-102 cm', lengthIn: '27.5"', lengthCm: '70 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', sleeveIn: '8.5"', sleeveCm: '21 cm' },
      { size: 'M', chestIn: '40-42"', chestCm: '102-107 cm', lengthIn: '28.5"', lengthCm: '72 cm', shoulderIn: '19.5"', shoulderCm: '49.5 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
      { size: 'L', chestIn: '42-44"', chestCm: '107-112 cm', lengthIn: '29.5"', lengthCm: '75 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
      { size: 'XL', chestIn: '44-46"', chestCm: '112-117 cm', lengthIn: '30.5"', lengthCm: '77 cm', shoulderIn: '21.5"', shoulderCm: '54.5 cm', sleeveIn: '10.0"', sleeveCm: '25.5 cm' },
      { size: 'XXL', chestIn: '46-48"', chestCm: '117-122 cm', lengthIn: '31.5"', lengthCm: '80 cm', shoulderIn: '22.5"', shoulderCm: '57 cm', sleeveIn: '10.5"', sleeveCm: '26.5 cm' },
    ],
    sizeChartColumns: DEFAULT_SIZE_CHART_COLS,
    sizeChartRows: DEFAULT_SIZE_CHART_ROWS,
  });

  const currentCols =
    Array.isArray(storeSettings.sizeChartColumns) && storeSettings.sizeChartColumns.length > 0
      ? storeSettings.sizeChartColumns
      : DEFAULT_SIZE_CHART_COLS;

  const currentRows =
    Array.isArray(storeSettings.sizeChartRows) && storeSettings.sizeChartRows.length > 0
      ? storeSettings.sizeChartRows
      : (Array.isArray(storeSettings.sizeChartData) && storeSettings.sizeChartData.length > 0
          ? storeSettings.sizeChartData.map((row) => [
              row.size || '',
              row.chestIn || '',
              row.chestCm || '',
              row.lengthIn || '',
              row.lengthCm || '',
              row.shoulderIn || '',
              row.shoulderCm || '',
            ])
          : DEFAULT_SIZE_CHART_ROWS);

  const handleAddColumn = () => {
    const newColName = `Col ${currentCols.length + 1}`;
    const newCols = [...currentCols, newColName];
    const newRows = currentRows.map((r) => [...r, '']);
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: newCols,
      sizeChartRows: newRows,
    }));
  };

  const handleRemoveColumn = (colIndex) => {
    if (currentCols.length <= 1) return;
    const newCols = currentCols.filter((_, idx) => idx !== colIndex);
    const newRows = currentRows.map((r) => r.filter((_, idx) => idx !== colIndex));
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: newCols,
      sizeChartRows: newRows,
    }));
  };

  const handleRenameColumn = (colIndex, val) => {
    const newCols = [...currentCols];
    newCols[colIndex] = val;
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: newCols,
      sizeChartRows: currentRows,
    }));
  };

  const handleAddRow = () => {
    const emptyRow = new Array(currentCols.length).fill('');
    emptyRow[0] = 'NEW';
    const newRows = [...currentRows, emptyRow];
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: currentCols,
      sizeChartRows: newRows,
    }));
  };

  const handleRemoveRow = (rowIndex) => {
    const newRows = currentRows.filter((_, idx) => idx !== rowIndex);
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: currentCols,
      sizeChartRows: newRows,
    }));
  };

  const handleCellChange = (rowIndex, colIndex, val) => {
    const newRows = currentRows.map((r, rIdx) => {
      if (rIdx !== rowIndex) return r;
      const updatedRow = [...r];
      updatedRow[colIndex] = val;
      return updatedRow;
    });
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: currentCols,
      sizeChartRows: newRows,
    }));
  };

  const handleResetPreset = () => {
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: DEFAULT_SIZE_CHART_COLS,
      sizeChartRows: DEFAULT_SIZE_CHART_ROWS,
    }));
  };

  const handleClearTable = () => {
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartColumns: ['Size', 'Chest', 'Length'],
      sizeChartRows: [['S', '', '']],
    }));
  };

  const handleSizeChartChange = (index, field, value) => {
    setStoreSettings((prev) => {
      const updated = [...(prev.sizeChartData || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sizeChartData: updated };
    });
  };

  const handleAddSizeRow = () => {
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartData: [
        ...(prev.sizeChartData || []),
        { size: '3XL', chestIn: '48-50"', chestCm: '122-127 cm', lengthIn: '32.5"', lengthCm: '82 cm', shoulderIn: '23.5"', shoulderCm: '59 cm', sleeveIn: '11.0"', sleeveCm: '28 cm' },
      ],
    }));
  };

  const handleRemoveSizeRow = (index) => {
    setStoreSettings((prev) => ({
      ...prev,
      sizeChartData: (prev.sizeChartData || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddFooterLink = () => {
    setStoreSettings((prev) => ({
      ...prev,
      footerCustomLinks: [...(prev.footerCustomLinks || []), { label: 'New Link', url: '#' }],
    }));
  };

  const handleRemoveFooterLink = (index) => {
    setStoreSettings((prev) => ({
      ...prev,
      footerCustomLinks: (prev.footerCustomLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handleFooterLinkChange = (index, field, value) => {
    setStoreSettings((prev) => {
      const updated = [...(prev.footerCustomLinks || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, footerCustomLinks: updated };
    });
  };

  const handleAddFeatureCard = () => {
    setStoreSettings((prev) => ({
      ...prev,
      featureCards: [
        ...(prev.featureCards || []),
        { iconName: 'Sparkles', value: '100% COTTON', label: 'PREMIUM QUALITY', sub: 'Bio-washed 240 GSM heavy cotton', link: '' },
      ],
    }));
  };

  const handleRemoveFeatureCard = (index) => {
    setStoreSettings((prev) => {
      const updated = [...(prev.featureCards || [])];
      updated.splice(index, 1);
      return { ...prev, featureCards: updated };
    });
  };

  const handleFeatureCardChange = (index, field, value) => {
    setStoreSettings((prev) => {
      const updated = JSON.parse(JSON.stringify(prev.featureCards || []));
      if (updated[index]) {
        updated[index][field] = value;
      }
      return { ...prev, featureCards: updated };
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();

        if (data.success) {
          setMetrics(data.metrics);
          setLowStockProducts(data.lowStockProducts || []);
          setRecentOrders(data.recentOrders || []);
          setMonthlySales(data.monthlySales || []);
        }

        const settingsRes = await fetch('/api/admin/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setStoreSettings(settingsData.settings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleHeroImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressHeroImage(file);
      if (compressed) {
        setStoreSettings((prev) => ({ ...prev, heroImage: compressed }));
        if (addToast) addToast('Hero image updated preview! Click "Save Banner Changes" to publish.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStoreSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast('Footer content, custom links & store settings published to website!', 'success');
      } else {
        if (addToast) addToast('Failed to save settings: ' + data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Error updating store settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />;
  }

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);

  // Real month-over-month trend calculation from MongoDB data
  const computeTrend = (key) => {
    if (monthlySales.length < 2) return null;
    const current = monthlySales[monthlySales.length - 1]?.[key] || 0;
    const previous = monthlySales[monthlySales.length - 2]?.[key] || 0;
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
  };
  const revenueTrend = computeTrend('revenue');
  const ordersTrend = computeTrend('orders');

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-header mb-4">
        <h1>Sales Analytics & Executive Dashboard</h1>
        <p>Monitor revenue metrics, order statuses, and low inventory notifications.</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-revenue"><DollarSign size={24} /></div>
          <div>
            <span className="kpi-label">Total Revenue</span>
            <h2 className="kpi-value">₹{metrics?.totalRevenue?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
            <span className={`kpi-trend ${revenueTrend === null ? 'text-muted' : revenueTrend >= 0 ? 'text-success' : 'text-danger'}`}>
              <TrendingUp size={14} />
              {revenueTrend === null ? 'No prior month data' : `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}% vs last month`}
            </span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-orders"><ShoppingBag size={24} /></div>
          <div>
            <span className="kpi-label">Total Orders</span>
            <h2 className="kpi-value">{metrics?.totalOrders || 0}</h2>
            <span className={`kpi-trend ${ordersTrend === null ? 'text-muted' : ordersTrend >= 0 ? 'text-success' : 'text-danger'}`}>
              <TrendingUp size={14} />
              {ordersTrend === null ? 'No prior month data' : `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}% vs last month`}
            </span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-users"><Users size={24} /></div>
          <div>
            <span className="kpi-label">Registered Customers</span>
            <h2 className="kpi-value">{metrics?.totalUsers || 0}</h2>
            <span className="kpi-trend text-info">Active Customer Accounts</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon icon-warning"><AlertTriangle size={24} /></div>
          <div>
            <span className="kpi-label">Low Stock Alerts</span>
            <h2 className="kpi-value">{metrics?.lowStockCount || 0}</h2>
            <span className="kpi-trend text-danger">Stock &lt; 10 units</span>
          </div>
        </div>
      </div>

      {/* Hidden Hero Image File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleHeroImageFileChange}
        style={{ display: 'none' }}
      />

      {/* Hero Banner & Polaroid Image Editor Card */}
      <div className="hero-settings-card glass-panel mt-4 mb-4">
        <div className="card-header-flex">
          <div>
            <h3><ImageIcon size={20} className="text-primary inline-icon" /> Hero Banner Image & Text Customization</h3>
            <p className="subtext">Upload a new photo for the landing page hero polaroid card and edit banner headlines.</p>
          </div>
          <button
            onClick={handleSaveStoreSettings}
            disabled={savingSettings}
            className="btn btn-primary"
          >
            <Save size={16} /> {savingSettings ? 'Saving Changes...' : 'Save Banner Changes'}
          </button>
        </div>

        <div className="hero-editor-grid mt-3">
          {/* Polaroid Image Preview & Upload Button */}
          <div className="hero-preview-box text-center">
            <label className="form-label mb-2">Hero Polaroid Image Preview</label>
            <div className="polaroid-preview-wrapper" onClick={() => fileInputRef.current?.click()} title="Click to Upload New Hero Photo">
              <img src={storeSettings.heroImage} alt="Hero Polaroid Preview" className="hero-preview-img" />
              <div className="preview-overlay">
                <Upload size={24} />
                <span>Upload Local Photo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm mt-3 w-100"
            >
              <Upload size={14} /> Upload New Photo From Device
            </button>
          </div>

          {/* Form Inputs */}
          <div className="hero-form-inputs">
            <div className="form-group mb-2">
              <label className="form-label">Hero Badge Text</label>
              <input
                type="text"
                className="form-input"
                value={storeSettings.heroBadge}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, heroBadge: e.target.value }))}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group mb-2">
                <label className="form-label">Hero Main Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeSettings.heroTitle}
                  onChange={(e) => setStoreSettings((prev) => ({ ...prev, heroTitle: e.target.value }))}
                />
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Hero Accent Italic Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeSettings.heroAccentTitle}
                  onChange={(e) => setStoreSettings((prev) => ({ ...prev, heroAccentTitle: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Description Subtitle</label>
              <textarea
                className="form-input"
                rows={2}
                value={storeSettings.heroDesc}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, heroDesc: e.target.value }))}
              />
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Image Tape Note Label</label>
              <input
                type="text"
                className="form-input"
                value={storeSettings.heroTapeNote || ''}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, heroTapeNote: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Trust & Brand Feature Cards Builder */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>⚡ Homepage Brand Feature Cards (6-Item Grid Builder)</h4>
              <p className="subtext">Add, delete, or edit the feature cards shown in the &quot;Trusted by the Streets&quot; band.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddFeatureCard}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 700 }}
              >
                + Add Feature Card
              </button>
              <button
                type="button"
                onClick={handleSaveStoreSettings}
                disabled={savingSettings}
                className="btn btn-primary btn-sm font-bold"
              >
                <Save size={14} /> {savingSettings ? 'Saving...' : 'Save Feature Cards'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(storeSettings.featureCards || []).map((card, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 140px 180px 1fr 140px 70px', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <select
                  value={card.iconName || 'Truck'}
                  onChange={(e) => handleFeatureCardChange(idx, 'iconName', e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.78rem' }}
                >
                  <option value="Truck">🚚 Truck</option>
                  <option value="RotateCcw">🔄 Return</option>
                  <option value="Users">👥 Users</option>
                  <option value="Instagram">📸 Insta</option>
                  <option value="Star">⭐️ Star</option>
                  <option value="ShieldCheck">🔒 Shield</option>
                  <option value="Award">🏆 Award</option>
                  <option value="Sparkles">✨ Sparkle</option>
                </select>

                <input
                  type="text"
                  placeholder="Stat (e.g. 24-48 HR)"
                  value={card.value || ''}
                  onChange={(e) => handleFeatureCardChange(idx, 'value', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.78rem' }}
                />

                <input
                  type="text"
                  placeholder="Title (e.g. EXPRESS DISPATCH)"
                  value={card.label || ''}
                  onChange={(e) => handleFeatureCardChange(idx, 'label', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.78rem' }}
                />

                <input
                  type="text"
                  placeholder="Subtitle (e.g. Pan-India shipping with live tracking)"
                  value={card.sub || ''}
                  onChange={(e) => handleFeatureCardChange(idx, 'sub', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.78rem' }}
                />

                <input
                  type="text"
                  placeholder="Link URL (Optional)"
                  value={card.link || ''}
                  onChange={(e) => handleFeatureCardChange(idx, 'link', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.78rem' }}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveFeatureCard(idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Customization Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Footer Content &amp; Custom Links Editor</h4>
              <p className="subtext">Add custom footer links (e.g. Size Chart, Policies) and customize brand text.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddFooterLink}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 700 }}
              >
                + Add New Footer Link
              </button>
              <button
                type="button"
                onClick={handleSaveStoreSettings}
                disabled={savingSettings}
                className="btn btn-primary btn-sm font-bold"
              >
                <Save size={14} /> {savingSettings ? 'Saving...' : 'Save Footer Changes'}
              </button>
            </div>
          </div>

          <div className="form-grid-2 mb-3">
            <div className="form-group">
              <label className="form-label">Footer Brand Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={storeSettings.footerAboutText || ''}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, footerAboutText: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Footer Copyright Notice</label>
              <input
                type="text"
                className="form-input"
                value={storeSettings.footerCopyrightText || ''}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, footerCopyrightText: e.target.value }))}
              />
            </div>
          </div>

          <label className="form-label mb-2" style={{ display: 'block' }}>Custom Footer Links List</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(storeSettings.footerCustomLinks || []).map((link, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Link Title (e.g. Size Chart)"
                  value={link.label}
                  onChange={(e) => handleFooterLinkChange(idx, 'label', e.target.value)}
                  className="form-input"
                  style={{ flex: '1', minWidth: '180px' }}
                />
                <input
                  type="text"
                  placeholder="URL / Path (e.g. #size-chart or /products)"
                  value={link.url}
                  onChange={(e) => handleFooterLinkChange(idx, 'url', e.target.value)}
                  className="form-input"
                  style={{ flex: '1', minWidth: '180px' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFooterLink(idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.5rem 0.75rem' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={handleSaveStoreSettings}
              disabled={savingSettings}
              className="btn btn-primary font-bold"
            >
              <Save size={16} /> {savingSettings ? 'Saving Footer Changes...' : 'Publish Footer Changes to Website'}
            </button>
          </div>
        </div>

        {/* Size Chart & Fit Guide Custom Table Builder */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>📐 Custom Size Chart &amp; Fit Guide Builder</h4>
              <p className="subtext">Build custom size charts from scratch. Add/remove columns &amp; rows, rename headers, and edit any measurement cell.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddColumn}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 700, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              >
                + Add Column
              </button>
              <button
                type="button"
                onClick={handleAddRow}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 700 }}
              >
                + Add Row
              </button>
              <button
                type="button"
                onClick={handleResetPreset}
                className="btn btn-secondary btn-sm"
                title="Load Standard T-Shirt Sizing Template"
              >
                🔄 Preset Template
              </button>
              <button
                type="button"
                onClick={handleClearTable}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444' }}
                title="Clear and build from scratch"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Fit Advice &amp; Sizing Tips</label>
            <textarea
              className="form-input"
              rows={2}
              value={storeSettings.sizeChartTips || ''}
              onChange={(e) => setStoreSettings((prev) => ({ ...prev, sizeChartTips: e.target.value }))}
              placeholder="e.g. Oversized Streetwear Fit: Choose your standard size for a relaxed dropped-shoulder silhouette..."
            />
          </div>

          <label className="form-label mb-2" style={{ display: 'block', fontWeight: 700 }}>
            Dynamic Measurement Table (Editable Column Headers &amp; Cell Rows)
          </label>
          <div style={{ overflowX: 'auto', background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
            <table className="admin-table" style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {currentCols.map((colTitle, colIdx) => (
                    <th key={colIdx} style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input
                          type="text"
                          value={colTitle}
                          onChange={(e) => handleRenameColumn(colIdx, e.target.value)}
                          className="form-input"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-primary)' }}
                          placeholder={`Col ${colIdx + 1}`}
                        />
                        {currentCols.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(colIdx)}
                            title="Delete Column"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', fontSize: '0.85rem' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th style={{ width: '60px', textAlign: 'center', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((rowArr, rowIdx) => (
                  <tr key={rowIdx}>
                    {currentCols.map((_, colIdx) => (
                      <td key={colIdx} style={{ padding: '0.4rem' }}>
                        <input
                          type="text"
                          value={rowArr[colIdx] || ''}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          className="form-input"
                          style={{
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: colIdx === 0 ? 800 : 400,
                            background: colIdx === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                          }}
                          placeholder={colIdx === 0 ? 'e.g. S' : 'Value'}
                        />
                      </td>
                    ))}
                    <td style={{ textAlign: 'center', padding: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rowIdx)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.25rem 0.45rem', fontSize: '0.75rem' }}
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

          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={handleSaveStoreSettings}
              disabled={savingSettings}
              className="btn btn-primary font-bold"
            >
              <Save size={16} /> {savingSettings ? 'Saving Settings...' : 'Save Size Chart & Store Settings'}
            </button>
          </div>
        </div>

        {/* Customer Policies Content Editor */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem' }}>📋 Customer Returns &amp; Shipping Policy Content Customization</h4>
          <p className="subtext mb-3">Edit official text shown in customer policy popups on the website.</p>

          <div className="form-grid-2 mb-3">
            <div className="form-group">
              <label className="form-label">7-Day Returns &amp; Refund Policy Text</label>
              <textarea
                className="form-input"
                rows={3}
                value={storeSettings.returnPolicyText || ''}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, returnPolicyText: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shipping &amp; Express Delivery Policy Text</label>
              <textarea
                className="form-input"
                rows={3}
                value={storeSettings.shippingPolicyText || ''}
                onChange={(e) => setStoreSettings((prev) => ({ ...prev, shippingPolicyText: e.target.value }))}
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleSaveStoreSettings}
              disabled={savingSettings}
              className="btn btn-primary font-bold"
            >
              <Save size={16} /> {savingSettings ? 'Saving Policies...' : 'Publish Policy Changes to Website'}
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Chart */}
      <div className="chart-card glass-panel mt-4">
        <div className="chart-header">
          <div>
            <h3>Monthly Revenue Overview</h3>
            <p className="subtext">Completed sales revenue trajectory for current fiscal year</p>
          </div>
        </div>

        <div className="bar-chart-container">
          {monthlySales.map((item) => {
            const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={item.month} className="bar-col">
                <div className="bar-val">₹{item.revenue}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${heightPercent}%` }} />
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="dashboard-tables-grid mt-4">
        {/* Recent Orders */}
        <div className="table-card glass-panel">
          <div className="table-card-header">
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" className="view-link">View All &rarr;</Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td><strong>#{order.invoiceNumber}</strong></td>
                  <td>{order.user?.name || 'Customer'}</td>
                  <td><span className="badge badge-warning">{order.status}</span></td>
                  <td>₹{order.totalPrice?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="table-card glass-panel">
          <div className="table-card-header">
            <h3>Low Stock Warning Items</h3>
            <Link href="/admin/inventory" className="view-link">Manage Inventory &rarr;</Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td><span className="badge badge-danger">{p.stock} units left</span></td>
                  <td><Link href="/admin/inventory" className="btn btn-secondary btn-xs">Update</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .hero-settings-card {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .inline-icon {
          display: inline-block;
          vertical-align: middle;
          margin-right: 0.35rem;
        }
        .hero-editor-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2rem;
          align-items: flex-start;
          margin-top: 1.5rem;
        }
        .polaroid-preview-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid var(--accent-primary);
          box-shadow: var(--shadow-lg);
        }
        .hero-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(3px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.25s ease;
          font-size: 0.75rem;
          font-weight: 700;
          gap: 0.35rem;
        }
        .polaroid-preview-wrapper:hover .preview-overlay {
          opacity: 1;
        }
        .polaroid-preview-wrapper:hover .hero-preview-img {
          transform: scale(1.05);
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 800px) {
          .hero-editor-grid { grid-template-columns: 1fr; }
          .form-grid-2 { grid-template-columns: 1fr; }
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .kpi-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border-radius: var(--radius-lg);
        }
        .kpi-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-revenue { background: var(--accent-light); color: var(--accent-primary); }
        .icon-orders { background: var(--success-light); color: var(--success); }
        .icon-users { background: var(--info-light); color: var(--info); }
        .icon-warning { background: var(--danger-light); color: var(--danger); }

        .kpi-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
        .kpi-value { font-size: 1.8rem; font-weight: 800; line-height: 1.1; margin: 0.2rem 0; }
        .kpi-trend { font-size: 0.75rem; display: flex; align-items: center; gap: 3px; font-weight: 600; }

        .chart-card {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .subtext { font-size: 0.85rem; color: var(--text-muted); }
        .bar-chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 220px;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .bar-val { font-size: 0.75rem; font-weight: 700; color: var(--accent-primary); margin-bottom: 6px; }
        .bar-track {
          width: 100%;
          max-width: 48px;
          flex: 1;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .bar-fill {
          width: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition: height 0.5s ease;
        }
        .bar-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-top: 8px; }

        .dashboard-tables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .table-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          overflow-x: auto;
        }
        .table-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .view-link { font-size: 0.85rem; color: var(--accent-primary); font-weight: 600; }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }
        .admin-table th, .admin-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          text-align: left;
          font-size: 0.85rem;
        }
        .admin-table th { color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; }

        @media (max-width: 900px) {
          .metrics-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .dashboard-tables-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .metrics-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
