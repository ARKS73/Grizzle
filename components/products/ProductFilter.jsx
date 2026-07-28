'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, Star, Check } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Oversized Printed Tees',
  'Desi Vibe Typography',
  'Anime & Pop Culture',
  'Minimalist Line Art',
  'Self-Made Artist Drops',
];

const GENDERS = ['All', 'Men', 'Women', 'Unisex'];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Gray', hex: '#64748b' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Beige', hex: '#d97706' },
  { name: 'Green', hex: '#14532d' },
];

export default function ProductFilter({ filters, setFilters, onReset }) {
  const handleCategoryChange = (cat) => {
    setFilters((prev) => ({ ...prev, category: cat === 'All' ? '' : cat }));
  };

  const handleGenderChange = (g) => {
    setFilters((prev) => ({ ...prev, gender: g === 'All' ? '' : g }));
  };

  const handleSizeToggle = (sz) => {
    setFilters((prev) => ({
      ...prev,
      size: prev.size === sz ? '' : sz,
    }));
  };

  const handleColorToggle = (colName) => {
    setFilters((prev) => ({
      ...prev,
      color: prev.color === colName ? '' : colName,
    }));
  };

  return (
    <div className="filter-sidebar glass-panel">
      <div className="filter-header">
        <div className="filter-title-box">
          <SlidersHorizontal size={18} className="filter-title-icon" />
          <h3>Filters</h3>
        </div>
        <button onClick={onReset} className="reset-btn">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Gender Collection Section */}
      <div className="filter-group">
        <h4>Collection / Gender</h4>
        <div className="category-list">
          {GENDERS.map((g) => {
            const isSelected = (!filters.gender && g === 'All') || filters.gender === g;
            return (
              <button
                key={g}
                onClick={() => handleGenderChange(g)}
                className={`category-item ${isSelected ? 'active' : ''}`}
              >
                <span>{g === 'All' ? 'All Collections' : `${g}'s Collection`}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Section */}
      <div className="filter-group">
        <h4>T-Shirt Style</h4>
        <div className="category-list">
          {CATEGORIES.map((cat) => {
            const isSelected = (!filters.category && cat === 'All') || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`category-item ${isSelected ? 'active' : ''}`}
              >
                <span>{cat}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="filter-group">
        <div className="price-header">
          <h4>Max Price</h4>
          <span className="price-val">₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="299"
          max="1999"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
          className="range-slider"
        />
        <div className="range-labels">
          <span>₹299</span>
          <span>₹1999</span>
        </div>
      </div>

      {/* Size Selector */}
      <div className="filter-group">
        <h4>Size Variant</h4>
        <div className="sizes-grid">
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => handleSizeToggle(sz)}
              className={`size-btn ${filters.size === sz ? 'active' : ''}`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="filter-group">
        <h4>Color Palette</h4>
        <div className="colors-grid">
          {COLORS.map((col) => (
            <button
              key={col.name}
              onClick={() => handleColorToggle(col.name)}
              className={`color-swatch ${filters.color === col.name ? 'active' : ''}`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            >
              {filters.color === col.name && (
                <Check size={12} color={col.hex === '#ffffff' ? '#000' : '#fff'} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="filter-group">
        <h4>Minimum Rating</h4>
        <div className="ratings-list">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => setFilters((prev) => ({ ...prev, rating: prev.rating === stars ? 0 : stars }))}
              className={`rating-item ${filters.rating === stars ? 'active' : ''}`}
            >
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < stars ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .filter-sidebar {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: sticky;
          top: 90px;
        }
        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .filter-title-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-title-icon { color: var(--accent-primary); }
        .reset-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .reset-btn:hover { color: var(--danger); }

        .filter-group h4 {
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .category-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        .category-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .category-item.active {
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 700;
        }

        .price-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .price-val {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-primary);
        }
        .range-slider {
          width: 100%;
          accent-color: var(--accent-primary);
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .sizes-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .size-btn {
          min-width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .size-btn.active, .size-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        .colors-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .color-swatch {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          border: 2px solid var(--border-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }
        .color-swatch.active {
          transform: scale(1.15);
          border-color: var(--accent-primary);
        }

        .ratings-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .rating-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .rating-item.active {
          background: var(--accent-light);
          border-color: var(--accent-primary);
        }
        .stars { display: flex; gap: 2px; }
      `}</style>
    </div>
  );
}
